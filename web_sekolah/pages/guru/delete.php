<?php
require_once __DIR__ . '/../../includes/auth.php';
require_once __DIR__ . '/../../includes/functions.php';
require_login();

$pdo = db();
$id = (int)($_REQUEST['id'] ?? 0);

$stmt = $pdo->prepare('SELECT * FROM tbl_guru WHERE id = ?');
$stmt->execute([$id]);
$g = $stmt->fetch();
if (!$g) {
    flash_set('danger', 'Data guru tidak ditemukan.');
    redirect('index.php');
}

// Mapel yang mengacu ke nama guru ini
$stmt = $pdo->prepare('SELECT COUNT(*) FROM tbl_pelajaran WHERE guru = ?');
$stmt->execute([$g['nama']]);
$jmlMapel = (int)$stmt->fetchColumn();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();
    $pdo->prepare('DELETE FROM tbl_guru WHERE id = ?')->execute([$id]);
    if ($g['foto'] && is_file(UPLOAD_DIR . $g['foto'])) {
        unlink(UPLOAD_DIR . $g['foto']);
    }
    flash_set('success', 'Data guru ' . $g['nama'] . ' berhasil dihapus.'
        . ($jmlMapel ? " ($jmlMapel mata pelajaran masih menyimpan nama guru ini.)" : ''));
    redirect('index.php');
}

$page_title = 'Hapus Guru';
include __DIR__ . '/../../includes/header.php';
?>

<div class="card" style="max-width:560px">
    <div class="card-header"><span class="card-title">Konfirmasi Hapus</span></div>
    <div class="card-body">
        <p>Anda akan menghapus data guru berikut:</p>
        <dl class="detail-grid" style="margin:16px 0">
            <dt>NIP</dt><dd><?= e($g['nip']) ?></dd>
            <dt>Nama</dt><dd><?= e($g['nama']) ?></dd>
            <dt>Telepon</dt><dd><?= e($g['telepon']) ?></dd>
        </dl>
        <?php if ($jmlMapel > 0): ?>
            <div class="alert alert-warning">
                Nama guru ini tercatat pada <strong><?= $jmlMapel ?> mata pelajaran</strong>.
                Menghapus guru tidak menghapus data pelajaran, tetapi kolom guru pada pelajaran tersebut menjadi tidak valid.
            </div>
        <?php endif; ?>
        <form method="post">
            <?= csrf_field() ?>
            <input type="hidden" name="id" value="<?= (int)$g['id'] ?>">
            <div class="form-actions">
                <button type="submit" class="btn btn-danger">Hapus Permanen</button>
                <a href="index.php" class="btn btn-secondary">Batal</a>
            </div>
        </form>
    </div>
</div>

<?php include __DIR__ . '/../../includes/footer.php'; ?>
