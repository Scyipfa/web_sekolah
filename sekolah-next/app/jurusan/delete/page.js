import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import NotFoundCard from '@/components/NotFound';
import SubmitButton from '@/components/SubmitButton';
import { db } from '@/lib/db';
import { sp } from '@/lib/helpers';
import { listJurusan } from '@/lib/lists';
import { requireLogin } from '@/lib/session';
import { deleteJurusan } from '../actions';

export default async function JurusanDelete({ searchParams }) {
  const user = await requireLogin();
  const j = sp(await searchParams, 'j');
  const sql = await db();
  if (!j || !(await listJurusan(sql)).includes(j)) {
    return <AppLayout user={user} title="Hapus Jurusan"><NotFoundCard message="Jurusan tidak ditemukan." back="/jurusan" /></AppLayout>;
  }
  const [[c]] = await Promise.all([
    sql`SELECT (SELECT COUNT(*) FROM tbl_siswa WHERE jurusan = ${j})::int AS siswa,
               (SELECT COUNT(*) FROM tbl_pelajaran WHERE jurusan = ${j})::int AS mapel,
               (SELECT COUNT(*) FROM tbl_ujian WHERE jurusan = ${j})::int AS ujian`,
  ]);
  return (
    <AppLayout user={user} title="Hapus Jurusan">
      <div className="card" style={{ maxWidth: 560 }}>
        <div className="card-header"><span className="card-title">Konfirmasi Hapus</span></div>
        <div className="card-body">
          <p>Anda akan menghapus jurusan <strong>{j}</strong>.</p>
          <dl className="detail-grid" style={{ margin: '16px 0' }}>
            <dt>Jumlah Siswa</dt><dd>{c.siswa}</dd>
            <dt>Jumlah Mapel</dt><dd>{c.mapel}</dd>
            <dt>Riwayat Ujian</dt><dd>{c.ujian}</dd>
          </dl>
          {(c.siswa > 0 || c.mapel > 0) && (
            <div className="alert alert-warning">
              Siswa dan mata pelajaran di jurusan ini <strong>tidak dihapus</strong>; jurusannya akan dikosongkan. Riwayat ujian tetap tersimpan.
            </div>
          )}
          <form action={deleteJurusan}>
            <input type="hidden" name="j" value={j} />
            <div className="form-actions">
              <SubmitButton className="btn btn-danger">Hapus Jurusan</SubmitButton>
              <Link href="/jurusan" className="btn btn-secondary">Batal</Link>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
