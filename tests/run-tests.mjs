import assert from "node:assert/strict";

process.env.DATABASE_PATH = "tmp/ws2026-test.db";

const { app } = await import("../dist/app.js");
const { db, initializeDatabase, seedBooks } = await import("../dist/db/database.js");

initializeDatabase();

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
    assert.equal(body.data.services.length, 2);
    assert.equal(body.data.services[0].kind, "domain-service");
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

  await run("openapi yaml", async () => {
    const response = await fetch(`${baseUrl}/openapi.yaml`);
    const body = await response.text();

    assert.equal(response.status, 200);
    assert.match(body, /openapi: 3.0.3/);
    assert.match(body, /\/api\/v1\/books:/);
    assert.match(body, /\/architecture\/services:/);
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
}
