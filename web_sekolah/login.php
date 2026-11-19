<?php
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/functions.php';

if (is_logged_in()) {
    redirect(BASE_URL . '/pages/dashboard.php');
}

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';

    if ($username === '' || $password === '') {
        $error = 'Username dan password wajib diisi.';
    } else {
        $stmt = db()->prepare('SELECT * FROM tbl_user WHERE username = ? LIMIT 1');
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password'])) {
            login_user($user);
            redirect(BASE_URL . '/pages/dashboard.php');
        }
        $error = 'Username atau password salah.';
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Login — <?= e(APP_NAME) ?></title>
<link rel="stylesheet" href="<?= BASE_URL ?>/assets/css/style.css">
</head>
<body class="login-page" style="background-image: linear-gradient(rgba(15,23,42,.55), rgba(15,23,42,.6)), url('<?= BASE_URL ?>/foto_sekolah.JPG');">
<div class="login-card">
    <div class="login-brand">
        <img src="<?= BASE_URL ?>/LOGOSMK1.png" alt="Logo SMK Negeri 1 Palangka Raya" class="login-logo">
        <h1>SMK Negeri 1 Palangka Raya</h1>
        <p>Masuk untuk mengelola data sekolah</p>
    </div>

    <?php if ($error): ?>
        <div class="alert alert-danger"><?= e($error) ?></div>
    <?php endif; ?>
    <?php foreach (flash_get() as $f): ?>
        <div class="alert alert-<?= e($f['type']) ?>"><?= e($f['msg']) ?></div>
    <?php endforeach; ?>

    <form method="post" autocomplete="off">
        <?= csrf_field() ?>
        <div class="form-group">
            <label for="username">Username</label>
            <input type="text" id="username" name="username" required maxlength="50"
                   value="<?= e($_POST['username'] ?? '') ?>" placeholder="Masukkan username" autofocus>
        </div>
        <div class="form-group">
            <label for="password">Password</label>
            <div class="input-password">
                <input type="password" id="password" name="password" required placeholder="Masukkan password">
                <button type="button" class="toggle-pw" data-target="password" aria-label="Tampilkan password">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
            </div>
        </div>
        <button type="submit" class="btn btn-primary btn-block">Masuk</button>
    </form>
</div>
<script src="<?= BASE_URL ?>/assets/js/app.js"></script>
</body>
</html>
