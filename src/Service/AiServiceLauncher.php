<?php

declare(strict_types=1);

namespace Photobooth\Service;

/** Starts one project worker and waits for HTTP readiness before submitting work. */
class AiServiceLauncher
{
    private string $root;

    public function __construct(?string $root = null)
    {
        $this->root = realpath($root ?? dirname(__DIR__, 2)) ?: throw new \RuntimeException('AI 项目目录不存在');
    }

    public function ensureReady(float $timeout = 15.0): array
    {
        $deadline = microtime(true) + $timeout;
        if ($status = $this->ready()) {
            return $status;
        }
        $lock = @fopen($this->root . '/private/ai-service-start.lock', 'c');
        if (!$lock) {
            throw new \RuntimeException('无法创建 AI 服务启动锁，请检查 private 目录权限');
        }
        try {
            while (!flock($lock, LOCK_EX | LOCK_NB)) {
                if (microtime(true) >= $deadline) {
                    throw new \RuntimeException('AI 服务正在启动，请稍后重试');
                }
                usleep(100000);
            }
            // Another request may have finished startup while we waited for the lock.
            if ($status = $this->ready()) {
                return $status;
            }
            if (!$this->portInUse()) {
                $this->start();
            }
            do {
                if ($status = $this->ready()) {
                    return $status;
                }
                usleep(100000);
            } while (microtime(true) < $deadline);
            throw new \RuntimeException('AI 服务未在限定时间内就绪，请检查 private/ai-service.stderr.log 和 8001 端口');
        } finally {
            flock($lock, LOCK_UN);
            fclose($lock);
        }
    }

    private function ready(): ?array
    {
        $status = $this->probe();
        if ($status === null) {
            return null;
        }
        if (($status['service'] ?? '') !== 'photobooth-ai'
            || $this->normalize((string)($status['project_root'] ?? '')) !== $this->normalize($this->root)) {
            throw new \RuntimeException('8001 端口不是当前项目的 AI 服务，请关闭旧服务后重试');
        }
        if (is_file($this->root . '/.venv-ai/photobooth-runtime.ready')
            && $this->normalize((string)($status['python_executable'] ?? '')) !== $this->normalize($this->python())) {
            if (($status['status'] ?? '') !== 'ok') {
                throw new \RuntimeException('AI 服务仍使用旧 Python 环境，请重启 AI 服务');
            }
        }
        return ($status['status'] ?? '') === 'ok' ? $status : null;
    }

    private function normalize(string $path): string
    {
        $path = rtrim(str_replace('\\', '/', $path), '/');
        return PHP_OS_FAMILY === 'Windows' ? strtolower($path) : $path;
    }

    protected function probe(): ?array
    {
        if (!function_exists('curl_init')) {
            throw new \RuntimeException('PHP 缺少 cURL 扩展，无法连接 AI 服务');
        }
        $handle = curl_init('http://127.0.0.1:8001/ready');
        curl_setopt_array($handle, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT_MS => 400,
            CURLOPT_CONNECTTIMEOUT_MS => 200, CURLOPT_PROXY => '', CURLOPT_NOSIGNAL => 1]);
        $response = curl_exec($handle);
        $code = curl_getinfo($handle, CURLINFO_RESPONSE_CODE);
        curl_close($handle);
        $status = $code === 200 && is_string($response) ? json_decode($response, true) : null;
        return is_array($status) ? $status : null;
    }

    protected function portInUse(): bool
    {
        $socket = @fsockopen('127.0.0.1', 8001, $errno, $error, 0.1);
        if (!$socket) return false;
        fclose($socket);
        return true;
    }

    private function python(): string
    {
        if (!is_file($this->root . '/.venv-ai/photobooth-runtime.ready')) return 'python';
        $python = $this->root . (PHP_OS_FAMILY === 'Windows' ? '/.venv-ai/Scripts/python.exe' : '/.venv-ai/bin/python');
        if (!is_file($python)) throw new \RuntimeException('项目 AI 环境不完整，请修复 .venv-ai');
        return $python;
    }

    protected function start(): void
    {
        if (!function_exists('proc_open')) throw new \RuntimeException('PHP 未允许启动 AI 服务，请预先运行 bin/rembg_service.py');
        $script = $this->root . '/bin/rembg_service.py';
        if (!is_file($script)) throw new \RuntimeException('AI 服务脚本不存在');
        $python = $this->python();
        $stdout = $this->root . '/private/ai-service.stdout.log';
        $stderr = $this->root . '/private/ai-service.stderr.log';
        if (PHP_OS_FAMILY === 'Windows') {
            // EncodedCommand avoids cmd/PowerShell nested quote and Unicode corruption.
            $quote = static fn(string $value): string => "'" . str_replace("'", "''", $value) . "'";
            $command = '$ErrorActionPreference = \'Stop\'; $ProgressPreference = \'SilentlyContinue\'; Start-Process -FilePath ' . $quote($python)
                . ' -ArgumentList @(\'-X\', \'utf8\', ' . $quote('"' . $script . '"') . ')'
                . ' -WorkingDirectory ' . $quote($this->root) . ' -WindowStyle Hidden'
                . ' -RedirectStandardOutput ' . $quote($stdout) . ' -RedirectStandardError ' . $quote($stderr);
            $encoded = base64_encode(mb_convert_encoding($command, 'UTF-16LE', 'UTF-8'));
            $command = ['powershell.exe', '-NoProfile', '-NonInteractive', '-EncodedCommand', $encoded];
        } else {
            $command = 'nohup ' . escapeshellarg($python) . ' -X utf8 ' . escapeshellarg($script)
                . ' > ' . escapeshellarg($stdout) . ' 2> ' . escapeshellarg($stderr) . ' < /dev/null &';
        }
        // No PHP pipes: the detached worker can inherit pipe handles and keep exec() blocked.
        $process = proc_open($command, [0 => ['file', PHP_OS_FAMILY === 'Windows' ? 'NUL' : '/dev/null', 'r'],
            1 => ['file', $this->root . '/private/ai-service.launcher.log', 'a'],
            2 => ['file', $this->root . '/private/ai-service.launcher.log', 'a']], $pipes, $this->root);
        if (!is_resource($process)) throw new \RuntimeException('无法启动 AI 服务进程');
        $deadline = microtime(true) + 5;
        do {
            $status = proc_get_status($process);
            if (!$status['running']) break;
            usleep(50000);
        } while (microtime(true) < $deadline);
        if ($status['running']) proc_terminate($process);
        proc_close($process);
        if ($status['running'] || $status['exitcode'] !== 0) {
            throw new \RuntimeException('AI 服务启动器失败或超时，请检查 private/ai-service.launcher.log');
        }
    }
}
