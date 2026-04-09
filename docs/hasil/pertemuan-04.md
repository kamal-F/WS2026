# Hasil Praktik Pertemuan 4

## Tujuan

Menjalankan skeleton API berbasis Node.js, Express, dan TypeScript.

## Dependency Utama

Project ini memakai:

- `express` untuk HTTP server dan routing
- `typescript` untuk static typing
- `tsx` untuk menjalankan file TypeScript saat development
- `helmet` untuk header keamanan dasar
- `cors` untuk mengatur akses cross-origin
- `morgan` untuk logging request
- `zod` untuk validasi data
- `dotenv` untuk membaca konfigurasi dari file `.env`

## Langkah Setup

### 1. Install dependency

```bash
npm install
```

### 2. Jalankan mode development

```bash
npm run dev
```

Script ini menjalankan:

```bash
tsx watch src/server.ts
```

Artinya:

- file TypeScript tidak perlu dibuild manual saat development,
- perubahan file akan membuat server restart otomatis.

### 3. Verifikasi endpoint awal

```bash
curl.exe http://localhost:3000/health
```

Hasil uji terminal:

```json
{"status":"ok","service":"ws2026-api"}
```

### 4. Verifikasi resource awal

```bash
curl.exe http://localhost:3000/api/v1/books
```

Contoh hasil:

```json
{
  "data": [
    {
      "id": "book-001",
      "title": "Web Service Fundamentals",
      "author": "WS2026 Team",
      "year": 2026
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 1
  }
}
```

## Struktur File Inti

| File | Peran |
|---|---|
| `src/server.ts` | Entry point aplikasi |
| `src/app.ts` | Konfigurasi Express dan middleware |
| `src/routes/health.ts` | Endpoint health check |
| `src/routes/books.ts` | Endpoint books |
| `src/schemas/book.ts` | Validasi input buku |
| `src/store/books.ts` | Data sementara di memory |

## Middleware di `src/app.ts`

Middleware yang dipakai:

- `helmet()` untuk header keamanan dasar
- `cors()` untuk mengizinkan request lintas origin
- `express.json()` untuk parsing body JSON
- `morgan("dev")` untuk logging request development

Selain itu ada:

- handler error untuk JSON yang tidak valid
- handler `404` untuk route yang tidak ditemukan

## Alur Startup

1. `src/server.ts` membaca konfigurasi environment
2. Express app diambil dari `src/app.ts`
3. server listen pada port `3000` jika `PORT` belum diisi
4. route `/health` dan `/api/v1/books` siap diakses

## Kesimpulan

Pada pertemuan 4, project Express + TypeScript berhasil dijalankan sebagai API skeleton. Mahasiswa sudah memiliki fondasi untuk masuk ke implementasi CRUD pada pertemuan berikutnya.
