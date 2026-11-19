import { db } from '@/lib/db';
import { xlsxResponse } from '@/lib/xlsx';
import { jurusanSelect, jurusanWhere } from '../query';

export async function GET(req) {
  const q = (req.nextUrl.searchParams.get('q') || '').trim();
  const sql = await db();
  const rows = await jurusanSelect(jurusanWhere(q));
  return xlsxResponse('data_jurusan', ['Jurusan', 'Jumlah Siswa', 'Jumlah Mapel'], rows.map((r) => [r.jurusan, r.jml_siswa, r.jml_mapel]));
}
