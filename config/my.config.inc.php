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
        'alpha_matting' => false,
        'gpu_mode' => 'cuda',
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
        'enabled' => true,
        'url' => 'http://192.168.137.1:8000/photo.php?image=',
        'append_filename' => true,
        'wifi_password' => '88888888',
    ],
    'beauty' => [
        'default_eye' => 21,
        'default_slim' => 20,
        'default_smooth' => 19,
        'default_white' => 22,
        'default_rosy' => 23,
        'default_clarity' => 20,
    ],
];
