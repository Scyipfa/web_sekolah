<?php
require_once __DIR__ . '/../../includes/auth.php';
require_once __DIR__ . '/../../includes/functions.php';
require_login();

$pdo = db();
$noUjian = trim($_REQUEST['id'] ?? '');

$stmt = $pdo->prepare(
    'SELECT u.*, s.nama AS nama_siswa FROM tbl_ujian u
     LEFT JOIN tbl_siswa s ON s.nis = u.nis WHERE u.no_ujian = ?'
);
$stmt->execute([$noUjian]);
$u = $stmt->fetch();
if (!$u) {
    flash_set('danger', 'Data hasil ujian tidak ditemukan.');
    redirect('index.php');
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();
    $pdo->beginTransaction();
    try {
        $pdo->prepare('DELETE FROM tbl_nilai_ujian WHERE no_ujian = ?')->execute([$noUjian]);
        $pdo->prepare('DELETE FROM tbl_ujian WHERE no_ujian = ?')->execute([$noUjian]);
        $pdo->commit();
        flash_set('success', 'Hasil ujian ' . $noUjian . ' beserta rincian nilainya berhasil dihapus.');
    } catch (Throwable $e) {
        $pdo->rollBack();
        flash_set('danger', 'Gagal menghapus: ' . $e->getMessage());
    }
    redirect('index.php');
}

$page_title = 'Hapus Hasil Ujian';
include __DIR__ . '/../../includes/header.php';
?>

<div class="card" style="max-width:560px">
    <div class="card-header"><span class="card-title">Konfirmasi Hapus</span></div>
    <div class="card-body">
        <p>Anda akan menghapus hasil ujian berikut <strong>beserta seluruh rincian nilainya</strong>:</p>
        <dl class="detail-grid" style="margin:16px 0">
            <dt>No Ujian</dt><dd><?= e($u['no_ujian']) ?></dd>
            <dt>Tanggal</dt><dd><?= tgl_id($u['tgl_ujian']) ?></dd>
            <dt>Siswa</dt><dd><?= e($u['nama_siswa'] ?? $u['nis']) ?></dd>
            <dt>Hasil</dt><dd><?= e($u['hasil_ujian']) ?> (rata-rata <?= (int)$u['nilai_rata2'] ?>)</dd>
        </dl>
        <form method="post">
            <?= csrf_field() ?>
            <input type="hidden" name="id" value="<?= e($u['no_ujian']) ?>">
            <div class="form-actions">
                <button type="submit" class="btn btn-danger">Hapus Permanen</button>
                <a href="index.php" class="btn btn-secondary">Batal</a>
            </div>
        </form>
    </div>
</div>

<?php include __DIR__ . '/../../includes/footer.php'; ?>
