<?php

require_once __DIR__ . '/../lib/boot.php';

use Photobooth\Enum\FolderEnum;
use Photobooth\Utility\PathUtility;
use Photobooth\Utility\QrCodeUtility;

header('Content-Type: application/json; charset=utf-8');

$tmpDir = realpath(FolderEnum::TEMP->absolute()) ?: FolderEnum::TEMP->absolute();
$orderFile = $tmpDir . DIRECTORY_SEPARATOR . 'kiosk_orders.json';

function getOrders($file) {
    if (file_exists($file)) {
        $content = @file_get_contents($file);
        $data = json_decode($content, true);
        if (is_array($data)) return $data;
    }
    return [];
}

function saveOrders($file, $orders) {
    @file_put_contents($file, json_encode($orders, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

$action = $_GET['action'] ?? ($_POST['action'] ?? 'status');

if ($action === 'create') {
    $orderId = 'ORD_' . date('YmdHis') . '_' . rand(1000, 9999);
    $mode = $_POST['mode'] ?? 'classic';
    $amount = ($mode === 'ai_swap') ? '29.90' : '19.90';
    $modeName = ($mode === 'ai_swap') ? 'AI 魔法变身照' : '经典美颜大头贴 (人生四格)';

    $orders = getOrders($orderFile);
    $orders[$orderId] = [
        'order_id' => $orderId,
        'mode' => $mode,
        'mode_name' => $modeName,
        'amount' => $amount,
        'status' => 'pending', // 'pending' | 'paid' | 'cancelled'
        'created_at' => time(),
    ];
    saveOrders($orderFile, $orders);

    echo json_encode([
        'success' => true,
        'order_id' => $orderId,
        'amount' => $amount,
        'mode_name' => $modeName,
        'qr_wechat' => 'api/qrcode.php?filename=mock_wx_' . $orderId,
        'qr_alipay' => 'api/qrcode.php?filename=mock_ali_' . $orderId,
        'message' => '支付开闸订单已创建'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($action === 'status') {
    $orderId = $_GET['order_id'] ?? '';
    if (empty($orderId)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => '缺少 order_id']);
        exit;
    }
    $orders = getOrders($orderFile);
    $order = $orders[$orderId] ?? null;
    if (!$order) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => '未找到该订单']);
        exit;
    }
    echo json_encode([
        'success' => true,
        'order_id' => $orderId,
        'status' => $order['status'],
        'paid' => ($order['status'] === 'paid'),
    ]);
    exit;
}

if ($action === 'mock_pay') {
    $orderId = $_POST['order_id'] ?? ($_GET['order_id'] ?? '');
    $orders = getOrders($orderFile);
    if (isset($orders[$orderId])) {
        $orders[$orderId]['status'] = 'paid';
        $orders[$orderId]['paid_at'] = time();
        saveOrders($orderFile, $orders);
        echo json_encode([
            'success' => true,
            'order_id' => $orderId,
            'status' => 'paid',
            'message' => '支付成功！照相亭已开闸。'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => '订单未找到']);
    exit;
}

http_response_code(400);
echo json_encode(['error' => '未知操作']);
