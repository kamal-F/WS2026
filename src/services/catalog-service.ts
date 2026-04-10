import { db } from "../db/database.js";
import type { Book } from "../store/books.js";
import { publishDomainEvent } from "./message-broker.js";

export const getCatalogServiceHealth = () => {
  return {
    status: "ok" as const,
    service: "catalog-service",
    boundedContext: "book-catalog"
  };
};

export const getCatalogServiceStats = () => {
  const countRow = db
    .prepare("SELECT COUNT(*) AS total FROM books")
    .get() as { total: number };

  const latestRow = db
    .prepare(
      `
        SELECT id, title, author, year, created_at
        FROM books
        ORDER BY created_at DESC
        LIMIT 1
      `
    )
    .get() as
    | {
        id: string;
        title: string;
        author: string;
        year: number;
        created_at: string;
      }
    | undefined;

  return {
    totalBooks: countRow.total,
    latestBook: latestRow
      ? {
          id: latestRow.id,
          title: latestRow.title,
          author: latestRow.author,
          year: latestRow.year,
          createdAt: latestRow.created_at
        }
      : null
  };
};

export const getCatalogServiceDescriptor = () => {
  return {
    name: "catalog-service",
    kind: "domain-service" as const,
    basePath: "/services/catalog",
    healthPath: "/services/catalog/health",
    responsibilities: [
      "Mengelola CRUD buku",
      "Menyediakan statistik katalog",
      "Menjadi kandidat service terpisah untuk database buku"
    ],
    integrations: ["API Gateway", "SQLite database", "Message broker producer"]
  };
};

export const publishBookCreatedEvent = async (
  book: Book,
  triggeredBy: string
) => {
  return publishDomainEvent("book.created", "catalog-service", {
    bookId: book.id,
    title: book.title,
    author: book.author,
    year: book.year,
    triggeredBy
  });
};
