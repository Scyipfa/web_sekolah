'use server';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { flash } from '@/lib/flash';
import { byteLen, str } from '@/lib/helpers';
import { createSession, requireLogin } from '@/lib/session';
import { uploadFoto } from '@/lib/upload';

async function loadUser() {
  const me = await requireLogin();
  const sql = await db();
  const [user] = await sql`SELECT * FROM tbl_user WHERE id = ${me.id}`;
  if (!user) redirect('/logout');
  return [sql, user];
}

export async function saveProfile(prev, formData) {
  const [sql, user] = await loadUser();
  const d = {
    username: str(formData.get('username')),
    nama: str(formData.get('nama')),
    alamat: str(formData.get('alamat')),
    jabatan: str(formData.get('jabatan')),
  };
  const errors = [];
  if (!d.username || byteLen(d.username) > 50) errors.push('Username wajib diisi (maks. 50 karakter).');
  if (!d.nama || byteLen(d.nama) > 128) errors.push('Nama wajib diisi (maks. 128 karakter).');
  if (byteLen(d.alamat) > 128) errors.push('Alamat maksimal 128 karakter.');
  if (byteLen(d.jabatan) > 128) errors.push('Jabatan maksimal 128 karakter.');
  if (!errors.length) {
    const [{ n }] = await sql`SELECT COUNT(*)::int AS n FROM tbl_user WHERE username = ${d.username} AND id <> ${user.id}`;
    if (n > 0) errors.push('Username sudah digunakan akun lain.');
  }
  if (errors.length) return { errors, values: d, n: Date.now() };
  const foto = await uploadFoto(sql, formData.get('foto'), user.foto);
  await sql`UPDATE tbl_user SET username=${d.username}, nama=${d.nama}, alamat=${d.alamat}, jabatan=${d.jabatan}, foto=${foto} WHERE id=${user.id}`;
  await createSession({ ...user, ...d, foto });
  await flash('success', 'Profil berhasil diperbarui.');
  redirect('/profile');
}

export async function changePassword(prev, formData) {
  const [sql, user] = await loadUser();
  const old = formData.get('old_password') || '';
  const nw = formData.get('new_password') || '';
  const cfm = formData.get('confirm_password') || '';
  let error = '';
  if (!(await bcrypt.compare(old, user.password.replace(/^\$2y\$/, '$2b$')))) error = 'Password lama salah.';
  else if (nw.length < 6) error = 'Password baru minimal 6 karakter.';
  else if (nw !== cfm) error = 'Konfirmasi password baru tidak cocok.';
  if (error) return { errors: [error], n: Date.now() };
  const hash = await bcrypt.hash(nw, 10);
  await sql`UPDATE tbl_user SET password = ${hash} WHERE id = ${user.id}`;
  await flash('success', 'Password berhasil diubah.');
  redirect('/profile');
}
