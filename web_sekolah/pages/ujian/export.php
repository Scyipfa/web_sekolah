<?php
require_once __DIR__ . '/../../includes/auth.php';
require_once __DIR__ . '/../../includes/functions.php';
require_once __DIR__ . '/../../lib/XLSX.php';
require_login();

// Export mengikuti filter yang sama dengan index.php
$q       = trim($_GET['q'] ?? '');
$hasil   = trim($_GET['hasil'] ?? '');
$jurusan = trim($_GET['jurusan'] ?? '');

$where  = [];
$params = [];
if ($q !== '') {
    $where[] = '(u.no_ujian LIKE ? OR u.nis LIKE ? OR s.nama LIKE ?)';
    $params[] = "%$q%";
    $params[] = "%$q%";
    $params[] = "%$q%";
}
if ($hasil !== '')   { $where[] = 'u.hasil_ujian = ?'; $params[] = $hasil; }
if ($jurusan !== '') { $where[] = 'u.jurusan = ?';     $params[] = $jurusan; }
$whereSql = $where ? ' WHERE ' . implode(' AND ', $where) : '';

$stmt = db()->prepare(
    "SELECT u.no_ujian, u.tgl_ujian, u.nis, COALESCE(s.nama,''), u.jurusan,
            u.total_nilai, u.nilai_terendah, u.nilai_tertinggi, u.nilai_rata2, u.hasil_ujian
     FROM tbl_ujian u LEFT JOIN tbl_siswa s ON s.nis = u.nis
     $whereSql ORDER BY u.tgl_ujian DESC, u.no_ujian DESC"
);
$stmt->execute($params);
$rows = $stmt->fetchAll(PDO::FETCH_NUM);

XLSX::download('hasil_ujian_' . date('Ymd_His') . '.xlsx',
    ['No Ujian', 'Tanggal', 'NIS', 'Nama Siswa', 'Jurusan', 'Total', 'Terendah', 'Tertinggi', 'Rata-rata', 'Hasil'],
    $rows
);
