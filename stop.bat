@echo off
chcp 65001 >nul
setlocal EnableExtensions EnableDelayedExpansion
title Photobooth 拍照系统 一键关闭

cd /d "%~dp0"

echo ========================================================
echo   Photobooth 拍照系统 一键完全关闭
echo ========================================================
echo.
echo 正在停止 Photobooth 所有服务与进程...
echo.

set "STOPPED_COUNT=0"

rem 1. 停止 PHP Web 服务 (端口 8000)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr /i /r /c:":8000 .*LISTENING" 2^>nul') do (
    taskkill /f /t /pid %%a >nul 2>&1
    if not errorlevel 1 (
        echo   [已停止] 释放 Web 服务 [PID: %%a, 端口 8000]
        set /a STOPPED_COUNT+=1
    )
)

rem 2. 停止 Python AI 微服务 (端口 8001)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr /i /r /c:":8001 .*LISTENING" 2^>nul') do (
    taskkill /f /t /pid %%a >nul 2>&1
    if not errorlevel 1 (
        echo   [已停止] 释放 AI 微服务 [PID: %%a, 端口 8001]
        set /a STOPPED_COUNT+=1
    )
)

rem 3. 清理残留后台服务进程
powershell -ExecutionPolicy Bypass -NoProfile -Command "Get-CimInstance Win32_Process -ErrorAction SilentlyContinue | Where-Object { ($_.ProcessId -ne $PID) -and ($_.Name -notlike '*powershell*') -and (($_.CommandLine -like '*rembg_service*') -or ($_.CommandLine -like '*-S 127.0.0.1:8000*')) } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue; Write-Host ('  [已停止] 终止残留进程: {0} [PID: {1}]' -f $_.Name, $_.ProcessId) }"

if !STOPPED_COUNT! EQU 0 (
    echo   [正常] 8000/8001 端口与服务未处于运行状态，无需重复停止。
)

echo.
echo ========================================================
echo   [成功] Photobooth 所有服务已完全关闭并释放端口！
echo ========================================================
echo.
ping 127.0.0.1 -n 3 >nul 2>&1
exit /b 0
