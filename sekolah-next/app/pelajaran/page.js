import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import { IconDownload, IconEdit, IconEye, IconPlus, IconTrash } from '@/components/Icons';
import Pagination from '@/components/Pagination';
import { db } from '@/lib/db';
import { pageInfo, qs, sp } from '@/lib/helpers';
import { listJurusan } from '@/lib/lists';
import { requireLogin } from '@/lib/session';
import { pelajaranWhere } from './query';

export default async function PelajaranIndex({ searchParams }) {
  const user = await requireLogin();
  const params = await searchParams;
  const f = { q: sp(params, 'q'), jurusan: sp(params, 'jurusan') };
  const sql = await db();
  const where = pelajaranWhere(f);
  const [{ n }] = await sql`SELECT COUNT(*)::int AS n FROM tbl_pelajaran ${where}`;
  const pg = pageInfo(n, sp(params, 'page'));
  const [rows, jurusanList] = await Promise.all([
    sql`SELECT * FROM tbl_pelajaran ${where} ORDER BY pelajaran LIMIT ${pg.perPage} OFFSET ${pg.offset}`,
    listJurusan(sql),
  ]);
  return (
    <AppLayout user={user} title="Mata Pelajaran">
      <div className="card">
        <div className="card-header">
          <span className="card-title">Daftar Mata Pelajaran</span>
          <div className="btn-group">
            <a className="btn btn-success btn-sm" href={`/pelajaran/export${qs(f)}`}><IconDownload /> Export Excel</a>
            <Link className="btn btn-primary btn-sm" href="/pelajaran/form"><IconPlus /> Tambah Pelajaran</Link>
          </div>
        </div>
        <div className="toolbar">
          <form method="get" key={JSON.stringify(f)}>
            <input type="search" name="q" placeholder="Cari pelajaran atau guru..." defaultValue={f.q} />
            <select name="jurusan" defaultValue={f.jurusan}>
              <option value="">Semua Jurusan</option>
              {jurusanList.map((j) => <option key={j} value={j}>{j}</option>)}
            </select>
            <button type="submit" className="btn btn-secondary btn-sm">Filter</button>
            {(f.q || f.jurusan) && <Link href="/pelajaran" className="btn btn-secondary btn-sm">Reset</Link>}
          </form>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>No</th><th>Mata Pelajaran</th><th>Jurusan</th><th>Guru Pengampu</th><th>Aksi</th></tr></thead>
            <tbody>
              {!rows.length && <tr><td colSpan={5} className="table-empty">Tidak ada data mata pelajaran ditemukan.</td></tr>}
              {rows.map((r, i) => (
                <tr key={r.id}>
                  <td>{pg.offset + i + 1}</td>
                  <td>{r.pelajaran}</td>
                  <td><span className="badge badge-info">{r.jurusan}</span></td>
                  <td>{r.guru}</td>
                  <td className="nowrap">
                    <div className="btn-group">
                      <Link className="btn btn-secondary btn-sm" href={`/pelajaran/detail?id=${r.id}`} title="Detail"><IconEye /></Link>
                      <Link className="btn btn-primary btn-sm" href={`/pelajaran/form?id=${r.id}`} title="Edit"><IconEdit /></Link>
                      <Link className="btn btn-danger btn-sm" href={`/pelajaran/delete?id=${r.id}`} title="Hapus"><IconTrash /></Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-footer"><span>Menampilkan {rows.length} dari {pg.total} data</span></div>
        <Pagination page={pg.page} pages={pg.pages} params={f} />
      </div>
    </AppLayout>
  );
}
