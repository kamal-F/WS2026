import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import type { NextFunction, Request, Response } from "express";
import { booksRouter } from "./routes/books.js";
import { healthRouter } from "./routes/health.js";
import { soapRouter } from "./routes/soap.js";

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/health", healthRouter);
app.use("/api/v1/books", booksRouter);
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
