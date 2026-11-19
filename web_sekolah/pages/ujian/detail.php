<?php
require_once __DIR__ . '/../../includes/auth.php';
require_once __DIR__ . '/../../includes/functions.php';
require_login();

$pdo = db();
$noUjian = trim($_GET['id'] ?? '');

$stmt = $pdo->prepare(
    'SELECT u.*, s.nama AS nama_siswa, s.kelas, s.alamat AS alamat_siswa
     FROM tbl_ujian u LEFT JOIN tbl_siswa s ON s.nis = u.nis
     WHERE u.no_ujian = ?'
);
$stmt->execute([$noUjian]);
$u = $stmt->fetch();
if (!$u) {
    flash_set('danger', 'Data hasil ujian tidak ditemukan.');
    redirect('index.php');
}

$stmt = $pdo->prepare('SELECT * FROM tbl_nilai_ujian WHERE no_ujian = ? ORDER BY id');
$stmt->execute([$noUjian]);
$nilai = $stmt->fetchAll();

$page_title = 'Detail Hasil Ujian';
include __DIR__ . '/../../includes/header.php';
?>

<div class="grid-2">
    <div class="card">
        <div class="card-header"><span class="card-title">Informasi Ujian</span></div>
        <div class="card-body">
            <dl class="detail-grid">
                <dt>No Ujian</dt><dd><strong><?= e($u['no_ujian']) ?></strong></dd>
                <dt>Tanggal</dt><dd><?= tgl_id($u['tgl_ujian']) ?></dd>
                <dt>NIS</dt><dd><?= e($u['nis']) ?></dd>
                <dt>Nama Siswa</dt>
                <dd>
                    <?php if ($u['nama_siswa']): ?>
                        <a href="<?= BASE_URL ?>/pages/siswa/detail.php?nis=<?= urlencode($u['nis']) ?>"><?= e($u['nama_siswa']) ?></a>
                    <?php else: ?>—<?php endif; ?>
                </dd>
                <dt>Kelas</dt><dd><?= e($u['kelas'] ?? '—') ?></dd>
                <dt>Jurusan</dt><dd><?= e($u['jurusan']) ?></dd>
            </dl>
            <div class="form-actions">
                <a href="form.php?id=<?= urlencode($u['no_ujian']) ?>" class="btn btn-primary">Edit</a>
                <a href="index.php" class="btn btn-secondary">Kembali</a>
            </div>
        </div>
    </div>

    <div class="card">
        <div class="card-header"><span class="card-title">Ringkasan Nilai</span></div>
        <div class="card-body">
            <div class="stat-grid" style="grid-template-columns:1fr 1fr;margin-bottom:0">
                <div class="stat-card">
                    <div><div class="stat-value"><?= (int)$u['total_nilai'] ?></div><div class="stat-label">Total Nilai</div></div>
                </div>
                <div class="stat-card">
                    <div><div class="stat-value"><?= (int)$u['nilai_rata2'] ?></div><div class="stat-label">Rata-rata</div></div>
                </div>
                <div class="stat-card">
                    <div><div class="stat-value"><?= (int)$u['nilai_terendah'] ?> / <?= (int)$u['nilai_tertinggi'] ?></div><div class="stat-label">Terendah / Tertinggi</div></div>
                </div>
                <div class="stat-card">
                    <div><div class="stat-value"><span class="badge <?= $u['hasil_ujian'] === 'LULUS' ? 'badge-success' : 'badge-danger' ?>" style="font-size:15px"><?= e($u['hasil_ujian']) ?></span></div><div class="stat-label">Hasil Ujian</div></div>
                </div>
            </div>
        </div>
    </div>
</div>

<div class="card">
    <div class="card-header"><span class="card-title">Nilai per Mata Pelajaran (<?= count($nilai) ?>)</span></div>
    <div class="table-wrap">
        <table class="data-table">
            <thead><tr><th>No</th><th>Mata Pelajaran</th><th>Nilai</th></tr></thead>
            <tbody>
            <?php if (!$nilai): ?>
                <tr><td colspan="3" class="table-empty">Belum ada rincian nilai.</td></tr>
            <?php endif; ?>
            <?php foreach ($nilai as $i => $n): ?>
                <tr>
                    <td><?= $i + 1 ?></td>
                    <td><?= e($n['pelajaran']) ?></td>
                    <td>
                        <?= (int)$n['nilai_ujian'] ?>
                        <?php if ((int)$n['nilai_ujian'] < NILAI_LULUS): ?>
                            <span class="badge badge-danger">di bawah <?= NILAI_LULUS ?></span>
                        <?php endif; ?>
                    </td>
                </tr>
            <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</div>

<?php include __DIR__ . '/../../includes/footer.php'; ?>
