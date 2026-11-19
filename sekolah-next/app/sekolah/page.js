import AppLayout from '@/components/AppLayout';
import { db } from '@/lib/db';
import { requireLogin } from '@/lib/session';
import SekolahForm from './SekolahForm';

export default async function SekolahPage() {
  const user = await requireLogin();
  const sql = await db();
  const [s] = await sql`SELECT * FROM tbl_sekolah ORDER BY id LIMIT 1`;
  const initial = { nama: '', alamat: '', akreditasi: '', status: '', email: '', visimisi: '', gambar: '', ...(s || {}) };
  return (
    <AppLayout user={user} title="Profil Sekolah">
      <div className="card" style={{ maxWidth: 720 }}>
        <div className="card-header"><span className="card-title">Profil Sekolah</span></div>
        <div className="card-body"><SekolahForm initial={initial} /></div>
      </div>
    </AppLayout>
  );
}
