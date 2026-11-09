<?php

return [
    'ui' => [
        'language' => 'zh',
        'local_timezone' => 'Asia/Shanghai',
        'show_fork' => false,
    ],
    'logo' => [
        'enabled' => false,
    ],
    'preview' => [
        'mode' => 'device_cam',
        'camTakesPic' => true,
        'style' => 'cover',
        'flip' => 'flip-horizontal',
        'asBackground' => true,
    ],
    'start_screen' => [
        'title' => 'PHOTOBOOTH',
        'title_visible' => true,
        'subtitle' => '智能照相亭 · 记录美好瞬间',
        'subtitle_visible' => true,
    ],
    'rembg' => [
        'enabled' => true,
        'engine' => 'birefnet',
        'alpha_matting' => false,
        'gpu_mode' => 'cuda',
        'cpu_threads' => 12,
    ],
    'picture' => [
        'cntdwn_time' => 3,
    ],
    'gallery' => [
        'enabled' => false,
    ],
    'collage' => [
        'enabled' => false,
    ],
    'sound' => [
        'enabled' => true,
        'cheese_enabled' => false,
        'voice' => 'woman',
    ],
    'screensaver' => [
        'enabled' => true,
        'mode' => 'folder',
        'timeout_minutes' => 1,
        'switch_seconds' => 8,
        'text' => '轻触屏幕，开始拍照',
        'text_position' => 'bottom-center',
        'text_backdrop_opacity' => 0.7,
    ],
    'webserver' => [
        'ssid' => 'photobooth',
    ],
    'qr' => [
        'url' => 'http://192.168.137.1:8000/photo.php?image=',
        'wifi_password' => '88888888',
    ],
    'beauty' => [
        'enabled' => true,
        'auto_apply' => true,
        'default_eye' => 20,
        'default_slim' => 20,
        'default_smooth' => 35,
        'default_white' => 30,
        'default_rosy' => 22,
        'default_clarity' => 15,
    ],
];
