<?php
require_once __DIR__ . '/../../includes/auth.php';
require_once __DIR__ . '/../../includes/functions.php';
require_once __DIR__ . '/../../lib/XLSX.php';
require_login();

$q = trim($_GET['q'] ?? '');
$where  = $q !== '' ? ' WHERE j.jurusan LIKE ?' : '';
$params = $q !== '' ? ["%$q%"] : [];

$stmt = db()->prepare(
    "SELECT j.jurusan,
            (SELECT COUNT(*) FROM tbl_siswa s WHERE s.jurusan = j.jurusan)     AS jml_siswa,
            (SELECT COUNT(*) FROM tbl_pelajaran p WHERE p.jurusan = j.jurusan) AS jml_mapel
     FROM tbl_jurusan j
     $where ORDER BY j.jurusan"
);
$stmt->execute($params);
$rows = $stmt->fetchAll(PDO::FETCH_NUM);

XLSX::download('data_jurusan_' . date('Ymd_His') . '.xlsx',
    ['Jurusan', 'Jumlah Siswa', 'Jumlah Mapel'],
    $rows
);
