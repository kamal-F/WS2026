import { Router } from "express";
import { randomUUID } from "node:crypto";
import { bookInputSchema } from "../schemas/book.js";
import { books } from "../store/books.js";

export const booksRouter = Router();

booksRouter.get("/", (req, res) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 10);
  const start = (page - 1) * limit;
  const data = books.slice(start, start + limit);

  res.json({
    data,
    meta: {
      page,
      limit,
      total: books.length
    }
  });
});

booksRouter.post("/", (req, res) => {
  const parsed = bookInputSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Body request tidak valid",
        issues: parsed.error.flatten().fieldErrors
      }
    });
  }

  const book = {
    id: randomUUID(),
    ...parsed.data,
    createdAt: new Date().toISOString()
  };

  books.push(book);

  return res.status(201).json({ data: book });
});

booksRouter.get("/:id", (req, res) => {
  const book = books.find((item) => item.id === req.params.id);

  if (!book) {
    return res.status(404).json({
      error: {
        code: "BOOK_NOT_FOUND",
        message: "Buku tidak ditemukan"
      }
    });
  }

  return res.json({ data: book });
});

booksRouter.put("/:id", (req, res) => {
  const parsed = bookInputSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Body request tidak valid",
        issues: parsed.error.flatten().fieldErrors
      }
    });
  }

  const index = books.findIndex((item) => item.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({
      error: {
        code: "BOOK_NOT_FOUND",
        message: "Buku tidak ditemukan"
      }
    });
  }

  books[index] = {
    ...books[index],
    ...parsed.data
  };

  return res.json({ data: books[index] });
});

booksRouter.delete("/:id", (req, res) => {
  const index = books.findIndex((item) => item.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({
      error: {
        code: "BOOK_NOT_FOUND",
        message: "Buku tidak ditemukan"
      }
    });
  }

  books.splice(index, 1);

  return res.status(204).send();
});
