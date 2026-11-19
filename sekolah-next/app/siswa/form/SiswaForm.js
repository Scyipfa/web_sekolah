'use client';
import Link from 'next/link';
import { useActionState } from 'react';
import Errors from '@/components/Errors';
import SubmitButton from '@/components/SubmitButton';
import { fotoUrl } from '@/lib/helpers';
import { saveSiswa } from '../actions';

export default function SiswaForm({ initial, origNis, kelasList, jurusanList }) {
  const [state, action] = useActionState(saveSiswa, { errors: [], values: initial, n: 0 });
  const v = state.values;
  const kelasOpts = [...new Set([...kelasList, 'X', 'XI', 'XII'])];
  return (
    <>
      <Errors errors={state.errors} />
      <form action={action} key={state.n}>
        <input type="hidden" name="orig_nis" value={origNis} />
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="nis">NIS <span className="text-muted">(maks. 6 karakter)</span></label>
            <input type="text" id="nis" name="nis" required maxLength={6} defaultValue={v.nis} />
          </div>
          <div className="form-group">
            <label htmlFor="nama">Nama Lengkap</label>
            <input type="text" id="nama" name="nama" required maxLength={100} defaultValue={v.nama} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="kelas">Kelas <span className="text-muted">(maks. 3 karakter, mis. XII)</span></label>
            <input type="text" id="kelas" name="kelas" required maxLength={3} list="kelasList" defaultValue={v.kelas} />
            <datalist id="kelasList">
              {kelasOpts.map((k) => <option key={k} value={k} />)}
            </datalist>
          </div>
          <div className="form-group">
            <label htmlFor="jurusan">Jurusan</label>
            <select id="jurusan" name="jurusan" required defaultValue={v.jurusan}>
              <option value="">— Pilih Jurusan —</option>
              {jurusanList.map((j) => <option key={j} value={j}>{j}</option>)}
              {v.jurusan && !jurusanList.includes(v.jurusan) && <option value={v.jurusan}>{v.jurusan} (tidak terdaftar)</option>}
            </select>
            <div className="form-hint">Daftar diambil dari Data Jurusan.</div>
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
          <Link href="/siswa" className="btn btn-secondary">Batal</Link>
        </div>
      </form>
    </>
  );
}
