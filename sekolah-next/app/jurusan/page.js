import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import { IconDownload, IconEdit, IconEye, IconPlus, IconTrash } from '@/components/Icons';
import Pagination from '@/components/Pagination';
import { db } from '@/lib/db';
import { pageInfo, qs, sp } from '@/lib/helpers';
import { requireLogin } from '@/lib/session';
import { jurusanSelect, jurusanWhere } from './query';

export default async function JurusanIndex({ searchParams }) {
  const user = await requireLogin();
  const params = await searchParams;
  const q = sp(params, 'q');
  const sql = await db();
  const where = jurusanWhere(q);
  const [{ n }] = await sql`SELECT COUNT(*)::int AS n FROM tbl_jurusan j ${where}`;
  const pg = pageInfo(n, sp(params, 'page'));
  const rows = await sql`${jurusanSelect(where)} LIMIT ${pg.perPage} OFFSET ${pg.offset}`;
  return (
    <AppLayout user={user} title="Data Jurusan">
      <div className="card">
        <div className="card-header">
          <span className="card-title">Daftar Jurusan</span>
          <div className="btn-group">
            <a className="btn btn-success btn-sm" href={`/jurusan/export${qs({ q })}`}><IconDownload /> Export Excel</a>
            <Link className="btn btn-primary btn-sm" href="/jurusan/form"><IconPlus /> Tambah Jurusan</Link>
          </div>
        </div>
        <div className="toolbar">
          <form method="get" key={q}>
            <input type="search" name="q" placeholder="Cari jurusan..." defaultValue={q} />
            <button type="submit" className="btn btn-secondary btn-sm">Cari</button>
            {q && <Link href="/jurusan" className="btn btn-secondary btn-sm">Reset</Link>}
          </form>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>No</th><th>Jurusan</th><th>Jml Siswa</th><th>Jml Mapel</th><th>Aksi</th></tr></thead>
            <tbody>
              {!rows.length && <tr><td colSpan={5} className="table-empty">Belum ada data jurusan.</td></tr>}
              {rows.map((r, i) => {
                const j = encodeURIComponent(r.jurusan);
                return (
                  <tr key={r.id}>
                    <td>{pg.offset + i + 1}</td>
                    <td><strong>{r.jurusan}</strong></td>
                    <td>{r.jml_siswa}</td>
                    <td>{r.jml_mapel}</td>
                    <td className="nowrap">
                      <div className="btn-group">
                        <Link className="btn btn-secondary btn-sm" href={`/jurusan/detail?j=${j}`} title="Kelola Isi"><IconEye /></Link>
                        <Link className="btn btn-primary btn-sm" href={`/jurusan/form?j=${j}`} title="Rename"><IconEdit /></Link>
                        <Link className="btn btn-danger btn-sm" href={`/jurusan/delete?j=${j}`} title="Hapus"><IconTrash /></Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="table-footer"><span>Menampilkan {rows.length} dari {pg.total} data</span></div>
        <Pagination page={pg.page} pages={pg.pages} params={{ q }} />
      </div>
    </AppLayout>
  );
}
