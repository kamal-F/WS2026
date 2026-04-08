# Hasil Praktik Pertemuan 2

## Tujuan

Memahami cara kerja HTTP method, status code, statelessness, dan prinsip REST melalui percobaan langsung ke API lokal.

## Menjalankan Server

```bash
npm run dev
```

## Percobaan `curl`

Gunakan `curl.exe` di PowerShell agar perilakunya konsisten.

Untuk request yang membawa JSON, cara paling stabil di PowerShell adalah menaruh body ke file sementara lalu mengirimkannya dengan `--data-binary`.

### 1. Health Check

```bash
curl.exe http://localhost:3000/health
```

Hasil yang diharapkan:

```json
{"status":"ok","service":"ws2026-api"}
```

### 2. GET daftar buku

```bash
curl.exe http://localhost:3000/api/v1/books
```

Tujuan:

- melihat method `GET`,
- melihat response resource collection,
- melihat bentuk response JSON.

### 3. POST buku baru

```bash
Set-Content -LiteralPath .\book-valid.json -NoNewline -Value '{"title":"REST API Dasar","author":"Kamal","year":2026}'
curl.exe -X POST http://localhost:3000/api/v1/books `
  -H "Content-Type: application/json" `
  --data-binary "@book-valid.json"
```

Tujuan:

- melihat method `POST`,
- memahami pembuatan resource baru,
- melihat status code `201 Created`.

Hasil yang diharapkan:

- status `201 Created`,
- body response JSON berisi data buku baru.

### 4. POST invalid

```bash
Set-Content -LiteralPath .\book-invalid.json -NoNewline -Value '{"title":"No","author":"AB","year":1800}'
curl.exe -X POST http://localhost:3000/api/v1/books `
  -H "Content-Type: application/json" `
  --data-binary "@book-invalid.json"
```

Tujuan:

- melihat validasi request body,
- memahami kapan API mengembalikan `400 Bad Request`.

Contoh response:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Body request tidak valid"
  }
}
```

### 5. POST malformed JSON

```bash
Set-Content -LiteralPath .\book-malformed.json -NoNewline -Value '{"title":"REST API Dasar"'
curl.exe -X POST http://localhost:3000/api/v1/books `
  -H "Content-Type: application/json" `
  --data-binary "@book-malformed.json"
```

Tujuan:

- memahami perbedaan antara JSON tidak valid dan data valid tetapi tidak lolos aturan bisnis,
- melihat response `400 Bad Request` untuk body yang tidak bisa diparse.

Contoh response:

```json
{
  "error": {
    "code": "INVALID_JSON",
    "message": "Body request harus berupa JSON yang valid"
  }
}
```

### 6. GET resource yang tidak ada

```bash
curl.exe http://localhost:3000/api/v1/books/book-tidak-ada
```

Tujuan:

- memahami perbedaan antara route valid dan resource tidak ditemukan,
- melihat status code `404 Not Found`.

### 7. PUT update buku

Gunakan `id` hasil dari `POST`.

```bash
Set-Content -LiteralPath .\book-update.json -NoNewline -Value '{"title":"REST API Lanjut","author":"Kamal","year":2026}'
curl.exe -X PUT http://localhost:3000/api/v1/books/{id} `
  -H "Content-Type: application/json" `
  --data-binary "@book-update.json"
```

Tujuan:

- memahami update resource,
- melihat penggunaan method `PUT`.

### 8. DELETE buku

Gunakan `id` hasil dari `POST`.

```bash
curl.exe -X DELETE http://localhost:3000/api/v1/books/{id}
```

Tujuan:

- memahami penghapusan resource,
- melihat status code `204 No Content`.

### 9. Route yang tidak ada

```bash
curl.exe http://localhost:3000/api/v1/unknown
```

Tujuan:

- melihat perbedaan route tidak ditemukan dengan resource tidak ditemukan,
- memahami response error global.

## Tabel Hasil Pengamatan

| Skenario | Method | Endpoint | Status Code | Makna |
|---|---|---|---:|---|
| Health check | `GET` | `/health` | 200 | Request berhasil |
| Ambil daftar buku | `GET` | `/api/v1/books` | 200 | Resource collection berhasil diambil |
| Tambah buku valid | `POST` | `/api/v1/books` | 201 | Resource baru berhasil dibuat |
| Tambah buku invalid | `POST` | `/api/v1/books` | 400 | Body request tidak valid |
| JSON tidak valid | `POST` | `/api/v1/books` | 400 | Format JSON rusak atau tidak lengkap |
| Detail buku tidak ada | `GET` | `/api/v1/books/:id` | 404 | Route valid, resource tidak ditemukan |
| Update buku valid | `PUT` | `/api/v1/books/:id` | 200 | Resource berhasil diperbarui |
| Hapus buku valid | `DELETE` | `/api/v1/books/:id` | 204 | Resource berhasil dihapus tanpa body response |
| Route salah | `GET` | `/api/v1/unknown` | 404 | Endpoint tidak ditemukan |

## Catatan REST

- API bersifat stateless karena setiap request berdiri sendiri.
- Resource utama direpresentasikan oleh URI `/api/v1/books`.
- Method HTTP menunjukkan aksi terhadap resource.
- Status code membantu client memahami hasil request tanpa harus menebak-nebak isi response.
