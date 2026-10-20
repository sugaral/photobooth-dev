<?php

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');

$targetHost = 'www.baidu.com';
$online = false;
$latencyMs = null;
$startTime = microtime(true);

$fp = @fsockopen($targetHost, 80, $errno, $errstr, 2.0);
if ($fp) {
    fclose($fp);
    $online = true;
    $latencyMs = round((microtime(true) - $startTime) * 1000);
}

echo json_encode([
    'online' => $online,
    'latency' => $latencyMs,
    'target' => $targetHost,
    'timestamp' => time()
]);
exit();
