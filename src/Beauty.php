<?php

namespace Photobooth;

use Photobooth\Service\LoggerService;

class Beauty
{
    public static function process(
        Image $imageHandler,
        array $vars,
        array $beautyConfig,
        \GdImage $imageResource
    ): array {
        $logger = LoggerService::getInstance()->getLogger('beauty');
        if (
            empty($beautyConfig['enabled']) ||
            empty($beautyConfig['auto_apply']) ||
            !empty($vars['isCollage']) ||
            !empty($vars['isChroma'])
        ) {
            $logger->debug('Skipped auto beauty (disabled or not applicable)');
            return [$imageHandler, $imageResource];
        }

        $tempInput = tempnam(sys_get_temp_dir(), 'beauty_in_') . '.jpg';
        $tempOutput = tempnam(sys_get_temp_dir(), 'beauty_out_') . '.jpg';

        try {
            if (!imagejpeg($imageResource, $tempInput, 95)) {
                throw new \Exception('Failed to write temp input for beauty');
            }

            $serviceUrl = rtrim((string)($beautyConfig['service_url'] ?? 'http://127.0.0.1:8001'), '/') . '/beauty';
            $payload = json_encode([
                'input' => $tempInput,
                'output' => $tempOutput,
                'eye' => (float)($beautyConfig['default_eye'] ?? 15),
                'slim' => (float)($beautyConfig['default_slim'] ?? 15),
                'smooth' => (float)($beautyConfig['default_smooth'] ?? 30),
                'white' => (float)($beautyConfig['default_white'] ?? 25),
                'rosy' => (float)($beautyConfig['default_rosy'] ?? 20),
                'clarity' => (float)($beautyConfig['default_clarity'] ?? 15),
                'preview' => false,
            ]);

            $fastSuccess = false;
            if (function_exists('curl_init')) {
                $ch = curl_init($serviceUrl);
                if ($ch) {
                    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                    curl_setopt($ch, CURLOPT_POST, true);
                    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
                    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
                    curl_setopt($ch, CURLOPT_TIMEOUT_MS, 15000);
                    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT_MS, 1500);
                    curl_setopt($ch, CURLOPT_NOSIGNAL, 1);
                    $resp = curl_exec($ch);
                    $err = curl_errno($ch);
                    curl_close($ch);
                    if (!$err && $resp) {
                        $parsed = json_decode($resp, true);
                        if (!empty($parsed['success']) && file_exists($tempOutput)) {
                            $fastSuccess = true;
                        }
                    }
                }
            }

            if (!$fastSuccess) {
                $script = realpath(__DIR__ . '/../bin/beauty_core.py');
                if ($script) {
                    $cmd = sprintf(
                        'python -X utf8 %s --input %s --output %s --eye %f --slim %f --smooth %f --white %f',
                        escapeshellarg($script),
                        escapeshellarg($tempInput),
                        escapeshellarg($tempOutput),
                        (float)($beautyConfig['default_eye'] ?? 15),
                        (float)($beautyConfig['default_slim'] ?? 15),
                        (float)($beautyConfig['default_smooth'] ?? 20),
                        (float)($beautyConfig['default_white'] ?? 15)
                    );
                    @exec($cmd);
                    if (file_exists($tempOutput) && filesize($tempOutput) > 0) {
                        $fastSuccess = true;
                    }
                }
            }

            if ($fastSuccess && file_exists($tempOutput)) {
                $retouchedResource = $imageHandler->createFromImage($tempOutput);
                if ($retouchedResource instanceof \GdImage) {
                    $imageHandler->imageModified = true;
                    $logger->info('Default auto beauty micro-retouch applied successfully');
                    return [$imageHandler, $retouchedResource];
                }
            }
        } catch (\Throwable $e) {
            $logger->error('Auto beauty error: ' . $e->getMessage());
        } finally {
            if (file_exists($tempInput)) {
                @unlink($tempInput);
            }
            if (file_exists($tempOutput)) {
                @unlink($tempOutput);
            }
        }

        return [$imageHandler, $imageResource];
    }
}
