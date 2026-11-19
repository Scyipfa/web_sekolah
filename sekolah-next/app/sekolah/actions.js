'use server';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { flash } from '@/lib/flash';
import { byteLen, str } from '@/lib/helpers';
import { requireLogin } from '@/lib/session';
import { uploadFoto } from '@/lib/upload';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function saveSekolah(prev, formData) {
  await requireLogin();
  const sql = await db();
  const [existing] = await sql`SELECT * FROM tbl_sekolah ORDER BY id LIMIT 1`;
  const d = {};
  for (const f of ['nama', 'alamat', 'akreditasi', 'status', 'email', 'visimisi']) d[f] = str(formData.get(f));
  const errors = [];
  if (!d.nama || byteLen(d.nama) > 128) errors.push('Nama sekolah wajib diisi (maks. 128 karakter).');
  if (byteLen(d.alamat) > 128) errors.push('Alamat maksimal 128 karakter.');
  if (byteLen(d.akreditasi) > 1) errors.push('Akreditasi cukup 1 karakter (mis. A, B, C).');
  if (byteLen(d.status) > 10) errors.push('Status maksimal 10 karakter (mis. Negeri).');
  if (d.email && (!EMAIL_RE.test(d.email) || byteLen(d.email) > 100)) errors.push('Format email tidak valid.');
  if (byteLen(d.visimisi) > 65535) errors.push('Visi & misi terlalu panjang.');
  if (errors.length) return { errors, values: d, n: Date.now() };
  const gambar = await uploadFoto(sql, formData.get('gambar'), existing?.gambar || '');
  if (existing) {
    await sql`UPDATE tbl_sekolah SET nama=${d.nama}, alamat=${d.alamat}, akreditasi=${d.akreditasi}, status=${d.status},
              email=${d.email}, visimisi=${d.visimisi}, gambar=${gambar} WHERE id=${existing.id}`;
  } else {
    await sql`INSERT INTO tbl_sekolah (nama, alamat, akreditasi, status, email, visimisi, gambar)
              VALUES (${d.nama}, ${d.alamat}, ${d.akreditasi}, ${d.status}, ${d.email}, ${d.visimisi}, ${gambar})`;
  }
  await flash('success', 'Profil sekolah berhasil disimpan.');
  redirect('/dashboard');
}
