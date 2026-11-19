'use server';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { flash } from '@/lib/flash';
import { byteLen, errMsg, str } from '@/lib/helpers';
import { listJurusan } from '@/lib/lists';
import { requireLogin } from '@/lib/session';

async function mustExist(sql, j) {
  if (!j || !(await listJurusan(sql)).includes(j)) {
    await flash('danger', 'Jurusan tidak ditemukan.');
    redirect('/jurusan');
  }
}

export async function saveJurusan(prev, formData) {
  await requireLogin();
  const sql = await db();
  const old = str(formData.get('old'));
  const edit = old !== '';
  if (edit) await mustExist(sql, old);
  const nama = str(formData.get('jurusan'));
  const errors = [];
  if (!nama || byteLen(nama) > 50) errors.push('Nama jurusan wajib diisi (maks. 50 karakter).');
  else if (!edit || nama.toLowerCase() !== old.toLowerCase()) {
    if ((await listJurusan(sql)).includes(nama)) errors.push('Jurusan sudah ada.');
  }
  if (errors.length) return { errors, value: nama, n: Date.now() };
  try {
    if (edit) {
      await sql.begin(async (tx) => {
        await tx`UPDATE tbl_jurusan SET jurusan = ${nama} WHERE jurusan = ${old}`;
        await tx`INSERT INTO tbl_jurusan (jurusan) VALUES (${nama}) ON CONFLICT (jurusan) DO NOTHING`;
        await tx`UPDATE tbl_siswa SET jurusan = ${nama} WHERE jurusan = ${old}`;
        await tx`UPDATE tbl_pelajaran SET jurusan = ${nama} WHERE jurusan = ${old}`;
        await tx`UPDATE tbl_ujian SET jurusan = ${nama} WHERE jurusan = ${old}`;
      });
      await flash('success', `Jurusan "${old}" berhasil diubah menjadi "${nama}".`);
    } else {
      await sql`INSERT INTO tbl_jurusan (jurusan) VALUES (${nama})`;
      await flash('success', `Jurusan "${nama}" berhasil ditambahkan.`);
    }
  } catch (e) {
    return { errors: ['Gagal menyimpan: ' + errMsg(e)], value: nama, n: Date.now() };
  }
  redirect('/jurusan');
}

export async function deleteJurusan(formData) {
  await requireLogin();
  const sql = await db();
  const j = str(formData.get('j'));
  await mustExist(sql, j);
  try {
    const [s, m] = await sql.begin(async (tx) => {
      await tx`DELETE FROM tbl_jurusan WHERE jurusan = ${j}`;
      const s = await tx`UPDATE tbl_siswa SET jurusan = '' WHERE jurusan = ${j}`;
      const m = await tx`UPDATE tbl_pelajaran SET jurusan = '' WHERE jurusan = ${j}`;
      return [s.count, m.count];
    });
    await flash('success', `Jurusan "${j}" dihapus. ${s} siswa dan ${m} mapel kini tanpa jurusan (data tidak dihapus).`);
  } catch (e) {
    await flash('danger', 'Gagal menghapus: ' + errMsg(e));
  }
  redirect('/jurusan');
}

export async function memberAction(formData) {
  await requireLogin();
  const sql = await db();
  const j = str(formData.get('j'));
  await mustExist(sql, j);
  const action = str(formData.get('action'));
  if (action === 'add_siswa') {
    const r = await sql`UPDATE tbl_siswa SET jurusan = ${j} WHERE nis = ${str(formData.get('nis'))}`;
    await flash(r.count ? 'success' : 'warning', r.count ? 'Siswa ditambahkan ke jurusan.' : 'Siswa tidak ditemukan.');
  } else if (action === 'del_siswa') {
    await sql`UPDATE tbl_siswa SET jurusan = '' WHERE nis = ${str(formData.get('nis'))} AND jurusan = ${j}`;
    await flash('success', 'Siswa dikeluarkan dari jurusan.');
  } else if (action === 'add_mapel') {
    const r = await sql`UPDATE tbl_pelajaran SET jurusan = ${j} WHERE id = ${parseInt(formData.get('id'), 10) || 0}`;
    await flash(r.count ? 'success' : 'warning', r.count ? 'Mata pelajaran ditambahkan ke jurusan.' : 'Pelajaran tidak ditemukan.');
  } else if (action === 'del_mapel') {
    await sql`UPDATE tbl_pelajaran SET jurusan = '' WHERE id = ${parseInt(formData.get('id'), 10) || 0} AND jurusan = ${j}`;
    await flash('success', 'Mata pelajaran dikeluarkan dari jurusan.');
  }
  redirect(`/jurusan/detail?j=${encodeURIComponent(j)}`);
}
