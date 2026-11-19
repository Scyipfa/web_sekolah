import AppLayout from '@/components/AppLayout';
import NotFoundCard from '@/components/NotFound';
import { db } from '@/lib/db';
import { sp } from '@/lib/helpers';
import { listJurusan, listKelas } from '@/lib/lists';
import { requireLogin } from '@/lib/session';
import SiswaForm from './SiswaForm';

export default async function SiswaFormPage({ searchParams }) {
  const user = await requireLogin();
  const nis = sp(await searchParams, 'nis');
  const edit = nis !== '';
  const title = edit ? 'Edit Siswa' : 'Tambah Siswa';
  const sql = await db();
  let data = { nis: '', nama: '', alamat: '', kelas: '', jurusan: '', foto: '' };
  if (edit) {
    [data] = await sql`SELECT * FROM tbl_siswa WHERE nis = ${nis}`;
    if (!data) return <AppLayout user={user} title={title}><NotFoundCard message="Data siswa tidak ditemukan." back="/siswa" /></AppLayout>;
  }
  const [kelasList, jurusanList] = await Promise.all([listKelas(sql), listJurusan(sql)]);
  return (
    <AppLayout user={user} title={title}>
      <div className="card" style={{ maxWidth: 720 }}>
        <div className="card-header"><span className="card-title">{title}</span></div>
        <div className="card-body">
          <SiswaForm initial={{ ...data }} origNis={edit ? nis : ''} kelasList={kelasList} jurusanList={jurusanList} />
        </div>
      </div>
    </AppLayout>
  );
}
