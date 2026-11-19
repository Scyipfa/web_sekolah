<?php
require_once __DIR__ . '/../../includes/auth.php';
require_once __DIR__ . '/../../includes/functions.php';
require_login();

$pdo = db();
$id = (int)($_GET['id'] ?? 0);
$edit = $id > 0;
$page_title = $edit ? 'Edit Guru' : 'Tambah Guru';

$data = ['nip' => '', 'nama' => '', 'alamat' => '', 'telepon' => '', 'agama' => '', 'foto' => ''];
$errors = [];

if ($edit) {
    $stmt = $pdo->prepare('SELECT * FROM tbl_guru WHERE id = ?');
    $stmt->execute([$id]);
    $data = $stmt->fetch();
    if (!$data) {
        flash_set('danger', 'Data guru tidak ditemukan.');
        redirect('index.php');
    }
}

$listAgama = ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();

    $data['nip']     = trim($_POST['nip'] ?? '');
    $data['nama']    = trim($_POST['nama'] ?? '');
    $data['alamat']  = trim($_POST['alamat'] ?? '');
    $data['telepon'] = trim($_POST['telepon'] ?? '');
    $data['agama']   = trim($_POST['agama'] ?? '');

    if ($data['nip'] === '' || strlen($data['nip']) > 30) $errors[] = 'NIP wajib diisi (maks. 30 karakter).';
    if ($data['nama'] === '' || strlen($data['nama']) > 100) $errors[] = 'Nama wajib diisi (maks. 100 karakter).';
    if (strlen($data['telepon']) > 20) $errors[] = 'Telepon maksimal 20 karakter.';
    if (strlen($data['agama']) > 20) $errors[] = 'Agama maksimal 20 karakter.';
    if (strlen($data['alamat']) > 128) $errors[] = 'Alamat maksimal 128 karakter.';

    if (!$errors) {
        $stmt = $pdo->prepare('SELECT COUNT(*) FROM tbl_guru WHERE nip = ? AND id != ?');
        $stmt->execute([$data['nip'], $edit ? $id : 0]);
        if ($stmt->fetchColumn() > 0) $errors[] = 'NIP sudah digunakan guru lain.';
    }

    $foto = upload_foto('foto', $data['foto']);

    if (!$errors) {
        if ($edit) {
            $oldNama = $pdo->prepare('SELECT nama FROM tbl_guru WHERE id = ?');
            $oldNama->execute([$id]);
            $oldNama = $oldNama->fetchColumn();

            $pdo->beginTransaction();
            try {
                $stmt = $pdo->prepare('UPDATE tbl_guru SET nip=?, nama=?, alamat=?, telepon=?, agama=?, foto=? WHERE id=?');
                $stmt->execute([$data['nip'], $data['nama'], $data['alamat'], $data['telepon'], $data['agama'], $foto, $id]);
                // tbl_pelajaran.guru menyimpan nama — sinkronkan bila nama berubah
                if ($oldNama && $oldNama !== $data['nama']) {
                    $pdo->prepare('UPDATE tbl_pelajaran SET guru=? WHERE guru=?')->execute([$data['nama'], $oldNama]);
                }
                $pdo->commit();
                flash_set('success', 'Data guru berhasil diperbarui.');
            } catch (Throwable $e) {
                $pdo->rollBack();
                flash_set('danger', 'Gagal memperbarui data: ' . $e->getMessage());
                redirect('form.php?id=' . $id);
            }
        } else {
            $stmt = $pdo->prepare('INSERT INTO tbl_guru (nip, nama, alamat, telepon, agama, foto) VALUES (?,?,?,?,?,?)');
            $stmt->execute([$data['nip'], $data['nama'], $data['alamat'], $data['telepon'], $data['agama'], $foto]);
            flash_set('success', 'Guru baru berhasil ditambahkan.');
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
                    <label for="nip">NIP</label>
                    <input type="text" id="nip" name="nip" required maxlength="30" value="<?= e($data['nip']) ?>">
                </div>
                <div class="form-group">
                    <label for="nama">Nama Lengkap</label>
                    <input type="text" id="nama" name="nama" required maxlength="100" value="<?= e($data['nama']) ?>">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="telepon">Telepon</label>
                    <input type="text" id="telepon" name="telepon" maxlength="20" value="<?= e($data['telepon']) ?>">
                </div>
                <div class="form-group">
                    <label for="agama">Agama</label>
                    <select id="agama" name="agama">
                        <option value="">— Pilih —</option>
                        <?php foreach ($listAgama as $a): ?>
                            <option value="<?= e($a) ?>" <?= $a === $data['agama'] ? 'selected' : '' ?>><?= e($a) ?></option>
                        <?php endforeach; ?>
                        <?php if ($data['agama'] !== '' && !in_array($data['agama'], $listAgama, true)): ?>
                            <option value="<?= e($data['agama']) ?>" selected><?= e($data['agama']) ?></option>
                        <?php endif; ?>
                    </select>
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
