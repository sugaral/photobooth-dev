<#
.SYNOPSIS
    重启 Photobooth 本地服务 (Web 网页服务 + AI 抠图换脸引擎)
#>
[CmdletBinding()]
param(
    [switch]$NoBrowser,
    [switch]$NoPause
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

if (Test-Path -LiteralPath (Join-Path $PSScriptRoot 'scripts\local-services.ps1')) {
    $devDir = $PSScriptRoot
} else {
    $devDir = Join-Path $PSScriptRoot 'photobooth-dev'
}
Set-Location -LiteralPath $devDir

$serviceScript = Join-Path $devDir 'scripts\local-services.ps1'
& "$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -ExecutionPolicy Bypass -File $serviceScript -Action restart
$scriptExit = $LASTEXITCODE

if ($scriptExit -eq 0 -and !$NoBrowser) {
    try {
        Start-Process "http://127.0.0.1:8000/"
    } catch {}
}

if (!$NoPause -and [Environment]::UserInteractive -and ![Console]::IsInputRedirected) {
    Write-Host ""
    Write-Host "按 Enter 键退出此窗口 (服务将在后台持续运行)..." -ForegroundColor Gray
    [void][System.Console]::ReadLine()
}

exit $scriptExit
