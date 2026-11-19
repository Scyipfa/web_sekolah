<?php
require_once __DIR__ . '/../../includes/auth.php';
require_once __DIR__ . '/../../includes/functions.php';
require_login();

$pdo = db();
$id = (int)($_GET['id'] ?? 0);

$stmt = $pdo->prepare('SELECT * FROM tbl_guru WHERE id = ?');
$stmt->execute([$id]);
$g = $stmt->fetch();
if (!$g) {
    flash_set('danger', 'Data guru tidak ditemukan.');
    redirect('index.php');
}

// Mapel yang diampu (tbl_pelajaran.guru menyimpan nama guru)
$mapel = $pdo->prepare('SELECT * FROM tbl_pelajaran WHERE guru = ? ORDER BY pelajaran');
$mapel->execute([$g['nama']]);
$mengajar = $mapel->fetchAll();

$page_title = 'Detail Guru';
include __DIR__ . '/../../includes/header.php';
?>

<div class="grid-2">
    <div class="card">
        <div class="card-header"><span class="card-title">Informasi Guru</span></div>
        <div class="card-body">
            <img class="detail-photo" src="<?= foto_url($g['foto']) ?>" alt="Foto <?= e($g['nama']) ?>" style="margin-bottom:18px">
            <dl class="detail-grid">
                <dt>NIP</dt><dd><?= e($g['nip']) ?></dd>
                <dt>Nama</dt><dd><?= e($g['nama']) ?></dd>
                <dt>Telepon</dt><dd><?= e($g['telepon']) ?></dd>
                <dt>Agama</dt><dd><?= e($g['agama']) ?></dd>
                <dt>Alamat</dt><dd><?= e($g['alamat']) ?></dd>
            </dl>
            <div class="form-actions">
                <a href="form.php?id=<?= (int)$g['id'] ?>" class="btn btn-primary">Edit</a>
                <a href="index.php" class="btn btn-secondary">Kembali</a>
            </div>
        </div>
    </div>

    <div class="card">
        <div class="card-header"><span class="card-title">Mata Pelajaran Diampu (<?= count($mengajar) ?>)</span></div>
        <div class="table-wrap">
            <table class="data-table">
                <thead><tr><th>Pelajaran</th><th>Jurusan</th></tr></thead>
                <tbody>
                <?php if (!$mengajar): ?>
                    <tr><td colspan="2" class="table-empty">Belum mengampu mata pelajaran.</td></tr>
                <?php endif; ?>
                <?php foreach ($mengajar as $m): ?>
                    <tr>
                        <td><?= e($m['pelajaran']) ?></td>
                        <td><?= e($m['jurusan']) ?></td>
                    </tr>
                <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>

<?php include __DIR__ . '/../../includes/footer.php'; ?>
