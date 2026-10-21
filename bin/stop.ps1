# Photobooth 一键完全关闭脚本
$Host.UI.RawUI.WindowTitle = "Photobooth 拍照系统 一键关闭"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Photobooth 拍照系统 一键完全关闭" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "正在停止 Photobooth 所有服务与进程..."
Write-Host ""

$stoppedCount = 0

# 1. 查找并停止监听 8000 和 8001 端口的服务
Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Where-Object { $_.LocalPort -in 8000, 8001 } | ForEach-Object {
    $procId = $_.OwningProcess
    if ($procId -gt 0) {
        try {
            $p = Get-Process -Id $procId -ErrorAction Stop
            $port = $_.LocalPort
            Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
            Write-Host "  [已停止] 释放端口 $port 服务: $($p.ProcessName) [PID: $procId]" -ForegroundColor Green
            $stoppedCount++
        } catch {}
    }
}

# 2. 终止残留的后台服务进程
Get-CimInstance Win32_Process -ErrorAction SilentlyContinue | Where-Object {
    ($_.ProcessId -ne $PID) -and
    ($_.Name -notlike '*powershell*') -and
    (($_.CommandLine -like '*rembg_service*') -or ($_.CommandLine -like '*-S 127.0.0.1:8000*'))
} | ForEach-Object {
    $procId = $_.ProcessId
    try {
        Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
        Write-Host "  [已停止] 终止后台进程: $($_.Name) [PID: $procId]" -ForegroundColor Green
        $stoppedCount++
    } catch {}
}

if ($stoppedCount -eq 0) {
    Write-Host "  [正常] 8000/8001 端口与服务未处于运行状态，无需重复停止。" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  [成功] Photobooth 所有服务已完全关闭并释放端口！" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""
Start-Sleep -Seconds 2
