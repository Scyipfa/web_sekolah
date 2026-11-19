<?php
require_once __DIR__ . '/../../includes/auth.php';
require_once __DIR__ . '/../../includes/functions.php';
require_login();

$pdo = db();
$page_title = 'Hasil Ujian';
$perPage = 10;

$q       = trim($_GET['q'] ?? '');
$hasil   = trim($_GET['hasil'] ?? '');
$jurusan = trim($_GET['jurusan'] ?? '');

$where  = [];
$params = [];
if ($q !== '') {
    $where[] = '(u.no_ujian LIKE ? OR u.nis LIKE ? OR s.nama LIKE ?)';
    $params[] = "%$q%";
    $params[] = "%$q%";
    $params[] = "%$q%";
}
if ($hasil !== '')   { $where[] = 'u.hasil_ujian = ?'; $params[] = $hasil; }
if ($jurusan !== '') { $where[] = 'u.jurusan = ?';     $params[] = $jurusan; }
$whereSql = $where ? ' WHERE ' . implode(' AND ', $where) : '';
$join = ' FROM tbl_ujian u LEFT JOIN tbl_siswa s ON s.nis = u.nis';

[$total, $offset, $pages, $page] = paginate("SELECT COUNT(*)$join$whereSql", $params, $perPage);

$stmt = $pdo->prepare(
    "SELECT u.*, s.nama AS nama_siswa $join$whereSql
     ORDER BY u.tgl_ujian DESC, u.no_ujian DESC LIMIT $perPage OFFSET $offset"
);
$stmt->execute($params);
$rows = $stmt->fetchAll();

$listJurusan = list_jurusan();
$exportQuery = http_build_query(array_filter(['q' => $q, 'hasil' => $hasil, 'jurusan' => $jurusan]));

include __DIR__ . '/../../includes/header.php';
?>

<div class="card">
    <div class="card-header">
        <span class="card-title">Daftar Hasil Ujian</span>
        <div class="btn-group">
            <a class="btn btn-success btn-sm" href="export.php?<?= e($exportQuery) ?>">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>
                Export Excel
            </a>
            <a class="btn btn-primary btn-sm" href="form.php">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
                Tambah Hasil Ujian
            </a>
        </div>
    </div>

    <div class="toolbar">
        <form method="get">
            <input type="search" name="q" placeholder="Cari no ujian, NIS, atau nama..." value="<?= e($q) ?>">
            <select name="hasil">
                <option value="">Semua Hasil</option>
                <option value="LULUS" <?= $hasil === 'LULUS' ? 'selected' : '' ?>>LULUS</option>
                <option value="TIDAK" <?= $hasil === 'TIDAK' ? 'selected' : '' ?>>TIDAK</option>
            </select>
            <select name="jurusan">
                <option value="">Semua Jurusan</option>
                <?php foreach ($listJurusan as $j): ?>
                    <option value="<?= e($j) ?>" <?= $j === $jurusan ? 'selected' : '' ?>><?= e($j) ?></option>
                <?php endforeach; ?>
            </select>
            <button type="submit" class="btn btn-secondary btn-sm">Filter</button>
            <?php if ($q !== '' || $hasil !== '' || $jurusan !== ''): ?>
                <a href="index.php" class="btn btn-secondary btn-sm">Reset</a>
            <?php endif; ?>
        </form>
    </div>

    <div class="table-wrap">
        <table class="data-table">
            <thead>
                <tr>
                    <th>No Ujian</th>
                    <th>Tanggal</th>
                    <th>NIS</th>
                    <th>Nama Siswa</th>
                    <th>Jurusan</th>
                    <th>Total</th>
                    <th>Rata-rata</th>
                    <th>Hasil</th>
                    <th>Aksi</th>
                </tr>
            </thead>
            <tbody>
            <?php if (!$rows): ?>
                <tr><td colspan="9" class="table-empty">Tidak ada data hasil ujian ditemukan.</td></tr>
            <?php endif; ?>
            <?php foreach ($rows as $r): ?>
                <tr>
                    <td class="nowrap"><strong><?= e($r['no_ujian']) ?></strong></td>
                    <td class="nowrap"><?= tgl_id($r['tgl_ujian']) ?></td>
                    <td><?= e($r['nis']) ?></td>
                    <td><?= e($r['nama_siswa'] ?? '—') ?></td>
                    <td><?= e($r['jurusan']) ?></td>
                    <td><?= (int)$r['total_nilai'] ?></td>
                    <td><?= (int)$r['nilai_rata2'] ?></td>
                    <td><span class="badge <?= $r['hasil_ujian'] === 'LULUS' ? 'badge-success' : 'badge-danger' ?>"><?= e($r['hasil_ujian']) ?></span></td>
                    <td class="nowrap">
                        <div class="btn-group">
                            <a class="btn btn-secondary btn-sm" href="detail.php?id=<?= urlencode($r['no_ujian']) ?>" title="Detail">
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            </a>
                            <a class="btn btn-primary btn-sm" href="form.php?id=<?= urlencode($r['no_ujian']) ?>" title="Edit">
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </a>
                            <a class="btn btn-danger btn-sm" href="delete.php?id=<?= urlencode($r['no_ujian']) ?>" title="Hapus">
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
