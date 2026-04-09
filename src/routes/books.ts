import { Router } from "express";
import {
  createBook,
  deleteBook,
  getBookById,
  listBooks,
  updateBook
} from "../controllers/books.js";

export const booksRouter = Router();

booksRouter.get("/", listBooks);
booksRouter.post("/", createBook);
booksRouter.get("/:id", getBookById);
booksRouter.put("/:id", updateBook);
booksRouter.delete("/:id", deleteBook);
