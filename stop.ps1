<#
.SYNOPSIS
    停止 Photobooth 本地服务 (Web 网页服务 + AI 抠图换脸引擎)
#>
[CmdletBinding()]
param(
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
& "$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -ExecutionPolicy Bypass -File $serviceScript -Action stop
$scriptExit = $LASTEXITCODE

if (!$NoPause -and [Environment]::UserInteractive -and ![Console]::IsInputRedirected) {
    Write-Host ""
    Write-Host "按 Enter 键退出此窗口..." -ForegroundColor Gray
    [void][System.Console]::ReadLine()
}

exit $scriptExit
