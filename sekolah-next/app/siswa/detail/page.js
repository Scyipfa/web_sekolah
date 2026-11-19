import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import NotFoundCard from '@/components/NotFound';
import { db } from '@/lib/db';
import { fotoUrl, sp, tglId } from '@/lib/helpers';
import { requireLogin } from '@/lib/session';

export default async function SiswaDetail({ searchParams }) {
  const user = await requireLogin();
  const nis = sp(await searchParams, 'nis');
  const sql = await db();
  const [s] = await sql`SELECT * FROM tbl_siswa WHERE nis = ${nis}`;
  if (!s) return <AppLayout user={user} title="Detail Siswa"><NotFoundCard message="Data siswa tidak ditemukan." back="/siswa" /></AppLayout>;
  const riwayat = await sql`SELECT * FROM tbl_ujian WHERE nis = ${nis} ORDER BY tgl_ujian DESC`;
  return (
    <AppLayout user={user} title="Detail Siswa">
      <div className="grid-2">
        <div className="card">
          <div className="card-header"><span className="card-title">Informasi Siswa</span></div>
          <div className="card-body">
            <img className="detail-photo" src={fotoUrl(s.foto)} alt={`Foto ${s.nama}`} style={{ marginBottom: 18 }} />
            <dl className="detail-grid">
              <dt>NIS</dt><dd>{s.nis}</dd>
              <dt>Nama</dt><dd>{s.nama}</dd>
              <dt>Kelas</dt><dd><span className="badge badge-info">{s.kelas}</span></dd>
              <dt>Jurusan</dt><dd>{s.jurusan}</dd>
              <dt>Alamat</dt><dd>{s.alamat}</dd>
            </dl>
            <div className="form-actions">
              <Link href={`/siswa/form?nis=${encodeURIComponent(s.nis)}`} className="btn btn-primary">Edit</Link>
              <Link href="/siswa" className="btn btn-secondary">Kembali</Link>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">Riwayat Ujian ({riwayat.length})</span></div>
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>No Ujian</th><th>Tanggal</th><th>Rata-rata</th><th>Hasil</th></tr></thead>
              <tbody>
                {!riwayat.length && <tr><td colSpan={4} className="table-empty">Belum ada riwayat ujian.</td></tr>}
                {riwayat.map((u) => (
                  <tr key={u.no_ujian}>
                    <td><Link href={`/ujian/detail?id=${encodeURIComponent(u.no_ujian)}`}>{u.no_ujian}</Link></td>
                    <td>{tglId(u.tgl_ujian)}</td>
                    <td>{u.nilai_rata2}</td>
                    <td><span className={`badge ${u.hasil_ujian === 'LULUS' ? 'badge-success' : 'badge-danger'}`}>{u.hasil_ujian}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
