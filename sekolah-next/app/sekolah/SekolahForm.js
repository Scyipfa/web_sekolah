'use client';
import Link from 'next/link';
import { useActionState } from 'react';
import Errors from '@/components/Errors';
import SubmitButton from '@/components/SubmitButton';
import { fotoUrl } from '@/lib/helpers';
import { saveSekolah } from './actions';

export default function SekolahForm({ initial }) {
  const [state, action] = useActionState(saveSekolah, { errors: [], values: initial, n: 0 });
  const v = state.values;
  return (
    <>
      <Errors errors={state.errors} />
      <form action={action} key={state.n}>
        <div className="form-group">
          <label htmlFor="nama">Nama Sekolah</label>
          <input type="text" id="nama" name="nama" required maxLength={128} defaultValue={v.nama} />
        </div>
        <div className="form-group">
          <label htmlFor="alamat">Alamat</label>
          <input type="text" id="alamat" name="alamat" maxLength={128} defaultValue={v.alamat} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="akreditasi">Akreditasi</label>
            <input type="text" id="akreditasi" name="akreditasi" maxLength={1} defaultValue={v.akreditasi} placeholder="A/B/C" />
          </div>
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <input type="text" id="status" name="status" maxLength={10} defaultValue={v.status} placeholder="Negeri" />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" maxLength={100} defaultValue={v.email} />
        </div>
        <div className="form-group">
          <label htmlFor="visimisi">Visi &amp; Misi</label>
          <textarea id="visimisi" name="visimisi" rows={5} defaultValue={v.visimisi}></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="gambar">Gambar/Logo Sekolah</label>
          {initial.gambar && <img className="foto-preview" src={fotoUrl(initial.gambar)} alt="" />}
          <input type="file" id="gambar" name="gambar" accept="image/jpeg,image/png,image/gif,image/webp" />
        </div>
        <div className="form-actions">
          <SubmitButton>Simpan</SubmitButton>
          <Link href="/dashboard" className="btn btn-secondary">Batal</Link>
        </div>
      </form>
    </>
  );
}
