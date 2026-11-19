'use server';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { flash } from '@/lib/flash';
import { byteLen, errMsg, str } from '@/lib/helpers';
import { listJurusan } from '@/lib/lists';
import { requireLogin } from '@/lib/session';
import { deleteFile, uploadFoto } from '@/lib/upload';

export async function saveSiswa(prev, formData) {
  await requireLogin();
  const sql = await db();
  const orig = str(formData.get('orig_nis'));
  const edit = orig !== '';
  const d = {
    nis: str(formData.get('nis')),
    nama: str(formData.get('nama')),
    alamat: str(formData.get('alamat')),
    kelas: str(formData.get('kelas')),
    jurusan: str(formData.get('jurusan')),
  };
  let old = null;
  if (edit) {
    [old] = await sql`SELECT * FROM tbl_siswa WHERE nis = ${orig}`;
    if (!old) {
      await flash('danger', 'Data siswa tidak ditemukan.');
      redirect('/siswa');
    }
  }
  const jurusanList = await listJurusan(sql);
  const errors = [];
  if (!d.nis || byteLen(d.nis) > 6) errors.push('NIS wajib diisi (maksimal 6 karakter).');
  if (!d.nama || byteLen(d.nama) > 100) errors.push('Nama wajib diisi (maks. 100 karakter).');
  if (!d.kelas || byteLen(d.kelas) > 3) errors.push('Kelas wajib diisi (maks. 3 karakter).');
  if (!d.jurusan || byteLen(d.jurusan) > 50) errors.push('Jurusan wajib diisi (maks. 50 karakter).');
  else if (!jurusanList.includes(d.jurusan)) errors.push('Jurusan tidak terdaftar — tambahkan dulu lewat menu Data Jurusan.');
  if (byteLen(d.alamat) > 128) errors.push('Alamat maksimal 128 karakter.');
  if (!errors.length) {
    const [{ n }] = await sql`SELECT COUNT(*)::int AS n FROM tbl_siswa WHERE nis = ${d.nis} AND nis <> ${orig}`;
    if (n > 0) errors.push('NIS sudah digunakan siswa lain.');
  }
  if (errors.length) return { errors, values: d, n: Date.now() };

  const foto = await uploadFoto(sql, formData.get('foto'), old?.foto || '');
  if (edit) {
    try {
      await sql.begin(async (tx) => {
        await tx`UPDATE tbl_siswa SET nis=${d.nis}, nama=${d.nama}, alamat=${d.alamat}, kelas=${d.kelas}, jurusan=${d.jurusan}, foto=${foto} WHERE nis=${orig}`;
        if (d.nis !== orig) await tx`UPDATE tbl_ujian SET nis=${d.nis} WHERE nis=${orig}`;
      });
      await flash('success', 'Data siswa berhasil diperbarui.');
    } catch (e) {
      return { errors: ['Gagal memperbarui data: ' + errMsg(e)], values: d, n: Date.now() };
    }
  } else {
    await sql`INSERT INTO tbl_siswa (nis, nama, alamat, kelas, jurusan, foto) VALUES (${d.nis}, ${d.nama}, ${d.alamat}, ${d.kelas}, ${d.jurusan}, ${foto})`;
    await flash('success', 'Siswa baru berhasil ditambahkan.');
  }
  redirect('/siswa');
}

export async function deleteSiswa(formData) {
  await requireLogin();
  const sql = await db();
  const nis = str(formData.get('nis'));
  const cascade = !!formData.get('cascade');
  const [s] = await sql`SELECT * FROM tbl_siswa WHERE nis = ${nis}`;
  if (!s) {
    await flash('danger', 'Data siswa tidak ditemukan.');
    redirect('/siswa');
  }
  const [{ n }] = await sql`SELECT COUNT(*)::int AS n FROM tbl_ujian WHERE nis = ${nis}`;
  if (n > 0 && !cascade) {
    await flash('warning', `Siswa memiliki ${n} data ujian. Centang opsi hapus data terkait untuk melanjutkan.`);
    redirect(`/siswa/delete?nis=${encodeURIComponent(nis)}`);
  }
  try {
    await sql.begin(async (tx) => {
      if (cascade && n > 0) {
        await tx`DELETE FROM tbl_nilai_ujian WHERE no_ujian IN (SELECT no_ujian FROM tbl_ujian WHERE nis = ${nis})`;
        await tx`DELETE FROM tbl_ujian WHERE nis = ${nis}`;
      }
      await tx`DELETE FROM tbl_siswa WHERE nis = ${nis}`;
      await deleteFile(tx, s.foto);
    });
    await flash('success', `Data siswa ${s.nama} berhasil dihapus.`);
  } catch (e) {
    await flash('danger', 'Gagal menghapus data: ' + errMsg(e));
  }
  redirect('/siswa');
}
