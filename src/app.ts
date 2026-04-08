import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { booksRouter } from "./routes/books.js";
import { healthRouter } from "./routes/health.js";

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/health", healthRouter);
app.use("/api/v1/books", booksRouter);

app.use((req, res) => {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: `Route ${req.method} ${req.originalUrl} tidak ditemukan`
    }
  });
});
