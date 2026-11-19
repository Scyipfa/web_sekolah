<?php
require_once __DIR__ . '/../../includes/auth.php';
require_once __DIR__ . '/../../includes/functions.php';
require_login();

$pdo = db();
$nis = trim($_GET['nis'] ?? '');

$stmt = $pdo->prepare('SELECT * FROM tbl_siswa WHERE nis = ?');
$stmt->execute([$nis]);
$s = $stmt->fetch();
if (!$s) {
    flash_set('danger', 'Data siswa tidak ditemukan.');
    redirect('index.php');
}

// Riwayat ujian siswa ini
$ujian = $pdo->prepare('SELECT * FROM tbl_ujian WHERE nis = ? ORDER BY tgl_ujian DESC');
$ujian->execute([$nis]);
$riwayat = $ujian->fetchAll();

$page_title = 'Detail Siswa';
include __DIR__ . '/../../includes/header.php';
?>

<div class="grid-2">
    <div class="card">
        <div class="card-header"><span class="card-title">Informasi Siswa</span></div>
        <div class="card-body">
            <img class="detail-photo" src="<?= foto_url($s['foto']) ?>" alt="Foto <?= e($s['nama']) ?>" style="margin-bottom:18px">
            <dl class="detail-grid">
                <dt>NIS</dt><dd><?= e($s['nis']) ?></dd>
                <dt>Nama</dt><dd><?= e($s['nama']) ?></dd>
                <dt>Kelas</dt><dd><span class="badge badge-info"><?= e($s['kelas']) ?></span></dd>
                <dt>Jurusan</dt><dd><?= e($s['jurusan']) ?></dd>
                <dt>Alamat</dt><dd><?= e($s['alamat']) ?></dd>
            </dl>
            <div class="form-actions">
                <a href="form.php?nis=<?= urlencode($s['nis']) ?>" class="btn btn-primary">Edit</a>
                <a href="index.php" class="btn btn-secondary">Kembali</a>
            </div>
        </div>
    </div>

    <div class="card">
        <div class="card-header"><span class="card-title">Riwayat Ujian (<?= count($riwayat) ?>)</span></div>
        <div class="table-wrap">
            <table class="data-table">
                <thead>
                    <tr><th>No Ujian</th><th>Tanggal</th><th>Rata-rata</th><th>Hasil</th></tr>
                </thead>
                <tbody>
                <?php if (!$riwayat): ?>
                    <tr><td colspan="4" class="table-empty">Belum ada riwayat ujian.</td></tr>
                <?php endif; ?>
                <?php foreach ($riwayat as $u): ?>
                    <tr>
                        <td><a href="<?= BASE_URL ?>/pages/ujian/detail.php?id=<?= urlencode($u['no_ujian']) ?>"><?= e($u['no_ujian']) ?></a></td>
                        <td><?= tgl_id($u['tgl_ujian']) ?></td>
                        <td><?= (int)$u['nilai_rata2'] ?></td>
                        <td><span class="badge <?= $u['hasil_ujian'] === 'LULUS' ? 'badge-success' : 'badge-danger' ?>"><?= e($u['hasil_ujian']) ?></span></td>
                    </tr>
                <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>

<?php include __DIR__ . '/../../includes/footer.php'; ?>
