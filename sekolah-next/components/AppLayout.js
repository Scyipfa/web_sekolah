import { readFlash } from '@/lib/flash';
import { APP_NAME } from '@/lib/helpers';
import Flash from './Flash';
import Shell from './Shell';

export default async function AppLayout({ user, title, children }) {
  const messages = await readFlash();
  return (
    <Shell user={user} title={title}>
      <title>{`${title} — ${APP_NAME}`}</title>
      <Flash messages={messages} />
      {children}
    </Shell>
  );
}
