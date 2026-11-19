<?php
// Layout atas: <head> + sidebar + topbar + pembuka konten.
// Set $page_title sebelum include file ini.
require_once __DIR__ . '/../includes/functions.php';
?>
<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title><?= e(($page_title ?? 'Halaman') . ' — ' . APP_NAME) ?></title>
<link rel="stylesheet" href="<?= BASE_URL ?>/assets/css/style.css">
</head>
<body>
<?php include __DIR__ . '/sidebar.php'; ?>
<div class="main">
    <?php include __DIR__ . '/topbar.php'; ?>
    <main class="content">
    <?php foreach (flash_get() as $f): ?>
        <div class="alert alert-<?= e($f['type']) ?>"><?= e($f['msg']) ?></div>
    <?php endforeach; ?>
