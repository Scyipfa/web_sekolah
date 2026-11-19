import { db } from '@/lib/db';
import { xlsxResponse } from '@/lib/xlsx';
import { siswaWhere } from '../query';

export async function GET(req) {
  const p = req.nextUrl.searchParams;
  const f = { q: (p.get('q') || '').trim(), kelas: (p.get('kelas') || '').trim(), jurusan: (p.get('jurusan') || '').trim() };
  const sql = await db();
  const rows = await sql`SELECT nis, nama, kelas, jurusan, alamat FROM tbl_siswa ${siswaWhere(f)} ORDER BY nis`;
  return xlsxResponse('data_siswa', ['NIS', 'Nama', 'Kelas', 'Jurusan', 'Alamat'], rows.map((r) => [r.nis, r.nama, r.kelas, r.jurusan, r.alamat]));
}
