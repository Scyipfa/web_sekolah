<?php
require_once __DIR__ . '/../../includes/auth.php';
require_once __DIR__ . '/../../includes/functions.php';
require_login();

$pdo = db();
$id = (int)($_REQUEST['id'] ?? 0);

$stmt = $pdo->prepare('SELECT * FROM tbl_pelajaran WHERE id = ?');
$stmt->execute([$id]);
$p = $stmt->fetch();
if (!$p) {
    flash_set('danger', 'Data mata pelajaran tidak ditemukan.');
    redirect('index.php');
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();
    $pdo->prepare('DELETE FROM tbl_pelajaran WHERE id = ?')->execute([$id]);
    flash_set('success', 'Mata pelajaran ' . $p['pelajaran'] . ' berhasil dihapus.');
    redirect('index.php');
}

$page_title = 'Hapus Mata Pelajaran';
include __DIR__ . '/../../includes/header.php';
?>

<div class="card" style="max-width:560px">
    <div class="card-header"><span class="card-title">Konfirmasi Hapus</span></div>
    <div class="card-body">
        <p>Anda akan menghapus mata pelajaran berikut:</p>
        <dl class="detail-grid" style="margin:16px 0">
            <dt>Pelajaran</dt><dd><?= e($p['pelajaran']) ?></dd>
            <dt>Jurusan</dt><dd><?= e($p['jurusan']) ?></dd>
            <dt>Guru</dt><dd><?= e($p['guru']) ?></dd>
        </dl>
        <form method="post">
            <?= csrf_field() ?>
            <input type="hidden" name="id" value="<?= (int)$p['id'] ?>">
            <div class="form-actions">
                <button type="submit" class="btn btn-danger">Hapus Permanen</button>
                <a href="index.php" class="btn btn-secondary">Batal</a>
            </div>
        </form>
    </div>
</div>

<?php include __DIR__ . '/../../includes/footer.php'; ?>
