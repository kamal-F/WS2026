import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";

const databasePath = process.env.DATABASE_PATH
  ? resolve(process.cwd(), process.env.DATABASE_PATH)
  : resolve(process.cwd(), "data", "ws2026.db");

mkdirSync(dirname(databasePath), { recursive: true });

export const db = new DatabaseSync(databasePath);

export const initializeDatabase = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS books (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      year INTEGER NOT NULL,
      created_at TEXT NOT NULL
    )
  `);

  const countRow = db
    .prepare("SELECT COUNT(*) AS total FROM books")
    .get() as { total: number };

  if (countRow.total === 0) {
    seedBooks();
  }
};

export const seedBooks = () => {
  db.prepare(
    `
      INSERT INTO books (id, title, author, year, created_at)
      VALUES (?, ?, ?, ?, ?)
    `
  ).run(
    "book-001",
    "Web Service Fundamentals",
    "WS2026 Team",
    2026,
    new Date().toISOString()
  );
};
