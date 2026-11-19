'use client';
import { useActionState } from 'react';
import Errors from '@/components/Errors';
import PasswordInput from '@/components/PasswordInput';
import SubmitButton from '@/components/SubmitButton';
import { fotoUrl } from '@/lib/helpers';
import { changePassword, saveProfile } from './actions';

export default function ProfileForms({ user }) {
  const [p, profileAction] = useActionState(saveProfile, { errors: [], values: user, n: 0 });
  const [pw, passwordAction] = useActionState(changePassword, { errors: [], n: 0 });
  const v = p.values;
  return (
    <>
      <Errors errors={[...p.errors, ...pw.errors]} />
      <div className="grid-2">
        <div className="card">
          <div className="card-header"><span className="card-title">Informasi Akun</span></div>
          <div className="card-body">
            <form action={profileAction} key={p.n}>
              <div className="form-group" style={{ textAlign: 'center' }}>
                <img className="detail-photo" src={fotoUrl(user.foto)} alt="Foto profil" style={{ margin: '0 auto 10px' }} />
              </div>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input type="text" id="username" name="username" required maxLength={50} defaultValue={v.username} />
              </div>
              <div className="form-group">
                <label htmlFor="nama">Nama Lengkap</label>
                <input type="text" id="nama" name="nama" required maxLength={128} defaultValue={v.nama} />
              </div>
              <div className="form-group">
                <label htmlFor="jabatan">Jabatan</label>
                <input type="text" id="jabatan" name="jabatan" maxLength={128} defaultValue={v.jabatan} />
              </div>
              <div className="form-group">
                <label htmlFor="alamat">Alamat</label>
                <textarea id="alamat" name="alamat" rows={3} maxLength={128} defaultValue={v.alamat}></textarea>
              </div>
              <div className="form-group">
                <label htmlFor="foto">Ganti Foto <span className="text-muted">(opsional, maks. 2 MB)</span></label>
                <input type="file" id="foto" name="foto" accept="image/*" />
              </div>
              <div className="form-actions"><SubmitButton>Simpan Profil</SubmitButton></div>
            </form>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">Ubah Password</span></div>
          <div className="card-body">
            <form action={passwordAction} key={pw.n}>
              <div className="form-group">
                <label htmlFor="old_password">Password Lama</label>
                <PasswordInput id="old_password" name="old_password" required />
              </div>
              <div className="form-group">
                <label htmlFor="new_password">Password Baru <span className="text-muted">(min. 6 karakter)</span></label>
                <PasswordInput id="new_password" name="new_password" required minLength={6} />
              </div>
              <div className="form-group">
                <label htmlFor="confirm_password">Konfirmasi Password Baru</label>
                <PasswordInput id="confirm_password" name="confirm_password" required minLength={6} />
              </div>
              <div className="form-actions"><SubmitButton>Ubah Password</SubmitButton></div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
