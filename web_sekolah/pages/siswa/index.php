<?php
require_once __DIR__ . '/../../includes/auth.php';
require_once __DIR__ . '/../../includes/functions.php';
require_login();

$pdo = db();
$page_title = 'Data Siswa';
$perPage = 10;

// ---------- Filter & pencarian ----------
$q       = trim($_GET['q'] ?? '');
$kelas   = trim($_GET['kelas'] ?? '');
$jurusan = trim($_GET['jurusan'] ?? '');

$where  = [];
$params = [];
if ($q !== '') {
    $where[] = '(nama LIKE ? OR nis LIKE ?)';
    $params[] = "%$q%";
    $params[] = "%$q%";
}
if ($kelas !== '')   { $where[] = 'kelas = ?';   $params[] = $kelas; }
if ($jurusan !== '') { $where[] = 'jurusan = ?'; $params[] = $jurusan; }
$whereSql = $where ? ' WHERE ' . implode(' AND ', $where) : '';

// ---------- Pagination ----------
[$total, $offset, $pages, $page] = paginate("SELECT COUNT(*) FROM tbl_siswa$whereSql", $params, $perPage);

$stmt = $pdo->prepare("SELECT * FROM tbl_siswa$whereSql ORDER BY nis LIMIT $perPage OFFSET $offset");
$stmt->execute($params);
$rows = $stmt->fetchAll();

// Opsi filter dinamis dari data yang ada
$listKelas   = $pdo->query('SELECT DISTINCT kelas FROM tbl_siswa ORDER BY kelas')->fetchAll(PDO::FETCH_COLUMN);
$listJurusan = list_jurusan();

$exportQuery = http_build_query(array_filter(['q' => $q, 'kelas' => $kelas, 'jurusan' => $jurusan]));

include __DIR__ . '/../../includes/header.php';
?>

<div class="card">
    <div class="card-header">
        <span class="card-title">Daftar Siswa</span>
        <div class="btn-group">
            <a class="btn btn-success btn-sm" href="export.php?<?= e($exportQuery) ?>">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>
                Export Excel
            </a>
            <a class="btn btn-primary btn-sm" href="form.php">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
                Tambah Siswa
            </a>
        </div>
    </div>

    <div class="toolbar">
        <form method="get">
            <input type="search" name="q" placeholder="Cari nama atau NIS..." value="<?= e($q) ?>">
            <select name="kelas">
                <option value="">Semua Kelas</option>
                <?php foreach ($listKelas as $k): ?>
                    <option value="<?= e($k) ?>" <?= $k === $kelas ? 'selected' : '' ?>><?= e($k) ?></option>
                <?php endforeach; ?>
            </select>
            <select name="jurusan">
                <option value="">Semua Jurusan</option>
                <?php foreach ($listJurusan as $j): ?>
                    <option value="<?= e($j) ?>" <?= $j === $jurusan ? 'selected' : '' ?>><?= e($j) ?></option>
                <?php endforeach; ?>
            </select>
            <button type="submit" class="btn btn-secondary btn-sm">Filter</button>
            <?php if ($q !== '' || $kelas !== '' || $jurusan !== ''): ?>
                <a href="index.php" class="btn btn-secondary btn-sm">Reset</a>
            <?php endif; ?>
        </form>
    </div>

    <div class="table-wrap">
        <table class="data-table">
            <thead>
                <tr>
                    <th>Foto</th>
                    <th>NIS</th>
                    <th>Nama</th>
                    <th>Kelas</th>
                    <th>Jurusan</th>
                    <th>Alamat</th>
                    <th>Aksi</th>
                </tr>
            </thead>
            <tbody>
            <?php if (!$rows): ?>
                <tr><td colspan="7" class="table-empty">Tidak ada data siswa ditemukan.</td></tr>
            <?php endif; ?>
            <?php foreach ($rows as $r): ?>
                <tr>
                    <td><img class="td-foto" src="<?= foto_url($r['foto']) ?>" alt=""></td>
                    <td class="nowrap"><?= e($r['nis']) ?></td>
                    <td><?= e($r['nama']) ?></td>
                    <td><span class="badge badge-info"><?= e($r['kelas']) ?></span></td>
                    <td><?= e($r['jurusan']) ?></td>
                    <td class="wrap"><?= e($r['alamat']) ?></td>
                    <td class="nowrap">
                        <div class="btn-group">
                            <a class="btn btn-secondary btn-sm" href="detail.php?nis=<?= urlencode($r['nis']) ?>" title="Detail">
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            </a>
                            <a class="btn btn-primary btn-sm" href="form.php?nis=<?= urlencode($r['nis']) ?>" title="Edit">
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </a>
                            <a class="btn btn-danger btn-sm" href="delete.php?nis=<?= urlencode($r['nis']) ?>" title="Hapus">
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                            </a>
                        </div>
                    </td>
                </tr>
            <?php endforeach; ?>
            </tbody>
        </table>
    </div>

    <div class="table-footer">
        <span>Menampilkan <?= count($rows) ?> dari <?= $total ?> data</span>
    </div>
    <?= pagination_links($page, $pages) ?>
</div>

<?php include __DIR__ . '/../../includes/footer.php'; ?>
