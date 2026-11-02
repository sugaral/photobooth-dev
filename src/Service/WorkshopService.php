<?php

declare(strict_types=1);

namespace Photobooth\Service;

/** The same pixel cells and optional polygons drive template previews and the saved photograph. */
final class WorkshopService
{
    public static function resolveBackground(string $template): ?string
    {
        if ($template === '' || $template === 'none') return null;
        $root = dirname(__DIR__, 2);
        $path = realpath($root . '/' . ltrim($template, '/\\'));
        foreach (['resources/img/templates', 'data/templates'] as $directory) {
            $allowed = realpath($root . '/' . $directory);
            if ($path && $allowed && str_starts_with(str_replace('\\', '/', $path), str_replace('\\', '/', $allowed) . '/')
                && is_file($path) && @getimagesize($path)) {
                return $path;
            }
        }
        throw new \InvalidArgumentException('背景模板不存在，请重新选择背景');
    }

    public static function applyBackground(string $source, string $template, string $destination, array $config): void
    {
        // Use the same resident matting service as classic studio capture.
        // A failure is explicit so retry never silently loses the chosen background.
        $request = curl_init(rtrim($config['service_url'] ?? 'http://127.0.0.1:8001', '/') . '/process');
        if (!$request) throw new \RuntimeException('无法连接背景处理服务，请重试');
        try {
            curl_setopt_array($request, [
                CURLOPT_POST => true, CURLOPT_RETURNTRANSFER => true,
                CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
                CURLOPT_CONNECTTIMEOUT => 3, CURLOPT_TIMEOUT => 90,
                CURLOPT_POSTFIELDS => json_encode([
                    'input' => $source, 'output' => $destination, 'template' => $template,
                    'engine' => $config['engine'] ?? 'birefnet', 'auto_fallback' => true,
                ], JSON_THROW_ON_ERROR),
            ]);
            $response = curl_exec($request);
            $data = $response ? json_decode($response, true) : null;
            if (curl_getinfo($request, CURLINFO_RESPONSE_CODE) !== 200 || empty($data['success']) || !is_file($destination) || !@getimagesize($destination)) {
                error_log('Workshop background: ' . (curl_error($request) ?: ($data['error'] ?? 'Invalid service response')));
                throw new \RuntimeException('背景处理失败，已拍照片已保留，请点击重新生成成片');
            }
        } finally {
            curl_close($request);
        }
    }

    private static function insidePolygon(float $x, float $y, array $points): bool
    {
        $inside = false;
        $count = count($points);
        for ($i = 0, $j = $count - 1; $i < $count; $j = $i++) {
            [$xi, $yi] = $points[$i];
            [$xj, $yj] = $points[$j];
            if ((($yi > $y) !== ($yj > $y)) && ($x < ($xj - $xi) * ($y - $yi) / (($yj - $yi) ?: 1) + $xi)) {
                $inside = !$inside;
            }
        }
        return $inside;
    }

    public static function catalog(): array
    {
        return json_decode(file_get_contents(dirname(__DIR__, 2) . '/resources/catalog/workshop-layouts.json'), true, 512, JSON_THROW_ON_ERROR);
    }

    public static function layout(string $id): array
    {
        foreach (self::catalog()['layouts'] as $layout) {
            if ($layout['id'] === $id) {
                $catalog = self::catalog();
                return $layout + ['width' => $catalog['width'], 'height' => $catalog['height'], 'dpi' => $catalog['dpi']];
            }
        }
        throw new \InvalidArgumentException('请选择有效的创意工坊模板');
    }

    public function compose(string $layoutId, array $sources, string $destination): void
    {
        $layout = self::layout($layoutId);
        if (count($sources) !== count($layout['cells'])) {
            throw new \InvalidArgumentException('照片数量与模板不符，请完成全部拍摄');
        }
        $canvas = imagecreatetruecolor($layout['width'], $layout['height']);
        imagefill($canvas, 0, 0, imagecolorallocate($canvas, 255, 255, 255));
        imageresolution($canvas, $layout['dpi'], $layout['dpi']);
        try {
            if (isset($layout['background'])) {
                // Static artwork comes exclusively from the server-owned catalog.
                $frame = @imagecreatefrompng(dirname(__DIR__, 2) . '/' . $layout['background']);
                if (!$frame) throw new \RuntimeException('报纸模板无法读取，请重试');
                try {
                    if (imagesx($frame) !== $layout['width'] || imagesy($frame) !== $layout['height']) {
                        throw new \RuntimeException('报纸模板尺寸不符');
                    }
                    imagecopy($canvas, $frame, 0, 0, 0, 0, $layout['width'], $layout['height']);
                } finally {
                    imagedestroy($frame);
                }
            }
            foreach ($layout['cells'] as $index => $cell) {
                [$x, $y, $width, $height] = $cell;
                $shape = $cell[4] ?? 'rect';
                $points = $cell[5] ?? null;
                $info = @getimagesize($sources[$index]);
                if (!$info || $info[0] * $info[1] > 40000000) {
                    throw new \RuntimeException('照片无法读取或尺寸过大，请重新拍摄');
                }
                $source = match ($info[2]) {
                    IMAGETYPE_JPEG => @imagecreatefromjpeg($sources[$index]),
                    IMAGETYPE_PNG => @imagecreatefrompng($sources[$index]),
                    IMAGETYPE_WEBP => @imagecreatefromwebp($sources[$index]),
                    default => false,
                };
                if (!$source) {
                    throw new \RuntimeException('照片已损坏，请重新拍摄');
                }
                try {
                    // Center crop, preserving proportions; never stretch a face to fill a cell.
                    $scale = max($width / imagesx($source), $height / imagesy($source));
                    $cropWidth = max(1, (int)round($width / $scale));
                    $cropHeight = max(1, (int)round($height / $scale));
                    if ($shape === 'polygon' && is_array($points) && count($points) >= 3) {
                        $tile = imagecreatetruecolor($width, $height);
                        imagealphablending($tile, false);
                        imagesavealpha($tile, true);
                        $transparent = imagecolorallocatealpha($tile, 0, 0, 0, 127);
                        imagefill($tile, 0, 0, $transparent);
                        imagecopyresampled($tile, $source, 0, 0,
                            (int)((imagesx($source) - $cropWidth) / 2),
                            (int)((imagesy($source) - $cropHeight) / 2),
                            $width, $height, $cropWidth, $cropHeight);
                        $normalized = array_map(static fn (array $point): array => [
                            (float)$point[0] / 100 * $width,
                            (float)$point[1] / 100 * $height,
                        ], $points);
                        for ($py = 0; $py < $height; $py++) {
                            for ($px = 0; $px < $width; $px++) {
                                if (!self::insidePolygon($px + .5, $py + .5, $normalized)) {
                                    imagesetpixel($tile, $px, $py, $transparent);
                                }
                            }
                        }
                        imagealphablending($canvas, true);
                        imagecopy($canvas, $tile, $x, $y, 0, 0, $width, $height);
                        imagedestroy($tile);
                    } else {
                        imagecopyresampled($canvas, $source, $x, $y,
                            (int)((imagesx($source) - $cropWidth) / 2),
                            (int)((imagesy($source) - $cropHeight) / 2),
                            $width, $height, $cropWidth, $cropHeight);
                    }
                } finally {
                    imagedestroy($source);
                }
            }
            if (!imagejpeg($canvas, $destination, 98)) {
                throw new \RuntimeException('保存拼图失败，请重试');
            }
        } finally {
            imagedestroy($canvas);
        }
    }
}
