import './globals.css';
import { APP_NAME } from '@/lib/helpers';

export const metadata = { title: APP_NAME };

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
