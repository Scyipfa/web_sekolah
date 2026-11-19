<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/functions.php';
require_login();

$pdo = db();
$page_title = 'Dashboard';

// ---------- Statistik ringkas ----------
$totalSiswa     = (int)$pdo->query('SELECT COUNT(*) FROM tbl_siswa')->fetchColumn();
$totalGuru      = (int)$pdo->query('SELECT COUNT(*) FROM tbl_guru')->fetchColumn();
$totalPelajaran = (int)$pdo->query('SELECT COUNT(*) FROM tbl_pelajaran')->fetchColumn();
$totalUjian     = (int)$pdo->query('SELECT COUNT(*) FROM tbl_ujian')->fetchColumn();

// ---------- Chart: siswa per jurusan ----------
$perJurusan = $pdo->query(
    "SELECT jurusan, COUNT(*) AS jml FROM tbl_siswa GROUP BY jurusan ORDER BY jml DESC"
)->fetchAll();

// ---------- Chart: distribusi hasil ujian ----------
$perHasil = $pdo->query(
    "SELECT hasil_ujian, COUNT(*) AS jml FROM tbl_ujian GROUP BY hasil_ujian"
)->fetchAll(PDO::FETCH_KEY_PAIR);
$lulus  = (int)($perHasil['LULUS'] ?? 0);
$tidak  = (int)($perHasil['TIDAK'] ?? 0);

// ---------- Aktivitas terbaru ----------
$recentUjian = $pdo->query(
    "SELECT u.no_ujian, u.tgl_ujian, u.hasil_ujian, u.nilai_rata2, s.nama AS nama_siswa, s.nis
     FROM tbl_ujian u LEFT JOIN tbl_siswa s ON s.nis = u.nis
     ORDER BY u.tgl_ujian DESC, u.no_ujian DESC LIMIT 5"
)->fetchAll();
$recentSiswa = $pdo->query('SELECT nis, nama, kelas, jurusan FROM tbl_siswa ORDER BY nis DESC LIMIT 5')->fetchAll();

// ---------- Profil sekolah ----------
$sekolah = $pdo->query('SELECT * FROM tbl_sekolah ORDER BY id LIMIT 1')->fetch();

include __DIR__ . '/../includes/header.php';
?>

<div class="stat-grid">
    <div class="stat-card">
        <div class="stat-icon blue">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </div>
        <div>
            <div class="stat-value"><?= $totalSiswa ?></div>
            <div class="stat-label">Total Siswa</div>
        </div>
    </div>
    <div class="stat-card">
        <div class="stat-icon green">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 18v3"/><circle cx="12" cy="9" r="2"/><path d="M9 13c.7-1 1.8-1.5 3-1.5s2.3.5 3 1.5"/></svg>
        </div>
        <div>
            <div class="stat-value"><?= $totalGuru ?></div>
            <div class="stat-label">Total Guru</div>
        </div>
    </div>
    <div class="stat-card">
        <div class="stat-icon orange">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
        </div>
        <div>
            <div class="stat-value"><?= $totalPelajaran ?></div>
            <div class="stat-label">Mata Pelajaran</div>
        </div>
    </div>
    <div class="stat-card">
        <div class="stat-icon cyan">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9 15l2 2 4-4"/></svg>
        </div>
        <div>
            <div class="stat-value"><?= $totalUjian ?></div>
            <div class="stat-label">Hasil Ujian</div>
        </div>
    </div>
</div>

<div class="grid-2">
    <div class="card">
        <div class="card-header"><span class="card-title">Statistik Siswa per Jurusan</span></div>
        <div class="card-body chart-box">
            <?php if ($perJurusan): ?>
            <canvas data-chart="bar"
                    data-labels='<?= e(json_encode(array_column($perJurusan, 'jurusan'))) ?>'
                    data-values='<?= e(json_encode(array_map('intval', array_column($perJurusan, 'jml')))) ?>'>
            </canvas>
            <?php else: ?>
                <p class="text-muted">Belum ada data siswa.</p>
            <?php endif; ?>
        </div>
    </div>

    <div class="card">
        <div class="card-header"><span class="card-title">Distribusi Hasil Ujian</span></div>
        <div class="card-body chart-box">
            <?php if ($totalUjian > 0): ?>
            <canvas data-chart="donut"
                    data-labels='["Lulus", "Tidak Lulus"]'
                    data-values='<?= json_encode([$lulus, $tidak]) ?>'
                    data-colors='["#16a34a", "#dc2626"]'>
            </canvas>
            <div class="chart-legend"></div>
            <?php else: ?>
                <p class="text-muted">Belum ada data hasil ujian.</p>
            <?php endif; ?>
        </div>
    </div>
</div>

<div class="grid-2">
    <div class="card">
        <div class="card-header">
            <span class="card-title">Aktivitas Terbaru</span>
            <a class="btn btn-sm btn-secondary" href="<?= BASE_URL ?>/pages/ujian/index.php">Lihat Semua</a>
        </div>
        <div class="card-body">
            <ul class="activity-list">
                <?php foreach ($recentUjian as $r): ?>
                <li>
                    <span class="activity-dot" style="background:<?= $r['hasil_ujian'] === 'LULUS' ? '#16a34a' : '#dc2626' ?>"></span>
                    <div class="activity-text">
                        <div><strong><?= e($r['nama_siswa'] ?? 'Siswa ' . $r['nis']) ?></strong> menyelesaikan ujian
                            <strong><?= e($r['no_ujian']) ?></strong>
                            — rata-rata <?= (int)$r['nilai_rata2'] ?>
                            <span class="badge <?= $r['hasil_ujian'] === 'LULUS' ? 'badge-success' : 'badge-danger' ?>"><?= e($r['hasil_ujian']) ?></span>
                        </div>
                        <div class="activity-meta"><?= tgl_id($r['tgl_ujian']) ?></div>
                    </div>
                </li>
                <?php endforeach; ?>
                <?php foreach (array_slice($recentSiswa, 0, max(0, 5 - count($recentUjian))) as $s): ?>
                <li>
                    <span class="activity-dot" style="background:#4f46e5"></span>
                    <div class="activity-text">
                        <div>Siswa baru terdaftar: <strong><?= e($s['nama']) ?></strong> (<?= e($s['nis']) ?>)</div>
                        <div class="activity-meta">Kelas <?= e($s['kelas']) ?> — <?= e($s['jurusan']) ?></div>
                    </div>
                </li>
                <?php endforeach; ?>
                <?php if (!$recentUjian && !$recentSiswa): ?>
                    <li><span class="text-muted">Belum ada aktivitas.</span></li>
                <?php endif; ?>
            </ul>
        </div>
    </div>

    <div class="card">
        <div class="card-header">
            <span class="card-title">Profil Sekolah</span>
            <a class="btn btn-sm btn-secondary" href="<?= BASE_URL ?>/pages/sekolah.php"><?= $sekolah ? 'Ubah' : 'Isi Profil' ?></a>
        </div>
        <div class="card-body">
            <?php if ($sekolah): ?>
            <?php if ($sekolah['gambar'] !== ''): ?>
                <img src="<?= foto_url($sekolah['gambar']) ?>" class="detail-photo" style="margin-bottom:16px" alt="Logo sekolah">
            <?php endif; ?>
            <dl class="detail-grid">
                <dt>Nama Sekolah</dt><dd><?= e($sekolah['nama']) ?></dd>
                <dt>Alamat</dt><dd><?= e($sekolah['alamat']) ?></dd>
                <dt>Akreditasi</dt><dd><span class="badge badge-info"><?= e($sekolah['akreditasi']) ?></span></dd>
                <dt>Status</dt><dd><?= e($sekolah['status']) ?></dd>
                <dt>Email</dt><dd><?= e($sekolah['email']) ?></dd>
                <dt>Visi &amp; Misi</dt><dd><?= nl2br(e($sekolah['visimisi'])) ?></dd>
            </dl>
            <?php else: ?>
                <p class="text-muted">Data profil sekolah belum diisi. <a href="<?= BASE_URL ?>/pages/sekolah.php">Isi sekarang</a>.</p>
            <?php endif; ?>
        </div>
    </div>
</div>

<?php include __DIR__ . '/../includes/footer.php'; ?>
