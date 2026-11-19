<?php
require_once __DIR__ . '/../../includes/auth.php';
require_once __DIR__ . '/../../includes/functions.php';
require_once __DIR__ . '/../../lib/XLSX.php';
require_login();

// Export mengikuti filter yang sama dengan index.php
$q       = trim($_GET['q'] ?? '');
$kelas   = trim($_GET['kelas'] ?? '');
$jurusan = trim($_GET['jurusan'] ?? '');

$where  = [];
$params = [];
if ($q !== '') {
    $where[] = '(nama LIKE ? OR nis LIKE ?)';
    $params[] = "%$q%";
    $params[] = "%$q%";
}
if ($kelas !== '')   { $where[] = 'kelas = ?';   $params[] = $kelas; }
if ($jurusan !== '') { $where[] = 'jurusan = ?'; $params[] = $jurusan; }
$whereSql = $where ? ' WHERE ' . implode(' AND ', $where) : '';

$stmt = db()->prepare("SELECT nis, nama, kelas, jurusan, alamat FROM tbl_siswa$whereSql ORDER BY nis");
$stmt->execute($params);
$rows = $stmt->fetchAll(PDO::FETCH_NUM);

XLSX::download('data_siswa_' . date('Ymd_His') . '.xlsx',
    ['NIS', 'Nama', 'Kelas', 'Jurusan', 'Alamat'],
    $rows
);
