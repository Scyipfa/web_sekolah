import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import { ConfirmButton } from '@/components/Confirm';
import NotFoundCard from '@/components/NotFound';
import { db } from '@/lib/db';
import { sp } from '@/lib/helpers';
import { listJurusan } from '@/lib/lists';
import { requireLogin } from '@/lib/session';
import { memberAction } from '../actions';

export default async function JurusanDetail({ searchParams }) {
  const user = await requireLogin();
  const j = sp(await searchParams, 'j');
  const sql = await db();
  if (!j || !(await listJurusan(sql)).includes(j)) {
    return <AppLayout user={user} title="Isi Jurusan"><NotFoundCard message="Jurusan tidak ditemukan." back="/jurusan" /></AppLayout>;
  }
  const [siswa, mapel, calonSiswa, calonMapel] = await Promise.all([
    sql`SELECT * FROM tbl_siswa WHERE jurusan = ${j} ORDER BY nama`,
    sql`SELECT * FROM tbl_pelajaran WHERE jurusan = ${j} ORDER BY pelajaran`,
    sql`SELECT nis, nama, kelas, jurusan FROM tbl_siswa WHERE jurusan <> ${j} ORDER BY nama`,
    sql`SELECT id, pelajaran, jurusan FROM tbl_pelajaran WHERE jurusan <> ${j} ORDER BY pelajaran`,
  ]);
  return (
    <AppLayout user={user} title={`Isi Jurusan: ${j}`}>
      <div className="grid-2">
        <div className="card">
          <div className="card-header"><span className="card-title">Siswa di {j} ({siswa.length})</span></div>
          <div className="card-body">
            <form action={memberAction} className="toolbar" style={{ padding: '0 0 14px' }}>
              <input type="hidden" name="j" value={j} />
              <input type="hidden" name="action" value="add_siswa" />
              <select name="nis" required style={{ flex: 1 }}>
                <option value="">— Tambah siswa ke jurusan —</option>
                {calonSiswa.map((s) => (
                  <option key={s.nis} value={s.nis}>{s.nis} — {s.nama} ({s.jurusan || 'tanpa jurusan'})</option>
                ))}
              </select>
              <button type="submit" className="btn btn-primary btn-sm">Tambah</button>
            </form>
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>NIS</th><th>Nama</th><th>Kelas</th><th></th></tr></thead>
                <tbody>
                  {!siswa.length && <tr><td colSpan={4} className="table-empty">Belum ada siswa di jurusan ini.</td></tr>}
                  {siswa.map((s) => (
                    <tr key={s.nis}>
                      <td>{s.nis}</td>
                      <td><Link href={`/siswa/detail?nis=${encodeURIComponent(s.nis)}`}>{s.nama}</Link></td>
                      <td><span className="badge badge-info">{s.kelas}</span></td>
                      <td>
                        <form action={memberAction}>
                          <input type="hidden" name="j" value={j} />
                          <input type="hidden" name="action" value="del_siswa" />
                          <input type="hidden" name="nis" value={s.nis} />
                          <ConfirmButton message={`Keluarkan ${s.nama} dari ${j}?`} className="btn btn-danger btn-sm" title="Keluarkan">&times;</ConfirmButton>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">Mata Pelajaran di {j} ({mapel.length})</span></div>
          <div className="card-body">
            <form action={memberAction} className="toolbar" style={{ padding: '0 0 14px' }}>
              <input type="hidden" name="j" value={j} />
              <input type="hidden" name="action" value="add_mapel" />
              <select name="id" required style={{ flex: 1 }}>
                <option value="">— Tambah mapel ke jurusan —</option>
                {calonMapel.map((m) => (
                  <option key={m.id} value={m.id}>{m.pelajaran} ({m.jurusan || 'tanpa jurusan'})</option>
                ))}
              </select>
              <button type="submit" className="btn btn-primary btn-sm">Tambah</button>
            </form>
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>Pelajaran</th><th>Guru</th><th></th></tr></thead>
                <tbody>
                  {!mapel.length && <tr><td colSpan={3} className="table-empty">Belum ada mata pelajaran di jurusan ini.</td></tr>}
                  {mapel.map((m) => (
                    <tr key={m.id}>
                      <td>{m.pelajaran}</td>
                      <td>{m.guru}</td>
                      <td>
                        <form action={memberAction}>
                          <input type="hidden" name="j" value={j} />
                          <input type="hidden" name="action" value="del_mapel" />
                          <input type="hidden" name="id" value={m.id} />
                          <ConfirmButton message={`Keluarkan ${m.pelajaran} dari ${j}?`} className="btn btn-danger btn-sm" title="Keluarkan">&times;</ConfirmButton>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div className="form-actions" style={{ marginTop: 0 }}>
        <Link href={`/jurusan/form?j=${encodeURIComponent(j)}`} className="btn btn-primary">Ubah Nama Jurusan</Link>
        <Link href="/jurusan" className="btn btn-secondary">Kembali</Link>
      </div>
    </AppLayout>
  );
}
