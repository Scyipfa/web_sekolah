import AppLayout from '@/components/AppLayout';
import NotFoundCard from '@/components/NotFound';
import { db } from '@/lib/db';
import { sp } from '@/lib/helpers';
import { requireLogin } from '@/lib/session';
import GuruForm from './GuruForm';

export default async function GuruFormPage({ searchParams }) {
  const user = await requireLogin();
  const id = parseInt(sp(await searchParams, 'id'), 10) || 0;
  const edit = id > 0;
  const title = edit ? 'Edit Guru' : 'Tambah Guru';
  let data = { nip: '', nama: '', alamat: '', telepon: '', agama: '', foto: '' };
  if (edit) {
    const sql = await db();
    [data] = await sql`SELECT * FROM tbl_guru WHERE id = ${id}`;
    if (!data) return <AppLayout user={user} title={title}><NotFoundCard message="Data guru tidak ditemukan." back="/guru" /></AppLayout>;
  }
  return (
    <AppLayout user={user} title={title}>
      <div className="card" style={{ maxWidth: 720 }}>
        <div className="card-header"><span className="card-title">{title}</span></div>
        <div className="card-body"><GuruForm initial={{ ...data }} id={id} /></div>
      </div>
    </AppLayout>
  );
}
