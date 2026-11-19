import { sql, whereAnd } from '@/lib/db';

export function jurusanWhere(q) {
  return whereAnd(q ? [sql`j.jurusan ILIKE ${'%' + q + '%'}`] : []);
}

export function jurusanSelect(where) {
  return sql`SELECT j.id, j.jurusan,
      (SELECT COUNT(*) FROM tbl_siswa s WHERE s.jurusan = j.jurusan)::int AS jml_siswa,
      (SELECT COUNT(*) FROM tbl_pelajaran p WHERE p.jurusan = j.jurusan)::int AS jml_mapel
    FROM tbl_jurusan j ${where} ORDER BY j.jurusan`;
}
