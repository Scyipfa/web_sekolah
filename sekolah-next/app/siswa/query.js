import { sql, whereAnd } from '@/lib/db';

export function siswaWhere({ q, kelas, jurusan }) {
  const conds = [];
  if (q) conds.push(sql`(nama ILIKE ${'%' + q + '%'} OR nis ILIKE ${'%' + q + '%'})`);
  if (kelas) conds.push(sql`kelas = ${kelas}`);
  if (jurusan) conds.push(sql`jurusan = ${jurusan}`);
  return whereAnd(conds);
}
