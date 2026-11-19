<?php
require_once __DIR__ . '/../../includes/auth.php';
require_once __DIR__ . '/../../includes/functions.php';
require_login();

$pdo = db();
$old = trim($_GET['j'] ?? '');
$edit = $old !== '';
$page_title = $edit ? 'Ubah Nama Jurusan' : 'Tambah Jurusan';
$errors = [];

if ($edit) {
    // Pastikan jurusan ada (terdaftar atau dipakai data)
    if (!in_array($old, list_jurusan(), true)) {
        flash_set('danger', 'Jurusan tidak ditemukan.');
        redirect('index.php');
    }
}

$nama = $old;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();
    $nama = trim($_POST['jurusan'] ?? '');

    if ($nama === '' || strlen($nama) > 50) {
        $errors[] = 'Nama jurusan wajib diisi (maks. 50 karakter).';
    } elseif (!$edit || strcasecmp($nama, $old) !== 0) {
        if (in_array($nama, list_jurusan(), true)) {
            $errors[] = 'Jurusan sudah ada.';
        }
    }

    if (!$errors) {
        $pdo->beginTransaction();
        try {
            if ($edit) {
                // Rename: daftarkan nama baru & perbarui semua tabel yang memakai nama lama
                $pdo->prepare('UPDATE tbl_jurusan SET jurusan = ? WHERE jurusan = ?')->execute([$nama, $old]);
                // Pastikan baris ada (untuk jurusan yang hanya ada di data)
                $chk = $pdo->prepare('SELECT COUNT(*) FROM tbl_jurusan WHERE jurusan = ?');
                $chk->execute([$nama]);
                if (!$chk->fetchColumn()) {
                    $pdo->prepare('INSERT INTO tbl_jurusan (jurusan) VALUES (?)')->execute([$nama]);
                }
                $pdo->prepare('UPDATE tbl_siswa SET jurusan = ? WHERE jurusan = ?')->execute([$nama, $old]);
                $pdo->prepare('UPDATE tbl_pelajaran SET jurusan = ? WHERE jurusan = ?')->execute([$nama, $old]);
                $pdo->prepare('UPDATE tbl_ujian SET jurusan = ? WHERE jurusan = ?')->execute([$nama, $old]);
                $pdo->commit();
                flash_set('success', "Jurusan \"$old\" berhasil diubah menjadi \"$nama\".");
            } else {
                $pdo->prepare('INSERT INTO tbl_jurusan (jurusan) VALUES (?)')->execute([$nama]);
                $pdo->commit();
                flash_set('success', "Jurusan \"$nama\" berhasil ditambahkan.");
            }
            redirect('index.php');
        } catch (Throwable $e) {
            $pdo->rollBack();
            $errors[] = 'Gagal menyimpan: ' . $e->getMessage();
        }
    }
}

include __DIR__ . '/../../includes/header.php';
?>

<div class="card" style="max-width:560px">
    <div class="card-header"><span class="card-title"><?= e($page_title) ?></span></div>
    <div class="card-body">
        <?php foreach ($errors as $err): ?>
            <div class="alert alert-danger"><?= e($err) ?></div>
        <?php endforeach; ?>
        <form method="post">
            <?= csrf_field() ?>
            <div class="form-group">
                <label for="jurusan">Nama Jurusan</label>
                <input type="text" id="jurusan" name="jurusan" required maxlength="50" value="<?= e($nama) ?>" placeholder="mis. RPL 3">
            </div>
            <?php if ($edit): ?>
                <div class="alert alert-info">Mengubah nama jurusan akan ikut memperbarui jurusan pada data siswa, mata pelajaran, dan hasil ujian terkait.</div>
            <?php endif; ?>
            <div class="form-actions">
                <button type="submit" class="btn btn-primary">Simpan</button>
                <a href="index.php" class="btn btn-secondary">Batal</a>
            </div>
        </form>
    </div>
</div>

<?php include __DIR__ . '/../../includes/footer.php'; ?>
