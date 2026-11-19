// Membuat tabel di PostgreSQL + akun awal admin/admin123 (bila belum ada user).
// Pemakaian: DATABASE_URL=... npm run db:setup
import postgres from 'postgres';
import bcrypt from 'bcryptjs';
import { SCHEMA_SQL } from '../lib/schema.mjs';

const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!url) {
  console.error('Set DATABASE_URL terlebih dahulu.');
  process.exit(1);
}
const sql = postgres(url, { onnotice: () => {} });
await sql.unsafe(SCHEMA_SQL);
const [{ n }] = await sql`SELECT COUNT(*)::int AS n FROM tbl_user`;
if (n === 0) {
  await sql`INSERT INTO tbl_user (username, password, nama, jabatan) VALUES ('admin', ${await bcrypt.hash('admin123', 10)}, 'Administrator', 'Administrator')`;
  console.log('Akun awal dibuat: admin / admin123 (segera ganti password).');
}
console.log('Database siap.');
await sql.end();
