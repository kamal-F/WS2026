# Hasil Praktik Pertemuan 3

## Tujuan

Mendesain REST API untuk domain perpustakaan dengan pendekatan resource-oriented.

## Domain dan Resource

Studi kasus memakai tiga resource utama:

- `books` untuk data buku
- `members` untuk data anggota
- `loans` untuk transaksi peminjaman

Relasi sederhananya:

- satu `member` bisa memiliki banyak `loans`
- satu `book` bisa muncul di banyak `loans`
- `loan` merepresentasikan aktivitas peminjaman sebuah buku oleh seorang anggota

## Prinsip Desain

- URI memakai kata benda, bukan kata kerja
- nama resource memakai bentuk jamak
- versi API ditulis di path: `/api/v1/...`
- response sukses dan error memakai format JSON yang konsisten
- endpoint list mendukung pagination

## Daftar Endpoint

### Books

| Method | Endpoint | Kegunaan |
|---|---|---|
| `GET` | `/api/v1/books` | Ambil daftar buku |
| `POST` | `/api/v1/books` | Tambah buku baru |
| `GET` | `/api/v1/books/:id` | Ambil detail buku |
| `PUT` | `/api/v1/books/:id` | Ubah data buku |
| `DELETE` | `/api/v1/books/:id` | Hapus buku |

### Members

| Method | Endpoint | Kegunaan |
|---|---|---|
| `GET` | `/api/v1/members` | Ambil daftar anggota |
| `POST` | `/api/v1/members` | Tambah anggota baru |
| `GET` | `/api/v1/members/:id` | Ambil detail anggota |
| `PUT` | `/api/v1/members/:id` | Ubah data anggota |
| `DELETE` | `/api/v1/members/:id` | Hapus anggota |

### Loans

| Method | Endpoint | Kegunaan |
|---|---|---|
| `GET` | `/api/v1/loans` | Ambil daftar transaksi peminjaman |
| `POST` | `/api/v1/loans` | Buat transaksi peminjaman |
| `GET` | `/api/v1/loans/:id` | Ambil detail transaksi |
| `PUT` | `/api/v1/loans/:id/return` | Tandai buku sudah dikembalikan |

Catatan:

- endpoint `PUT /api/v1/loans/:id/return` dipakai karena kasus bisnisnya spesifik, yaitu mengubah status peminjaman menjadi selesai,
- alternatif lain adalah `PATCH /api/v1/loans/:id`, tetapi untuk pembelajaran awal bentuk explicit action seperti ini lebih mudah dipahami.

## Contoh Request dan Response

### 1. GET daftar buku

Request:

```http
GET /api/v1/books?page=1&limit=10 HTTP/1.1
Host: localhost:3000
```

Response:

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

### 2. POST buku baru

Request body:

```json
{
  "title": "REST API Dasar",
  "author": "Kamal",
  "year": 2026
}
```

Response:

```json
{
  "data": {
    "id": "book-002",
    "title": "REST API Dasar",
    "author": "Kamal",
    "year": 2026,
    "createdAt": "2026-04-09T00:00:00.000Z"
  }
}
```

### 3. Error validation

Response:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Body request tidak valid",
    "issues": {
      "title": ["String must contain at least 3 character(s)"]
    }
  }
}
```

### 4. Resource tidak ditemukan

Response:

```json
{
  "error": {
    "code": "BOOK_NOT_FOUND",
    "message": "Buku tidak ditemukan"
  }
}
```

## Konvensi Pagination

Endpoint list memakai query parameter:

- `page` untuk nomor halaman
- `limit` untuk jumlah item per halaman

Contoh:

```http
GET /api/v1/books?page=2&limit=5 HTTP/1.1
```

Format metadata pagination:

```json
{
  "meta": {
    "page": 2,
    "limit": 5,
    "total": 12
  }
}
```

## Naming Convention

Konvensi URI yang dipakai:

- benar: `/api/v1/books`
- benar: `/api/v1/books/:id`
- benar: `/api/v1/members`
- hindari: `/api/v1/getBooks`
- hindari: `/api/v1/createBook`

Alasannya:

- method HTTP sudah mewakili aksi
- URI fokus pada resource
- desain menjadi lebih konsisten dan mudah dikembangkan

## Kesimpulan

Desain REST API untuk domain perpustakaan disusun dari resource utama `books`, `members`, dan `loans`, memakai versi `/api/v1`, format error yang konsisten, dan pagination sederhana. Desain ini cukup stabil untuk dijadikan dasar implementasi di pertemuan berikutnya.
