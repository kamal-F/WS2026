import type { BookInput } from "../schemas/book.js";

export type Book = BookInput & {
  id: string;
  createdAt: string;
};

export const books: Book[] = [
  {
    id: "book-001",
    title: "Web Service Fundamentals",
    author: "WS2026 Team",
    year: 2026,
    createdAt: new Date().toISOString()
  }
];
