import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import Chart from '@/components/Charts';
import { IconBook, IconExam, IconGuru, IconUsers } from '@/components/Icons';
import { db } from '@/lib/db';
import { fotoUrl, tglId } from '@/lib/helpers';
import { requireLogin } from '@/lib/session';

export default async function Dashboard() {
  const user = await requireLogin();
  const sql = await db();
  const [[c], perJurusan, perHasil, recentUjian, recentSiswa, [sekolah]] = await Promise.all([
    sql`SELECT (SELECT COUNT(*) FROM tbl_siswa)::int AS siswa, (SELECT COUNT(*) FROM tbl_guru)::int AS guru,
               (SELECT COUNT(*) FROM tbl_pelajaran)::int AS pelajaran, (SELECT COUNT(*) FROM tbl_ujian)::int AS ujian`,
    sql`SELECT jurusan, COUNT(*)::int AS jml FROM tbl_siswa GROUP BY jurusan ORDER BY jml DESC`,
    sql`SELECT hasil_ujian, COUNT(*)::int AS jml FROM tbl_ujian GROUP BY hasil_ujian`,
    sql`SELECT u.no_ujian, u.tgl_ujian, u.hasil_ujian, u.nilai_rata2, s.nama AS nama_siswa, u.nis
        FROM tbl_ujian u LEFT JOIN tbl_siswa s ON s.nis = u.nis
        ORDER BY u.tgl_ujian DESC, u.no_ujian DESC LIMIT 5`,
    sql`SELECT nis, nama, kelas, jurusan FROM tbl_siswa ORDER BY nis DESC LIMIT 5`,
    sql`SELECT * FROM tbl_sekolah ORDER BY id LIMIT 1`,
  ]);
  const hasil = Object.fromEntries(perHasil.map((r) => [r.hasil_ujian, r.jml]));
  const lulus = hasil.LULUS || 0;
  const tidak = hasil.TIDAK || 0;
  const stats = [
    ['blue', IconUsers, c.siswa, 'Total Siswa'],
    ['green', IconGuru, c.guru, 'Total Guru'],
    ['orange', IconBook, c.pelajaran, 'Mata Pelajaran'],
    ['cyan', IconExam, c.ujian, 'Hasil Ujian'],
  ];

  return (
    <AppLayout user={user} title="Dashboard">
      <div className="stat-grid">
        {stats.map(([color, Icon, value, label]) => (
          <div className="stat-card" key={label}>
            <div className={`stat-icon ${color}`}><Icon size={26} /></div>
            <div>
              <div className="stat-value">{value}</div>
              <div className="stat-label">{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header"><span className="card-title">Statistik Siswa per Jurusan</span></div>
          <div className="card-body chart-box">
            {perJurusan.length ? (
              <Chart type="bar" labels={perJurusan.map((r) => r.jurusan)} values={perJurusan.map((r) => r.jml)} />
            ) : (
              <p className="text-muted">Belum ada data siswa.</p>
            )}
          </div>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">Distribusi Hasil Ujian</span></div>
          <div className="card-body chart-box">
            {c.ujian > 0 ? (
              <Chart type="donut" labels={['Lulus', 'Tidak Lulus']} values={[lulus, tidak]} colors={['#16a34a', '#dc2626']} />
            ) : (
              <p className="text-muted">Belum ada data hasil ujian.</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Aktivitas Terbaru</span>
            <Link className="btn btn-sm btn-secondary" href="/ujian">Lihat Semua</Link>
          </div>
          <div className="card-body">
            <ul className="activity-list">
              {recentUjian.map((r) => (
                <li key={r.no_ujian}>
                  <span className="activity-dot" style={{ background: r.hasil_ujian === 'LULUS' ? '#16a34a' : '#dc2626' }}></span>
                  <div className="activity-text">
                    <div>
                      <strong>{r.nama_siswa ?? `Siswa ${r.nis}`}</strong> menyelesaikan ujian <strong>{r.no_ujian}</strong> — rata-rata {r.nilai_rata2}{' '}
                      <span className={`badge ${r.hasil_ujian === 'LULUS' ? 'badge-success' : 'badge-danger'}`}>{r.hasil_ujian}</span>
                    </div>
                    <div className="activity-meta">{tglId(r.tgl_ujian)}</div>
                  </div>
                </li>
              ))}
              {recentSiswa.slice(0, Math.max(0, 5 - recentUjian.length)).map((s) => (
                <li key={s.nis}>
                  <span className="activity-dot" style={{ background: '#4f46e5' }}></span>
                  <div className="activity-text">
                    <div>Siswa baru terdaftar: <strong>{s.nama}</strong> ({s.nis})</div>
                    <div className="activity-meta">Kelas {s.kelas} — {s.jurusan}</div>
                  </div>
                </li>
              ))}
              {!recentUjian.length && !recentSiswa.length && (
                <li><span className="text-muted">Belum ada aktivitas.</span></li>
              )}
            </ul>
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Profil Sekolah</span>
            <Link className="btn btn-sm btn-secondary" href="/sekolah">{sekolah ? 'Ubah' : 'Isi Profil'}</Link>
          </div>
          <div className="card-body">
            {sekolah ? (
              <>
                {sekolah.gambar && <img src={fotoUrl(sekolah.gambar)} className="detail-photo" style={{ marginBottom: 16 }} alt="Logo sekolah" />}
                <dl className="detail-grid">
                  <dt>Nama Sekolah</dt><dd>{sekolah.nama}</dd>
                  <dt>Alamat</dt><dd>{sekolah.alamat}</dd>
                  <dt>Akreditasi</dt><dd><span className="badge badge-info">{sekolah.akreditasi}</span></dd>
                  <dt>Status</dt><dd>{sekolah.status}</dd>
                  <dt>Email</dt><dd>{sekolah.email}</dd>
                  <dt>Visi &amp; Misi</dt><dd style={{ whiteSpace: 'pre-line' }}>{sekolah.visimisi}</dd>
                </dl>
              </>
            ) : (
              <p className="text-muted">Data profil sekolah belum diisi. <Link href="/sekolah">Isi sekarang</Link>.</p>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
