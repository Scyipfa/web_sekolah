import { redirect } from 'next/navigation';
import Flash from '@/components/Flash';
import { readFlash } from '@/lib/flash';
import { APP_NAME } from '@/lib/helpers';
import { currentUser } from '@/lib/session';
import LoginForm from './LoginForm';

export const metadata = { title: `Login — ${APP_NAME}` };

export default async function LoginPage() {
  if (await currentUser()) redirect('/dashboard');
  const messages = await readFlash();
  return (
    <div
      className="login-page"
      style={{ backgroundImage: "linear-gradient(rgba(15,23,42,.55), rgba(15,23,42,.6)), url('/foto_sekolah.jpg')" }}
    >
      <div className="login-card">
        <div className="login-brand">
          <img src="/LOGOSMK1.png" alt="Logo SMK Negeri 1 Palangka Raya" className="login-logo" />
          <h1>SMK Negeri 1 Palangka Raya</h1>
          <p>Masuk untuk mengelola data sekolah</p>
        </div>
        <Flash messages={messages} />
        <LoginForm />
      </div>
    </div>
  );
}
