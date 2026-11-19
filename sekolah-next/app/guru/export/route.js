import { db } from '@/lib/db';
import { xlsxResponse } from '@/lib/xlsx';
import { guruWhere } from '../query';

export async function GET(req) {
  const q = (req.nextUrl.searchParams.get('q') || '').trim();
  const sql = await db();
  const rows = await sql`SELECT nip, nama, telepon, agama, alamat FROM tbl_guru ${guruWhere(q)} ORDER BY nama`;
  return xlsxResponse('data_guru', ['NIP', 'Nama', 'Telepon', 'Agama', 'Alamat'], rows.map((r) => [r.nip, r.nama, r.telepon, r.agama, r.alamat]));
}
