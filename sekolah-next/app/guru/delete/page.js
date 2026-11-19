import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import NotFoundCard from '@/components/NotFound';
import SubmitButton from '@/components/SubmitButton';
import { db } from '@/lib/db';
import { sp } from '@/lib/helpers';
import { requireLogin } from '@/lib/session';
import { deleteGuru } from '../actions';

export default async function GuruDelete({ searchParams }) {
  const user = await requireLogin();
  const id = parseInt(sp(await searchParams, 'id'), 10) || 0;
  const sql = await db();
  const [g] = await sql`SELECT * FROM tbl_guru WHERE id = ${id}`;
  if (!g) return <AppLayout user={user} title="Hapus Guru"><NotFoundCard message="Data guru tidak ditemukan." back="/guru" /></AppLayout>;
  const [{ n }] = await sql`SELECT COUNT(*)::int AS n FROM tbl_pelajaran WHERE guru = ${g.nama}`;
  return (
    <AppLayout user={user} title="Hapus Guru">
      <div className="card" style={{ maxWidth: 560 }}>
        <div className="card-header"><span className="card-title">Konfirmasi Hapus</span></div>
        <div className="card-body">
          <p>Anda akan menghapus data guru berikut:</p>
          <dl className="detail-grid" style={{ margin: '16px 0' }}>
            <dt>NIP</dt><dd>{g.nip}</dd>
            <dt>Nama</dt><dd>{g.nama}</dd>
            <dt>Telepon</dt><dd>{g.telepon}</dd>
          </dl>
          {n > 0 && (
            <div className="alert alert-warning">
              Nama guru ini tercatat pada <strong>{n} mata pelajaran</strong>. Menghapus guru tidak menghapus data pelajaran, tetapi kolom guru pada pelajaran tersebut menjadi tidak valid.
            </div>
          )}
          <form action={deleteGuru}>
            <input type="hidden" name="id" value={g.id} />
            <div className="form-actions">
              <SubmitButton className="btn btn-danger">Hapus Permanen</SubmitButton>
              <Link href="/guru" className="btn btn-secondary">Batal</Link>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
