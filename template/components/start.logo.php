<?php

use Photobooth\Utility\PathUtility;

if ($config['logo']['enabled'] && !empty($config['logo']['path']) && !str_contains($config['logo']['path'], 'qrcode')) {
    echo '
        <div class="logo logo--' . ($config['logo']['position'] ?? 'center') . '">
            <img src="' . PathUtility::getPublicPath($config['logo']['path']) . '" alt="Logo">
        </div>
    ';
}
