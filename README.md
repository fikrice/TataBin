# TataBin - Warehouse Management System (WMS)

TataBin WMS adalah sistem digital manajemen pergudangan (_Warehouse Management System_) decoupled berbasis web. Aplikasi ini membantu pencatatan stok barang, alokasi ruang penyimpanan (_Storage Bin_), tracking aset, serta audit transaksi pergudangan.

Sistem ini memakai arsitektur terpisah antara backend API dan frontend SPA. Tampilan aplikasi menggunakan tema **Industrial Dark Mode** yang responsif dan interaktif.

---

## Tech Stack & Arsitektur Sistem

### 1. Backend API (Node.js & Express.js)

- **Framework**: Express.js dengan ESM Modules.
- **Database & ORM**: PostgreSQL dengan Sequelize ORM.
- **Autentikasi**: JWT (JSON Web Token), dengan token klien disimpan di `localStorage`.
- **Keamanan**: BcryptJS untuk hashing password, Helmet, CORS, rate limiting, dan centralized error handler.
- **Ekspor Berkas**: `exceljs` untuk membuat laporan Excel.

### 2. Frontend SPA (Vue 3)

- **Build Tool**: Vite.
- **Style Framework**: Tailwind CSS + DaisyUI.
- **Ikonografi**: Lucide Icons sebagai ikon utama, dengan beberapa inline SVG untuk state/loading/komponen khusus.
- **State Management**: Pinia untuk state autentikasi.
- **Routing**: Vue Router dengan route guard untuk akses Admin dan Crew.
- **HTTP Client**: Axios dengan request interceptor untuk menyisipkan token Bearer JWT.
- **API Base URL**: `http://localhost:3000/api` pada `frontend/src/services/api.js`.

---

## Aturan Bisnis & Integritas Data

Sistem ini menerapkan validasi bisnis untuk menjaga konsistensi stok dan akurasi log pergudangan:

1. **Alur Kerja Berbasis Work Order (WO)**
    - Seluruh aktivitas penerimaan (Inbound) dan pengeluaran (Outbound) barang wajib didasarkan pada dokumen rujukan **Work Order** dengan target kuantitas yang ditentukan.
    - Status Work Order akan bertransisi secara dinamis: `To-Do` (Baru dibuat) $\rightarrow$ `On Progress` (Mulai dipindai) $\rightarrow$ `Done` (Kuantitas target terpenuhi).

2. **Pencocokan Kategori Aset & Bin**
    - Aset dan Storage Bin memiliki kategori ukuran yang sama (`Small Asset`, `Medium Asset`, `Large Asset`).
    - Aset hanya boleh dialokasikan ke Storage Bin dengan kategori yang cocok.

3. **Aturan Alokasi Slot (1-Bin-1-Aset)**
    - Satu Storage Bin hanya boleh menampung satu jenis aset unik (`1 Storage Bin = 1 Part Allocation`).

4. **Penegakan FIFO (First In First Out) Saat Pemindaian**
    - Pada proses Outbound, sistem secara dinamis memverifikasi scan barcode label unik.
    - Operator **wajib memindai unit terlama** yang masuk ke bin tersebut terlebih dahulu (berdasarkan tanggal scan masuk). Jika operator memindai unit baru mendahului unit terlama, sistem akan menolak pemindaian tersebut secara instan.

5. **Format Lembar Cetak QR Label Terstandar (A4)**
    - Crew dapat mencetak batch label barcode ke media kertas A4 dengan tata letak grid 2 kolom dan 5 baris (maksimal 10 label per lembar).
    - Setiap kartu label memuat Kode SKU, Nama Aset, Harga (Rupiah), Brand (`WMS Solution`), QR Code riil, dan nama Supplier.

6. **Log Transaksi Terpusat (11 Kolom Wajib)**
    - Aktivitas inbound dan outbound direkam secara mendetail per unit label unik ke tabel `work_order_scans` dan disinkronkan ke tabel riwayat lama, memuat 11 parameter data wajib untuk laporan audit.

---

## Struktur Direktori Proyek

```txt
TataBin/
|-- backend/
|   |-- migrations/          # Database migration files
|   |-- seeders/             # Seeder data demo awal
|   |-- src/
|   |   |-- config/          # Konfigurasi database
|   |   |-- controllers/     # Request handler & business logic
|   |   |-- middlewares/     # Auth, rate limiter, error handler
|   |   |-- models/          # Sequelize models
|   |   |-- repositories/    # Repository layer bila dibutuhkan
|   |   |-- routes/          # Router Express per modul
|   |   |-- services/        # Service layer bila dibutuhkan
|   |   |-- utils/           # Helper/utilitas umum
|   |   `-- validations/     # Validasi request bila dibutuhkan
|   |-- .env
|   |-- package.json
|   `-- server.js            # Entry point backend
|-- frontend/
|   |-- public/              # Favicon, manifest, asset publik
|   |-- src/
|   |   |-- assets/          # Global styles dan asset lokal
|   |   |-- components/      # Komponen UI reusable
|   |   |-- layouts/         # Layout utama aplikasi
|   |   |-- pages/           # Halaman WMS
|   |   |-- router/          # Konfigurasi Vue Router
|   |   |-- services/        # Axios API client
|   |   |-- stores/          # Pinia stores
|   |   `-- utils/           # Helper frontend
|   |-- index.html
|   |-- package.json
|   `-- vite.config.js
|-- docker-compose.yml       # PostgreSQL Docker service
`-- README.md
```

---

## Petunjuk Setup & Instalasi Lokal

### Prasyarat

- Node.js versi `^18.x` atau lebih baru.
- Docker & Docker Desktop.
- NPM.

### 1. Inisialisasi Database

Jalankan container PostgreSQL dari root project:

```bash
docker-compose up -d
```

Database default dari `docker-compose.yml`:

```txt
Host     : localhost
Port     : 5432
Database : tatabin_db
User     : postgres
Password : postgres
```

### 2. Setup Backend Server

Masuk ke folder backend, instal dependensi, pastikan file `.env` tersedia, lalu jalankan migrasi dan seeder.

```bash
cd backend
npm install
npm run migrate
npm run seed
npm run dev
```

Contoh konfigurasi `backend/.env`:

```env
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=tatabin_db

JWT_SECRET=replace-with-a-random-secret-min-32-chars
JWT_EXPIRES_IN=7d
```

Backend API berjalan di `http://localhost:3000`.

### 3. Setup Frontend Client

Masuk ke folder frontend, instal dependensi, lalu jalankan server development:

```bash
cd frontend
npm install
npm run dev
```

Frontend berjalan di `http://localhost:5173`.

---

## QA API Testing (Pengujian Otomatis)

Sistem ini dilengkapi dengan script pengujian otomatis untuk memverifikasi fungsionalitas seluruh endpoint API penting, alur kerja Work Order, serta penegakan aturan FIFO.

Jalankan perintah ini di dalam folder `backend`:
```bash
cd backend
npm run test:api
```

Script akan memverifikasi:
- Autentikasi dan penerbitan token JWT.
- Integrasi CRUD & pencarian Master Data.
- Siklus hidup Inbound Work Order (pembuatan, pratinjau label, dan scan masuk hingga status Done).
- Siklus hidup Outbound Work Order (pembuatan, FIFO suggestions).
- **FIFO Enforcement**: Memastikan bahwa memindai unit di luar urutan FIFO akan ditolak secara ketat oleh sistem.
- Ekspor berkas audit log transaksi ke format Excel (.xlsx).

---

## Akun Demo Pengujian

Setelah database diisi seeder, Anda dapat login menggunakan akun berikut:

| Peran     | Username / Email              | Password     | Hak Akses                                                              |
| --------- | ----------------------------- | ------------ | ---------------------------------------------------------------------- |
| **Admin** | `admin` / `admin@tatabin.com` | `admin123`   | Akses penuh ke master data dan operasional                             |
| **Crew**  | `crew` / `crew@tatabin.com`   | `Qwerty123*` | Dashboard, inbound, outbound, laporan, dan analitik sesuai route guard |

Catatan: saat Admin membuat user role `crew` tanpa mengisi password, backend memakai password default `Qwerty123*`.

---
