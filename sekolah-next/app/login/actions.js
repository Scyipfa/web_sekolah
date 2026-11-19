'use server';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { createSession } from '@/lib/session';
import { str } from '@/lib/helpers';

export async function login(prev, formData) {
  const username = str(formData.get('username'));
  const password = formData.get('password') || '';
  if (!username || !password) return { error: 'Username dan password wajib diisi.', username };
  const sql = await db();
  const [user] = await sql`SELECT * FROM tbl_user WHERE username = ${username} LIMIT 1`;
  const ok = user && (await bcrypt.compare(password, user.password.replace(/^\$2y\$/, '$2b$')));
  if (!ok) return { error: 'Username atau password salah.', username };
  await createSession(user);
  redirect('/dashboard');
}
