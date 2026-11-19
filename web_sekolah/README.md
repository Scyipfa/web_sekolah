# School Management System

Sistem informasi manajemen sekolah — PHP Native + MySQL, dirancang untuk XAMPP.

## Kebutuhan
- XAMPP (Apache + MySQL + PHP 8.x)
- Database `db_sekolah` (struktur: `tbl_user`, `tbl_siswa`, `tbl_guru`, `tbl_pelajaran`, `tbl_ujian`, `tbl_nilai_ujian`, `tbl_sekolah`)

## Instalasi

1. **Salin project ke htdocs**
   ```
   C:\xampp\htdocs\web_sekolah\
   ```
   Jika nama folder berbeda, ubah `BASE_URL` di `config/database.php`.

2. **Import database** — via phpMyAdmin, import file `db_sekolah.sql` ke database `db_sekolah`.

3. **Buat akun admin pertama** — tabel `tbl_user` kosong saat pertama kali. Jalankan `setup_admin.sql` di phpMyAdmin, lalu login dengan:
   - Username: `admin`
   - Password: `admin123` (segera ganti via menu Profile)

4. **Sesuaikan kredensial DB** bila perlu di `config/database.php` (default: root / tanpa password).

5. Buka `http://localhost/web_sekolah/`

## Struktur Folder

```
├── index.php · login.php · logout.php
├── config/database.php          → koneksi PDO & konstanta
├── includes/                    → auth, helpers, layout
│   ├── auth.php                 → session, login check, CSRF
│   ├── functions.php            → helper (escape, pagination, upload, flash)
│   └── header/sidebar/topbar/footer.php
├── lib/XLSX.php                 → export .xlsx native (tanpa Composer)
├── pages/
│   ├── dashboard.php            → statistik, grafik, aktivitas, profil sekolah
│   ├── profile.php              → edit profil & ganti password
│   ├── siswa/                   → index, form, detail, delete, export
│   ├── guru/                    → index, form, detail, delete, export
│   ├── pelajaran/               → index, form, detail, delete, export
│   └── ujian/                   → index, form (master-detail), detail, delete, export
├── assets/css/style.css         → tema responsif
├── assets/js/app.js             → interaksi + chart canvas native
└── uploads/                     → foto (dilindungi .htaccess)
```

## Catatan Teknis

- **Relasi**: `tbl_ujian.nis → tbl_siswa.nis`, `tbl_nilai_ujian.no_ujian → tbl_ujian.no_ujian` (implisit, tanpa FK constraint di skema).
- **Agregat ujian** (`total_nilai`, `nilai_terendah`, `nilai_tertinggi`, `nilai_rata2`, `hasil_ujian`) dihitung otomatis dari rincian nilai. Ambang lulus: `NILAI_LULUS` di `config/database.php` (default 60).
- **Export Excel**: `lib/XLSX.php` menghasilkan `.xlsx` asli (OOXML, ZIP store-method) — tidak butuh Composer/ZipArchive. Export mengikuti filter aktif di halaman daftar.
- **Keamanan**: PDO prepared statements, `password_hash`/`password_verify`, CSRF token di semua form mutasi, escape output via `e()`, session regeneration saat login, validasi MIME upload, `.htaccess` memblokir skrip di `uploads/`.
