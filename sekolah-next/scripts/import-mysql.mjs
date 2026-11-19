// Memindahkan seluruh data dari MySQL XAMPP (db_sekolah) ke PostgreSQL (Neon).
// Jalankan di komputer yang MySQL XAMPP-nya menyala:
//   DATABASE_URL=postgresql://... npm run import-mysql
// Opsional: MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE, UPLOADS_DIR
// PERINGATAN: data di PostgreSQL untuk tabel yang sama akan ditimpa.
import fs from 'node:fs';
import path from 'node:path';
import mysql from 'mysql2/promise';
import postgres from 'postgres';
import { SCHEMA_SQL } from '../lib/schema.mjs';

const pgUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!pgUrl) {
  console.error('Set DATABASE_URL (connection string PostgreSQL/Neon) terlebih dahulu.');
  process.exit(1);
}
const uploadsDir = process.env.UPLOADS_DIR || path.resolve('..', 'web_sekolah', 'uploads');

const my = await mysql.createConnection({
  host: process.env.MYSQL_HOST || '127.0.0.1',
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'db_sekolah',
  dateStrings: true,
});
const pg = postgres(pgUrl, { onnotice: () => {} });

const TABLES = {
  tbl_user: ['id', 'username', 'password', 'nama', 'alamat', 'jabatan', 'foto'],
  tbl_sekolah: ['id', 'nama', 'alamat', 'akreditasi', 'status', 'email', 'visimisi', 'gambar'],
  tbl_jurusan: ['id', 'jurusan'],
  tbl_siswa: ['nis', 'nama', 'alamat', 'kelas', 'jurusan', 'foto'],
  tbl_guru: ['id', 'nip', 'nama', 'alamat', 'telepon', 'agama', 'foto'],
  tbl_pelajaran: ['id', 'pelajaran', 'jurusan', 'guru'],
  tbl_ujian: ['no_ujian', 'tgl_ujian', 'nis', 'jurusan', 'total_nilai', 'nilai_terendah', 'nilai_tertinggi', 'nilai_rata2', 'hasil_ujian'],
  tbl_nilai_ujian: ['id', 'no_ujian', 'pelajaran', 'nilai_ujian'],
};
const SERIAL = ['tbl_user', 'tbl_sekolah', 'tbl_jurusan', 'tbl_guru', 'tbl_pelajaran', 'tbl_nilai_ujian'];
const MIME = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp' };

const [existing] = await my.query('SHOW TABLES');
const have = new Set(existing.map((r) => Object.values(r)[0]));

await pg.unsafe(SCHEMA_SQL);
const fotos = new Set();
await pg.begin(async (tx) => {
  for (const [table, cols] of Object.entries(TABLES)) {
    if (!have.has(table)) {
      console.log(`- ${table}: tidak ada di MySQL, dilewati`);
      continue;
    }
    const [myCols] = await my.query(`SHOW COLUMNS FROM \`${table}\``);
    const present = cols.filter((c) => myCols.some((m) => m.Field === c));
    const [rows] = await my.query(`SELECT ${present.map((c) => '`' + c + '`').join(', ')} FROM \`${table}\``);
    await tx.unsafe(`TRUNCATE ${table}`);
    const clean = rows.map((r) => {
      const o = {};
      for (const c of present) o[c] = r[c] ?? (typeof r[c] === 'number' ? 0 : '');
      if (o.tgl_ujian === '0000-00-00') o.tgl_ujian = '1970-01-01';
      for (const f of ['foto', 'gambar']) if (o[f]) fotos.add(o[f]);
      return o;
    });
    for (let i = 0; i < clean.length; i += 500) await tx`INSERT INTO ${tx(table)} ${tx(clean.slice(i, i + 500), present)}`;
    if (SERIAL.includes(table)) {
      await tx.unsafe(`SELECT setval(pg_get_serial_sequence('${table}', 'id'), COALESCE((SELECT MAX(id) FROM ${table}), 0) + 1, false)`);
    }
    console.log(`- ${table}: ${clean.length} baris`);
  }
  // Jurusan yang dipakai data tapi belum terdaftar di tbl_jurusan
  await tx`INSERT INTO tbl_jurusan (jurusan)
           SELECT DISTINCT jurusan FROM (SELECT jurusan FROM tbl_siswa UNION SELECT jurusan FROM tbl_pelajaran) x
           WHERE jurusan <> '' ON CONFLICT (jurusan) DO NOTHING`;

  let ok = 0;
  for (const name of fotos) {
    const file = path.join(uploadsDir, path.basename(name));
    const mime = MIME[path.extname(name).slice(1).toLowerCase()];
    if (!mime || !fs.existsSync(file)) continue;
    await tx`INSERT INTO tbl_file (name, mime, data) VALUES (${name}, ${mime}, ${fs.readFileSync(file)})
             ON CONFLICT (name) DO UPDATE SET mime = EXCLUDED.mime, data = EXCLUDED.data`;
    ok++;
  }
  console.log(`- foto: ${ok} dari ${fotos.size} file dipindahkan dari ${uploadsDir}`);
});

await my.end();
await pg.end();
console.log('Selesai.');
