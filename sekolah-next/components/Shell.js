'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { APP_NAME, fotoUrl } from '@/lib/helpers';
import { IconBook, IconDashboard, IconExam, IconGuru, IconHome, IconLayers, IconLogout, IconMenu, IconUser, IconUsers } from './Icons';

const NAV = [
  ['/dashboard', 'Dashboard', IconDashboard],
  ['/siswa', 'Data Siswa', IconUsers],
  ['/guru', 'Data Guru', IconGuru],
  ['/pelajaran', 'Mata Pelajaran', IconBook],
  ['/jurusan', 'Data Jurusan', IconLayers],
  ['/ujian', 'Hasil Ujian', IconExam],
  ['/sekolah', 'Profil Sekolah', IconHome],
];

export default function Shell({ user, title, children }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);
  const active = (href) => (pathname === href || pathname.startsWith(href + '/') ? ' active' : '');

  return (
    <>
      <aside className={`sidebar${open ? ' open' : ''}`} id="sidebar">
        <div className="sidebar-brand">
          <img src="/LOGOSMK1.png" alt="Logo SMK" className="brand-logo" />
          <span>SMK Negeri 1 Palangka Raya</span>
        </div>
        <nav className="sidebar-nav">
          {NAV.map(([href, label, Icon]) => (
            <Link key={href} href={href} className={`nav-link${active(href)}`}>
              <Icon />
              {label}
            </Link>
          ))}
          <div className="nav-separator"></div>
          <Link href="/profile" className={`nav-link${active('/profile')}`}>
            <IconUser />
            Profile
          </Link>
          <a
            href="/logout"
            className="nav-link nav-logout"
            onClick={(e) => {
              if (!window.confirm('Yakin ingin keluar?')) e.preventDefault();
            }}
          >
            <IconLogout />
            Logout
          </a>
        </nav>
      </aside>
      <div className={`sidebar-overlay${open ? ' show' : ''}`} onClick={() => setOpen(false)}></div>
      <div className="main">
        <header className="topbar">
          <button className="icon-btn" aria-label="Menu" onClick={() => setOpen((o) => !o)}>
            <IconMenu />
          </button>
          <h2 className="topbar-title">{title}</h2>
          <div className="topbar-user">
            <img src={fotoUrl(user?.foto)} alt="Foto profil" className="topbar-avatar" />
            <div className="topbar-user-info">
              <span className="topbar-name">{user?.nama}</span>
              <span className="topbar-role">{user?.jabatan}</span>
            </div>
          </div>
        </header>
        <main className="content">{children}</main>
        <footer className="footer">
          <span>
            &copy; {new Date().getFullYear()} {APP_NAME}
          </span>
        </footer>
      </div>
    </>
  );
}
