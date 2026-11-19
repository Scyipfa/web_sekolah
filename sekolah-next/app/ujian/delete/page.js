import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import NotFoundCard from '@/components/NotFound';
import SubmitButton from '@/components/SubmitButton';
import { db } from '@/lib/db';
import { sp, tglId } from '@/lib/helpers';
import { requireLogin } from '@/lib/session';
import { deleteUjian } from '../actions';

export default async function UjianDelete({ searchParams }) {
  const user = await requireLogin();
  const id = sp(await searchParams, 'id');
  const sql = await db();
  const [u] = await sql`SELECT u.*, s.nama AS nama_siswa FROM tbl_ujian u LEFT JOIN tbl_siswa s ON s.nis = u.nis WHERE u.no_ujian = ${id}`;
  if (!u) return <AppLayout user={user} title="Hapus Hasil Ujian"><NotFoundCard message="Data hasil ujian tidak ditemukan." back="/ujian" /></AppLayout>;
  const [{ n }] = await sql`SELECT COUNT(*)::int AS n FROM tbl_nilai_ujian WHERE no_ujian = ${id}`;
  return (
    <AppLayout user={user} title="Hapus Hasil Ujian">
      <div className="card" style={{ maxWidth: 560 }}>
        <div className="card-header"><span className="card-title">Konfirmasi Hapus</span></div>
        <div className="card-body">
          <p>Anda akan menghapus hasil ujian berikut beserta <strong>{n} rincian nilai</strong>:</p>
          <dl className="detail-grid" style={{ margin: '16px 0' }}>
            <dt>No Ujian</dt><dd>{u.no_ujian}</dd>
            <dt>Tanggal</dt><dd>{tglId(u.tgl_ujian)}</dd>
            <dt>Siswa</dt><dd>{u.nis} — {u.nama_siswa ?? '—'}</dd>
            <dt>Hasil</dt><dd>{u.nilai_rata2} ({u.hasil_ujian})</dd>
          </dl>
          <form action={deleteUjian}>
            <input type="hidden" name="id" value={u.no_ujian} />
            <div className="form-actions">
              <SubmitButton className="btn btn-danger">Hapus Permanen</SubmitButton>
              <Link href="/ujian" className="btn btn-secondary">Batal</Link>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
