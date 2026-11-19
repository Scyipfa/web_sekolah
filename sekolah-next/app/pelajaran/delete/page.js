import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import NotFoundCard from '@/components/NotFound';
import SubmitButton from '@/components/SubmitButton';
import { db } from '@/lib/db';
import { sp } from '@/lib/helpers';
import { requireLogin } from '@/lib/session';
import { deletePelajaran } from '../actions';

export default async function PelajaranDelete({ searchParams }) {
  const user = await requireLogin();
  const id = parseInt(sp(await searchParams, 'id'), 10) || 0;
  const sql = await db();
  const [p] = await sql`SELECT * FROM tbl_pelajaran WHERE id = ${id}`;
  const title = 'Hapus Mata Pelajaran';
  if (!p) return <AppLayout user={user} title={title}><NotFoundCard message="Data mata pelajaran tidak ditemukan." back="/pelajaran" /></AppLayout>;
  return (
    <AppLayout user={user} title={title}>
      <div className="card" style={{ maxWidth: 560 }}>
        <div className="card-header"><span className="card-title">Konfirmasi Hapus</span></div>
        <div className="card-body">
          <p>Anda akan menghapus mata pelajaran berikut:</p>
          <dl className="detail-grid" style={{ margin: '16px 0' }}>
            <dt>Pelajaran</dt><dd>{p.pelajaran}</dd>
            <dt>Jurusan</dt><dd>{p.jurusan}</dd>
            <dt>Guru</dt><dd>{p.guru}</dd>
          </dl>
          <form action={deletePelajaran}>
            <input type="hidden" name="id" value={p.id} />
            <div className="form-actions">
              <SubmitButton className="btn btn-danger">Hapus Permanen</SubmitButton>
              <Link href="/pelajaran" className="btn btn-secondary">Batal</Link>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
