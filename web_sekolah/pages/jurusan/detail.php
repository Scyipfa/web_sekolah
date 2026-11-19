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

// ---------- Aksi tambah/hapus isi jurusan ----------
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();
    $action = $_POST['action'] ?? '';

    if ($action === 'add_siswa') {
        $nis = trim($_POST['nis'] ?? '');
        $st = $pdo->prepare('UPDATE tbl_siswa SET jurusan = ? WHERE nis = ?');
        $st->execute([$jurusan, $nis]);
        flash_set($st->rowCount() ? 'success' : 'warning',
            $st->rowCount() ? 'Siswa ditambahkan ke jurusan.' : 'Siswa tidak ditemukan.');
    } elseif ($action === 'del_siswa') {
        $nis = trim($_POST['nis'] ?? '');
        $pdo->prepare("UPDATE tbl_siswa SET jurusan = '' WHERE nis = ? AND jurusan = ?")->execute([$nis, $jurusan]);
        flash_set('success', 'Siswa dikeluarkan dari jurusan.');
    } elseif ($action === 'add_mapel') {
        $id = (int)($_POST['id'] ?? 0);
        $st = $pdo->prepare('UPDATE tbl_pelajaran SET jurusan = ? WHERE id = ?');
        $st->execute([$jurusan, $id]);
        flash_set($st->rowCount() ? 'success' : 'warning',
            $st->rowCount() ? 'Mata pelajaran ditambahkan ke jurusan.' : 'Pelajaran tidak ditemukan.');
    } elseif ($action === 'del_mapel') {
        $id = (int)($_POST['id'] ?? 0);
        $pdo->prepare("UPDATE tbl_pelajaran SET jurusan = '' WHERE id = ? AND jurusan = ?")->execute([$id, $jurusan]);
        flash_set('success', 'Mata pelajaran dikeluarkan dari jurusan.');
    }
    redirect('detail.php?j=' . urlencode($jurusan));
}

// Anggota jurusan
$stmt = $pdo->prepare('SELECT * FROM tbl_siswa WHERE jurusan = ? ORDER BY nama');
$stmt->execute([$jurusan]);
$siswa = $stmt->fetchAll();

$stmt = $pdo->prepare('SELECT * FROM tbl_pelajaran WHERE jurusan = ? ORDER BY pelajaran');
$stmt->execute([$jurusan]);
$mapel = $stmt->fetchAll();

// Kandidat yang bisa ditambahkan (belum berada di jurusan ini)
$stmt = $pdo->prepare('SELECT nis, nama, kelas, jurusan FROM tbl_siswa WHERE jurusan <> ? ORDER BY nama');
$stmt->execute([$jurusan]);
$calonSiswa = $stmt->fetchAll();

$stmt = $pdo->prepare('SELECT id, pelajaran, jurusan FROM tbl_pelajaran WHERE jurusan <> ? ORDER BY pelajaran');
$stmt->execute([$jurusan]);
$calonMapel = $stmt->fetchAll();

$page_title = 'Isi Jurusan: ' . $jurusan;
include __DIR__ . '/../../includes/header.php';
?>

<div class="grid-2">
    <div class="card">
        <div class="card-header">
            <span class="card-title">Siswa di <?= e($jurusan) ?> (<?= count($siswa) ?>)</span>
        </div>
        <div class="card-body">
            <form method="post" class="toolbar" style="padding:0 0 14px">
                <?= csrf_field() ?>
                <input type="hidden" name="action" value="add_siswa">
                <select name="nis" required style="flex:1">
                    <option value="">— Tambah siswa ke jurusan —</option>
                    <?php foreach ($calonSiswa as $s): ?>
                        <option value="<?= e($s['nis']) ?>"><?= e($s['nis']) ?> — <?= e($s['nama']) ?> (<?= e($s['jurusan'] !== '' ? $s['jurusan'] : 'tanpa jurusan') ?>)</option>
                    <?php endforeach; ?>
                </select>
                <button type="submit" class="btn btn-primary btn-sm">Tambah</button>
            </form>
            <div class="table-wrap">
                <table class="data-table">
                    <thead><tr><th>NIS</th><th>Nama</th><th>Kelas</th><th></th></tr></thead>
                    <tbody>
                    <?php if (!$siswa): ?>
                        <tr><td colspan="4" class="table-empty">Belum ada siswa di jurusan ini.</td></tr>
                    <?php endif; ?>
                    <?php foreach ($siswa as $s): ?>
                        <tr>
                            <td><?= e($s['nis']) ?></td>
                            <td><a href="<?= BASE_URL ?>/pages/siswa/detail.php?nis=<?= urlencode($s['nis']) ?>"><?= e($s['nama']) ?></a></td>
                            <td><span class="badge badge-info"><?= e($s['kelas']) ?></span></td>
                            <td>
                                <form method="post" data-confirm="Keluarkan <?= e($s['nama']) ?> dari <?= e($jurusan) ?>?">
                                    <?= csrf_field() ?>
                                    <input type="hidden" name="action" value="del_siswa">
                                    <input type="hidden" name="nis" value="<?= e($s['nis']) ?>">
                                    <button type="submit" class="btn btn-danger btn-sm" title="Keluarkan">&times;</button>
                                </form>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <div class="card">
        <div class="card-header">
            <span class="card-title">Mata Pelajaran di <?= e($jurusan) ?> (<?= count($mapel) ?>)</span>
        </div>
        <div class="card-body">
            <form method="post" class="toolbar" style="padding:0 0 14px">
                <?= csrf_field() ?>
                <input type="hidden" name="action" value="add_mapel">
                <select name="id" required style="flex:1">
                    <option value="">— Tambah mapel ke jurusan —</option>
                    <?php foreach ($calonMapel as $m): ?>
                        <option value="<?= (int)$m['id'] ?>"><?= e($m['pelajaran']) ?> (<?= e($m['jurusan'] !== '' ? $m['jurusan'] : 'tanpa jurusan') ?>)</option>
                    <?php endforeach; ?>
                </select>
                <button type="submit" class="btn btn-primary btn-sm">Tambah</button>
            </form>
            <div class="table-wrap">
                <table class="data-table">
                    <thead><tr><th>Pelajaran</th><th>Guru</th><th></th></tr></thead>
                    <tbody>
                    <?php if (!$mapel): ?>
                        <tr><td colspan="3" class="table-empty">Belum ada mata pelajaran di jurusan ini.</td></tr>
                    <?php endif; ?>
                    <?php foreach ($mapel as $m): ?>
                        <tr>
                            <td><?= e($m['pelajaran']) ?></td>
                            <td><?= e($m['guru']) ?></td>
                            <td>
                                <form method="post" data-confirm="Keluarkan <?= e($m['pelajaran']) ?> dari <?= e($jurusan) ?>?">
                                    <?= csrf_field() ?>
                                    <input type="hidden" name="action" value="del_mapel">
                                    <input type="hidden" name="id" value="<?= (int)$m['id'] ?>">
                                    <button type="submit" class="btn btn-danger btn-sm" title="Keluarkan">&times;</button>
                                </form>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<div class="form-actions" style="margin-top:0">
    <a href="form.php?j=<?= urlencode($jurusan) ?>" class="btn btn-primary">Ubah Nama Jurusan</a>
    <a href="index.php" class="btn btn-secondary">Kembali</a>
</div>

<?php include __DIR__ . '/../../includes/footer.php'; ?>
