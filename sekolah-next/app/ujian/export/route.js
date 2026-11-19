import { db } from '@/lib/db';
import { xlsxResponse } from '@/lib/xlsx';
import { UJIAN_JOIN, ujianWhere } from '../query';

export async function GET(req) {
  const p = req.nextUrl.searchParams;
  const f = { q: (p.get('q') || '').trim(), hasil: (p.get('hasil') || '').trim(), jurusan: (p.get('jurusan') || '').trim() };
  const sql = await db();
  const rows = await sql`SELECT u.*, COALESCE(s.nama, '') AS nama_siswa ${UJIAN_JOIN} ${ujianWhere(f)} ORDER BY u.tgl_ujian DESC, u.no_ujian DESC`;
  return xlsxResponse(
    'hasil_ujian',
    ['No Ujian', 'Tanggal', 'NIS', 'Nama Siswa', 'Jurusan', 'Total', 'Terendah', 'Tertinggi', 'Rata-rata', 'Hasil'],
    rows.map((r) => [r.no_ujian, r.tgl_ujian, r.nis, r.nama_siswa, r.jurusan, r.total_nilai, r.nilai_terendah, r.nilai_tertinggi, r.nilai_rata2, r.hasil_ujian]),
  );
}
