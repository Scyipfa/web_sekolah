'use client';
import Link from 'next/link';
import { useActionState, useState } from 'react';
import Errors from '@/components/Errors';
import SubmitButton from '@/components/SubmitButton';
import { saveUjian } from '../actions';

let uid = 0;
const withKeys = (rows) => rows.map((r) => ({ ...r, k: ++uid }));

function Fields({ values, noUjian, listSiswa, pelajaranPerJurusan, semuaPelajaran }) {
  const [nis, setNis] = useState(values.nis);
  const [rows, setRows] = useState(() => withKeys(values.rows));
  const jurusan = listSiswa.find((s) => s.nis === nis)?.jurusan ?? values.jurusan ?? '';
  const opts = pelajaranPerJurusan[jurusan] || semuaPelajaran;
  return (
    <>
      <div className="form-row">
        <div className="form-group">
          <label>No Ujian</label>
          <input type="text" value={noUjian || '(otomatis)'} disabled />
          <div className="form-hint">Nomor dibuat otomatis oleh sistem.</div>
        </div>
        <div className="form-group">
          <label htmlFor="tgl_ujian">Tanggal Ujian</label>
          <input type="date" id="tgl_ujian" name="tgl_ujian" required defaultValue={values.tgl_ujian} />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="nis">Siswa</label>
          <select id="nis" name="nis" required value={nis} onChange={(e) => setNis(e.target.value)}>
            <option value="">— Pilih Siswa —</option>
            {listSiswa.map((s) => (
              <option key={s.nis} value={s.nis}>{s.nis} — {s.nama} ({s.kelas})</option>
            ))}
          </select>
          {!listSiswa.length && (
            <div className="form-hint">Belum ada data siswa. <Link href="/siswa/form">Tambah siswa</Link> terlebih dahulu.</div>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="jurusanDisplay">Jurusan</label>
          <input type="text" id="jurusanDisplay" value={jurusan} disabled />
          <div className="form-hint">Otomatis mengikuti jurusan siswa.</div>
        </div>
      </div>
      <div className="form-group">
        <label>Nilai per Mata Pelajaran <span className="text-muted">(0–100)</span></label>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th style={{ width: '60%' }}>Mata Pelajaran</th><th>Nilai</th><th style={{ width: 50 }}></th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.k}>
                  <td><input type="text" name="pelajaran" maxLength={100} list="pelajaranList" defaultValue={r.pelajaran} placeholder="Nama pelajaran" required /></td>
                  <td><input type="number" name="nilai" min={0} max={100} step={1} defaultValue={r.nilai_ujian} placeholder="0–100" required /></td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      title="Hapus baris"
                      onClick={() => setRows((rs) => (rs.length > 1 ? rs.filter((x) => x.k !== r.k) : withKeys([{ pelajaran: '', nilai_ujian: '' }])))}
                    >
                      &times;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <datalist id="pelajaranList">
          {opts.map((p) => <option key={p} value={p} />)}
        </datalist>
        <button type="button" className="btn btn-secondary btn-sm" style={{ marginTop: 10 }} onClick={() => setRows((rs) => [...rs, ...withKeys([{ pelajaran: '', nilai_ujian: '' }])])}>
          + Tambah Pelajaran
        </button>
        <div className="form-hint">Agregat (total, terendah, tertinggi, rata-rata, hasil) dihitung otomatis saat disimpan.</div>
      </div>
    </>
  );
}

export default function UjianForm({ initial, noUjian, ...lists }) {
  const [state, action] = useActionState(saveUjian, { errors: [], values: initial, n: 0 });
  return (
    <>
      <Errors errors={state.errors} />
      <form action={action} key={state.n}>
        <input type="hidden" name="no_ujian" value={noUjian} />
        <Fields values={state.values} noUjian={noUjian} {...lists} />
        <div className="form-actions">
          <SubmitButton>Simpan &amp; Hitung Hasil</SubmitButton>
          <Link href="/ujian" className="btn btn-secondary">Batal</Link>
        </div>
      </form>
    </>
  );
}
