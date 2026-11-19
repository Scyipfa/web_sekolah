-- Membuat akun admin pertama untuk login.
-- Jalankan sekali di phpMyAdmin pada database `db_sekolah`.
-- Username: admin | Password: admin123
-- (password disimpan sebagai hash bcrypt — ganti setelah login
--  melalui menu Profile > Ubah Password)
INSERT INTO `tbl_user` (`username`, `password`, `nama`, `alamat`, `jabatan`, `foto`) VALUES
('admin', '$2y$10$ovmYNZVuVRw0x./s05b0MuxJtHrDvmNZXL5QXtEu0asaiGWuQP4CC', 'Administrator', '', 'Administrator', '');
