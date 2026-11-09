<?php

namespace Photobooth\Utility;

use Photobooth\Service\LoggerService;

class HotspotUtility
{
    private const DEBOUNCE_SECONDS = 90;

    /**
     * Launch Windows Mobile Hotspot in a detached, non-blocking background process.
     * Only runs when on Windows and when not triggered recently.
     */
    public static function ensureStarted(?array $config = null): bool
    {
        if (PHP_OS_FAMILY !== 'Windows') {
            return false;
        }

        if ($config === null) {
            global $config;
        }

        $ssid = (string)($config['webserver']['ssid'] ?? 'photobooth');
        $passphrase = (string)($config['qr']['wifi_password'] ?? '88888888');

        if ($ssid === '' || $passphrase === '') {
            return false;
        }

        $runDir = PathUtility::getAbsolutePath('var/run');
        if (!is_dir($runDir)) {
            @mkdir($runDir, 0755, true);
        }

        $stampFile = $runDir . DIRECTORY_SEPARATOR . 'hotspot_triggered.timestamp';
        $now = time();

        if (file_exists($stampFile)) {
            $lastTriggered = (int)@file_get_contents($stampFile);
            if ($lastTriggered > 0 && ($now - $lastTriggered) < self::DEBOUNCE_SECONDS) {
                return true;
            }
        }

        @file_put_contents($stampFile, (string)$now);

        $scriptPath = PathUtility::getAbsolutePath('scripts/enable-hotspot.ps1');
        if (!file_exists($scriptPath)) {
            return false;
        }

        $powershell = getenv('SystemRoot') . '\\System32\\WindowsPowerShell\\v1.0\\powershell.exe';
        if (!file_exists($powershell)) {
            $powershell = 'powershell.exe';
        }

        $cmd = sprintf(
            'cmd /c start "PhotoboothHotspot" /b "%s" -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "%s" -Ssid "%s" -Passphrase "%s"',
            $powershell,
            addslashes($scriptPath),
            addslashes($ssid),
            addslashes($passphrase)
        );

        pclose(popen($cmd, 'r'));

        try {
            LoggerService::getInstance()->getLogger('hotspot')->info('On-demand mobile hotspot trigger launched', [
                'ssid' => $ssid,
                'script' => $scriptPath,
            ]);
        } catch (\Throwable) {}

        return true;
    }
}
