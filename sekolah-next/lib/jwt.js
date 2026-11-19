import { SignJWT, jwtVerify } from 'jose';

function key() {
  const secret =
    process.env.SESSION_SECRET || process.env.DATABASE_URL || process.env.POSTGRES_URL || 'dev-only-secret-ganti-saat-produksi';
  return new TextEncoder().encode(secret);
}

export const SESSION_COOKIE = 'session';
export const SESSION_MAX_AGE = 8 * 60 * 60;

export async function signSession(user) {
  return new SignJWT({ id: user.id, username: user.username, nama: user.nama, jabatan: user.jabatan, foto: user.foto })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(key());
}

export async function verifySession(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key());
    return payload;
  } catch {
    return null;
  }
}
