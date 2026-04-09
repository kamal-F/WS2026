import { db } from "../db/database.js";
import type { BookInput } from "../schemas/book.js";
import type { Book } from "../store/books.js";

type BookRow = {
  id: string;
  title: string;
  author: string;
  year: number;
  created_at: string;
};

const toBook = (row: BookRow): Book => {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    year: row.year,
    createdAt: row.created_at
  };
};

export const listBooksFromDatabase = (page: number, limit: number) => {
  const offset = (page - 1) * limit;

  const rows = db
    .prepare(
      `
        SELECT id, title, author, year, created_at
        FROM books
        ORDER BY created_at ASC
        LIMIT ? OFFSET ?
      `
    )
    .all(limit, offset) as BookRow[];

  const countRow = db
    .prepare("SELECT COUNT(*) AS total FROM books")
    .get() as { total: number };

  return {
    data: rows.map(toBook),
    total: countRow.total
  };
};

export const createBookInDatabase = (book: Book) => {
  db.prepare(
    `
      INSERT INTO books (id, title, author, year, created_at)
      VALUES (?, ?, ?, ?, ?)
    `
  ).run(book.id, book.title, book.author, book.year, book.createdAt);

  return book;
};

export const findBookById = (id: string) => {
  const row = db
    .prepare(
      `
        SELECT id, title, author, year, created_at
        FROM books
        WHERE id = ?
      `
    )
    .get(id) as BookRow | undefined;

  return row ? toBook(row) : null;
};

export const updateBookInDatabase = (id: string, input: BookInput) => {
  const current = findBookById(id);

  if (!current) {
    return null;
  }

  db.prepare(
    `
      UPDATE books
      SET title = ?, author = ?, year = ?
      WHERE id = ?
    `
  ).run(input.title, input.author, input.year, id);

  return {
    ...current,
    ...input
  };
};

export const deleteBookFromDatabase = (id: string) => {
  const current = findBookById(id);

  if (!current) {
    return false;
  }

  db.prepare("DELETE FROM books WHERE id = ?").run(id);

  return true;
};
