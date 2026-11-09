<#
.SYNOPSIS
    启动 Photobooth 本地服务 (Web 网页服务 + AI 抠图换脸引擎)
#>
[CmdletBinding()]
param(
    [switch]$NoBrowser,
    [switch]$NoPause,
    [switch]$SkipCheck
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

if (Test-Path -LiteralPath (Join-Path $PSScriptRoot 'scripts\local-services.ps1')) {
    $devDir = $PSScriptRoot
} else {
    $devDir = Join-Path $PSScriptRoot 'photobooth-dev'
}
Set-Location -LiteralPath $devDir

# 1. 运行前置条件一键全自动检测与自愈修复
if (!$SkipCheck) {
    $preReqScript = Join-Path $devDir 'scripts\ensure-prerequisites.ps1'
    if (Test-Path -LiteralPath $preReqScript) {
        & "$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -ExecutionPolicy Bypass -File $preReqScript
        if ($LASTEXITCODE -ne 0) {
            Write-Host "`n[错误] 前置依赖环境检测失败，无法继续启动！" -ForegroundColor Red
            exit $LASTEXITCODE
        }
    }
}

# 2. 启动本地服务 (Web + AI)
$serviceScript = Join-Path $devDir 'scripts\local-services.ps1'
& "$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -ExecutionPolicy Bypass -File $serviceScript -Action start
$scriptExit = $LASTEXITCODE

# 3. 成功后拉起浏览器
if ($scriptExit -eq 0 -and !$NoBrowser) {
    try {
        Start-Process "http://127.0.0.1:8000/"
    } catch {}
}

# 4. 如果交互运行且未禁用暂停，等待用户
if (!$NoPause -and [Environment]::UserInteractive -and ![Console]::IsInputRedirected) {
    Write-Host ""
    Write-Host "按 Enter 键退出此窗口 (服务将在后台持续运行)..." -ForegroundColor Gray
    [void][System.Console]::ReadLine()
}

exit $scriptExit
