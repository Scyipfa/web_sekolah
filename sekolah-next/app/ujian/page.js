import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import { IconDownload, IconEdit, IconEye, IconPlus, IconTrash } from '@/components/Icons';
import Pagination from '@/components/Pagination';
import { db } from '@/lib/db';
import { pageInfo, qs, sp, tglId } from '@/lib/helpers';
import { listJurusan } from '@/lib/lists';
import { requireLogin } from '@/lib/session';
import { UJIAN_JOIN, ujianWhere } from './query';

export default async function UjianIndex({ searchParams }) {
  const user = await requireLogin();
  const params = await searchParams;
  const f = { q: sp(params, 'q'), hasil: sp(params, 'hasil'), jurusan: sp(params, 'jurusan') };
  const sql = await db();
  const where = ujianWhere(f);
  const [{ n }] = await sql`SELECT COUNT(*)::int AS n ${UJIAN_JOIN} ${where}`;
  const pg = pageInfo(n, sp(params, 'page'));
  const [rows, jurusanList] = await Promise.all([
    sql`SELECT u.*, s.nama AS nama_siswa ${UJIAN_JOIN} ${where}
        ORDER BY u.tgl_ujian DESC, u.no_ujian DESC LIMIT ${pg.perPage} OFFSET ${pg.offset}`,
    listJurusan(sql),
  ]);
  return (
    <AppLayout user={user} title="Hasil Ujian">
      <div className="card">
        <div className="card-header">
          <span className="card-title">Daftar Hasil Ujian</span>
          <div className="btn-group">
            <a className="btn btn-success btn-sm" href={`/ujian/export${qs(f)}`}><IconDownload /> Export Excel</a>
            <Link className="btn btn-primary btn-sm" href="/ujian/form"><IconPlus /> Tambah Hasil Ujian</Link>
          </div>
        </div>
        <div className="toolbar">
          <form method="get" key={JSON.stringify(f)}>
            <input type="search" name="q" placeholder="Cari no ujian, NIS, atau nama..." defaultValue={f.q} />
            <select name="hasil" defaultValue={f.hasil}>
              <option value="">Semua Hasil</option>
              <option value="LULUS">LULUS</option>
              <option value="TIDAK">TIDAK</option>
            </select>
            <select name="jurusan" defaultValue={f.jurusan}>
              <option value="">Semua Jurusan</option>
              {jurusanList.map((j) => <option key={j} value={j}>{j}</option>)}
            </select>
            <button type="submit" className="btn btn-secondary btn-sm">Filter</button>
            {(f.q || f.hasil || f.jurusan) && <Link href="/ujian" className="btn btn-secondary btn-sm">Reset</Link>}
          </form>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>No Ujian</th><th>Tanggal</th><th>NIS</th><th>Nama Siswa</th><th>Jurusan</th><th>Total</th><th>Min/Max</th><th>Rata-rata</th><th>Hasil</th><th>Aksi</th></tr>
            </thead>
            <tbody>
              {!rows.length && <tr><td colSpan={10} className="table-empty">Tidak ada data hasil ujian ditemukan.</td></tr>}
              {rows.map((r) => {
                const id = encodeURIComponent(r.no_ujian);
                return (
                  <tr key={r.no_ujian}>
                    <td className="nowrap"><strong>{r.no_ujian}</strong></td>
                    <td className="nowrap">{tglId(r.tgl_ujian)}</td>
                    <td>{r.nis}</td>
                    <td>{r.nama_siswa ?? '—'}</td>
                    <td>{r.jurusan}</td>
                    <td>{r.total_nilai}</td>
                    <td className="nowrap">{r.nilai_terendah} / {r.nilai_tertinggi}</td>
                    <td>{r.nilai_rata2}</td>
                    <td><span className={`badge ${r.hasil_ujian === 'LULUS' ? 'badge-success' : 'badge-danger'}`}>{r.hasil_ujian}</span></td>
                    <td className="nowrap">
                      <div className="btn-group">
                        <Link className="btn btn-secondary btn-sm" href={`/ujian/detail?id=${id}`} title="Detail"><IconEye /></Link>
                        <Link className="btn btn-primary btn-sm" href={`/ujian/form?id=${id}`} title="Edit"><IconEdit /></Link>
                        <Link className="btn btn-danger btn-sm" href={`/ujian/delete?id=${id}`} title="Hapus"><IconTrash /></Link>
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
