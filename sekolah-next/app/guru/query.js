import { sql, whereAnd } from '@/lib/db';

export function guruWhere(q) {
  return whereAnd(q ? [sql`(nama ILIKE ${'%' + q + '%'} OR nip ILIKE ${'%' + q + '%'})`] : []);
}
