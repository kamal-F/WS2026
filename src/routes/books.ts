import { Router } from "express";
import {
  createBook,
  deleteBook,
  getBookById,
  listBooks,
  updateBook
} from "../controllers/books.js";
import { requireAuth } from "../middleware/auth.js";

export const booksRouter = Router();

booksRouter.get("/", listBooks);
booksRouter.post("/", requireAuth, createBook);
booksRouter.get("/:id", getBookById);
booksRouter.put("/:id", requireAuth, updateBook);
booksRouter.delete("/:id", requireAuth, deleteBook);
