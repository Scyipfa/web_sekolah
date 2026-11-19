'use client';
import Link from 'next/link';
import { useActionState } from 'react';
import Errors from '@/components/Errors';
import SubmitButton from '@/components/SubmitButton';
import { saveJurusan } from '../actions';

export default function JurusanForm({ old }) {
  const [state, action] = useActionState(saveJurusan, { errors: [], value: old, n: 0 });
  return (
    <>
      <Errors errors={state.errors} />
      <form action={action} key={state.n}>
        <input type="hidden" name="old" value={old} />
        <div className="form-group">
          <label htmlFor="jurusan">Nama Jurusan</label>
          <input type="text" id="jurusan" name="jurusan" required maxLength={50} defaultValue={state.value} placeholder="mis. RPL 3" />
        </div>
        {old && (
          <div className="alert alert-info">Mengubah nama jurusan akan ikut memperbarui jurusan pada data siswa, mata pelajaran, dan hasil ujian terkait.</div>
        )}
        <div className="form-actions">
          <SubmitButton>Simpan</SubmitButton>
          <Link href="/jurusan" className="btn btn-secondary">Batal</Link>
        </div>
      </form>
    </>
  );
}
