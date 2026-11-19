import { redirect } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { db } from '@/lib/db';
import { requireLogin } from '@/lib/session';
import ProfileForms from './ProfileForms';

export default async function ProfilePage() {
  const me = await requireLogin();
  const sql = await db();
  const [u] = await sql`SELECT id, username, nama, alamat, jabatan, foto FROM tbl_user WHERE id = ${me.id}`;
  if (!u) redirect('/logout');
  return (
    <AppLayout user={me} title="Profile">
      <ProfileForms user={{ ...u }} />
    </AppLayout>
  );
}
