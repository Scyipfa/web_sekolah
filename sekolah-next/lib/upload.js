import crypto from 'node:crypto';
import { flash } from './flash';

const MAX = 2 * 1024 * 1024;

function sniff(b) {
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return ['image/jpeg', 'jpg'];
  if (b.length >= 8 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return ['image/png', 'png'];
  if (b.length >= 6 && /^GIF8[79]a$/.test(b.subarray(0, 6).toString('latin1'))) return ['image/gif', 'gif'];
  if (b.length >= 12 && b.subarray(0, 4).toString('latin1') === 'RIFF' && b.subarray(8, 12).toString('latin1') === 'WEBP') return ['image/webp', 'webp'];
  return null;
}

// Simpan foto ke tabel tbl_file (Vercel tidak punya penyimpanan file permanen).
// Mengembalikan nama file baru, atau nama lama bila tidak ada upload / upload tidak valid.
export async function uploadFoto(sql, file, old = '') {
  if (!file || typeof file === 'string' || file.size === 0) return old;
  if (file.size > MAX) {
    await flash('danger', 'Ukuran foto maksimal 2 MB.');
    return old;
  }
  const buf = Buffer.from(await file.arrayBuffer());
  const type = sniff(buf);
  if (!type) {
    await flash('danger', 'Format foto harus JPG/PNG/GIF/WebP.');
    return old;
  }
  // 13 karakter hex + '.' + ext (<=4) = maks 18 karakter, muat di kolom varchar(20)
  const name = `${crypto.randomBytes(7).toString('hex').slice(0, 13)}.${type[1]}`;
  await sql`INSERT INTO tbl_file (name, mime, data) VALUES (${name}, ${type[0]}, ${buf})`;
  if (old && old !== name) await deleteFile(sql, old);
  return name;
}

export async function deleteFile(sql, name) {
  if (name) await sql`DELETE FROM tbl_file WHERE name = ${name}`;
}
