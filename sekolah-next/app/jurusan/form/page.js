import AppLayout from '@/components/AppLayout';
import NotFoundCard from '@/components/NotFound';
import { db } from '@/lib/db';
import { sp } from '@/lib/helpers';
import { listJurusan } from '@/lib/lists';
import { requireLogin } from '@/lib/session';
import JurusanForm from './JurusanForm';

export default async function JurusanFormPage({ searchParams }) {
  const user = await requireLogin();
  const old = sp(await searchParams, 'j');
  const title = old ? 'Ubah Nama Jurusan' : 'Tambah Jurusan';
  if (old && !(await listJurusan(await db())).includes(old)) {
    return <AppLayout user={user} title={title}><NotFoundCard message="Jurusan tidak ditemukan." back="/jurusan" /></AppLayout>;
  }
  return (
    <AppLayout user={user} title={title}>
      <div className="card" style={{ maxWidth: 560 }}>
        <div className="card-header"><span className="card-title">{title}</span></div>
        <div className="card-body"><JurusanForm old={old} /></div>
      </div>
    </AppLayout>
  );
}
