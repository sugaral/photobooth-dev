<?php

require_once __DIR__ . '/../lib/boot.php';

header('Content-Type: application/json');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');

echo json_encode([
    'key' => 'csrf',
    'token' => $_SESSION['csrf'] ?? '',
]);

exit();
