<?php
require_once __DIR__ . '/../../includes/auth.php';
require_once __DIR__ . '/../../includes/functions.php';
require_login();

$pdo = db();
$id = (int)($_GET['id'] ?? 0);
$edit = $id > 0;
$page_title = $edit ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran';

$data = ['pelajaran' => '', 'jurusan' => '', 'guru' => ''];
$errors = [];

if ($edit) {
    $stmt = $pdo->prepare('SELECT * FROM tbl_pelajaran WHERE id = ?');
    $stmt->execute([$id]);
    $data = $stmt->fetch();
    if (!$data) {
        flash_set('danger', 'Data mata pelajaran tidak ditemukan.');
        redirect('index.php');
    }
}

// Dropdown guru diambil dari tbl_guru (kolom guru menyimpan nama)
$listGuru    = $pdo->query('SELECT nama FROM tbl_guru ORDER BY nama')->fetchAll(PDO::FETCH_COLUMN);
$listJurusan = list_jurusan();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();

    $data['pelajaran'] = trim($_POST['pelajaran'] ?? '');
    $data['jurusan']   = trim($_POST['jurusan'] ?? '');
    $data['guru']      = trim($_POST['guru'] ?? '');

    if ($data['pelajaran'] === '' || strlen($data['pelajaran']) > 50) $errors[] = 'Nama pelajaran wajib diisi (maks. 50 karakter).';
    if ($data['jurusan'] === '' || strlen($data['jurusan']) > 50) $errors[] = 'Jurusan wajib diisi (maks. 50 karakter).';
    elseif (!in_array($data['jurusan'], $listJurusan, true)) $errors[] = 'Jurusan tidak terdaftar — tambahkan dulu lewat menu Data Jurusan.';
    if (strlen($data['guru']) > 50) $errors[] = 'Nama guru maksimal 50 karakter.';

    if (!$errors) {
        $stmt = $pdo->prepare('SELECT COUNT(*) FROM tbl_pelajaran WHERE pelajaran = ? AND jurusan = ? AND id != ?');
        $stmt->execute([$data['pelajaran'], $data['jurusan'], $edit ? $id : 0]);
        if ($stmt->fetchColumn() > 0) $errors[] = 'Kombinasi pelajaran & jurusan ini sudah ada.';
    }

    if (!$errors) {
        if ($edit) {
            $stmt = $pdo->prepare('UPDATE tbl_pelajaran SET pelajaran=?, jurusan=?, guru=? WHERE id=?');
            $stmt->execute([$data['pelajaran'], $data['jurusan'], $data['guru'], $id]);
            flash_set('success', 'Mata pelajaran berhasil diperbarui.');
        } else {
            $stmt = $pdo->prepare('INSERT INTO tbl_pelajaran (pelajaran, jurusan, guru) VALUES (?,?,?)');
            $stmt->execute([$data['pelajaran'], $data['jurusan'], $data['guru']]);
            flash_set('success', 'Mata pelajaran baru berhasil ditambahkan.');
        }
        redirect('index.php');
    }
}

include __DIR__ . '/../../includes/header.php';
?>

<div class="card" style="max-width:720px">
    <div class="card-header"><span class="card-title"><?= e($page_title) ?></span></div>
    <div class="card-body">
        <?php foreach ($errors as $err): ?>
            <div class="alert alert-danger"><?= e($err) ?></div>
        <?php endforeach; ?>

        <form method="post">
            <?= csrf_field() ?>
            <div class="form-group">
                <label for="pelajaran">Nama Mata Pelajaran</label>
                <input type="text" id="pelajaran" name="pelajaran" required maxlength="50" value="<?= e($data['pelajaran']) ?>">
            </div>
            <div class="form-group">
                <label for="jurusan">Jurusan</label>
                <select id="jurusan" name="jurusan" required>
                    <option value="">— Pilih Jurusan —</option>
                    <?php foreach ($listJurusan as $j): ?>
                        <option value="<?= e($j) ?>" <?= $j === $data['jurusan'] ? 'selected' : '' ?>><?= e($j) ?></option>
                    <?php endforeach; ?>
                    <?php if ($data['jurusan'] !== '' && !in_array($data['jurusan'], $listJurusan, true)): ?>
                        <option value="<?= e($data['jurusan']) ?>" selected><?= e($data['jurusan']) ?> (tidak terdaftar)</option>
                    <?php endif; ?>
                </select>
                <div class="form-hint">Daftar diambil dari Data Jurusan.</div>
            </div>
            <div class="form-group">
                <label for="guru">Guru Pengampu</label>
                <select id="guru" name="guru">
                    <option value="">— Pilih Guru —</option>
                    <?php foreach ($listGuru as $g): ?>
                        <option value="<?= e($g) ?>" <?= $g === $data['guru'] ? 'selected' : '' ?>><?= e($g) ?></option>
                    <?php endforeach; ?>
                    <?php if ($data['guru'] !== '' && !in_array($data['guru'], $listGuru, true)): ?>
                        <option value="<?= e($data['guru']) ?>" selected><?= e($data['guru']) ?> (tidak terdaftar)</option>
                    <?php endif; ?>
                </select>
                <div class="form-hint">Daftar diambil dari Data Guru. Tambahkan guru terlebih dahulu bila belum ada.</div>
            </div>
            <div class="form-actions">
                <button type="submit" class="btn btn-primary">Simpan</button>
                <a href="index.php" class="btn btn-secondary">Batal</a>
            </div>
        </form>
    </div>
</div>

<?php include __DIR__ . '/../../includes/footer.php'; ?>
