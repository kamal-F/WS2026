import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import express, { Router } from "express";
import { findBookById } from "../services/books.js";

const soapRouter = Router();
const wsdlPath = resolve(process.cwd(), "examples", "soap", "book-service.wsdl");

const escapeXml = (value: string) => {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
};

const soapFault = (code: string, message: string) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
  <soapenv:Body>
    <soapenv:Fault>
      <faultcode>${escapeXml(code)}</faultcode>
      <faultstring>${escapeXml(message)}</faultstring>
    </soapenv:Fault>
  </soapenv:Body>
</soapenv:Envelope>`;
};

const soapResponse = (book: {
  id: string;
  title: string;
  author: string;
  year: number;
}) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope
  xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:bk="http://ws2026.example.com/book-service">
  <soapenv:Header />
  <soapenv:Body>
    <bk:GetBookResponse>
      <bk:id>${escapeXml(book.id)}</bk:id>
      <bk:title>${escapeXml(book.title)}</bk:title>
      <bk:author>${escapeXml(book.author)}</bk:author>
      <bk:year>${book.year}</bk:year>
    </bk:GetBookResponse>
  </soapenv:Body>
</soapenv:Envelope>`;
};

soapRouter.get("/book-service", (req, res) => {
  if (!("wsdl" in req.query)) {
    return res.status(404).json({
      error: {
        code: "NOT_FOUND",
        message: "Gunakan /soap/book-service?wsdl untuk membaca WSDL"
      }
    });
  }

  const rawWsdl = readFileSync(wsdlPath, "utf8");
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const wsdl = rawWsdl.replace(
    "http://localhost:3001/soap/book-service",
    `${baseUrl}/soap/book-service`
  );

  res.type("text/xml");
  return res.send(wsdl);
});

soapRouter.post("/book-service", express.text({ type: ["text/xml", "application/soap+xml"] }));

soapRouter.post("/book-service", (req, res) => {
  const body = typeof req.body === "string" ? req.body : "";
  const match = body.match(/<[^:>]*:?bookId>([^<]+)<\/[^:>]*:?bookId>/i);

  if (!match) {
    res.status(400).type("text/xml");
    return res.send(soapFault("Client", "Elemen bookId wajib ada di SOAP Body"));
  }

  const bookId = match[1].trim();
  const book = findBookById(bookId);

  if (!book) {
    res.status(404).type("text/xml");
    return res.send(soapFault("Client", "Book tidak ditemukan"));
  }

  res.type("text/xml");
  return res.send(soapResponse(book));
});

export { soapRouter };
