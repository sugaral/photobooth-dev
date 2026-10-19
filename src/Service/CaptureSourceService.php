<?php

namespace Photobooth\Service;

/** Immutable, session-bound capture masters. Never resolve a customer's source by "latest". */
final class CaptureSourceService
{
    private const TTL = 7200;

    public function __construct(private ?string $directory = null)
    {
        $this->directory ??= sys_get_temp_dir() . '/photobooth-raw-' . substr(hash('sha256', dirname(__DIR__, 2)), 0, 16);
        if (!is_dir($this->directory) && !mkdir($this->directory, 0700, true) && !is_dir($this->directory)) {
            throw new \RuntimeException('无法创建拍摄原片目录');
        }
    }

    public function register(string $file, array &$session): string
    {
        if (!is_file($file) || !getimagesize($file)) {
            throw new \RuntimeException('拍摄原片无效，请重新拍摄');
        }
        $records = $session['capture_sources'] ?? [];
        foreach ($records as $id => $record) {
            if ($record['expires'] <= time()) {
                @unlink($this->directory . '/' . $id . '.jpg');
                unset($records[$id]);
            }
        }
        // This directory contains only masters created by this service.
        foreach (glob($this->directory . '/*.jpg') ?: [] as $expired) {
            if (filemtime($expired) < time() - self::TTL) @unlink($expired);
        }
        while (count($records) >= 12) {
            $id = array_key_first($records);
            @unlink($this->directory . '/' . $id . '.jpg');
            unset($records[$id]);
        }
        $token = bin2hex(random_bytes(24));
        $destination = $this->directory . '/' . $token . '.jpg';
        $input = fopen($file, 'rb');
        $output = fopen($destination, 'xb');
        if (!$input || !$output) {
            if ($input) fclose($input);
            if ($output) { fclose($output); @unlink($destination); }
            throw new \RuntimeException('保存拍摄原片失败');
        }
        try {
            if (stream_copy_to_stream($input, $output) !== filesize($file)) throw new \RuntimeException('保存拍摄原片不完整');
        } catch (\Throwable $error) {
            fclose($input);
            fclose($output);
            @unlink($destination);
            throw $error;
        } finally {
            if (is_resource($input)) fclose($input);
            if (is_resource($output)) fclose($output);
        }
        $records[$token] = ['hash' => hash_file('sha256', $destination), 'expires' => time() + self::TTL, 'file' => basename($file)];
        $session['capture_sources'] = $records;
        return $token;
    }

    public function resolve(string $token, array $session): string
    {
        $record = $session['capture_sources'][$token] ?? null;
        if (!preg_match('/^[a-f0-9]{48}$/D', $token) || !$record || $record['expires'] <= time()) {
            throw new \RuntimeException('拍摄原片已失效，请重新拍摄');
        }
        $path = $this->directory . '/' . $token . '.jpg';
        if (!is_file($path) || !hash_equals($record['hash'], hash_file('sha256', $path))) {
            throw new \RuntimeException('拍摄原片校验失败，请重新拍摄');
        }
        return $path;
    }
}
