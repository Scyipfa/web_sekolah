import AppLayout from '@/components/AppLayout';
import NotFoundCard from '@/components/NotFound';
import { db } from '@/lib/db';
import { sp } from '@/lib/helpers';
import { listJurusan } from '@/lib/lists';
import { requireLogin } from '@/lib/session';
import PelajaranForm from './PelajaranForm';

export default async function PelajaranFormPage({ searchParams }) {
  const user = await requireLogin();
  const id = parseInt(sp(await searchParams, 'id'), 10) || 0;
  const edit = id > 0;
  const title = edit ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran';
  const sql = await db();
  let data = { pelajaran: '', jurusan: '', guru: '' };
  if (edit) {
    [data] = await sql`SELECT pelajaran, jurusan, guru FROM tbl_pelajaran WHERE id = ${id}`;
    if (!data) return <AppLayout user={user} title={title}><NotFoundCard message="Data mata pelajaran tidak ditemukan." back="/pelajaran" /></AppLayout>;
  }
  const [jurusanList, guruRows] = await Promise.all([listJurusan(sql), sql`SELECT nama FROM tbl_guru ORDER BY nama`]);
  return (
    <AppLayout user={user} title={title}>
      <div className="card" style={{ maxWidth: 720 }}>
        <div className="card-header"><span className="card-title">{title}</span></div>
        <div className="card-body">
          <PelajaranForm initial={{ ...data }} id={id} jurusanList={jurusanList} guruList={guruRows.map((g) => g.nama)} />
        </div>
      </div>
    </AppLayout>
  );
}
