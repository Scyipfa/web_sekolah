import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import NotFoundCard from '@/components/NotFound';
import { db } from '@/lib/db';
import { NILAI_LULUS, sp, tglId } from '@/lib/helpers';
import { requireLogin } from '@/lib/session';

export default async function UjianDetail({ searchParams }) {
  const user = await requireLogin();
  const id = sp(await searchParams, 'id');
  const sql = await db();
  const [u] = await sql`SELECT u.*, s.nama AS nama_siswa, s.kelas FROM tbl_ujian u LEFT JOIN tbl_siswa s ON s.nis = u.nis WHERE u.no_ujian = ${id}`;
  if (!u) return <AppLayout user={user} title="Detail Hasil Ujian"><NotFoundCard message="Data hasil ujian tidak ditemukan." back="/ujian" /></AppLayout>;
  const nilai = await sql`SELECT * FROM tbl_nilai_ujian WHERE no_ujian = ${id} ORDER BY id`;
  return (
    <AppLayout user={user} title="Detail Hasil Ujian">
      <div className="grid-2">
        <div className="card">
          <div className="card-header"><span className="card-title">Informasi Ujian</span></div>
          <div className="card-body">
            <dl className="detail-grid">
              <dt>No Ujian</dt><dd><strong>{u.no_ujian}</strong></dd>
              <dt>Tanggal</dt><dd>{tglId(u.tgl_ujian)}</dd>
              <dt>NIS</dt><dd>{u.nis}</dd>
              <dt>Nama Siswa</dt>
              <dd>{u.nama_siswa ? <Link href={`/siswa/detail?nis=${encodeURIComponent(u.nis)}`}>{u.nama_siswa}</Link> : '—'}</dd>
              <dt>Kelas</dt><dd>{u.kelas ?? '—'}</dd>
              <dt>Jurusan</dt><dd>{u.jurusan}</dd>
            </dl>
            <div className="form-actions">
              <Link href={`/ujian/form?id=${encodeURIComponent(u.no_ujian)}`} className="btn btn-primary">Edit</Link>
              <Link href="/ujian" className="btn btn-secondary">Kembali</Link>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">Ringkasan Nilai</span></div>
          <div className="card-body">
            <div className="stat-grid" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: 0 }}>
              <div className="stat-card"><div><div className="stat-value">{u.total_nilai}</div><div className="stat-label">Total Nilai</div></div></div>
              <div className="stat-card"><div><div className="stat-value">{u.nilai_rata2}</div><div className="stat-label">Rata-rata</div></div></div>
              <div className="stat-card"><div><div className="stat-value">{u.nilai_terendah} / {u.nilai_tertinggi}</div><div className="stat-label">Terendah / Tertinggi</div></div></div>
              <div className="stat-card">
                <div>
                  <div className="stat-value"><span className={`badge ${u.hasil_ujian === 'LULUS' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: 15 }}>{u.hasil_ujian}</span></div>
                  <div className="stat-label">Hasil Ujian</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-header"><span className="card-title">Nilai per Mata Pelajaran ({nilai.length})</span></div>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>No</th><th>Mata Pelajaran</th><th>Nilai</th></tr></thead>
            <tbody>
              {!nilai.length && <tr><td colSpan={3} className="table-empty">Belum ada rincian nilai.</td></tr>}
              {nilai.map((n, i) => (
                <tr key={n.id}>
                  <td>{i + 1}</td>
                  <td>{n.pelajaran}</td>
                  <td>{n.nilai_ujian} {n.nilai_ujian < NILAI_LULUS && <span className="badge badge-danger">di bawah {NILAI_LULUS}</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
