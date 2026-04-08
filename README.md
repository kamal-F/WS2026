# Tutorial Praktik Web Service

Repo ini berisi bahan praktik Web Service berdasarkan `mini rps.pdf`, dengan stack utama Node.js, Express, dan TypeScript.

Fokus repo:

- praktik bertahap untuk setiap pertemuan non-ujian,
- REST API sebagai jalur praktik utama,
- pengenalan SOAP, microservice, RabbitMQ, gRPC, Kafka, dan integrasi arsitektur modern,
- strategi tag Git per progres pertemuan untuk repo GitHub `https://github.com/kamal-F/WS2026`.

## Urutan Pertemuan

Pertemuan 8 dan 16 dikecualikan dari tag praktik karena berisi UTS dan UAS/proyek.

| Pertemuan | Topik | Praktik | Tag yang Disarankan |
|---:|---|---|---|
| 1 | Pengantar Web Service & Sistem Terdistribusi | Peta client-server dan jenis komunikasi | `pertemuan-01` |
| 2 | HTTP & RESTful Principles | Eksperimen HTTP method dan status code | `pertemuan-02` |
| 3 | REST API Design | Desain resource, URI, error, pagination | `pertemuan-03` |
| 4 | Node.js, Express, TypeScript | Setup API skeleton | `pertemuan-04` |
| 5 | Implementasi REST API CRUD | CRUD endpoint | `pertemuan-05` |
| 6 | REST API + Database | Hubungkan API ke database | `pertemuan-06` |
| 7 | SOAP Web Service & WSDL | Membaca WSDL dan contoh SOAP message | `pertemuan-07` |
| 9 | API Testing & Documentation | OpenAPI dan testing endpoint | `pertemuan-09` |
| 10 | Authentication & Security Dasar | JWT auth, API key, CORS/rate limit konsep | `pertemuan-10` |
| 11 | Pengantar Microservice Architecture | Pecah monolith menjadi service boundary | `pertemuan-11` |
| 12 | Message Queue dengan RabbitMQ | Publish dan consume event | `pertemuan-12` |
| 13 | RPC & gRPC | Call antar service dengan `.proto` | `pertemuan-13` |
| 14 | Kafka & Event Streaming | Simulasi event log dan replay | `pertemuan-14` |
| 15 | Integrasi Arsitektur Web Service Modern | Rancang REST + MQ + gRPC + gateway | `pertemuan-15` |

Lihat detail praktik di folder [docs/pertemuan](docs/pertemuan).

## Menjalankan Project

```bash
npm install
npm run dev
```

Endpoint awal:

- `GET /health`
- `GET /api/v1/books`
- `POST /api/v1/books`
- `GET /api/v1/books/:id`
- `PUT /api/v1/books/:id`
- `DELETE /api/v1/books/:id`

## Struktur

```text
docs/
  pertemuan/        Panduan praktik per pertemuan
  tagging.md        Strategi commit dan tag Git
src/
  app.ts            Konfigurasi Express
  server.ts         Entry point
  routes/           Route API
  schemas/          Validasi request
  store/            Penyimpanan sementara
```

## Remote GitHub

Remote repo lokal ini sudah diarahkan ke:

```bash
https://github.com/kamal-F/WS2026.git
```

Setelah commit siap:

```bash
git push -u origin main
git push origin --tags
```

Panduan tag ada di [docs/tagging.md](docs/tagging.md).
