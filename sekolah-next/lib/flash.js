import { cookies } from 'next/headers';

const NAME = 'flash';

export async function flash(type, msg) {
  const c = await cookies();
  const list = parse(c.get(NAME)?.value);
  list.push({ type, msg });
  c.set(NAME, encodeURIComponent(JSON.stringify(list)), { path: '/', maxAge: 60, sameSite: 'lax' });
}

export async function readFlash() {
  return parse((await cookies()).get(NAME)?.value);
}

function parse(v) {
  if (!v) return [];
  try {
    const arr = JSON.parse(decodeURIComponent(v));
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}
