<?php
// Helper functions yang reusable

// Escape output — anti XSS
function e(?string $s): string
{
    return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8');
}

function redirect(string $url): void
{
    header('Location: ' . $url);
    exit;
}

// ---------------- Flash message ----------------
function flash_set(string $type, string $msg): void
{
    $_SESSION['flash'][] = ['type' => $type, 'msg' => $msg];
}

function flash_get(): array
{
    $f = $_SESSION['flash'] ?? [];
    unset($_SESSION['flash']);
    return $f;
}

// ---------------- Pagination ----------------
// Mengembalikan [totalRows, offset, totalPages, currentPage]
function paginate(string $countSql, array $params, int $perPage = 10): array
{
    $page  = max(1, (int)($_GET['page'] ?? 1));
    $stmt  = db()->prepare($countSql);
    $stmt->execute($params);
    $total = (int)$stmt->fetchColumn();
    $pages = max(1, (int)ceil($total / $perPage));
    $page  = min($page, $pages);
    return [$total, ($page - 1) * $perPage, $pages, $page];
}

// Render link pagination, mempertahankan query string aktif.
function pagination_links(int $page, int $pages): string
{
    if ($pages <= 1) return '';
    $q = $_GET;
    $html = '<div class="pagination">';
    $q['page'] = max(1, $page - 1);
    $html .= '<a class="pg-btn' . ($page <= 1 ? ' disabled' : '') . '" href="?' . http_build_query($q) . '">&laquo;</a>';
    $start = max(1, $page - 2);
    $end   = min($pages, $page + 2);
    for ($i = $start; $i <= $end; $i++) {
        $q['page'] = $i;
        $html .= '<a class="pg-btn' . ($i === $page ? ' active' : '') . '" href="?' . http_build_query($q) . '">' . $i . '</a>';
    }
    $q['page'] = min($pages, $page + 1);
    $html .= '<a class="pg-btn' . ($page >= $pages ? ' disabled' : '') . '" href="?' . http_build_query($q) . '">&raquo;</a>';
    $html .= '</div>';
    return $html;
}

// ---------------- Upload foto ----------------
// Mengembalikan nama file tersimpan, atau '' bila tidak ada/invalid.
// $old = nama file lama untuk dihapus saat diganti.
function upload_foto(string $field, string $old = ''): string
{
    if (empty($_FILES[$field]) || $_FILES[$field]['error'] === UPLOAD_ERR_NO_FILE) {
        return $old;
    }
    $f = $_FILES[$field];
    if ($f['error'] !== UPLOAD_ERR_OK) {
        flash_set('danger', 'Upload foto gagal (error ' . $f['error'] . ').');
        return $old;
    }
    if ($f['size'] > 2 * 1024 * 1024) {
        flash_set('danger', 'Ukuran foto maksimal 2 MB.');
        return $old;
    }
    $mime = mime_content_type($f['tmp_name']);
    $ext  = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/gif' => 'gif', 'image/webp' => 'webp'][$mime] ?? null;
    if (!$ext) {
        flash_set('danger', 'Format foto harus JPG/PNG/GIF/WebP.');
        return $old;
    }
    if (!is_dir(UPLOAD_DIR)) {
        mkdir(UPLOAD_DIR, 0755, true);
    }
    // uniqid (13) + '.' + ext (<=4) = max 18 karakter, muat di kolom varchar(20)
    $name = uniqid() . '.' . $ext;
    if (move_uploaded_file($f['tmp_name'], UPLOAD_DIR . $name)) {
        if ($old && $old !== $name && is_file(UPLOAD_DIR . $old)) {
            unlink(UPLOAD_DIR . $old);
        }
        return $name;
    }
    flash_set('danger', 'Gagal menyimpan file foto.');
    return $old;
}

function foto_url(string $foto): string
{
    if ($foto && is_file(UPLOAD_DIR . $foto)) {
        return UPLOAD_URL . rawurlencode($foto);
    }
    return BASE_URL . '/assets/img/avatar.svg';
}

// Tanggal format Indonesia singkat
function tgl_id(?string $date): string
{
    $bln = [1=>'Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    $ts  = $date !== null && $date !== '' ? strtotime($date) : false;
    if (!$ts) return e($date);
    return date('j', $ts) . ' ' . $bln[(int)date('n', $ts)] . ' ' . date('Y', $ts);
}

// Generate nomor ujian baru (char(7)): "U" + 6 digit berurutan
function next_no_ujian(PDO $pdo): string
{
    $max = $pdo->query("SELECT MAX(no_ujian) FROM tbl_ujian")->fetchColumn();
    $num = $max ? ((int)substr($max, 1) + 1) : 1;
    return 'U' . str_pad((string)$num, 6, '0', STR_PAD_LEFT);
}

// Daftar jurusan — sumber tunggal: tbl_jurusan
function list_jurusan(): array
{
    return db()->query("SELECT jurusan FROM tbl_jurusan WHERE jurusan <> '' ORDER BY jurusan")
        ->fetchAll(PDO::FETCH_COLUMN);
}

// Highlight menu aktif di sidebar
function nav_active(string $segment): string
{
    $uri = $_SERVER['REQUEST_URI'] ?? '';
    return str_contains($uri, $segment) ? ' active' : '';
}
