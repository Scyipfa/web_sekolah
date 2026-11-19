'use server';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { flash } from '@/lib/flash';
import { byteLen, errMsg, NILAI_LULUS, str } from '@/lib/helpers';
import { requireLogin } from '@/lib/session';
import { hitungNilai } from './query';

async function nextNoUjian(tx) {
  const [{ m }] = await tx`SELECT MAX(no_ujian) AS m FROM tbl_ujian`;
  const num = m ? (parseInt(m.slice(1), 10) || 0) + 1 : 1;
  return 'U' + String(num).padStart(6, '0');
}

export async function saveUjian(prev, formData) {
  await requireLogin();
  const sql = await db();
  const noUjian = str(formData.get('no_ujian'));
  const edit = noUjian !== '';
  if (edit) {
    const [u] = await sql`SELECT no_ujian FROM tbl_ujian WHERE no_ujian = ${noUjian}`;
    if (!u) {
      await flash('danger', 'Data hasil ujian tidak ditemukan.');
      redirect('/ujian');
    }
  }
  const master = { nis: str(formData.get('nis')), tgl_ujian: str(formData.get('tgl_ujian')), jurusan: '' };
  const pel = formData.getAll('pelajaran').map(str);
  const nil = formData.getAll('nilai').map(str);
  const errors = [];

  const [siswa] = await sql`SELECT jurusan FROM tbl_siswa WHERE nis = ${master.nis}`;
  if (!siswa) errors.push('Siswa tidak ditemukan.');
  else master.jurusan = siswa.jurusan;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(master.tgl_ujian) || isNaN(Date.parse(master.tgl_ujian))) errors.push('Tanggal ujian tidak valid.');

  const rows = [];
  const raw = [];
  const seen = new Set();
  for (let i = 0; i < Math.max(pel.length, nil.length); i++) {
    const pl = pel[i] ?? '';
    const nl = nil[i] ?? '';
    if (pl === '' && nl === '') continue;
    raw.push({ pelajaran: pl, nilai_ujian: nl });
    if (pl === '' || byteLen(pl) > 100) {
      errors.push(`Baris ${i + 1}: nama pelajaran wajib diisi (maks. 100 karakter).`);
      continue;
    }
    const v = Number(nl);
    if (nl === '' || !Number.isFinite(v) || Math.trunc(v) < 0 || Math.trunc(v) > 100) {
      errors.push(`Baris ${i + 1}: nilai harus angka 0–100.`);
      continue;
    }
    if (seen.has(pl)) {
      errors.push(`Pelajaran "${pl}" tercatat lebih dari sekali.`);
      continue;
    }
    seen.add(pl);
    rows.push({ pelajaran: pl, nilai_ujian: Math.trunc(v) });
  }
  if (!rows.length && !errors.length) errors.push('Minimal satu mata pelajaran dengan nilai harus diisi.');
  const values = { ...master, rows: raw.length ? raw : [{ pelajaran: '', nilai_ujian: '' }] };
  if (errors.length) return { errors, values, n: Date.now() };

  const h = hitungNilai(rows.map((r) => r.nilai_ujian), NILAI_LULUS);
  let target;
  try {
    target = await sql.begin(async (tx) => {
      let t = noUjian;
      if (edit) {
        await tx`UPDATE tbl_ujian SET tgl_ujian=${master.tgl_ujian}, nis=${master.nis}, jurusan=${master.jurusan},
                 total_nilai=${h.total}, nilai_terendah=${h.min}, nilai_tertinggi=${h.max}, nilai_rata2=${h.rata}, hasil_ujian=${h.hasil}
                 WHERE no_ujian=${noUjian}`;
        await tx`DELETE FROM tbl_nilai_ujian WHERE no_ujian = ${noUjian}`;
      } else {
        await tx`LOCK TABLE tbl_ujian IN SHARE ROW EXCLUSIVE MODE`;
        t = await nextNoUjian(tx);
        await tx`INSERT INTO tbl_ujian (no_ujian, tgl_ujian, nis, jurusan, total_nilai, nilai_terendah, nilai_tertinggi, nilai_rata2, hasil_ujian)
                 VALUES (${t}, ${master.tgl_ujian}, ${master.nis}, ${master.jurusan}, ${h.total}, ${h.min}, ${h.max}, ${h.rata}, ${h.hasil})`;
      }
      for (const r of rows) {
        await tx`INSERT INTO tbl_nilai_ujian (no_ujian, pelajaran, nilai_ujian) VALUES (${t}, ${r.pelajaran}, ${r.nilai_ujian})`;
      }
      return t;
    });
  } catch (e) {
    return { errors: ['Gagal menyimpan: ' + errMsg(e)], values, n: Date.now() };
  }
  await flash('success', `Hasil ujian ${target} berhasil ${edit ? 'diperbarui' : 'ditambahkan'} — Total: ${h.total}, Rata-rata: ${h.rata} (${h.hasil}).`);
  redirect(`/ujian/detail?id=${encodeURIComponent(target)}`);
}

export async function deleteUjian(formData) {
  await requireLogin();
  const sql = await db();
  const id = str(formData.get('id'));
  const [u] = await sql`SELECT no_ujian FROM tbl_ujian WHERE no_ujian = ${id}`;
  if (!u) {
    await flash('danger', 'Data hasil ujian tidak ditemukan.');
    redirect('/ujian');
  }
  try {
    await sql.begin(async (tx) => {
      await tx`DELETE FROM tbl_nilai_ujian WHERE no_ujian = ${id}`;
      await tx`DELETE FROM tbl_ujian WHERE no_ujian = ${id}`;
    });
    await flash('success', `Hasil ujian ${id} beserta rincian nilainya berhasil dihapus.`);
  } catch (e) {
    await flash('danger', 'Gagal menghapus: ' + errMsg(e));
  }
  redirect('/ujian');
}
