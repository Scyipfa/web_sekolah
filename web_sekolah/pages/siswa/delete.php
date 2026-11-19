<?php
require_once __DIR__ . '/../../includes/auth.php';
require_once __DIR__ . '/../../includes/functions.php';
require_login();

$pdo = db();
$nis = trim($_REQUEST['nis'] ?? '');

$stmt = $pdo->prepare('SELECT * FROM tbl_siswa WHERE nis = ?');
$stmt->execute([$nis]);
$s = $stmt->fetch();
if (!$s) {
    flash_set('danger', 'Data siswa tidak ditemukan.');
    redirect('index.php');
}

// Hitung data ujian terkait
$stmt = $pdo->prepare('SELECT COUNT(*) FROM tbl_ujian WHERE nis = ?');
$stmt->execute([$nis]);
$jmlUjian = (int)$stmt->fetchColumn();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();
    $cascade = !empty($_POST['cascade']);

    if ($jmlUjian > 0 && !$cascade) {
        flash_set('warning', 'Siswa memiliki ' . $jmlUjian . ' data ujian. Centang opsi hapus data terkait untuk melanjutkan.');
        redirect('delete.php?nis=' . urlencode($nis));
    }

    $pdo->beginTransaction();
    try {
        if ($cascade && $jmlUjian > 0) {
            $pdo->prepare('DELETE n FROM tbl_nilai_ujian n INNER JOIN tbl_ujian u ON n.no_ujian = u.no_ujian WHERE u.nis = ?')->execute([$nis]);
            $pdo->prepare('DELETE FROM tbl_ujian WHERE nis = ?')->execute([$nis]);
        }
        $pdo->prepare('DELETE FROM tbl_siswa WHERE nis = ?')->execute([$nis]);
        if ($s['foto'] && is_file(UPLOAD_DIR . $s['foto'])) {
            unlink(UPLOAD_DIR . $s['foto']);
        }
        $pdo->commit();
        flash_set('success', 'Data siswa ' . $s['nama'] . ' berhasil dihapus.');
    } catch (Throwable $e) {
        $pdo->rollBack();
        flash_set('danger', 'Gagal menghapus data: ' . $e->getMessage());
    }
    redirect('index.php');
}

$page_title = 'Hapus Siswa';
include __DIR__ . '/../../includes/header.php';
?>

<div class="card" style="max-width:560px">
    <div class="card-header"><span class="card-title">Konfirmasi Hapus</span></div>
    <div class="card-body">
        <p>Anda akan menghapus data siswa berikut:</p>
        <dl class="detail-grid" style="margin:16px 0">
            <dt>NIS</dt><dd><?= e($s['nis']) ?></dd>
            <dt>Nama</dt><dd><?= e($s['nama']) ?></dd>
            <dt>Kelas</dt><dd><?= e($s['kelas']) ?> — <?= e($s['jurusan']) ?></dd>
        </dl>
        <?php if ($jmlUjian > 0): ?>
            <div class="alert alert-warning">
                Siswa ini memiliki <strong><?= $jmlUjian ?> data hasil ujian</strong> yang ikut terhapus bila Anda mencentang opsi di bawah.
            </div>
        <?php endif; ?>
        <form method="post">
            <?= csrf_field() ?>
            <input type="hidden" name="nis" value="<?= e($s['nis']) ?>">
            <?php if ($jmlUjian > 0): ?>
            <div class="form-group">
                <label style="display:flex;align-items:center;gap:8px;font-weight:500">
                    <input type="checkbox" name="cascade" value="1" style="width:auto">
                    Hapus juga seluruh data ujian &amp; nilai siswa ini
                </label>
            </div>
            <?php endif; ?>
            <div class="form-actions">
                <button type="submit" class="btn btn-danger">Hapus Permanen</button>
                <a href="index.php" class="btn btn-secondary">Batal</a>
            </div>
        </form>
    </div>
</div>

<?php include __DIR__ . '/../../includes/footer.php'; ?>
