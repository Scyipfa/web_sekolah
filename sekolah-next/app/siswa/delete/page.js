import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import NotFoundCard from '@/components/NotFound';
import SubmitButton from '@/components/SubmitButton';
import { db } from '@/lib/db';
import { sp } from '@/lib/helpers';
import { requireLogin } from '@/lib/session';
import { deleteSiswa } from '../actions';

export default async function SiswaDelete({ searchParams }) {
  const user = await requireLogin();
  const nis = sp(await searchParams, 'nis');
  const sql = await db();
  const [s] = await sql`SELECT * FROM tbl_siswa WHERE nis = ${nis}`;
  if (!s) return <AppLayout user={user} title="Hapus Siswa"><NotFoundCard message="Data siswa tidak ditemukan." back="/siswa" /></AppLayout>;
  const [{ n }] = await sql`SELECT COUNT(*)::int AS n FROM tbl_ujian WHERE nis = ${nis}`;
  return (
    <AppLayout user={user} title="Hapus Siswa">
      <div className="card" style={{ maxWidth: 560 }}>
        <div className="card-header"><span className="card-title">Konfirmasi Hapus</span></div>
        <div className="card-body">
          <p>Anda akan menghapus data siswa berikut:</p>
          <dl className="detail-grid" style={{ margin: '16px 0' }}>
            <dt>NIS</dt><dd>{s.nis}</dd>
            <dt>Nama</dt><dd>{s.nama}</dd>
            <dt>Kelas</dt><dd>{s.kelas} — {s.jurusan}</dd>
          </dl>
          {n > 0 && (
            <div className="alert alert-warning">
              Siswa ini memiliki <strong>{n} data hasil ujian</strong> yang ikut terhapus bila Anda mencentang opsi di bawah.
            </div>
          )}
          <form action={deleteSiswa}>
            <input type="hidden" name="nis" value={s.nis} />
            {n > 0 && (
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}>
                  <input type="checkbox" name="cascade" value="1" style={{ width: 'auto' }} />
                  Hapus juga seluruh data ujian &amp; nilai siswa ini
                </label>
              </div>
            )}
            <div className="form-actions">
              <SubmitButton className="btn btn-danger">Hapus Permanen</SubmitButton>
              <Link href="/siswa" className="btn btn-secondary">Batal</Link>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
