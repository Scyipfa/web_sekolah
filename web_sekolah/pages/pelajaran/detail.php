<?php
require_once __DIR__ . '/../../includes/auth.php';
require_once __DIR__ . '/../../includes/functions.php';
require_login();

$pdo = db();
$id = (int)($_GET['id'] ?? 0);

$stmt = $pdo->prepare('SELECT * FROM tbl_pelajaran WHERE id = ?');
$stmt->execute([$id]);
$p = $stmt->fetch();
if (!$p) {
    flash_set('danger', 'Data mata pelajaran tidak ditemukan.');
    redirect('index.php');
}

// Cari guru terdaftar dengan nama sama
$guruInfo = $pdo->prepare('SELECT * FROM tbl_guru WHERE nama = ? LIMIT 1');
$guruInfo->execute([$p['guru']]);
$guru = $guruInfo->fetch();

$page_title = 'Detail Mata Pelajaran';
include __DIR__ . '/../../includes/header.php';
?>

<div class="card" style="max-width:640px">
    <div class="card-header"><span class="card-title">Detail Mata Pelajaran</span></div>
    <div class="card-body">
        <dl class="detail-grid">
            <dt>ID</dt><dd><?= (int)$p['id'] ?></dd>
            <dt>Pelajaran</dt><dd><?= e($p['pelajaran']) ?></dd>
            <dt>Jurusan</dt><dd><span class="badge badge-info"><?= e($p['jurusan']) ?></span></dd>
            <dt>Guru Pengampu</dt>
            <dd>
                <?php if ($guru): ?>
                    <a href="<?= BASE_URL ?>/pages/guru/detail.php?id=<?= (int)$guru['id'] ?>"><?= e($p['guru']) ?></a>
                <?php else: ?>
                    <?= e($p['guru']) ?> <?= $p['guru'] !== '' ? '<span class="badge badge-muted">tidak terdaftar</span>' : '' ?>
                <?php endif; ?>
            </dd>
        </dl>
        <div class="form-actions">
            <a href="form.php?id=<?= (int)$p['id'] ?>" class="btn btn-primary">Edit</a>
            <a href="index.php" class="btn btn-secondary">Kembali</a>
        </div>
    </div>
</div>

<?php include __DIR__ . '/../../includes/footer.php'; ?>
