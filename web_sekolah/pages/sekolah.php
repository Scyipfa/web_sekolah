<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/functions.php';
require_login();

$pdo = db();
$existing = $pdo->query('SELECT * FROM tbl_sekolah ORDER BY id LIMIT 1')->fetch();

$data = [
    'nama'        => $existing['nama'] ?? '',
    'alamat'      => $existing['alamat'] ?? '',
    'akreditasi'  => $existing['akreditasi'] ?? '',
    'status'      => $existing['status'] ?? '',
    'email'       => $existing['email'] ?? '',
    'visimisi'    => $existing['visimisi'] ?? '',
    'gambar'      => $existing['gambar'] ?? '',
];
$errors = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();
    foreach (['nama','alamat','akreditasi','status','email','visimisi'] as $f) {
        $data[$f] = trim($_POST[$f] ?? '');
    }
    $data['gambar'] = upload_foto('gambar', $data['gambar']);

    if ($data['nama'] === '' || strlen($data['nama']) > 128) $errors[] = 'Nama sekolah wajib diisi (maks. 128 karakter).';
    if (strlen($data['alamat']) > 128) $errors[] = 'Alamat maksimal 128 karakter.';
    if (strlen($data['akreditasi']) > 1) $errors[] = 'Akreditasi cukup 1 karakter (mis. A, B, C).';
    if (strlen($data['status']) > 10) $errors[] = 'Status maksimal 10 karakter (mis. Negeri).';
    if ($data['email'] !== '' && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) $errors[] = 'Format email tidak valid.';
    if (strlen($data['visimisi']) > 65535) $errors[] = 'Visi & misi terlalu panjang.';

    if (!$errors) {
        if ($existing) {
            $stmt = $pdo->prepare(
                'UPDATE tbl_sekolah SET nama=?, alamat=?, akreditasi=?, status=?, email=?, visimisi=?, gambar=? WHERE id=?'
            );
            $stmt->execute([
                $data['nama'], $data['alamat'], $data['akreditasi'], $data['status'],
                $data['email'], $data['visimisi'], $data['gambar'], $existing['id']
            ]);
        } else {
            $stmt = $pdo->prepare(
                'INSERT INTO tbl_sekolah (nama, alamat, akreditasi, status, email, visimisi, gambar) VALUES (?,?,?,?,?,?,?)'
            );
            $stmt->execute([
                $data['nama'], $data['alamat'], $data['akreditasi'], $data['status'],
                $data['email'], $data['visimisi'], $data['gambar']
            ]);
        }
        flash_set('success', 'Profil sekolah berhasil disimpan.');
        redirect(BASE_URL . '/pages/dashboard.php');
    }
}

$page_title = 'Profil Sekolah';
include __DIR__ . '/../includes/header.php';
?>

<div class="card" style="max-width:720px">
    <div class="card-header"><span class="card-title">Profil Sekolah</span></div>
    <div class="card-body">
        <?php foreach ($errors as $err): ?>
            <div class="alert alert-danger"><?= e($err) ?></div>
        <?php endforeach; ?>
        <form method="post" enctype="multipart/form-data">
            <?= csrf_field() ?>
            <div class="form-group">
                <label for="nama">Nama Sekolah</label>
                <input type="text" id="nama" name="nama" required maxlength="128" value="<?= e($data['nama']) ?>">
            </div>
            <div class="form-group">
                <label for="alamat">Alamat</label>
                <input type="text" id="alamat" name="alamat" maxlength="128" value="<?= e($data['alamat']) ?>">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="akreditasi">Akreditasi</label>
                    <input type="text" id="akreditasi" name="akreditasi" maxlength="1" value="<?= e($data['akreditasi']) ?>" placeholder="A/B/C">
                </div>
                <div class="form-group">
                    <label for="status">Status</label>
                    <input type="text" id="status" name="status" maxlength="10" value="<?= e($data['status']) ?>" placeholder="Negeri">
                </div>
            </div>
            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" name="email" maxlength="100" value="<?= e($data['email']) ?>">
            </div>
            <div class="form-group">
                <label for="visimisi">Visi &amp; Misi</label>
                <textarea id="visimisi" name="visimisi" rows="5"><?= e($data['visimisi']) ?></textarea>
            </div>
            <div class="form-group">
                <label for="gambar">Gambar/Logo Sekolah</label>
                <input type="file" id="gambar" name="gambar" accept="image/jpeg,image/png,image/gif,image/webp">
                <div class="form-hint">Maks. 2 MB — JPG/PNG/GIF/WebP.</div>
                <?php if ($data['gambar'] !== ''): ?>
                    <div style="margin-top:8px"><img src="<?= foto_url($data['gambar']) ?>" class="detail-photo" alt=""></div>
                <?php endif; ?>
            </div>
            <div class="form-actions">
                <button type="submit" class="btn btn-primary">Simpan</button>
                <a href="<?= BASE_URL ?>/pages/dashboard.php" class="btn btn-secondary">Kembali</a>
            </div>
        </form>
    </div>
</div>

<?php include __DIR__ . '/../includes/footer.php'; ?>
