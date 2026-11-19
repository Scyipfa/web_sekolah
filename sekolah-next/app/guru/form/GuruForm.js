'use client';
import Link from 'next/link';
import { useActionState } from 'react';
import Errors from '@/components/Errors';
import SubmitButton from '@/components/SubmitButton';
import { fotoUrl } from '@/lib/helpers';
import { saveGuru } from '../actions';

const AGAMA = ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu'];

export default function GuruForm({ initial, id }) {
  const [state, action] = useActionState(saveGuru, { errors: [], values: initial, n: 0 });
  const v = state.values;
  return (
    <>
      <Errors errors={state.errors} />
      <form action={action} key={state.n}>
        <input type="hidden" name="id" value={id} />
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="nip">NIP</label>
            <input type="text" id="nip" name="nip" required maxLength={30} defaultValue={v.nip} />
          </div>
          <div className="form-group">
            <label htmlFor="nama">Nama Lengkap</label>
            <input type="text" id="nama" name="nama" required maxLength={100} defaultValue={v.nama} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="telepon">Telepon</label>
            <input type="text" id="telepon" name="telepon" maxLength={20} defaultValue={v.telepon} />
          </div>
          <div className="form-group">
            <label htmlFor="agama">Agama</label>
            <select id="agama" name="agama" defaultValue={v.agama}>
              <option value="">— Pilih —</option>
              {AGAMA.map((a) => <option key={a} value={a}>{a}</option>)}
              {v.agama && !AGAMA.includes(v.agama) && <option value={v.agama}>{v.agama}</option>}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="alamat">Alamat</label>
          <textarea id="alamat" name="alamat" rows={3} maxLength={128} defaultValue={v.alamat}></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="foto">Foto <span className="text-muted">(opsional, maks. 2 MB)</span></label>
          {initial.foto && <img className="foto-preview" src={fotoUrl(initial.foto)} alt="" />}
          <input type="file" id="foto" name="foto" accept="image/*" />
        </div>
        <div className="form-actions">
          <SubmitButton>Simpan</SubmitButton>
          <Link href="/guru" className="btn btn-secondary">Batal</Link>
        </div>
      </form>
    </>
  );
}
