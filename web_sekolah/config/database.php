<?php
// Konfigurasi & koneksi database (PDO)
// Sesuaikan kredensial dengan XAMPP Anda bila perlu.

define('DB_HOST', '127.0.0.1');
define('DB_NAME', 'db_sekolah');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_CHARSET', 'utf8mb4');

// Base URL aplikasi — terdeteksi otomatis dari SCRIPT_NAME.
// - Via Apache + htdocs\web_sekolah  → '/web_sekolah'
// - Via php -S localhost:8080        → ''  (root)
$_sn = str_replace('\\', '/', $_SERVER['SCRIPT_NAME'] ?? '');
$_base = '';
foreach (['/pages/', '/assets/', '/includes/', '/uploads/', '/index.php', '/login.php', '/logout.php'] as $_m) {
    $_pos = strpos($_sn, $_m);
    if ($_pos !== false) { $_base = substr($_sn, 0, $_pos); break; }
}
unset($_sn, $_m, $_pos);
define('BASE_URL', $_base);

define('APP_NAME', 'School Management System');
define('UPLOAD_DIR', __DIR__ . '/../uploads/');
define('UPLOAD_URL', BASE_URL . '/uploads/');

// Ambang kelulusan hasil ujian (rata-rata)
define('NILAI_LULUS', 60);

function db(): PDO
{
    static $pdo = null;
    if ($pdo === null) {
        $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=' . DB_CHARSET;
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            http_response_code(500);
            exit('Koneksi database gagal: ' . htmlspecialchars($e->getMessage()));
        }
    }
    return $pdo;
}
