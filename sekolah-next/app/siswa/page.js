import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import { IconDownload, IconEdit, IconEye, IconPlus, IconTrash } from '@/components/Icons';
import Pagination from '@/components/Pagination';
import { db } from '@/lib/db';
import { fotoUrl, pageInfo, qs, sp } from '@/lib/helpers';
import { listJurusan, listKelas } from '@/lib/lists';
import { requireLogin } from '@/lib/session';
import { siswaWhere } from './query';

export default async function SiswaIndex({ searchParams }) {
  const user = await requireLogin();
  const params = await searchParams;
  const f = { q: sp(params, 'q'), kelas: sp(params, 'kelas'), jurusan: sp(params, 'jurusan') };
  const sql = await db();
  const where = siswaWhere(f);
  const [{ n }] = await sql`SELECT COUNT(*)::int AS n FROM tbl_siswa ${where}`;
  const pg = pageInfo(n, sp(params, 'page'));
  const [rows, kelasList, jurusanList] = await Promise.all([
    sql`SELECT * FROM tbl_siswa ${where} ORDER BY nis LIMIT ${pg.perPage} OFFSET ${pg.offset}`,
    listKelas(sql),
    listJurusan(sql),
  ]);

  return (
    <AppLayout user={user} title="Data Siswa">
      <div className="card">
        <div className="card-header">
          <span className="card-title">Daftar Siswa</span>
          <div className="btn-group">
            <a className="btn btn-success btn-sm" href={`/siswa/export${qs(f)}`}><IconDownload /> Export Excel</a>
            <Link className="btn btn-primary btn-sm" href="/siswa/form"><IconPlus /> Tambah Siswa</Link>
          </div>
        </div>
        <div className="toolbar">
          <form method="get" key={JSON.stringify(f)}>
            <input type="search" name="q" placeholder="Cari nama atau NIS..." defaultValue={f.q} />
            <select name="kelas" defaultValue={f.kelas}>
              <option value="">Semua Kelas</option>
              {kelasList.map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
            <select name="jurusan" defaultValue={f.jurusan}>
              <option value="">Semua Jurusan</option>
              {jurusanList.map((j) => <option key={j} value={j}>{j}</option>)}
            </select>
            <button type="submit" className="btn btn-secondary btn-sm">Filter</button>
            {(f.q || f.kelas || f.jurusan) && <Link href="/siswa" className="btn btn-secondary btn-sm">Reset</Link>}
          </form>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Foto</th><th>NIS</th><th>Nama</th><th>Kelas</th><th>Jurusan</th><th>Alamat</th><th>Aksi</th></tr>
            </thead>
            <tbody>
              {!rows.length && <tr><td colSpan={7} className="table-empty">Tidak ada data siswa ditemukan.</td></tr>}
              {rows.map((r) => {
                const id = encodeURIComponent(r.nis);
                return (
                  <tr key={r.nis}>
                    <td><img className="td-foto" src={fotoUrl(r.foto)} alt="" /></td>
                    <td className="nowrap">{r.nis}</td>
                    <td>{r.nama}</td>
                    <td><span className="badge badge-info">{r.kelas}</span></td>
                    <td>{r.jurusan}</td>
                    <td className="wrap">{r.alamat}</td>
                    <td className="nowrap">
                      <div className="btn-group">
                        <Link className="btn btn-secondary btn-sm" href={`/siswa/detail?nis=${id}`} title="Detail"><IconEye /></Link>
                        <Link className="btn btn-primary btn-sm" href={`/siswa/form?nis=${id}`} title="Edit"><IconEdit /></Link>
                        <Link className="btn btn-danger btn-sm" href={`/siswa/delete?nis=${id}`} title="Hapus"><IconTrash /></Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="table-footer"><span>Menampilkan {rows.length} dari {pg.total} data</span></div>
        <Pagination page={pg.page} pages={pg.pages} params={f} />
      </div>
    </AppLayout>
  );
}
