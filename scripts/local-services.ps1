param([ValidateSet('start', 'stop', 'status')][string]$Action = 'start')

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
    $process.Refresh()
    if ($process.HasExited) {
        $details = (Get-Content -LiteralPath $errorLog -Tail 15 -ErrorAction SilentlyContinue) -join [Environment]::NewLine
        return "$name service exited (code $($process.ExitCode)). Log: $errorLog`n$details"
    }
}

function Get-OwnedProcess($entry) {
    $process = Get-Process -Id $entry.id -ErrorAction SilentlyContinue
    if ($process -and $process.StartTime.ToUniversalTime().ToString('o') -eq $entry.started) {
        return $process
    }
}

if ($Action -ne 'start') {
    if (Test-Path -LiteralPath $statePath) {
        $state = Get-Content -LiteralPath $statePath -Raw | ConvertFrom-Json
        foreach ($entry in $state) {
            $process = Get-OwnedProcess $entry
            if ($Action -eq 'stop' -and $process) {
                Stop-Process -Id $process.Id
                Write-Host "Stopped $($entry.name) (PID $($process.Id))"
            } elseif ($Action -eq 'status') {
                Write-Host "$($entry.name): $(if ($process) { 'running' } else { 'stopped' })"
            }
        }
        if ($Action -eq 'stop') { Remove-Item -LiteralPath $statePath }
    } else {
        Write-Host 'No local services have been recorded.'
    }
    exit 0
}

foreach ($executable in @($php, $python)) {
    if (!(Test-Path -LiteralPath $executable)) { throw "Missing runtime: $executable" }
}
if (Test-Path -LiteralPath $statePath) {
    $state = Get-Content -LiteralPath $statePath -Raw | ConvertFrom-Json
    if (@($state | Where-Object { Get-OwnedProcess $_ }).Count) {
        throw 'Services are already running. Use stop-photobooth.bat before restarting.'
    }
}
foreach ($port in @(8000, 8001)) {
    if (Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue) {
        throw "Port $port is in use. No existing process was stopped."
    }
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
    $ai = Start-Process -FilePath $python -ArgumentList '-u', 'bin/rembg_service.py' -WorkingDirectory $projectRoot -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $logDirectory 'ai.stdout.log') -RedirectStandardError (Join-Path $logDirectory 'ai.stderr.log')
    $startedProcesses += $ai
    $web = Start-Process -FilePath $php -ArgumentList '-S', '0.0.0.0:8000', '-t', '.', 'scripts/local-router.php' -WorkingDirectory $projectRoot -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $logDirectory 'web.stdout.log') -RedirectStandardError (Join-Path $logDirectory 'web.stderr.log')
    $startedProcesses += $web
    $records = @(
        @{ name = 'AI'; id = $ai.Id; started = $ai.StartTime.ToUniversalTime().ToString('o') },
        @{ name = 'Web'; id = $web.Id; started = $web.StartTime.ToUniversalTime().ToString('o') }
    )
    $records | ConvertTo-Json | Set-Content -LiteralPath $statePath -Encoding UTF8
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
    if (!$ready) { throw "Services did not become ready. $lastReadinessError`nCheck $logDirectory" }
    & "$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -ExecutionPolicy Bypass -File (Join-Path $projectRoot 'scripts/enable-hotspot.ps1')
    Write-Host 'Photobooth: http://127.0.0.1:8000/'
    Write-Host 'Admin: http://127.0.0.1:8000/admin/'
    Write-Host 'Use stop-photobooth.bat to stop these services.'
} catch {
    foreach ($process in $startedProcesses) {
        if (!$process.HasExited) { Stop-Process -Id $process.Id -ErrorAction SilentlyContinue }
    }
    if (Test-Path -LiteralPath $statePath) { Remove-Item -LiteralPath $statePath }
    throw
}
