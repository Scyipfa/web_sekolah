import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import { IconDownload, IconEdit, IconEye, IconPlus, IconTrash } from '@/components/Icons';
import Pagination from '@/components/Pagination';
import { db } from '@/lib/db';
import { fotoUrl, pageInfo, qs, sp } from '@/lib/helpers';
import { requireLogin } from '@/lib/session';
import { guruWhere } from './query';


export default async function GuruIndex({ searchParams }) {
  const user = await requireLogin();
  const params = await searchParams;
  const q = sp(params, 'q');
  const sql = await db();
  const where = guruWhere(q);
  const [{ n }] = await sql`SELECT COUNT(*)::int AS n FROM tbl_guru ${where}`;
  const pg = pageInfo(n, sp(params, 'page'));
  const rows = await sql`SELECT * FROM tbl_guru ${where} ORDER BY nama LIMIT ${pg.perPage} OFFSET ${pg.offset}`;
  return (
    <AppLayout user={user} title="Data Guru">
      <div className="card">
        <div className="card-header">
          <span className="card-title">Daftar Guru</span>
          <div className="btn-group">
            <a className="btn btn-success btn-sm" href={`/guru/export${qs({ q })}`}><IconDownload /> Export Excel</a>
            <Link className="btn btn-primary btn-sm" href="/guru/form"><IconPlus /> Tambah Guru</Link>
          </div>
        </div>
        <div className="toolbar">
          <form method="get" key={q}>
            <input type="search" name="q" placeholder="Cari nama atau NIP..." defaultValue={q} />
            <button type="submit" className="btn btn-secondary btn-sm">Cari</button>
            {q && <Link href="/guru" className="btn btn-secondary btn-sm">Reset</Link>}
          </form>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Foto</th><th>NIP</th><th>Nama</th><th>Telepon</th><th>Agama</th><th>Alamat</th><th>Aksi</th></tr></thead>
            <tbody>
              {!rows.length && <tr><td colSpan={7} className="table-empty">Tidak ada data guru ditemukan.</td></tr>}
              {rows.map((r) => (
                <tr key={r.id}>
                  <td><img className="td-foto" src={fotoUrl(r.foto)} alt="" /></td>
                  <td className="nowrap">{r.nip}</td>
                  <td>{r.nama}</td>
                  <td className="nowrap">{r.telepon}</td>
                  <td>{r.agama}</td>
                  <td className="wrap">{r.alamat}</td>
                  <td className="nowrap">
                    <div className="btn-group">
                      <Link className="btn btn-secondary btn-sm" href={`/guru/detail?id=${r.id}`} title="Detail"><IconEye /></Link>
                      <Link className="btn btn-primary btn-sm" href={`/guru/form?id=${r.id}`} title="Edit"><IconEdit /></Link>
                      <Link className="btn btn-danger btn-sm" href={`/guru/delete?id=${r.id}`} title="Hapus"><IconTrash /></Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-footer"><span>Menampilkan {rows.length} dari {pg.total} data</span></div>
        <Pagination page={pg.page} pages={pg.pages} params={{ q }} />
      </div>
    </AppLayout>
  );
}
