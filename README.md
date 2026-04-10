# Tutorial Praktik Web Service

Repo ini berisi bahan praktik Web Service versi 2026, dengan stack utama Node.js, Express, dan TypeScript.

Fokus repo:

- praktik bertahap untuk setiap pertemuan non-ujian,
- REST API sebagai jalur praktik utama,
- pengenalan SOAP, microservice, RabbitMQ, gRPC, event streaming, dan integrasi arsitektur modern.

## Urutan Pertemuan

Pertemuan 8 dan 16 tidak dimasukkan ke alur praktik rutin karena berisi UTS dan UAS/proyek.

| Pertemuan | Topik | Praktik |
|---:|---|---|
| 1 | Pengantar Web Service & Sistem Terdistribusi | Peta client-server dan jenis komunikasi |
| 2 | HTTP & RESTful Principles | Eksperimen HTTP method dan status code |
| 3 | REST API Design | Desain resource, URI, error, pagination |
| 4 | Node.js, Express, TypeScript | Setup API skeleton |
| 5 | Implementasi REST API CRUD | CRUD endpoint |
| 6 | REST API + Database | Hubungkan API ke database |
| 7 | SOAP Web Service & WSDL | Membaca WSDL dan contoh SOAP message |
| 9 | API Testing & Documentation | OpenAPI dan testing endpoint |
| 10 | Authentication & Security Dasar | JWT auth, API key, CORS/rate limit konsep |
| 11 | Pengantar Microservice Architecture | Breakdown monolith, service boundary, dan data ownership |
| 12 | Message Queue dengan RabbitMQ | Asynchronous communication, producer-consumer, publish-consume event |
| 13 | RPC & gRPC | REST vs RPC, `.proto`, dan gRPC service communication |
| 14 | Event Streaming | Event log, replay, dan streaming architecture |
| 15 | Integrasi Arsitektur Web Service Modern | REST + MQ, REST + gRPC, API Gateway, observability |

## Menjalankan Project

```bash
npm install
npm run dev
```

Endpoint awal:

- `GET /health`
- `GET /architecture/services`
- `POST /api/v1/auth/login`
- `GET /api/v1/books`
- `POST /api/v1/books`
- `GET /api/v1/books/:id`
- `PUT /api/v1/books/:id`
- `DELETE /api/v1/books/:id`
- `GET /api/v1/integration/books/:id/overview`
- `GET /services/identity/health`
- `POST /services/identity/login`
- `GET /services/catalog/health`
- `GET /services/catalog/stats`
- `GET /services/catalog/books`
- `GET /services/events/health`
- `GET /services/grpc/health`
- `GET /services/grpc/books/:id/summary`
- `GET /services/notifications/health`
- `GET /services/notifications/events`
- `GET /services/observability/health`
- `GET /services/observability/logs`
- `GET /services/streaming/health`
- `GET /services/streaming/topics`
- `GET /services/streaming/topics/:topic/replay`
- `GET /openapi.yaml`
- `GET /docs`
- `GET /soap/book-service?wsdl`
- `POST /soap/book-service`

Artefak contoh SOAP/WSDL untuk pertemuan 7 tersedia di `examples/soap/`.

Contoh test SOAP:

```bash
curl.exe http://localhost:3000/soap/book-service?wsdl
curl.exe -X POST http://localhost:3000/soap/book-service -H "Content-Type: text/xml" --data-binary "@examples/soap/requests/get-book-request.xml"
```

Dokumentasi OpenAPI:

```bash
curl.exe http://localhost:3000/openapi.yaml
```

Swagger UI:

```bash
start http://localhost:3000/docs
```

Menjalankan test:

```bash
npm test
```

Demo login:

```bash
curl.exe -X POST http://localhost:3000/api/v1/auth/login -H "Content-Type: application/json" -d "{\"email\":\"admin@ws2026.local\",\"password\":\"secret123\"}"
```

## Struktur

```text
examples/
  soap/             Demo WSDL dan SOAP message
src/
  app.ts            Konfigurasi Express
  server.ts         Entry point
  controllers/      Handler per bounded context
  services/         Business logic dan service boundary
  routes/           Route API
  schemas/          Validasi request
  db/               Koneksi dan inisialisasi database
```
