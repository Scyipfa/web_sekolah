<?php
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/functions.php';

redirect(is_logged_in() ? BASE_URL . '/pages/dashboard.php' : BASE_URL . '/login.php');
