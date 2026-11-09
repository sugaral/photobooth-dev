param(
    [ValidateSet('start', 'stop', 'restart', 'status')][string]$Action = 'start',
    [switch]$Force
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$runDirectory = Join-Path $projectRoot 'var/run'
$logDirectory = Join-Path $projectRoot 'var/log'
$statePath = Join-Path $runDirectory 'local-services.json'
$php = Join-Path $projectRoot '.runtime/php/php.exe'
$python = Join-Path $projectRoot '.venv-ai/Scripts/python.exe'
$localPythonHome = Join-Path $projectRoot '.runtime/python'

function Test-Runtime($executable) {
    # Checking that python.exe exists is insufficient: a venv launcher can point
    # to a base Python installation that was moved or removed.
    $previousPreference = $ErrorActionPreference
    try {
        $ErrorActionPreference = 'Continue'
        $output = & $executable --version 2>&1
        $runtimeExitCode = $LASTEXITCODE
    } finally {
        $ErrorActionPreference = $previousPreference
    }
    if ($runtimeExitCode -ne 0) {
        throw "Runtime check failed: $executable`n$($output -join [Environment]::NewLine)"
    }
}

function Get-ServiceFailure($process, $name, $errorLog) {
    if (!$process) { return $null }
    try {
        $process.Refresh()
        if ($process.HasExited) {
            $details = (Get-Content -LiteralPath $errorLog -Tail 15 -ErrorAction SilentlyContinue) -join [Environment]::NewLine
            return "$name 服务已退出 (退出码 $($process.ExitCode))。日志文件: $errorLog`n$details"
        }
    } catch {}
    return $null
}

function Get-OwnedProcess($entry) {
    if (!$entry.id) { return $null }
    try {
        $process = Get-Process -Id $entry.id -ErrorAction SilentlyContinue
        if ($process -and !$process.HasExited) {
            if ($entry.started) {
                if ($process.StartTime.ToUniversalTime().ToString('o') -eq $entry.started) {
                    return $process
                }
            } else {
                return $process
            }
        }
    } catch {}
    return $null
}

function Stop-ServiceProcesses {
    $stoppedAny = $false
    # 1. 停止记录在 local-services.json 中的进程
    if (Test-Path -LiteralPath $statePath) {
        try {
            $raw = Get-Content -LiteralPath $statePath -Raw -ErrorAction SilentlyContinue
            if ($raw) {
                $state = $raw | ConvertFrom-Json -ErrorAction SilentlyContinue
                foreach ($entry in $state) {
                    if ($entry.id) {
                        $p = Get-Process -Id $entry.id -ErrorAction SilentlyContinue
                        if ($p -and !$p.HasExited) {
                            try {
                                & taskkill.exe /PID $entry.id /T /F 2>&1 | Out-Null
                            } catch {
                                Stop-Process -Id $entry.id -Force -ErrorAction SilentlyContinue
                            }
                            Write-Host "已停止 $($entry.name) 服务 (PID $($entry.id))" -ForegroundColor Cyan
                            $stoppedAny = $true
                        }
                    }
                }
            }
        } catch {}
        Remove-Item -LiteralPath $statePath -Force -ErrorAction SilentlyContinue
    }

    # 2. 释放 8000 和 8001 端口上的残留 PHP/Python 进程
    foreach ($port in @(8000, 8001)) {
        try {
            $conns = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
            foreach ($conn in $conns) {
                if ($conn.OwningProcess -and $conn.OwningProcess -gt 0) {
                    $proc = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
                    if ($proc -and ($proc.ProcessName -match 'php|python')) {
                        Write-Host "释放端口 $port 上的残留服务进程: $($proc.ProcessName) (PID $($conn.OwningProcess))..." -ForegroundColor Yellow
                        & taskkill.exe /PID $conn.OwningProcess /T /F 2>&1 | Out-Null
                        $stoppedAny = $true
                    }
                }
            }
        } catch {}
    }

    # 3. 彻底清理所有属于当前项目路径的 python.exe 与 php.exe 残留孤儿进程
    try {
        $wmiProcs = Get-CimInstance Win32_Process | Where-Object {
            ($_.Name -match 'python|php') -and (
                ($_.ExecutablePath -and $_.ExecutablePath -like "*$projectRoot*") -or
                ($_.CommandLine -and $_.CommandLine -like "*$projectRoot*") -or
                ($_.CommandLine -and ($_.CommandLine -match 'rembg_service|local-router|beauty_core|matting_core|faceswap_core'))
            )
        }
        foreach ($wp in $wmiProcs) {
            try {
                Write-Host "终止残留进程: $($wp.Name) (PID $($wp.ProcessId))..." -ForegroundColor Yellow
                & taskkill.exe /PID $wp.ProcessId /T /F 2>&1 | Out-Null
                $stoppedAny = $true
            } catch {
                Stop-Process -Id $wp.ProcessId -Force -ErrorAction SilentlyContinue
            }
        }
    } catch {}

    # 4. 清理退出标记
    $exitFlag = Join-Path $projectRoot 'admin_exit.flag'
    if (Test-Path -LiteralPath $exitFlag) {
        Remove-Item -LiteralPath $exitFlag -Force -ErrorAction SilentlyContinue
    }

    if ($stoppedAny) {
        Start-Sleep -Milliseconds 600
    }
    return $stoppedAny
}

function Test-ServicesHealthy {
    $aiOk = $false
    $webOk = $false
    try {
        $health = Invoke-RestMethod 'http://127.0.0.1:8001/ready' -TimeoutSec 2 -ErrorAction Stop
        if ($health.status -eq 'ok') { $aiOk = $true }
    } catch {}
    try {
        $page = Invoke-WebRequest 'http://127.0.0.1:8000/' -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
        if ($page.StatusCode -eq 200) { $webOk = $true }
    } catch {}
    return ($aiOk -and $webOk)
}

# --- 处理 status ---
if ($Action -eq 'status') {
    $aiStatus = '未运行'
    $webStatus = '未运行'
    $aiHealth = '无法访问'
    $webHealth = '无法访问'

    if (Test-Path -LiteralPath $statePath) {
        try {
            $state = Get-Content -LiteralPath $statePath -Raw | ConvertFrom-Json
            foreach ($entry in $state) {
                $process = Get-OwnedProcess $entry
                if ($entry.name -eq 'AI' -and $process) {
                    $aiStatus = "运行中 (PID $($process.Id))"
                } elseif ($entry.name -eq 'Web' -and $process) {
                    $webStatus = "运行中 (PID $($process.Id))"
                }
            }
        } catch {}
    }

    try {
        $health = Invoke-RestMethod 'http://127.0.0.1:8001/ready' -TimeoutSec 2 -ErrorAction Stop
        if ($health.status -eq 'ok') { $aiHealth = '健康就绪' }
    } catch {}

    try {
        $page = Invoke-WebRequest 'http://127.0.0.1:8000/' -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
        if ($page.StatusCode -eq 200) { $webHealth = '响应正常 (HTTP 200)' }
    } catch {}

    Write-Host "================ 服务状态 ================" -ForegroundColor Cyan
    Write-Host "  AI 引擎  (端口 8001): $aiStatus [$aiHealth]"
    Write-Host "  Web 网页 (端口 8000): $webStatus [$webHealth]"
    Write-Host "==========================================" -ForegroundColor Cyan
    exit 0
}

# --- 处理 stop ---
if ($Action -eq 'stop') {
    Write-Host "正在停止 Photobooth 本地服务..." -ForegroundColor Cyan
    $stopped = Stop-ServiceProcesses
    if ($stopped) {
        Write-Host "Photobooth 服务已完全停止并释放端口。" -ForegroundColor Green
    } else {
        Write-Host "未发现正在运行的 Photobooth 服务进程。" -ForegroundColor Yellow
    }
    exit 0
}

# --- 处理 restart ---
if ($Action -eq 'restart') {
    Write-Host "正在重启 Photobooth 服务..." -ForegroundColor Cyan
    Stop-ServiceProcesses | Out-Null
    Start-Sleep -Seconds 1
    $Action = 'start'
}

# --- 处理 start ---
# 1. 检查是否已经处于正常运行状态
if (Test-ServicesHealthy) {
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host "[提示] Photobooth 服务已在正常运行中，无需重复启动。" -ForegroundColor Green
    Write-Host "  Photobooth 首页:  http://127.0.0.1:8000/" -ForegroundColor Cyan
    Write-Host "  管理后台:         http://127.0.0.1:8000/admin/" -ForegroundColor Cyan
    Write-Host "  AI 引擎接口:      http://127.0.0.1:8001/ready" -ForegroundColor Cyan
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host "提示: 如需重启服务，可运行 .\restart.ps1" -ForegroundColor Yellow
    Write-Host "      如需停止服务，可运行 .\stop.ps1" -ForegroundColor Yellow
    exit 0
}

# 2. 如果端口被占用或有残留记录但服务不健康，自动清理残留
$port8000 = Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue
$port8001 = Get-NetTCPConnection -LocalPort 8001 -State Listen -ErrorAction SilentlyContinue
if ($port8000 -or $port8001 -or (Test-Path -LiteralPath $statePath)) {
    Write-Host "[提示] 检测到先前服务异常残留或端口占用，正在自动清理旧进程..." -ForegroundColor Yellow
    Stop-ServiceProcesses | Out-Null
}

# 再次检查端口是否仍被非 Photobooth 外部程序占用
foreach ($port in @(8000, 8001)) {
    $conn = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if ($conn) {
        throw "端口 $port 仍被其他外部程序 (PID $($conn.OwningProcess)) 占用，请先退出占用端口的程序后再启动。"
    }
}

# 3. 校验运行环境
foreach ($executable in @($php, $python)) {
    if (!(Test-Path -LiteralPath $executable)) { throw "缺少运行依赖: $executable" }
}

New-Item -ItemType Directory -Path $runDirectory, $logDirectory -Force | Out-Null
$env:PHOTOBOOTH_MODELS_DIR = Join-Path $projectRoot 'models'
$env:PHOTOBOOTH_FACE_MODELS_DIR = Join-Path $projectRoot 'models/faceswap'
$env:PATH = "$(Split-Path -Parent $python);$(Split-Path -Parent $php);$env:SystemRoot\System32;$env:SystemRoot\System32\WindowsPowerShell\v1.0;$env:PATH"
$env:PYTHONUNBUFFERED = '1'
$env:PYTHONUTF8 = '1'

# Keep the existing AI packages, but use the project's own matching Python
# installation when supplied. This also repairs the path after moving the project.
$venvConfigPath = Join-Path $projectRoot '.venv-ai/pyvenv.cfg'
if (Test-Path -LiteralPath (Join-Path $localPythonHome 'python.exe')) {
    $venvConfig = Get-Content -LiteralPath $venvConfigPath -Raw
    $localVersion = (& (Join-Path $localPythonHome 'python.exe') --version) -replace '^Python ', ''
    if ($LASTEXITCODE -ne 0 -or $venvConfig -notmatch ('(?m)^version_info\s*=\s*' + [regex]::Escape($localVersion.Trim()) + '\s*$')) {
        throw 'The bundled Python version does not match .venv-ai/pyvenv.cfg. Restore the matching Python runtime.'
    }
    $updatedConfig = [regex]::Replace($venvConfig, '(?m)^home\s*=.*$', ('home = ' + $localPythonHome))
    if ($updatedConfig -ne $venvConfig) {
        [System.IO.File]::WriteAllText($venvConfigPath, $updatedConfig, (New-Object System.Text.UTF8Encoding($false)))
    }
}
Test-Runtime $python
Test-Runtime $php

$startedProcesses = @()
try {
    Write-Host "正在启动 AI 抠图/换脸引擎 (端口 8001)..." -ForegroundColor Cyan
    $ai = Start-Process -FilePath $python -ArgumentList '-u', 'bin/rembg_service.py' -WorkingDirectory $projectRoot -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $logDirectory 'ai.stdout.log') -RedirectStandardError (Join-Path $logDirectory 'ai.stderr.log')
    $startedProcesses += $ai

    Write-Host "正在启动 Web 网页服务 (端口 8000)..." -ForegroundColor Cyan
    $web = Start-Process -FilePath $php -ArgumentList '-d', 'max_execution_time=300', '-d', 'max_input_time=300', '-d', 'session.save_path=data/tmp', '-S', '0.0.0.0:8000', '-t', '.', 'scripts/local-router.php' -WorkingDirectory $projectRoot -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $logDirectory 'web.stdout.log') -RedirectStandardError (Join-Path $logDirectory 'web.stderr.log')
    $startedProcesses += $web

    $ready = $false
    $deadline = (Get-Date).AddSeconds(120)
    $lastReadinessError = ''
    while ((Get-Date) -lt $deadline) {
        $failure = Get-ServiceFailure $ai 'AI' (Join-Path $logDirectory 'ai.stderr.log')
        if ($failure) { throw $failure }
        $failure = Get-ServiceFailure $web 'Web' (Join-Path $logDirectory 'web.stderr.log')
        if ($failure) { throw $failure }
        try {
            $health = Invoke-RestMethod 'http://127.0.0.1:8001/ready' -TimeoutSec 2
            $page = Invoke-WebRequest 'http://127.0.0.1:8000/' -UseBasicParsing -TimeoutSec 10
            if ($health.status -eq 'ok' -and $page.StatusCode -eq 200) { $ready = $true; break }
        } catch { $lastReadinessError = $_.Exception.Message }
        Start-Sleep -Milliseconds 500
    }
    if (!$ready) { throw "服务未能成功就绪: $lastReadinessError`n请查看日志目录: $logDirectory" }

    # 记录状态（包括 AI 实际监听进程）
    $records = @(
        @{ name = 'AI'; id = $ai.Id; started = $ai.StartTime.ToUniversalTime().ToString('o') },
        @{ name = 'Web'; id = $web.Id; started = $web.StartTime.ToUniversalTime().ToString('o') }
    )
    $conn8001 = Get-NetTCPConnection -LocalPort 8001 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($conn8001 -and $conn8001.OwningProcess -and $conn8001.OwningProcess -ne $ai.Id) {
        $records += @{ name = 'AI-Worker'; id = $conn8001.OwningProcess; started = '' }
    }
    $records | ConvertTo-Json | Set-Content -LiteralPath $statePath -Encoding UTF8

    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host "Photobooth 本地服务启动成功！" -ForegroundColor Green
    Write-Host "  Photobooth 首页:  http://127.0.0.1:8000/" -ForegroundColor Cyan
    Write-Host "  管理后台:         http://127.0.0.1:8000/admin/" -ForegroundColor Cyan
    Write-Host "  AI 引擎接口:      http://127.0.0.1:8001/ready" -ForegroundColor Cyan
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host "提示: 如需停止服务，请运行 .\stop.ps1" -ForegroundColor Yellow
    Write-Host "      如需重启服务，请运行 .\restart.ps1" -ForegroundColor Yellow
} catch {
    foreach ($process in $startedProcesses) {
        if ($process -and !$process.HasExited) { Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue }
    }
    if (Test-Path -LiteralPath $statePath) { Remove-Item -LiteralPath $statePath -Force -ErrorAction SilentlyContinue }
    throw
}
