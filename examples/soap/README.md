# SOAP Demo

Folder ini berisi artefak sederhana untuk pertemuan 7:

- `book-service.wsdl` untuk membaca struktur service contract
- `requests/get-book-request.xml` untuk contoh SOAP request
- `requests/get-book-unknown-request.xml` untuk contoh SOAP request yang memicu fault
- `responses/get-book-response.xml` untuk contoh SOAP response

Fokusnya adalah memahami:

- struktur `definitions`, `message`, `portType`, `binding`, dan `service`
- bentuk SOAP envelope
- perbedaan pendekatan SOAP contract-first dengan REST resource-oriented

## Cara Test

Jalankan server:

```bash
npm run dev
```

Baca WSDL:

```bash
curl.exe http://localhost:3000/soap/book-service?wsdl
```

Kirim SOAP request valid:

```bash
curl.exe -X POST http://localhost:3000/soap/book-service -H "Content-Type: text/xml" --data-binary "@examples/soap/requests/get-book-request.xml"
```

Kirim SOAP request untuk buku yang tidak ada:

```bash
curl.exe -X POST http://localhost:3000/soap/book-service -H "Content-Type: text/xml" --data-binary "@examples/soap/requests/get-book-unknown-request.xml"
```
