<?php
require_once __DIR__ . '/../../includes/auth.php';
require_once __DIR__ . '/../../includes/functions.php';
require_once __DIR__ . '/../../lib/XLSX.php';
require_login();

$q       = trim($_GET['q'] ?? '');
$jurusan = trim($_GET['jurusan'] ?? '');

$where  = [];
$params = [];
if ($q !== '') {
    $where[] = '(pelajaran LIKE ? OR guru LIKE ?)';
    $params[] = "%$q%";
    $params[] = "%$q%";
}
if ($jurusan !== '') { $where[] = 'jurusan = ?'; $params[] = $jurusan; }
$whereSql = $where ? ' WHERE ' . implode(' AND ', $where) : '';

$stmt = db()->prepare("SELECT pelajaran, jurusan, guru FROM tbl_pelajaran$whereSql ORDER BY pelajaran");
$stmt->execute($params);
$rows = $stmt->fetchAll(PDO::FETCH_NUM);

XLSX::download('data_pelajaran_' . date('Ymd_His') . '.xlsx',
    ['Mata Pelajaran', 'Jurusan', 'Guru Pengampu'],
    $rows
);
