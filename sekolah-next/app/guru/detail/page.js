import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import NotFoundCard from '@/components/NotFound';
import { db } from '@/lib/db';
import { fotoUrl, sp } from '@/lib/helpers';
import { requireLogin } from '@/lib/session';

export default async function GuruDetail({ searchParams }) {
  const user = await requireLogin();
  const id = parseInt(sp(await searchParams, 'id'), 10) || 0;
  const sql = await db();
  const [g] = await sql`SELECT * FROM tbl_guru WHERE id = ${id}`;
  if (!g) return <AppLayout user={user} title="Detail Guru"><NotFoundCard message="Data guru tidak ditemukan." back="/guru" /></AppLayout>;
  const mengajar = await sql`SELECT * FROM tbl_pelajaran WHERE guru = ${g.nama} ORDER BY pelajaran`;
  return (
    <AppLayout user={user} title="Detail Guru">
      <div className="grid-2">
        <div className="card">
          <div className="card-header"><span className="card-title">Informasi Guru</span></div>
          <div className="card-body">
            <img className="detail-photo" src={fotoUrl(g.foto)} alt={`Foto ${g.nama}`} style={{ marginBottom: 18 }} />
            <dl className="detail-grid">
              <dt>NIP</dt><dd>{g.nip}</dd>
              <dt>Nama</dt><dd>{g.nama}</dd>
              <dt>Telepon</dt><dd>{g.telepon}</dd>
              <dt>Agama</dt><dd>{g.agama}</dd>
              <dt>Alamat</dt><dd>{g.alamat}</dd>
            </dl>
            <div className="form-actions">
              <Link href={`/guru/form?id=${g.id}`} className="btn btn-primary">Edit</Link>
              <Link href="/guru" className="btn btn-secondary">Kembali</Link>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">Mata Pelajaran Diampu ({mengajar.length})</span></div>
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Pelajaran</th><th>Jurusan</th></tr></thead>
              <tbody>
                {!mengajar.length && <tr><td colSpan={2} className="table-empty">Belum mengampu mata pelajaran.</td></tr>}
                {mengajar.map((m) => <tr key={m.id}><td>{m.pelajaran}</td><td>{m.jurusan}</td></tr>)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
