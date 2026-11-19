<?php
require_once __DIR__ . '/../../includes/auth.php';
require_once __DIR__ . '/../../includes/functions.php';
require_login();

$pdo = db();
$page_title = 'Mata Pelajaran';
$perPage = 10;

$q       = trim($_GET['q'] ?? '');
$jurusan = trim($_GET['jurusan'] ?? '');

$where  = [];
$params = [];
if ($q !== '') {
    $where[] = '(pelajaran LIKE ? OR guru LIKE ?)';
    $params[] = "%$q%";
    $params[] = "%$q%";
}
if ($jurusan !== '') { $where[] = 'jurusan = ?'; $params[] = $jurusan; }
$whereSql = $where ? ' WHERE ' . implode(' AND ', $where) : '';

[$total, $offset, $pages, $page] = paginate("SELECT COUNT(*) FROM tbl_pelajaran$whereSql", $params, $perPage);

$stmt = $pdo->prepare("SELECT * FROM tbl_pelajaran$whereSql ORDER BY pelajaran LIMIT $perPage OFFSET $offset");
$stmt->execute($params);
$rows = $stmt->fetchAll();

$listJurusan = list_jurusan();
$exportQuery = http_build_query(array_filter(['q' => $q, 'jurusan' => $jurusan]));

include __DIR__ . '/../../includes/header.php';
?>

<div class="card">
    <div class="card-header">
        <span class="card-title">Daftar Mata Pelajaran</span>
        <div class="btn-group">
            <a class="btn btn-success btn-sm" href="export.php?<?= e($exportQuery) ?>">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>
                Export Excel
            </a>
            <a class="btn btn-primary btn-sm" href="form.php">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
                Tambah Pelajaran
            </a>
        </div>
    </div>

    <div class="toolbar">
        <form method="get">
            <input type="search" name="q" placeholder="Cari pelajaran atau guru..." value="<?= e($q) ?>">
            <select name="jurusan">
                <option value="">Semua Jurusan</option>
                <?php foreach ($listJurusan as $j): ?>
                    <option value="<?= e($j) ?>" <?= $j === $jurusan ? 'selected' : '' ?>><?= e($j) ?></option>
                <?php endforeach; ?>
            </select>
            <button type="submit" class="btn btn-secondary btn-sm">Filter</button>
            <?php if ($q !== '' || $jurusan !== ''): ?>
                <a href="index.php" class="btn btn-secondary btn-sm">Reset</a>
            <?php endif; ?>
        </form>
    </div>

    <div class="table-wrap">
        <table class="data-table">
            <thead>
                <tr>
                    <th>No</th>
                    <th>Mata Pelajaran</th>
                    <th>Jurusan</th>
                    <th>Guru Pengampu</th>
                    <th>Aksi</th>
                </tr>
            </thead>
            <tbody>
            <?php if (!$rows): ?>
                <tr><td colspan="5" class="table-empty">Tidak ada data mata pelajaran ditemukan.</td></tr>
            <?php endif; ?>
            <?php foreach ($rows as $i => $r): ?>
                <tr>
                    <td><?= $offset + $i + 1 ?></td>
                    <td><?= e($r['pelajaran']) ?></td>
                    <td><span class="badge badge-info"><?= e($r['jurusan']) ?></span></td>
                    <td><?= e($r['guru']) ?></td>
                    <td class="nowrap">
                        <div class="btn-group">
                            <a class="btn btn-secondary btn-sm" href="detail.php?id=<?= (int)$r['id'] ?>" title="Detail">
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            </a>
                            <a class="btn btn-primary btn-sm" href="form.php?id=<?= (int)$r['id'] ?>" title="Edit">
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </a>
                            <a class="btn btn-danger btn-sm" href="delete.php?id=<?= (int)$r['id'] ?>" title="Hapus">
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
