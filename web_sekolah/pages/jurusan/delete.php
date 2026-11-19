<?php
require_once __DIR__ . '/../../includes/auth.php';
require_once __DIR__ . '/../../includes/functions.php';
require_login();

$pdo = db();
$jurusan = trim($_REQUEST['j'] ?? '');

if ($jurusan === '' || !in_array($jurusan, list_jurusan(), true)) {
    flash_set('danger', 'Jurusan tidak ditemukan.');
    redirect('index.php');
}

$stmt = $pdo->prepare('SELECT COUNT(*) FROM tbl_siswa WHERE jurusan = ?');
$stmt->execute([$jurusan]);
$jmlSiswa = (int)$stmt->fetchColumn();
$stmt = $pdo->prepare('SELECT COUNT(*) FROM tbl_pelajaran WHERE jurusan = ?');
$stmt->execute([$jurusan]);
$jmlMapel = (int)$stmt->fetchColumn();
$stmt = $pdo->prepare('SELECT COUNT(*) FROM tbl_ujian WHERE jurusan = ?');
$stmt->execute([$jurusan]);
$jmlUjian = (int)$stmt->fetchColumn();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();
    $pdo->beginTransaction();
    try {
        $pdo->prepare('DELETE FROM tbl_jurusan WHERE jurusan = ?')->execute([$jurusan]);
        // Kosongkan jurusan pada anggotanya — data siswa/mapel tidak dihapus
        $pdo->prepare("UPDATE tbl_siswa SET jurusan = '' WHERE jurusan = ?")->execute([$jurusan]);
        $pdo->prepare("UPDATE tbl_pelajaran SET jurusan = '' WHERE jurusan = ?")->execute([$jurusan]);
        $pdo->commit();
        flash_set('success', "Jurusan \"$jurusan\" dihapus. $jmlSiswa siswa dan $jmlMapel mapel kini tanpa jurusan (data tidak dihapus).");
    } catch (Throwable $e) {
        $pdo->rollBack();
        flash_set('danger', 'Gagal menghapus: ' . $e->getMessage());
    }
    redirect('index.php');
}

$page_title = 'Hapus Jurusan';
include __DIR__ . '/../../includes/header.php';
?>

<div class="card" style="max-width:560px">
    <div class="card-header"><span class="card-title">Konfirmasi Hapus</span></div>
    <div class="card-body">
        <p>Anda akan menghapus jurusan <strong><?= e($jurusan) ?></strong>.</p>
        <dl class="detail-grid" style="margin:16px 0">
            <dt>Siswa terkait</dt><dd><?= $jmlSiswa ?></dd>
            <dt>Mapel terkait</dt><dd><?= $jmlMapel ?></dd>
            <dt>Riwayat ujian</dt><dd><?= $jmlUjian ?> <span class="text-muted">(tetap tersimpan)</span></dd>
        </dl>
        <div class="alert alert-warning">
            Data siswa dan mata pelajaran <strong>tidak ikut terhapus</strong> — hanya kolom jurusannya yang dikosongkan.
        </div>
        <form method="post">
            <?= csrf_field() ?>
            <input type="hidden" name="j" value="<?= e($jurusan) ?>">
            <div class="form-actions">
                <button type="submit" class="btn btn-danger">Hapus Jurusan</button>
                <a href="index.php" class="btn btn-secondary">Batal</a>
            </div>
        </form>
    </div>
</div>

<?php include __DIR__ . '/../../includes/footer.php'; ?>
