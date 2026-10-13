<?php

require_once '../lib/boot.php';

header('Content-Type: application/json');

$templates = [];

// Built-in special templates
$templates[] = [
    'id' => 'transparent',
    'name' => '透明背景 (PNG)',
    'thumbnail' => 'resources/img/templates/transparent.png',
    'path' => 'transparent',
    'type' => 'builtin'
];

$builtinDir = realpath(__DIR__ . '/../resources/img/templates');
if ($builtinDir && is_dir($builtinDir)) {
    $files = scandir($builtinDir);
    $friendlyNames = [
        'beach_sunset.jpg' => '海滩日落',
        'cyberpunk_neon.jpg' => '赛博朋克',
        'cosmic_space.jpg' => '璀璨星空',
        'nature_forest.jpg' => '自然森林',
        'studio_light.jpg' => '高级影棚',
        'id_red.png' => '标准红底',
        'id_blue.png' => '标准蓝底',
        'id_white.png' => '标准白底',
        'bg_scene_01.jpg' => '优雅派对',
        'bg_scene_02.jpg' => '城市天际',
        'bg_scene_03.jpg' => '阳光庄园',
        'bg_scene_04.jpg' => '炫彩光斑',
        'bg_scene_05.jpg' => '艺术空间',
        'bg_scene_06.jpg' => '复古质感'
    ];

    foreach ($files as $file) {
        if ($file === '.' || $file === '..' || $file === 'transparent.png') {
            continue;
        }
        $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
        if (in_array($ext, ['jpg', 'jpeg', 'png', 'webp'])) {
            $name = isset($friendlyNames[$file]) ? $friendlyNames[$file] : pathinfo($file, PATHINFO_FILENAME);
            $templates[] = [
                'id' => $file,
                'name' => $name,
                'thumbnail' => 'resources/img/templates/' . $file,
                'path' => 'resources/img/templates/' . $file,
                'type' => 'builtin'
            ];
        }
    }
}

// User custom uploaded templates
$customDir = realpath(__DIR__ . '/../data/templates');
if ($customDir && is_dir($customDir)) {
    $files = scandir($customDir);
    foreach ($files as $file) {
        if ($file === '.' || $file === '..') {
            continue;
        }
        $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
        if (in_array($ext, ['jpg', 'jpeg', 'png', 'webp'])) {
            $templates[] = [
                'id' => $file,
                'name' => '自定义: ' . pathinfo($file, PATHINFO_FILENAME),
                'thumbnail' => 'data/templates/' . $file,
                'path' => 'data/templates/' . $file,
                'type' => 'custom'
            ];
        }
    }
}

echo json_encode(['success' => true, 'templates' => $templates]);
