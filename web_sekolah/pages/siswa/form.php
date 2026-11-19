<?php
require_once __DIR__ . '/../../includes/auth.php';
require_once __DIR__ . '/../../includes/functions.php';
require_login();

$pdo = db();
$nis = trim($_GET['nis'] ?? '');
$edit = $nis !== '';
$page_title = $edit ? 'Edit Siswa' : 'Tambah Siswa';

$data = ['nis' => '', 'nama' => '', 'alamat' => '', 'kelas' => '', 'jurusan' => '', 'foto' => ''];
$errors = [];

if ($edit) {
    $stmt = $pdo->prepare('SELECT * FROM tbl_siswa WHERE nis = ?');
    $stmt->execute([$nis]);
    $data = $stmt->fetch();
    if (!$data) {
        flash_set('danger', 'Data siswa tidak ditemukan.');
        redirect('index.php');
    }
}

$listKelas   = $pdo->query('SELECT DISTINCT kelas FROM tbl_siswa ORDER BY kelas')->fetchAll(PDO::FETCH_COLUMN);
$listJurusan = list_jurusan();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();

    $data['nis']     = trim($_POST['nis'] ?? '');
    $data['nama']    = trim($_POST['nama'] ?? '');
    $data['alamat']  = trim($_POST['alamat'] ?? '');
    $data['kelas']   = trim($_POST['kelas'] ?? '');
    $data['jurusan'] = trim($_POST['jurusan'] ?? '');

    // ---------- Validasi ----------
    if ($data['nis'] === '' || strlen($data['nis']) > 6) {
        $errors[] = 'NIS wajib diisi (maksimal 6 karakter).';
    }
    if ($data['nama'] === '' || strlen($data['nama']) > 100) $errors[] = 'Nama wajib diisi (maks. 100 karakter).';
    if ($data['kelas'] === '' || strlen($data['kelas']) > 3) $errors[] = 'Kelas wajib diisi (maks. 3 karakter).';
    if ($data['jurusan'] === '' || strlen($data['jurusan']) > 50) $errors[] = 'Jurusan wajib diisi (maks. 50 karakter).';
    elseif (!in_array($data['jurusan'], $listJurusan, true)) $errors[] = 'Jurusan tidak terdaftar — tambahkan dulu lewat menu Data Jurusan.';
    if (strlen($data['alamat']) > 128) $errors[] = 'Alamat maksimal 128 karakter.';

    if (!$errors) {
        // Unik NIS
        $stmt = $pdo->prepare('SELECT COUNT(*) FROM tbl_siswa WHERE nis = ? AND nis != ?');
        $stmt->execute([$data['nis'], $edit ? $nis : '']);
        if ($stmt->fetchColumn() > 0) {
            $errors[] = 'NIS sudah digunakan siswa lain.';
        }
    }

    $foto = upload_foto('foto', $data['foto']);

    if (!$errors) {
        if ($edit) {
            // Jika NIS berubah, PK berubah — perlu update baris terkait di tbl_ujian juga.
            $pdo->beginTransaction();
            try {
                $stmt = $pdo->prepare('UPDATE tbl_siswa SET nis=?, nama=?, alamat=?, kelas=?, jurusan=?, foto=? WHERE nis=?');
                $stmt->execute([$data['nis'], $data['nama'], $data['alamat'], $data['kelas'], $data['jurusan'], $foto, $nis]);
                if ($data['nis'] !== $nis) {
                    $pdo->prepare('UPDATE tbl_ujian SET nis=? WHERE nis=?')->execute([$data['nis'], $nis]);
                }
                $pdo->commit();
                flash_set('success', 'Data siswa berhasil diperbarui.');
            } catch (Throwable $e) {
                $pdo->rollBack();
                flash_set('danger', 'Gagal memperbarui data: ' . $e->getMessage());
                redirect('form.php?nis=' . urlencode($nis));
            }
        } else {
            $stmt = $pdo->prepare('INSERT INTO tbl_siswa (nis, nama, alamat, kelas, jurusan, foto) VALUES (?,?,?,?,?,?)');
            $stmt->execute([$data['nis'], $data['nama'], $data['alamat'], $data['kelas'], $data['jurusan'], $foto]);
            flash_set('success', 'Siswa baru berhasil ditambahkan.');
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

        <form method="post" enctype="multipart/form-data">
            <?= csrf_field() ?>
            <div class="form-row">
                <div class="form-group">
                    <label for="nis">NIS <span class="text-muted">(maks. 6 karakter)</span></label>
                    <input type="text" id="nis" name="nis" required maxlength="6" value="<?= e($data['nis']) ?>">
                </div>
                <div class="form-group">
                    <label for="nama">Nama Lengkap</label>
                    <input type="text" id="nama" name="nama" required maxlength="100" value="<?= e($data['nama']) ?>">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="kelas">Kelas <span class="text-muted">(maks. 3 karakter, mis. XII)</span></label>
                    <input type="text" id="kelas" name="kelas" required maxlength="3" list="kelasList" value="<?= e($data['kelas']) ?>">
                    <datalist id="kelasList">
                        <?php foreach ($listKelas as $k): ?><option value="<?= e($k) ?>"><?php endforeach; ?>
                        <option value="X"><option value="XI"><option value="XII">
                    </datalist>
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
            </div>
            <div class="form-group">
                <label for="alamat">Alamat</label>
                <textarea id="alamat" name="alamat" rows="3" maxlength="128"><?= e($data['alamat']) ?></textarea>
            </div>
            <div class="form-group">
                <label for="foto">Foto <span class="text-muted">(opsional, maks. 2 MB)</span></label>
                <?php if ($data['foto']): ?>
                    <img class="foto-preview" src="<?= foto_url($data['foto']) ?>" alt="">
                <?php endif; ?>
                <input type="file" id="foto" name="foto" accept="image/*">
            </div>
            <div class="form-actions">
                <button type="submit" class="btn btn-primary">Simpan</button>
                <a href="index.php" class="btn btn-secondary">Batal</a>
            </div>
        </form>
    </div>
</div>

<?php include __DIR__ . '/../../includes/footer.php'; ?>
