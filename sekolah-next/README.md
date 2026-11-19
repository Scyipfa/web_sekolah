# School Management System — SMK Negeri 1 Palangka Raya

Versi Next.js (Node.js) + PostgreSQL dari aplikasi PHP/XAMPP `web_sekolah`, siap di-hosting di **Vercel**.
Semua fitur lama tetap ada: login, dashboard + grafik, data siswa/guru/pelajaran/jurusan, hasil ujian
(hitung otomatis total, min, max, rata-rata, LULUS/TIDAK dengan batas 60), profil sekolah, profil user,
upload foto, dan export Excel (.xlsx).

| Dulu (XAMPP)            | Sekarang (Vercel)                                  |
|-------------------------|----------------------------------------------------|
| PHP native              | Next.js 15 (JavaScript)                            |
| MySQL lokal             | PostgreSQL cloud (Neon, gratis)                    |
| Folder `uploads/`       | Foto disimpan di tabel `tbl_file` (database)       |
| Session PHP + CSRF      | Cookie sesi bertanda tangan (JWT, httpOnly) + Server Actions |

## 1. Deploy ke Vercel

1. Upload folder ini ke repository GitHub (jangan ikutkan `node_modules`, `.next`, `.env.local`).
2. Di [vercel.com](https://vercel.com) → **Add New → Project** → pilih repository tersebut → **Deploy**.
3. Buka project → tab **Storage** → **Create Database** → pilih **Neon (Postgres)** → hubungkan ke project.
   Vercel otomatis mengisi variabel `DATABASE_URL`.
4. Tab **Settings → Environment Variables** → tambahkan `SESSION_SECRET` berisi teks acak panjang
   (mis. hasil `openssl rand -hex 32`).
5. **Deployments → Redeploy**.

Tabel dibuat otomatis saat aplikasi pertama kali dibuka. Jika database masih kosong, akun awal adalah
`admin` / `admin123` — segera ganti password lewat menu **Profile**.

## 2. Memindahkan data lama dari XAMPP

Jalankan di komputer yang punya XAMPP (MySQL harus menyala):

```bash
npm install
# Windows PowerShell:
$env:DATABASE_URL="postgresql://...neon.tech/neondb?sslmode=require"   # salin dari Vercel → Storage → Neon
npm run import-mysql
```

Script membaca database `db_sekolah` (user `root`, tanpa password) dan menyalin semua tabel serta foto
dari `..\web_sekolah\uploads`. Ubah lewat variabel `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD`,
`MYSQL_DATABASE`, `UPLOADS_DIR` bila berbeda. **Data di PostgreSQL untuk tabel yang sama akan ditimpa.**
Password user lama tetap berlaku.

## 3. Menjalankan di komputer sendiri

```bash
npm install
copy .env.example .env.local   # isi DATABASE_URL & SESSION_SECRET
npm run db:setup               # opsional: buat tabel + akun admin
npm run dev                    # buka http://localhost:3000
```

## Struktur

- `app/` — halaman & aksi (`siswa`, `guru`, `pelajaran`, `jurusan`, `ujian`, `sekolah`, `profile`, `login`)
- `components/` — layout sidebar, grafik, pagination, dll.
- `lib/` — koneksi database, skema, sesi, upload, export Excel
- `scripts/` — `setup-db.mjs`, `import-mysql.mjs`
