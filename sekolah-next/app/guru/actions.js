'use server';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { flash } from '@/lib/flash';
import { byteLen, errMsg, str } from '@/lib/helpers';
import { requireLogin } from '@/lib/session';
import { deleteFile, uploadFoto } from '@/lib/upload';

export async function saveGuru(prev, formData) {
  await requireLogin();
  const sql = await db();
  const id = parseInt(formData.get('id'), 10) || 0;
  const edit = id > 0;
  const d = {
    nip: str(formData.get('nip')),
    nama: str(formData.get('nama')),
    alamat: str(formData.get('alamat')),
    telepon: str(formData.get('telepon')),
    agama: str(formData.get('agama')),
  };
  let old = null;
  if (edit) {
    [old] = await sql`SELECT * FROM tbl_guru WHERE id = ${id}`;
    if (!old) {
      await flash('danger', 'Data guru tidak ditemukan.');
      redirect('/guru');
    }
  }
  const errors = [];
  if (!d.nip || byteLen(d.nip) > 30) errors.push('NIP wajib diisi (maks. 30 karakter).');
  if (!d.nama || byteLen(d.nama) > 100) errors.push('Nama wajib diisi (maks. 100 karakter).');
  if (byteLen(d.telepon) > 20) errors.push('Telepon maksimal 20 karakter.');
  if (byteLen(d.agama) > 20) errors.push('Agama maksimal 20 karakter.');
  if (byteLen(d.alamat) > 128) errors.push('Alamat maksimal 128 karakter.');
  if (!errors.length) {
    const [{ n }] = await sql`SELECT COUNT(*)::int AS n FROM tbl_guru WHERE nip = ${d.nip} AND id <> ${id}`;
    if (n > 0) errors.push('NIP sudah digunakan guru lain.');
  }
  if (errors.length) return { errors, values: d, n: Date.now() };

  const foto = await uploadFoto(sql, formData.get('foto'), old?.foto || '');
  if (edit) {
    try {
      await sql.begin(async (tx) => {
        await tx`UPDATE tbl_guru SET nip=${d.nip}, nama=${d.nama}, alamat=${d.alamat}, telepon=${d.telepon}, agama=${d.agama}, foto=${foto} WHERE id=${id}`;
        // tbl_pelajaran.guru menyimpan nama — sinkronkan bila nama berubah
        if (old.nama && old.nama !== d.nama) await tx`UPDATE tbl_pelajaran SET guru=${d.nama} WHERE guru=${old.nama}`;
      });
      await flash('success', 'Data guru berhasil diperbarui.');
    } catch (e) {
      return { errors: ['Gagal memperbarui data: ' + errMsg(e)], values: d, n: Date.now() };
    }
  } else {
    await sql`INSERT INTO tbl_guru (nip, nama, alamat, telepon, agama, foto) VALUES (${d.nip}, ${d.nama}, ${d.alamat}, ${d.telepon}, ${d.agama}, ${foto})`;
    await flash('success', 'Guru baru berhasil ditambahkan.');
  }
  redirect('/guru');
}

export async function deleteGuru(formData) {
  await requireLogin();
  const sql = await db();
  const id = parseInt(formData.get('id'), 10) || 0;
  const [g] = await sql`SELECT * FROM tbl_guru WHERE id = ${id}`;
  if (!g) {
    await flash('danger', 'Data guru tidak ditemukan.');
    redirect('/guru');
  }
  const [{ n }] = await sql`SELECT COUNT(*)::int AS n FROM tbl_pelajaran WHERE guru = ${g.nama}`;
  await sql`DELETE FROM tbl_guru WHERE id = ${id}`;
  await deleteFile(sql, g.foto);
  await flash('success', `Data guru ${g.nama} berhasil dihapus.` + (n ? ` (${n} mata pelajaran masih menyimpan nama guru ini.)` : ''));
  redirect('/guru');
}
