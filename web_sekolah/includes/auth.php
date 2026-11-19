<?php
// Session, autentikasi & CSRF protection
require_once __DIR__ . '/../config/database.php';

if (session_status() === PHP_SESSION_NONE) {
    session_set_cookie_params([
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();
}

function current_user(): ?array
{
    return $_SESSION['user'] ?? null;
}

function is_logged_in(): bool
{
    return isset($_SESSION['user']['id']);
}

// Wajib login — panggil di awal setiap halaman terproteksi.
function require_login(): void
{
    if (!is_logged_in()) {
        header('Location: ' . BASE_URL . '/login.php');
        exit;
    }
}

// Regenerasi session id setelah login sukses (session fixation protection).
function login_user(array $user): void
{
    session_regenerate_id(true);
    $_SESSION['user'] = [
        'id'       => $user['id'],
        'username' => $user['username'],
        'nama'     => $user['nama'],
        'jabatan'  => $user['jabatan'],
        'foto'     => $user['foto'],
    ];
}

// ---------------- CSRF ----------------
function csrf_token(): string
{
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function csrf_field(): string
{
    return '<input type="hidden" name="csrf_token" value="' . csrf_token() . '">';
}

// Verifikasi token pada semua request POST/DELETE yang mengubah data.
function csrf_verify(): void
{
    $token = $_POST['csrf_token'] ?? '';
    if (!hash_equals($_SESSION['csrf_token'] ?? '', $token)) {
        http_response_code(403);
        exit('CSRF token tidak valid. Silakan muat ulang halaman.');
    }
}
