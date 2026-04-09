import { randomUUID } from "node:crypto";
import type { Request, Response } from "express";
import { bookInputSchema, type BookInput } from "../schemas/book.js";
import { books, type Book } from "../store/books.js";
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
  const start = (page - 1) * limit;
  const data = books.slice(start, start + limit);

  return res.json({
    data,
    meta: {
      page,
      limit,
      total: books.length
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

  books.push(book);

  return res.status(201).json({ data: book });
};

export const getBookById = (
  req: Request<BookParams, SuccessBody<Book> | ErrorBody>,
  res: Response<SuccessBody<Book> | ErrorBody>
) => {
  const book = books.find((item) => item.id === req.params.id);

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

  const index = books.findIndex((item) => item.id === req.params.id);

  if (index === -1) {
    return notFound(res);
  }

  books[index] = {
    ...books[index],
    ...parsed.data
  };

  return res.json({ data: books[index] });
};

export const deleteBook = (
  req: Request<BookParams, undefined | ErrorBody>,
  res: Response<undefined | ErrorBody>
) => {
  const index = books.findIndex((item) => item.id === req.params.id);

  if (index === -1) {
    return notFound(res);
  }

  books.splice(index, 1);

  return res.status(204).send();
};
