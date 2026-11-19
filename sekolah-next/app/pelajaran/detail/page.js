import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import NotFoundCard from '@/components/NotFound';
import { db } from '@/lib/db';
import { sp } from '@/lib/helpers';
import { requireLogin } from '@/lib/session';

export default async function PelajaranDetail({ searchParams }) {
  const user = await requireLogin();
  const id = parseInt(sp(await searchParams, 'id'), 10) || 0;
  const sql = await db();
  const [p] = await sql`SELECT * FROM tbl_pelajaran WHERE id = ${id}`;
  const title = 'Detail Mata Pelajaran';
  if (!p) return <AppLayout user={user} title={title}><NotFoundCard message="Data mata pelajaran tidak ditemukan." back="/pelajaran" /></AppLayout>;
  const [guru] = await sql`SELECT id FROM tbl_guru WHERE nama = ${p.guru} LIMIT 1`;
  return (
    <AppLayout user={user} title={title}>
      <div className="card" style={{ maxWidth: 640 }}>
        <div className="card-header"><span className="card-title">Detail Mata Pelajaran</span></div>
        <div className="card-body">
          <dl className="detail-grid">
            <dt>ID</dt><dd>{p.id}</dd>
            <dt>Pelajaran</dt><dd>{p.pelajaran}</dd>
            <dt>Jurusan</dt><dd><span className="badge badge-info">{p.jurusan}</span></dd>
            <dt>Guru Pengampu</dt>
            <dd>
              {guru ? (
                <Link href={`/guru/detail?id=${guru.id}`}>{p.guru}</Link>
              ) : (
                <>{p.guru} {p.guru !== '' && <span className="badge badge-muted">tidak terdaftar</span>}</>
              )}
            </dd>
          </dl>
          <div className="form-actions">
            <Link href={`/pelajaran/form?id=${p.id}`} className="btn btn-primary">Edit</Link>
            <Link href="/pelajaran" className="btn btn-secondary">Kembali</Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
