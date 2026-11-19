import { db } from '@/lib/db';
import { xlsxResponse } from '@/lib/xlsx';
import { pelajaranWhere } from '../query';

export async function GET(req) {
  const p = req.nextUrl.searchParams;
  const f = { q: (p.get('q') || '').trim(), jurusan: (p.get('jurusan') || '').trim() };
  const sql = await db();
  const rows = await sql`SELECT pelajaran, jurusan, guru FROM tbl_pelajaran ${pelajaranWhere(f)} ORDER BY pelajaran`;
  return xlsxResponse('data_pelajaran', ['Mata Pelajaran', 'Jurusan', 'Guru Pengampu'], rows.map((r) => [r.pelajaran, r.jurusan, r.guru]));
}
