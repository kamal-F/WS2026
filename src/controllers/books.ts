import { randomUUID } from "node:crypto";
import type { Request, Response } from "express";
import { bookInputSchema, type BookInput } from "../schemas/book.js";
import type { Book } from "../store/books.js";
import {
  createBookInDatabase,
  deleteBookFromDatabase,
  findBookById,
  listBooksFromDatabase,
  updateBookInDatabase
} from "../services/books.js";
import type { ErrorBody, PaginatedBody, SuccessBody } from "../types/api.js";

type BookParams = {
  id: string;
};

type BookListQuery = {
  page?: string;
  limit?: string;
};

const notFound = (
  res: Response<ErrorBody>,
  message = "Buku tidak ditemukan"
) => {
  return res.status(404).json({
    error: {
      code: "BOOK_NOT_FOUND",
      message
    }
  });
};

const validationError = (
  res: Response<ErrorBody>,
  issues: Record<string, string[] | undefined>
) => {
  return res.status(400).json({
    error: {
      code: "VALIDATION_ERROR",
      message: "Body request tidak valid",
      issues
    }
  });
};

export const listBooks = (
  req: Request<Record<string, never>, PaginatedBody<Book>, never, BookListQuery>,
  res: Response<PaginatedBody<Book>>
) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 10);
  const result = listBooksFromDatabase(page, limit);

  return res.json({
    data: result.data,
    meta: {
      page,
      limit,
      total: result.total
    }
  });
};

export const createBook = (
  req: Request<Record<string, never>, SuccessBody<Book> | ErrorBody, BookInput>,
  res: Response<SuccessBody<Book> | ErrorBody>
) => {
  const parsed = bookInputSchema.safeParse(req.body);

  if (!parsed.success) {
    return validationError(res, parsed.error.flatten().fieldErrors);
  }

  const book: Book = {
    id: randomUUID(),
    ...parsed.data,
    createdAt: new Date().toISOString()
  };

  return res.status(201).json({ data: createBookInDatabase(book) });
};

export const getBookById = (
  req: Request<BookParams, SuccessBody<Book> | ErrorBody>,
  res: Response<SuccessBody<Book> | ErrorBody>
) => {
  const book = findBookById(req.params.id);

  if (!book) {
    return notFound(res);
  }

  return res.json({ data: book });
};

export const updateBook = (
  req: Request<BookParams, SuccessBody<Book> | ErrorBody, BookInput>,
  res: Response<SuccessBody<Book> | ErrorBody>
) => {
  const parsed = bookInputSchema.safeParse(req.body);

  if (!parsed.success) {
    return validationError(res, parsed.error.flatten().fieldErrors);
  }

  const updated = updateBookInDatabase(req.params.id, parsed.data);

  if (!updated) {
    return notFound(res);
  }

  return res.json({ data: updated });
};

export const deleteBook = (
  req: Request<BookParams, undefined | ErrorBody>,
  res: Response<undefined | ErrorBody>
) => {
  const deleted = deleteBookFromDatabase(req.params.id);

  if (!deleted) {
    return notFound(res);
  }

  return res.status(204).send();
};
