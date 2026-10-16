<?php

require_once __DIR__ . '/../lib/boot.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed'], JSON_UNESCAPED_UNICODE);
    exit;
}

if (!isset($_FILES['template']) || $_FILES['template']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['error' => '请选择需要上传的模板图片文件'], JSON_UNESCAPED_UNICODE);
    exit;
}

$file = $_FILES['template'];
$allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
$extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

if (!in_array($extension, $allowedExtensions)) {
    echo json_encode(['error' => '不支持的图片格式，仅支持 JPG、PNG、WEBP 格式'], JSON_UNESCAPED_UNICODE);
    exit;
}

// 目标目录：resources/img/templates_ai/custom/
$targetDir = realpath(__DIR__ . '/../resources/img/templates_ai/custom');
if (!$targetDir) {
    $targetDir = __DIR__ . '/../resources/img/templates_ai/custom';
    if (!is_dir($targetDir)) {
        mkdir($targetDir, 0777, true);
    }
}

$rawTitle = pathinfo($file['name'], PATHINFO_FILENAME);
$cleanTitle = mb_substr(trim(preg_replace('/[^\p{L}\p{N}_\-\s]/u', '', $rawTitle)), 0, 20);
if (empty($cleanTitle)) {
    $cleanTitle = '自定义写真_' . date('md');
}

$newId = 'custom_' . time() . '_' . substr(md5(uniqid()), 0, 6);
$newFilename = $newId . '.' . $extension;
$targetPath = $targetDir . DIRECTORY_SEPARATOR . $newFilename;

if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
    echo json_encode(['error' => '保存上传模板图片失败，请检查文件写入权限'], JSON_UNESCAPED_UNICODE);
    exit;
}

// AI 正脸五官质量预检（调用 faceswap_core 检测是否有清晰正脸）
$projectRoot = dirname(__DIR__);
$checkScript = sprintf(
    'python -X utf8 -c "import sys, json; sys.path.insert(0, %s); from bin.faceswap_core import FaceSwapEngine; e=FaceSwapEngine(); import cv2; img=cv2.imread(sys.argv[1]); faces=e.detect_faces(img) if img is not None else []; has_face=len(faces)>0; ok=False; msg=\"\";'
    . ' (ok, msg)=e.check_face_pose(faces[0][\"kps\"]) if has_face else (False, \"未检测到人脸\");'
    . ' print(json.dumps({\"has_face\": has_face, \"pose_ok\": ok, \"msg\": msg}))" %s',
    var_export($projectRoot, true),
    escapeshellarg($targetPath)
);

exec($checkScript, $checkOutput, $checkCode);
$faceVerified = false;
$poseNote = '';
if ($checkCode === 0 && !empty($checkOutput)) {
    $checkRes = json_decode(implode("\n", $checkOutput), true);
    if ($checkRes && !empty($checkRes['has_face'])) {
        $faceVerified = true;
        if (!empty($checkRes['pose_ok'])) {
            $poseNote = '正脸基准合格';
        } else {
            $poseNote = $checkRes['msg'] ?? '侧脸偏角较大，可能影响对齐';
        }
    }
}

if (!$faceVerified) {
    @unlink($targetPath);
    echo json_encode([
        'error' => '未能从该图片中识别到清晰人脸五官，请上传正面或微侧半身写真肖像！'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// 写入数据持久化索引库 data/ai_templates_custom.json
$jsonFile = __DIR__ . '/../data/ai_templates_custom.json';
$customList = [];
if (file_exists($jsonFile)) {
    $customList = json_decode(file_get_contents($jsonFile), true) ?: [];
}

$relPath = 'resources/img/templates_ai/custom/' . $newFilename;
$newRecord = [
    'id' => $newId,
    'title' => $cleanTitle,
    'category' => 'custom',
    'sex' => '自定义',
    'sex_code' => 'unisex',
    'tag' => '我的写真',
    'thumb' => $relPath,
    'image' => $relPath,
    'url' => $relPath,
    'pose_note' => $poseNote,
    'created_at' => date('Y-m-d H:i:s'),
];

array_unshift($customList, $newRecord);
file_put_contents($jsonFile, json_encode($customList, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

// 同步到发布目录（若存在）
$runtimeDir = 'C:\\Users\\WS\\Desktop\\photobooth美颜版\\resources\\img\\templates_ai\\custom';
if (is_dir(dirname($runtimeDir))) {
    if (!is_dir($runtimeDir)) {
        @mkdir($runtimeDir, 0777, true);
    }
    @copy($targetPath, $runtimeDir . DIRECTORY_SEPARATOR . $newFilename);
    $runtimeJson = 'C:\\Users\\WS\\Desktop\\photobooth美颜版\\data\\ai_templates_custom.json';
    @copy($jsonFile, $runtimeJson);
}

echo json_encode([
    'success' => true,
    'id' => $newId,
    'title' => $cleanTitle,
    'category' => 'custom',
    'sex' => '自定义',
    'sex_code' => 'unisex',
    'tag' => '我的写真',
    'thumb' => $relPath,
    'image' => $relPath,
    'url' => $relPath,
    'path' => $relPath,
    'message' => '自定义写真模板添加成功！' . ($poseNote ? " ($poseNote)" : '')
], JSON_UNESCAPED_UNICODE);
