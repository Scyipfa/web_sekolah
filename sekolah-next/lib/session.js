import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE, SESSION_MAX_AGE, signSession, verifySession } from './jwt';

export async function createSession(user) {
  const token = await signSession(user);
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
}

export async function currentUser() {
  return verifySession((await cookies()).get(SESSION_COOKIE)?.value);
}

export async function requireLogin() {
  const user = await currentUser();
  if (!user) redirect('/login');
  return user;
}

export async function destroySession() {
  (await cookies()).delete(SESSION_COOKIE);
}
