<?php

require_once __DIR__ . '/../lib/boot.php';

use Photobooth\Service\ScreensaverMediaService;

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    header('Allow: GET');
    exit(json_encode(['error' => 'Method not allowed']));
}

// This list contains only operator-selected display media, never guest photos.
echo json_encode(['images' => ScreensaverMediaService::images()], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
