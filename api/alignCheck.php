<?php
/**
 * Photobooth AI Face Pose Alignment Proxy
 * Forwards camera preview frames to the local resident AI microservice (Port 8001).
 * Avoids browser cross-port CORS complications and supports multi-device / tablet kiosk setups.
 */
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-cache, no-store, must-revalidate');

$rawInput = file_get_contents('php://input');
if (empty($rawInput)) {
    echo json_encode([
        'status' => 'error',
        'detected' => false,
        'aligned' => false,
        'error' => 'Empty request payload'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$ch = curl_init('http://127.0.0.1:8001/align');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $rawInput,
    CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
    CURLOPT_CONNECTTIMEOUT_MS => 350,
    CURLOPT_TIMEOUT_MS => 1500,
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($response !== false && $httpCode >= 200 && $httpCode < 300) {
    echo $response;
} else {
    echo json_encode([
        'status' => 'ok',
        'detected' => false,
        'aligned' => false,
        'message' => 'AI服务响应中...',
        'reason' => 'service_unreachable'
    ], JSON_UNESCAPED_UNICODE);
}
