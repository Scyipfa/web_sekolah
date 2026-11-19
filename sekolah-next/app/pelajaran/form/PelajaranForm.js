'use client';
import Link from 'next/link';
import { useActionState } from 'react';
import Errors from '@/components/Errors';
import SubmitButton from '@/components/SubmitButton';
import { savePelajaran } from '../actions';

export default function PelajaranForm({ initial, id, jurusanList, guruList }) {
  const [state, action] = useActionState(savePelajaran, { errors: [], values: initial, n: 0 });
  const v = state.values;
  return (
    <>
      <Errors errors={state.errors} />
      <form action={action} key={state.n}>
        <input type="hidden" name="id" value={id} />
        <div className="form-group">
          <label htmlFor="pelajaran">Nama Mata Pelajaran</label>
          <input type="text" id="pelajaran" name="pelajaran" required maxLength={50} defaultValue={v.pelajaran} />
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
        <div className="form-group">
          <label htmlFor="guru">Guru Pengampu</label>
          <select id="guru" name="guru" defaultValue={v.guru}>
            <option value="">— Pilih Guru —</option>
            {guruList.map((g, i) => <option key={i} value={g}>{g}</option>)}
            {v.guru && !guruList.includes(v.guru) && <option value={v.guru}>{v.guru} (tidak terdaftar)</option>}
          </select>
          <div className="form-hint">Daftar diambil dari Data Guru. Tambahkan guru terlebih dahulu bila belum ada.</div>
        </div>
        <div className="form-actions">
          <SubmitButton>Simpan</SubmitButton>
          <Link href="/pelajaran" className="btn btn-secondary">Batal</Link>
        </div>
      </form>
    </>
  );
}
