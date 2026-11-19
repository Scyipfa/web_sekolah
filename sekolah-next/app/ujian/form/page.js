import AppLayout from '@/components/AppLayout';
import NotFoundCard from '@/components/NotFound';
import { db } from '@/lib/db';
import { sp } from '@/lib/helpers';
import { requireLogin } from '@/lib/session';
import UjianForm from './UjianForm';

function today() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date());
}

export default async function UjianFormPage({ searchParams }) {
  const user = await requireLogin();
  const noUjian = sp(await searchParams, 'id');
  const edit = noUjian !== '';
  const title = edit ? 'Edit Hasil Ujian' : 'Tambah Hasil Ujian';
  const sql = await db();
  let initial = { tgl_ujian: today(), nis: '', jurusan: '', rows: [{ pelajaran: '', nilai_ujian: '' }] };
  if (edit) {
    const [m] = await sql`SELECT * FROM tbl_ujian WHERE no_ujian = ${noUjian}`;
    if (!m) return <AppLayout user={user} title={title}><NotFoundCard message="Data hasil ujian tidak ditemukan." back="/ujian" /></AppLayout>;
    const rows = await sql`SELECT pelajaran, nilai_ujian FROM tbl_nilai_ujian WHERE no_ujian = ${noUjian} ORDER BY id`;
    initial = { tgl_ujian: m.tgl_ujian, nis: m.nis, jurusan: m.jurusan, rows: rows.length ? rows.map((r) => ({ ...r })) : initial.rows };
  }
  const [listSiswa, mapPel] = await Promise.all([
    sql`SELECT nis, nama, kelas, jurusan FROM tbl_siswa ORDER BY nama`,
    sql`SELECT jurusan, pelajaran FROM tbl_pelajaran ORDER BY pelajaran`,
  ]);
  const pelajaranPerJurusan = {};
  for (const r of mapPel) (pelajaranPerJurusan[r.jurusan] ??= []).push(r.pelajaran);
  const semuaPelajaran = [...new Set(mapPel.map((r) => r.pelajaran))];
  return (
    <AppLayout user={user} title={title}>
      <div className="card" style={{ maxWidth: 860 }}>
        <div className="card-header"><span className="card-title">{title}</span></div>
        <div className="card-body">
          <UjianForm
            initial={initial}
            noUjian={noUjian}
            listSiswa={listSiswa.map((s) => ({ ...s }))}
            pelajaranPerJurusan={pelajaranPerJurusan}
            semuaPelajaran={semuaPelajaran}
          />
        </div>
      </div>
    </AppLayout>
  );
}
