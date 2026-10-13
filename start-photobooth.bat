@echo off
chcp 65001 >nul
setlocal EnableExtensions
title Photobooth 智能照相亭一键启动器

cd /d "%~dp0"

echo ==============================================
echo Photobooth 智能照相亭一键启动器
echo ==============================================
echo.

rem 1. 自动定位 PHP
where php >nul 2>&1
if not errorlevel 1 (
    set "PHP_CMD=php"
) else (
    set "PHP_CMD=%LOCALAPPDATA%\Microsoft\WinGet\Packages\PHP.PHP.8.4_Microsoft.Winget.Source_8wekyb3d8bbwe\php.exe"
    if not exist "%PHP_CMD%" (
        echo [错误] 未找到 PHP 环境。
        echo 请安装 PHP 8.4 并将 php.exe 添加至 PATH 环境变量。
        pause
        exit /b 1
    )
)

rem 2. 自动定位 Python（优先使用项目虚拟环境）
if exist "%~dp0.venv\Scripts\python.exe" (
    set "PYTHON_CMD=%~dp0.venv\Scripts\python.exe"
) else if exist "%~dp0venv\Scripts\python.exe" (
    set "PYTHON_CMD=%~dp0venv\Scripts\python.exe"
) else (
    where python >nul 2>&1
    if not errorlevel 1 (
        set "PYTHON_CMD=python"
    ) else (
        echo [错误] 未找到 Python 环境。
        echo 请安装 Python 3 并将其添加至 PATH 环境变量。
        pause
        exit /b 1
    )
)

if not exist "%~dp0bin\rembg_service.py" (
    echo [错误] 未找到 bin\rembg_service.py。
    pause
    exit /b 1
)

if not exist "%~dp0var\log" mkdir "%~dp0var\log" >nul 2>&1

echo [1/3] 清理残留孤儿进程与端口占用 (8000 / 8001)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000 " 2^>nul') do (
    if not "%%a"=="0" taskkill /f /pid %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8001 " 2^>nul') do (
    if not "%%a"=="0" taskkill /f /pid %%a >nul 2>&1
)

echo [2/3] 启动 AI 抠图后台服务 (http://127.0.0.1:8001)...
start "Photobooth AI Service" /min "%PYTHON_CMD%" "%~dp0bin\rembg_service.py"

rem 开启 PHP 内置服务器的多 Worker 并发模式，避免静态资源并发请求卡死
set PHP_CLI_SERVER_WORKERS=4

echo [3/3] 启动 Web 服务器并准备开启前端界面...
echo.
echo ==============================================
echo 服务运行中: http://127.0.0.1:8000
echo 请勿关闭本窗口。在窗口中按 Ctrl+C 可停止服务器。
echo 若需一键退出，可双击运行 stop-photobooth.bat。
echo ==============================================
echo.

rem 后台就绪监听器：等 Web 服务器 200 就绪后自动打开浏览器
start /min "" powershell -NoProfile -WindowStyle Hidden -Command "$ready = $false; for ($i=0; $i -lt 30; $i++) { Start-Sleep -Milliseconds 300; try { $res = Invoke-WebRequest -Uri 'http://127.0.0.1:8000/' -UseBasicParsing -TimeoutSec 1; if ($res.StatusCode -eq 200) { $ready = $true; break } } catch {} }; Start-Process 'http://127.0.0.1:8000'"

"%PHP_CMD%" -d memory_limit=512M -d upload_max_filesize=64M -d post_max_size=64M -S 127.0.0.1:8000

rem PHP 退出后清理后台 AI 服务
echo.
echo 正在停止 Photobooth 相关服务...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8001 " 2^>nul') do (
    if not "%%a"=="0" taskkill /f /pid %%a >nul 2>&1
)

endlocal
