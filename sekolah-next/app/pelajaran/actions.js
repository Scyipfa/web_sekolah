'use server';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { flash } from '@/lib/flash';
import { byteLen, str } from '@/lib/helpers';
import { listJurusan } from '@/lib/lists';
import { requireLogin } from '@/lib/session';

export async function savePelajaran(prev, formData) {
  await requireLogin();
  const sql = await db();
  const id = parseInt(formData.get('id'), 10) || 0;
  const edit = id > 0;
  const d = { pelajaran: str(formData.get('pelajaran')), jurusan: str(formData.get('jurusan')), guru: str(formData.get('guru')) };
  if (edit) {
    const [old] = await sql`SELECT id FROM tbl_pelajaran WHERE id = ${id}`;
    if (!old) {
      await flash('danger', 'Data mata pelajaran tidak ditemukan.');
      redirect('/pelajaran');
    }
  }
  const jurusanList = await listJurusan(sql);
  const errors = [];
  if (!d.pelajaran || byteLen(d.pelajaran) > 50) errors.push('Nama pelajaran wajib diisi (maks. 50 karakter).');
  if (!d.jurusan || byteLen(d.jurusan) > 50) errors.push('Jurusan wajib diisi (maks. 50 karakter).');
  else if (!jurusanList.includes(d.jurusan)) errors.push('Jurusan tidak terdaftar — tambahkan dulu lewat menu Data Jurusan.');
  if (byteLen(d.guru) > 50) errors.push('Nama guru maksimal 50 karakter.');
  if (!errors.length) {
    const [{ n }] = await sql`SELECT COUNT(*)::int AS n FROM tbl_pelajaran WHERE pelajaran = ${d.pelajaran} AND jurusan = ${d.jurusan} AND id <> ${id}`;
    if (n > 0) errors.push('Kombinasi pelajaran & jurusan ini sudah ada.');
  }
  if (errors.length) return { errors, values: d, n: Date.now() };
  if (edit) {
    await sql`UPDATE tbl_pelajaran SET pelajaran=${d.pelajaran}, jurusan=${d.jurusan}, guru=${d.guru} WHERE id=${id}`;
    await flash('success', 'Mata pelajaran berhasil diperbarui.');
  } else {
    await sql`INSERT INTO tbl_pelajaran (pelajaran, jurusan, guru) VALUES (${d.pelajaran}, ${d.jurusan}, ${d.guru})`;
    await flash('success', 'Mata pelajaran baru berhasil ditambahkan.');
  }
  redirect('/pelajaran');
}

export async function deletePelajaran(formData) {
  await requireLogin();
  const sql = await db();
  const id = parseInt(formData.get('id'), 10) || 0;
  const [p] = await sql`SELECT * FROM tbl_pelajaran WHERE id = ${id}`;
  if (!p) {
    await flash('danger', 'Data mata pelajaran tidak ditemukan.');
    redirect('/pelajaran');
  }
  await sql`DELETE FROM tbl_pelajaran WHERE id = ${id}`;
  await flash('success', `Mata pelajaran ${p.pelajaran} berhasil dihapus.`);
  redirect('/pelajaran');
}
