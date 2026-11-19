<?php
require_once __DIR__ . '/../../includes/auth.php';
require_once __DIR__ . '/../../includes/functions.php';
require_login();

$pdo = db();
$noUjian = trim($_GET['id'] ?? '');
$edit = $noUjian !== '';
$page_title = $edit ? 'Edit Hasil Ujian' : 'Tambah Hasil Ujian';

$master = ['no_ujian' => '', 'tgl_ujian' => date('Y-m-d'), 'nis' => '', 'jurusan' => ''];
$nilaiRows = [['pelajaran' => '', 'nilai_ujian' => '']];
$errors = [];

if ($edit) {
    $stmt = $pdo->prepare('SELECT * FROM tbl_ujian WHERE no_ujian = ?');
    $stmt->execute([$noUjian]);
    $master = $stmt->fetch();
    if (!$master) {
        flash_set('danger', 'Data hasil ujian tidak ditemukan.');
        redirect('index.php');
    }
    $stmt = $pdo->prepare('SELECT pelajaran, nilai_ujian FROM tbl_nilai_ujian WHERE no_ujian = ? ORDER BY id');
    $stmt->execute([$noUjian]);
    $nilaiRows = $stmt->fetchAll() ?: $nilaiRows;
}

// Data pendukung form
$listSiswa = $pdo->query('SELECT nis, nama, kelas, jurusan FROM tbl_siswa ORDER BY nama')->fetchAll();
$mapPelajaran = $pdo->query('SELECT jurusan, pelajaran FROM tbl_pelajaran ORDER BY pelajaran')->fetchAll();
$pelajaranPerJurusan = [];
foreach ($mapPelajaran as $mp) {
    $pelajaranPerJurusan[$mp['jurusan']][] = $mp['pelajaran'];
}
// Semua pelajaran sebagai fallback
$semuaPelajaran = array_values(array_unique(array_column($mapPelajaran, 'pelajaran')));

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();

    $master['nis']       = trim($_POST['nis'] ?? '');
    $master['tgl_ujian'] = trim($_POST['tgl_ujian'] ?? '');
    $postPelajaran       = $_POST['pelajaran'] ?? [];
    $postNilai           = $_POST['nilai'] ?? [];

    // Ambil jurusan dari data siswa (jangan percaya POST)
    $stmt = $pdo->prepare('SELECT jurusan FROM tbl_siswa WHERE nis = ?');
    $stmt->execute([$master['nis']]);
    $jurusanSiswa = $stmt->fetchColumn();
    if ($jurusanSiswa === false) {
        $errors[] = 'Siswa tidak ditemukan.';
    } else {
        $master['jurusan'] = $jurusanSiswa;
    }

    if (strtotime($master['tgl_ujian']) === false) {
        $errors[] = 'Tanggal ujian tidak valid.';
    }

    // ---------- Validasi baris nilai ----------
    $nilaiRows = [];
    $seen = [];
    $count = max(count($postPelajaran), count($postNilai));
    for ($i = 0; $i < $count; $i++) {
        $pl = trim((string)($postPelajaran[$i] ?? ''));
        $nl = trim((string)($postNilai[$i] ?? ''));
        if ($pl === '' && $nl === '') continue; // baris kosong diabaikan
        if ($pl === '' || strlen($pl) > 100) {
            $errors[] = "Baris " . ($i + 1) . ": nama pelajaran wajib diisi (maks. 100 karakter).";
            continue;
        }
        if (!is_numeric($nl) || (int)$nl < 0 || (int)$nl > 100) {
            $errors[] = "Baris " . ($i + 1) . ": nilai harus angka 0–100.";
            continue;
        }
        if (isset($seen[$pl])) {
            $errors[] = "Pelajaran \"$pl\" tercatat lebih dari sekali.";
            continue;
        }
        $seen[$pl] = true;
        $nilaiRows[] = ['pelajaran' => $pl, 'nilai_ujian' => (int)$nl];
    }
    if (!$nilaiRows && !$errors) {
        $errors[] = 'Minimal satu mata pelajaran dengan nilai harus diisi.';
    }

    if (!$errors) {
        $nilaiArr = array_column($nilaiRows, 'nilai_ujian');
        $total = array_sum($nilaiArr);
        $min   = min($nilaiArr);
        $max   = max($nilaiArr);
        $rata  = (int)round($total / count($nilaiArr));
        $hasil = $rata >= NILAI_LULUS ? 'LULUS' : 'TIDAK';

        $pdo->beginTransaction();
        try {
            if ($edit) {
                $stmt = $pdo->prepare(
                    'UPDATE tbl_ujian SET tgl_ujian=?, nis=?, jurusan=?, total_nilai=?, nilai_terendah=?, nilai_tertinggi=?, nilai_rata2=?, hasil_ujian=?
                     WHERE no_ujian=?'
                );
                $stmt->execute([$master['tgl_ujian'], $master['nis'], $master['jurusan'], $total, $min, $max, $rata, $hasil, $noUjian]);
                $pdo->prepare('DELETE FROM tbl_nilai_ujian WHERE no_ujian = ?')->execute([$noUjian]);
                $target = $noUjian;
            } else {
                $target = next_no_ujian($pdo);
                $stmt = $pdo->prepare(
                    'INSERT INTO tbl_ujian (no_ujian, tgl_ujian, nis, jurusan, total_nilai, nilai_terendah, nilai_tertinggi, nilai_rata2, hasil_ujian)
                     VALUES (?,?,?,?,?,?,?,?,?)'
                );
                $stmt->execute([$target, $master['tgl_ujian'], $master['nis'], $master['jurusan'], $total, $min, $max, $rata, $hasil]);
            }
            $ins = $pdo->prepare('INSERT INTO tbl_nilai_ujian (no_ujian, pelajaran, nilai_ujian) VALUES (?,?,?)');
            foreach ($nilaiRows as $row) {
                $ins->execute([$target, $row['pelajaran'], $row['nilai_ujian']]);
            }
            $pdo->commit();
            flash_set('success', 'Hasil ujian ' . $target . ' berhasil ' . ($edit ? 'diperbarui' : 'ditambahkan')
                . " — Total: $total, Rata-rata: $rata ($hasil).");
            redirect('detail.php?id=' . urlencode($target));
        } catch (Throwable $e) {
            $pdo->rollBack();
            $errors[] = 'Gagal menyimpan: ' . $e->getMessage();
        }
    }
}

include __DIR__ . '/../../includes/header.php';
?>

<div class="card" style="max-width:860px">
    <div class="card-header"><span class="card-title"><?= e($page_title) ?></span></div>
    <div class="card-body">
        <?php foreach ($errors as $err): ?>
            <div class="alert alert-danger"><?= e($err) ?></div>
        <?php endforeach; ?>

        <form method="post" id="ujianForm">
            <?= csrf_field() ?>
            <div class="form-row">
                <div class="form-group">
                    <label>No Ujian</label>
                    <input type="text" value="<?= e($edit ? $noUjian : '(otomatis)') ?>" disabled>
                    <div class="form-hint">Nomor dibuat otomatis oleh sistem.</div>
                </div>
                <div class="form-group">
                    <label for="tgl_ujian">Tanggal Ujian</label>
                    <input type="date" id="tgl_ujian" name="tgl_ujian" required value="<?= e($master['tgl_ujian']) ?>">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="nis">Siswa</label>
                    <select id="nis" name="nis" required>
                        <option value="">— Pilih Siswa —</option>
                        <?php foreach ($listSiswa as $s): ?>
                            <option value="<?= e($s['nis']) ?>" data-jurusan="<?= e($s['jurusan']) ?>"
                                <?= $s['nis'] === $master['nis'] ? 'selected' : '' ?>>
                                <?= e($s['nis']) ?> — <?= e($s['nama']) ?> (<?= e($s['kelas']) ?>)
                            </option>
                        <?php endforeach; ?>
                    </select>
                    <?php if (!$listSiswa): ?>
                        <div class="form-hint">Belum ada data siswa. <a href="<?= BASE_URL ?>/pages/siswa/form.php">Tambah siswa</a> terlebih dahulu.</div>
                    <?php endif; ?>
                </div>
                <div class="form-group">
                    <label for="jurusanDisplay">Jurusan</label>
                    <input type="text" id="jurusanDisplay" value="<?= e($master['jurusan']) ?>" disabled>
                    <div class="form-hint">Otomatis mengikuti jurusan siswa.</div>
                </div>
            </div>

            <div class="form-group">
                <label>Nilai per Mata Pelajaran <span class="text-muted">(0–100)</span></label>
                <div class="table-wrap">
                    <table class="data-table">
                        <thead>
                            <tr><th style="width:60%">Mata Pelajaran</th><th>Nilai</th><th style="width:50px"></th></tr>
                        </thead>
                        <tbody id="nilaiRows">
                            <?php foreach ($nilaiRows as $row): ?>
                            <tr>
                                <td>
                                    <input type="text" name="pelajaran[]" maxlength="100" list="pelajaranList"
                                           value="<?= e($row['pelajaran']) ?>" placeholder="Nama pelajaran" required>
                                </td>
                                <td>
                                    <input type="number" name="nilai[]" min="0" max="100" step="1"
                                           value="<?= e((string)$row['nilai_ujian']) ?>" placeholder="0–100" required>
                                </td>
                                <td>
                                    <button type="button" class="btn btn-danger btn-sm remove-nilai" title="Hapus baris">&times;</button>
                                </td>
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
                <datalist id="pelajaranList"></datalist>
                <button type="button" class="btn btn-secondary btn-sm" id="addNilaiRow" style="margin-top:10px">+ Tambah Pelajaran</button>
                <div class="form-hint">Agregat (total, terendah, tertinggi, rata-rata, hasil) dihitung otomatis saat disimpan.</div>
            </div>

            <div class="form-actions">
                <button type="submit" class="btn btn-primary">Simpan &amp; Hitung Hasil</button>
                <a href="index.php" class="btn btn-secondary">Batal</a>
            </div>
        </form>
    </div>
</div>

<template id="nilaiRowTpl">
    <tr>
        <td><input type="text" name="pelajaran[]" maxlength="100" list="pelajaranList" placeholder="Nama pelajaran" required></td>
        <td><input type="number" name="nilai[]" min="0" max="100" step="1" placeholder="0–100" required></td>
        <td><button type="button" class="btn btn-danger btn-sm remove-nilai" title="Hapus baris">&times;</button></td>
    </tr>
</template>

<script>
window.UJIAN = {
    pelajaranPerJurusan: <?= json_encode($pelajaranPerJurusan, JSON_UNESCAPED_UNICODE) ?>,
    semuaPelajaran: <?= json_encode($semuaPelajaran, JSON_UNESCAPED_UNICODE) ?>
};
</script>

<?php include __DIR__ . '/../../includes/footer.php'; ?>
