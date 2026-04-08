# Strategi Tag Progress Pertemuan

Gunakan tag setelah praktik pertemuan selesai dan sudah dicommit. UTS dan UAS tidak perlu dibuat tag praktik.

## Setup Remote

```bash
git init
git branch -M main
git remote add origin https://github.com/kamal-F/WS2026.git
```

## Pola Commit dan Tag

Contoh setelah pertemuan 4 selesai:

```bash
git add .
git commit -m "Pertemuan 04: setup Express TypeScript"
git tag pertemuan-04
git push origin main
git push origin pertemuan-04
```

## Daftar Tag

| Tag | Setelah Praktik |
|---|---|
| `pertemuan-01` | Peta konsep client-server selesai |
| `pertemuan-02` | Eksperimen HTTP method dan status code selesai |
| `pertemuan-03` | Desain endpoint REST selesai |
| `pertemuan-04` | Skeleton Express TypeScript berjalan |
| `pertemuan-05` | CRUD REST API selesai |
| `pertemuan-06` | API terhubung database |
| `pertemuan-07` | Demo SOAP/WSDL selesai |
| `pertemuan-09` | Dokumentasi OpenAPI dan testing selesai |
| `pertemuan-10` | JWT auth selesai |
| `pertemuan-11` | Desain microservice selesai |
| `pertemuan-12` | RabbitMQ publish/consume selesai |
| `pertemuan-13` | Demo gRPC selesai |
| `pertemuan-14` | Studi kasus Kafka/event streaming selesai |
| `pertemuan-15` | Integrasi arsitektur modern selesai |

## Catatan

Jika ingin menjaga histori pembelajaran yang benar-benar bertahap, jangan membuat semua tag di akhir pada commit yang sama. Buat tag satu per satu setelah perubahan pertemuan tersebut selesai.
