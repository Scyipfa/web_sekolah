import { sql, whereAnd } from '@/lib/db';

export function pelajaranWhere({ q, jurusan }) {
  const conds = [];
  if (q) conds.push(sql`(pelajaran ILIKE ${'%' + q + '%'} OR guru ILIKE ${'%' + q + '%'})`);
  if (jurusan) conds.push(sql`jurusan = ${jurusan}`);
  return whereAnd(conds);
}
