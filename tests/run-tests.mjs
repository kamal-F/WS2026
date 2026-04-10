import assert from "node:assert/strict";

process.env.DATABASE_PATH = "tmp/ws2026-test.db";
process.env.MESSAGE_BROKER_TRANSPORT = "in-memory";
const grpcTestPort = String(55000 + Math.floor(Math.random() * 1000));
process.env.GRPC_PORT = grpcTestPort;

const { app } = await import("../dist/app.js");
const { db, initializeDatabase, seedBooks } = await import("../dist/db/database.js");
const { initializeMessageBroker, waitForMessageBrokerIdle } = await import(
  "../dist/services/message-broker.js"
);
const { initializeCatalogGrpcServer, closeCatalogGrpcServer } = await import(
  "../dist/services/grpc-catalog.js"
);
const { resetNotificationRecords } = await import("../dist/services/notification-service.js");
const { initializeNotificationConsumer } = await import(
  "../dist/services/notification-service.js"
);

initializeDatabase();
await initializeCatalogGrpcServer();
initializeMessageBroker();
initializeNotificationConsumer();

const server = app.listen(0);

await new Promise((resolve) => {
  server.once("listening", resolve);
});

const address = server.address();

if (!address || typeof address === "string") {
  throw new Error("Server test gagal mendapatkan port");
}

const baseUrl = `http://127.0.0.1:${address.port}`;

const resetBooks = () => {
  db.exec("DELETE FROM books");
  seedBooks();
  resetNotificationRecords();
};

const run = async (name, fn) => {
  try {
    resetBooks();
    await fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
};

const waitFor = async (fn, options = {}) => {
  const timeoutMs = options.timeoutMs ?? 3000;
  const intervalMs = options.intervalMs ?? 150;
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const result = await fn();

    if (result) {
      return result;
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  return null;
};

try {
  await run("health check", async () => {
    const response = await fetch(`${baseUrl}/health`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.status, "ok");
  });

  await run("list books", async () => {
    const response = await fetch(`${baseUrl}/api/v1/books`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.meta.total, 1);
    assert.equal(body.data[0].id, "book-001");
  });

  await run("create book", async () => {
    const loginResponse = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: "admin@ws2026.local",
        password: "secret123"
      })
    });

    const loginBody = await loginResponse.json();

    const response = await fetch(`${baseUrl}/api/v1/books`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${loginBody.data.accessToken}`
      },
      body: JSON.stringify({
        title: "Testing API",
        author: "Kamal",
        year: 2026
      })
    });

    const body = await response.json();

    assert.equal(loginResponse.status, 200);
    assert.equal(response.status, 201);
    assert.equal(body.data.title, "Testing API");

    await waitForMessageBrokerIdle();

    const notificationBody = await waitFor(async () => {
      const notificationResponse = await fetch(`${baseUrl}/services/notifications/events`);
      const candidate = await notificationResponse.json();

      if (notificationResponse.status === 200 && candidate.data.length > 0) {
        return candidate;
      }

      return null;
    });

    assert.ok(notificationBody);
    assert.equal(notificationBody.data[0].eventType, "book.created");
    assert.match(notificationBody.data[0].payloadSummary, /Testing API/);
  });

  await run("reject create tanpa auth", async () => {
    const response = await fetch(`${baseUrl}/api/v1/books`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: "Tanpa Auth",
        author: "Kamal",
        year: 2026
      })
    });

    const body = await response.json();

    assert.equal(response.status, 401);
    assert.equal(body.error.code, "UNAUTHORIZED");
  });

  await run("validation failure", async () => {
    const loginResponse = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: "admin@ws2026.local",
        password: "secret123"
      })
    });

    const loginBody = await loginResponse.json();

    const response = await fetch(`${baseUrl}/api/v1/books`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${loginBody.data.accessToken}`
      },
      body: JSON.stringify({
        title: "No",
        author: "AB",
        year: 1800
      })
    });

    const body = await response.json();

    assert.equal(loginResponse.status, 200);
    assert.equal(response.status, 400);
    assert.equal(body.error.code, "VALIDATION_ERROR");
  });

  await run("api key dapat dipakai untuk create", async () => {
    const response = await fetch(`${baseUrl}/api/v1/books`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": "ws2026-api-key"
      },
      body: JSON.stringify({
        title: "API Key Book",
        author: "Kamal",
        year: 2026
      })
    });

    const body = await response.json();

    assert.equal(response.status, 201);
    assert.equal(body.data.title, "API Key Book");
  });

  await run("architecture overview tersedia", async () => {
    const response = await fetch(`${baseUrl}/architecture/services`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.data.style, "microservice-ready modular monolith");
    assert.equal(body.data.services.length, 4);
    assert.equal(body.data.services[2].name, "notification-service");
    assert.equal(body.data.services[3].name, "catalog-rpc");
    assert.equal(body.data.currentState.messageBroker.transport, "in-memory");
    assert.equal(body.data.currentState.grpcHealth.service, "catalog-rpc");
  });

  await run("identity service health tersedia", async () => {
    const response = await fetch(`${baseUrl}/services/identity/health`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.service, "identity-service");
    assert.equal(body.status, "ok");
  });

  await run("catalog service stats tersedia", async () => {
    const response = await fetch(`${baseUrl}/services/catalog/stats`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.data.totalBooks, 1);
    assert.equal(body.data.latestBook.id, "book-001");
  });

  await run("message broker health tersedia", async () => {
    const response = await fetch(`${baseUrl}/services/events/health`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.data.transport, "in-memory");
    assert.equal(body.data.queueName, "ws2026.book.events");
  });

  await run("notification service health tersedia", async () => {
    const response = await fetch(`${baseUrl}/services/notifications/health`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.service, "notification-service");
    assert.equal(body.status, "ok");
  });

  await run("grpc health tersedia", async () => {
    const response = await fetch(`${baseUrl}/services/grpc/health`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.data.service, "catalog-rpc");
    assert.equal(body.data.port, Number(grpcTestPort));
  });

  await run("rest gateway dapat memanggil grpc", async () => {
    const response = await fetch(`${baseUrl}/services/grpc/books/book-001/summary`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.data.id, "book-001");
    assert.equal(body.data.servedBy, "catalog-rpc");
    assert.match(body.data.summary, /Web Service Fundamentals/);
  });

  await run("openapi yaml", async () => {
    const response = await fetch(`${baseUrl}/openapi.yaml`);
    const body = await response.text();

    assert.equal(response.status, 200);
    assert.match(body, /openapi: 3.0.3/);
    assert.match(body, /\/api\/v1\/books:/);
    assert.match(body, /\/architecture\/services:/);
    assert.match(body, /\/services\/events\/health:/);
    assert.match(body, /\/services\/grpc\/health:/);
  });

  console.log("All API tests passed");
} finally {
  await new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
  await closeCatalogGrpcServer();
}
