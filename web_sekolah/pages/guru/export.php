<?php
require_once __DIR__ . '/../../includes/auth.php';
require_once __DIR__ . '/../../includes/functions.php';
require_once __DIR__ . '/../../lib/XLSX.php';
require_login();

$q = trim($_GET['q'] ?? '');
$where  = [];
$params = [];
if ($q !== '') {
    $where[] = '(nama LIKE ? OR nip LIKE ?)';
    $params[] = "%$q%";
    $params[] = "%$q%";
}
$whereSql = $where ? ' WHERE ' . implode(' AND ', $where) : '';

$stmt = db()->prepare("SELECT nip, nama, telepon, agama, alamat FROM tbl_guru$whereSql ORDER BY nama");
$stmt->execute($params);
$rows = $stmt->fetchAll(PDO::FETCH_NUM);

XLSX::download('data_guru_' . date('Ymd_His') . '.xlsx',
    ['NIP', 'Nama', 'Telepon', 'Agama', 'Alamat'],
    $rows
);
