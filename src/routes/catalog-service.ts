import { Router } from "express";
import {
  createBook,
  deleteBook,
  getBookById,
  listBooks,
  updateBook
} from "../controllers/books.js";
import { requireAuth } from "../middleware/auth.js";
import {
  getCatalogServiceHealth,
  getCatalogServiceStats
} from "../services/catalog-service.js";

export const catalogServiceRouter = Router();

catalogServiceRouter.get("/health", (_req, res) => {
  return res.json(getCatalogServiceHealth());
});

catalogServiceRouter.get("/stats", (_req, res) => {
  return res.json({ data: getCatalogServiceStats() });
});

catalogServiceRouter.get("/books", listBooks);
catalogServiceRouter.post("/books", requireAuth, createBook);
catalogServiceRouter.get("/books/:id", getBookById);
catalogServiceRouter.put("/books/:id", requireAuth, updateBook);
catalogServiceRouter.delete("/books/:id", requireAuth, deleteBook);
