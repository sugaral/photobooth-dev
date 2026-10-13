@echo off
chcp 65001 >nul
setlocal EnableExtensions
title Photobooth 智能照相亭一键关闭

cd /d "%~dp0"

echo ==============================================
echo Photobooth 智能照相亭一键关闭
echo ==============================================
echo.
echo 正在停止 Photobooth 所有服务，请稍候...
echo.

rem 1. 停止 PHP Web 服务器 (端口 8000)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000 " 2^>nul') do (
    if not "%%a"=="0" (
        taskkill /f /pid %%a >nul 2>&1
        echo   [已停止] 释放 Web 服务进程 [PID: %%a, 端口 8000]
    )
)

rem 2. 停止 Python AI 抠图服务 (端口 8001)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8001 " 2^>nul') do (
    if not "%%a"=="0" (
        taskkill /f /pid %%a >nul 2>&1
        echo   [已停止] 释放 AI 抠图服务进程 [PID: %%a, 端口 8001]
    )
)

rem 3. 清理可能残留的后台进程
powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \"CommandLine like '%%rembg_service%%'\" -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }" >nul 2>&1

echo.
echo ==============================================
echo [成功] Photobooth 所有服务已完全关闭！
echo ==============================================
echo.
echo 提示：等待 2 秒后自动关闭窗口...
timeout /t 2 /nobreak >nul 2>&1
exit /b 0
