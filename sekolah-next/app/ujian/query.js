import { sql, whereAnd } from '@/lib/db';

export const UJIAN_JOIN = sql`FROM tbl_ujian u LEFT JOIN tbl_siswa s ON s.nis = u.nis`;

export function ujianWhere({ q, hasil, jurusan }) {
  const conds = [];
  if (q) {
    const like = '%' + q + '%';
    conds.push(sql`(u.no_ujian ILIKE ${like} OR u.nis ILIKE ${like} OR s.nama ILIKE ${like})`);
  }
  if (hasil) conds.push(sql`u.hasil_ujian = ${hasil}`);
  if (jurusan) conds.push(sql`u.jurusan = ${jurusan}`);
  return whereAnd(conds);
}

export function hitungNilai(nilaiArr, lulus) {
  const total = nilaiArr.reduce((a, b) => a + b, 0);
  const rata = Math.round(total / nilaiArr.length);
  return {
    total,
    min: Math.min(...nilaiArr),
    max: Math.max(...nilaiArr),
    rata,
    hasil: rata >= lulus ? 'LULUS' : 'TIDAK',
  };
}
