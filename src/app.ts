import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import type { NextFunction, Request, Response } from "express";
import { architectureRouter } from "./routes/architecture.js";
import { authRouter } from "./routes/auth.js";
import { booksRouter } from "./routes/books.js";
import { catalogServiceRouter } from "./routes/catalog-service.js";
import { eventsRouter, notificationsRouter } from "./routes/events.js";
import { grpcRouter } from "./routes/grpc.js";
import { healthRouter } from "./routes/health.js";
import { identityServiceRouter } from "./routes/identity-service.js";
import { openApiRouter } from "./routes/openapi.js";
import { soapRouter } from "./routes/soap.js";

export const app = express();

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "https://unpkg.com", "'unsafe-inline'"],
        scriptSrc: ["'self'", "https://unpkg.com"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'"]
      }
    }
  })
);
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/health", healthRouter);
app.use("/", openApiRouter);
app.use("/architecture", architectureRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/books", booksRouter);
app.use("/services/events", eventsRouter);
app.use("/services/grpc", grpcRouter);
app.use("/services/identity", identityServiceRouter);
app.use("/services/catalog", catalogServiceRouter);
app.use("/services/notifications", notificationsRouter);
app.use("/soap", soapRouter);

app.use((error: Error, _req: Request, res: Response, next: NextFunction) => {
  if (error instanceof SyntaxError && "body" in error) {
    return res.status(400).json({
      error: {
        code: "INVALID_JSON",
        message: "Body request harus berupa JSON yang valid"
      }
    });
  }

  return next(error);
});

app.use((req, res) => {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: `Route ${req.method} ${req.originalUrl} tidak ditemukan`
    }
  });
});
