<?php
// Sidebar navigasi utama. Membutuhkan functions.php (nav_active).
?>
<aside class="sidebar" id="sidebar">
    <div class="sidebar-brand">
        <img src="<?= BASE_URL ?>/LOGOSMK1.png" alt="Logo SMK" class="brand-logo">
        <span>SMK Negeri 1 Palangka Raya</span>
    </div>
    <nav class="sidebar-nav">
        <a href="<?= BASE_URL ?>/pages/dashboard.php" class="nav-link<?= nav_active('dashboard') ?>">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>
            Dashboard
        </a>
        <a href="<?= BASE_URL ?>/pages/siswa/index.php" class="nav-link<?= nav_active('/siswa/') ?>">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            Data Siswa
        </a>
        <a href="<?= BASE_URL ?>/pages/guru/index.php" class="nav-link<?= nav_active('/guru/') ?>">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 18v3"/><circle cx="12" cy="9" r="2"/><path d="M9 13c.7-1 1.8-1.5 3-1.5s2.3.5 3 1.5"/></svg>
            Data Guru
        </a>
        <a href="<?= BASE_URL ?>/pages/pelajaran/index.php" class="nav-link<?= nav_active('/pelajaran/') ?>">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            Mata Pelajaran
        </a>
        <a href="<?= BASE_URL ?>/pages/jurusan/index.php" class="nav-link<?= nav_active('/jurusan/') ?>">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            Data Jurusan
        </a>
        <a href="<?= BASE_URL ?>/pages/ujian/index.php" class="nav-link<?= nav_active('/ujian/') ?>">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9 15l2 2 4-4"/></svg>
            Hasil Ujian
        </a>
        <a href="<?= BASE_URL ?>/pages/sekolah.php" class="nav-link<?= nav_active('sekolah.php') ?>">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg>
            Profil Sekolah
        </a>
        <div class="nav-separator"></div>
        <a href="<?= BASE_URL ?>/pages/profile.php" class="nav-link<?= nav_active('profile.php') ?>">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Profile
        </a>
        <a href="<?= BASE_URL ?>/logout.php" class="nav-link nav-logout" data-confirm="Yakin ingin keluar?">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>
            Logout
        </a>
    </nav>
</aside>
<div class="sidebar-overlay" id="sidebarOverlay"></div>
