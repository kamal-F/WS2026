import { config } from "dotenv";
import { initializeDatabase } from "./db/database.js";
import { initializeCatalogGrpcServer } from "./services/grpc-catalog.js";
import { initializeMessageBroker } from "./services/message-broker.js";
import { initializeNotificationConsumer } from "./services/notification-service.js";

config();
initializeDatabase();
await initializeCatalogGrpcServer();
initializeMessageBroker();
initializeNotificationConsumer();

const { app } = await import("./app.js");

const port = Number(process.env.PORT ?? 3000);

app.listen(port, () => {
  console.log(`Web Service API running on http://localhost:${port}`);
});
