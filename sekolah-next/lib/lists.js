export async function listJurusan(sql) {
  const rows = await sql`SELECT jurusan FROM tbl_jurusan WHERE jurusan <> '' ORDER BY jurusan`;
  return rows.map((r) => r.jurusan);
}

export async function listKelas(sql) {
  const rows = await sql`SELECT DISTINCT kelas FROM tbl_siswa ORDER BY kelas`;
  return rows.map((r) => r.kelas);
}
