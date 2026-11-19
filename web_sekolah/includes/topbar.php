<?php
// Topbar: tombol sidebar (mobile), judul halaman, info user.
// NB: jangan pakai nama variabel umum ($u) agar tidak menimpa variabel halaman.
$_tbUser = current_user();
?>
<header class="topbar">
    <button class="icon-btn" id="sidebarToggle" aria-label="Menu">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
    </button>
    <h2 class="topbar-title"><?= e($page_title ?? '') ?></h2>
    <div class="topbar-user">
        <img src="<?= foto_url($_tbUser['foto'] ?? '') ?>" alt="Foto profil" class="topbar-avatar">
        <div class="topbar-user-info">
            <span class="topbar-name"><?= e($_tbUser['nama'] ?? '') ?></span>
            <span class="topbar-role"><?= e($_tbUser['jabatan'] ?? '') ?></span>
        </div>
    </div>
</header>
