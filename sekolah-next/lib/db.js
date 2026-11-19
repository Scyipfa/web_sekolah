import postgres from 'postgres';
import bcrypt from 'bcryptjs';
import { SCHEMA_SQL } from './schema.mjs';

const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;

const g = globalThis;
const sql =
  g.__sekolahSql ??
  (g.__sekolahSql = postgres(url, {
    max: 5,
    idle_timeout: 20,
    prepare: false,
    onnotice: () => {},
    // Kolom DATE dikembalikan sebagai string 'YYYY-MM-DD'
    types: { date: { to: 1082, from: [1082], serialize: (x) => x, parse: (x) => x } },
  }));

async function init() {
  await sql.unsafe(SCHEMA_SQL);
  // Akun awal admin/admin123 bila belum ada user sama sekali
  const [{ n }] = await sql`SELECT COUNT(*)::int AS n FROM tbl_user`;
  if (n === 0) {
    const hash = await bcrypt.hash('admin123', 10);
    await sql`INSERT INTO tbl_user (username, password, nama, alamat, jabatan, foto)
              VALUES ('admin', ${hash}, 'Administrator', '', 'Administrator', '')
              ON CONFLICT (username) DO NOTHING`;
  }
  return sql;
}

export function db() {
  if (!g.__sekolahReady) {
    g.__sekolahReady = init().catch((e) => {
      g.__sekolahReady = null;
      throw e;
    });
  }
  return g.__sekolahReady;
}

export function whereAnd(conds) {
  if (!conds.length) return sql``;
  return sql`WHERE ${conds.reduce((a, c) => sql`${a} AND ${c}`)}`;
}

export { sql };
