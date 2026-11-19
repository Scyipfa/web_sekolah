<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/functions.php';
require_login();

$pdo = db();
$page_title = 'Profile';
$u = current_user();
$errors = [];

// Ambil data terbaru dari DB
$stmt = $pdo->prepare('SELECT * FROM tbl_user WHERE id = ?');
$stmt->execute([$u['id']]);
$user = $stmt->fetch();
if (!$user) {
    session_destroy();
    redirect(BASE_URL . '/login.php');
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();
    $action = $_POST['action'] ?? '';

    if ($action === 'profile') {
        $user['username'] = trim($_POST['username'] ?? '');
        $user['nama']     = trim($_POST['nama'] ?? '');
        $user['alamat']   = trim($_POST['alamat'] ?? '');
        $user['jabatan']  = trim($_POST['jabatan'] ?? '');

        if ($user['username'] === '' || strlen($user['username']) > 50) $errors[] = 'Username wajib diisi (maks. 50 karakter).';
        if ($user['nama'] === '' || strlen($user['nama']) > 128) $errors[] = 'Nama wajib diisi (maks. 128 karakter).';
        if (strlen($user['alamat']) > 128) $errors[] = 'Alamat maksimal 128 karakter.';
        if (strlen($user['jabatan']) > 128) $errors[] = 'Jabatan maksimal 128 karakter.';

        if (!$errors) {
            $stmt = $pdo->prepare('SELECT COUNT(*) FROM tbl_user WHERE username = ? AND id != ?');
            $stmt->execute([$user['username'], $u['id']]);
            if ($stmt->fetchColumn() > 0) $errors[] = 'Username sudah digunakan akun lain.';
        }

        $foto = upload_foto('foto', $user['foto']);

        if (!$errors) {
            $stmt = $pdo->prepare('UPDATE tbl_user SET username=?, nama=?, alamat=?, jabatan=?, foto=? WHERE id=?');
            $stmt->execute([$user['username'], $user['nama'], $user['alamat'], $user['jabatan'], $foto, $u['id']]);
            // Sinkronkan session
            $_SESSION['user'] = array_merge($_SESSION['user'], [
                'username' => $user['username'],
                'nama'     => $user['nama'],
                'jabatan'  => $user['jabatan'],
                'foto'     => $foto,
            ]);
            $user['foto'] = $foto;
            flash_set('success', 'Profil berhasil diperbarui.');
            redirect('profile.php');
        }
    }

    if ($action === 'password') {
        $old = $_POST['old_password'] ?? '';
        $new = $_POST['new_password'] ?? '';
        $cfm = $_POST['confirm_password'] ?? '';

        if (!password_verify($old, $user['password'])) {
            $errors[] = 'Password lama salah.';
        } elseif (strlen($new) < 6) {
            $errors[] = 'Password baru minimal 6 karakter.';
        } elseif ($new !== $cfm) {
            $errors[] = 'Konfirmasi password baru tidak cocok.';
        } else {
            $hash = password_hash($new, PASSWORD_DEFAULT);
            $pdo->prepare('UPDATE tbl_user SET password = ? WHERE id = ?')->execute([$hash, $u['id']]);
            flash_set('success', 'Password berhasil diubah.');
            redirect('profile.php');
        }
    }
}

include __DIR__ . '/../includes/header.php';
?>

<?php foreach ($errors as $err): ?>
    <div class="alert alert-danger"><?= e($err) ?></div>
<?php endforeach; ?>

<div class="grid-2">
    <div class="card">
        <div class="card-header"><span class="card-title">Informasi Akun</span></div>
        <div class="card-body">
            <form method="post" enctype="multipart/form-data">
                <?= csrf_field() ?>
                <input type="hidden" name="action" value="profile">
                <div class="form-group" style="text-align:center">
                    <img class="detail-photo" src="<?= foto_url($user['foto']) ?>" alt="Foto profil" style="margin:0 auto 10px">
                </div>
                <div class="form-group">
                    <label for="username">Username</label>
                    <input type="text" id="username" name="username" required maxlength="50" value="<?= e($user['username']) ?>">
                </div>
                <div class="form-group">
                    <label for="nama">Nama Lengkap</label>
                    <input type="text" id="nama" name="nama" required maxlength="128" value="<?= e($user['nama']) ?>">
                </div>
                <div class="form-group">
                    <label for="jabatan">Jabatan</label>
                    <input type="text" id="jabatan" name="jabatan" maxlength="128" value="<?= e($user['jabatan']) ?>">
                </div>
                <div class="form-group">
                    <label for="alamat">Alamat</label>
                    <textarea id="alamat" name="alamat" rows="3" maxlength="128"><?= e($user['alamat']) ?></textarea>
                </div>
                <div class="form-group">
                    <label for="foto">Ganti Foto <span class="text-muted">(opsional, maks. 2 MB)</span></label>
                    <input type="file" id="foto" name="foto" accept="image/*">
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">Simpan Profil</button>
                </div>
            </form>
        </div>
    </div>

    <div class="card">
        <div class="card-header"><span class="card-title">Ubah Password</span></div>
        <div class="card-body">
            <form method="post">
                <?= csrf_field() ?>
                <input type="hidden" name="action" value="password">
                <div class="form-group">
                    <label for="old_password">Password Lama</label>
                    <div class="input-password">
                        <input type="password" id="old_password" name="old_password" required>
                        <button type="button" class="toggle-pw" data-target="old_password" aria-label="Tampilkan">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        </button>
                    </div>
                </div>
                <div class="form-group">
                    <label for="new_password">Password Baru <span class="text-muted">(min. 6 karakter)</span></label>
                    <div class="input-password">
                        <input type="password" id="new_password" name="new_password" required minlength="6">
                        <button type="button" class="toggle-pw" data-target="new_password" aria-label="Tampilkan">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        </button>
                    </div>
                </div>
                <div class="form-group">
                    <label for="confirm_password">Konfirmasi Password Baru</label>
                    <div class="input-password">
                        <input type="password" id="confirm_password" name="confirm_password" required minlength="6">
                        <button type="button" class="toggle-pw" data-target="confirm_password" aria-label="Tampilkan">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        </button>
                    </div>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">Ubah Password</button>
                </div>
            </form>
        </div>
    </div>
</div>

<?php include __DIR__ . '/../includes/footer.php'; ?>
