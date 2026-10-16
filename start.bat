@echo off
setlocal EnableExtensions
title Photobooth 拍照系统 (窗口测试模式)

cd /d "%~dp0"

echo ========================================================
echo   Photobooth 拍照系统 [窗口测试模式]
echo   经典大头贴 + AI变身 (非全屏 · 方便调试)
echo ========================================================
echo.

rem 1. 自动定位 PHP
where php >nul 2>&1
if not errorlevel 1 (
    set "PHP_CMD=php"
) else (
    set "PHP_CMD=%LOCALAPPDATA%\Microsoft\WinGet\Packages\PHP.PHP.8.4_Microsoft.Winget.Source_8wekyb3d8bbwe\php.exe"
    if not exist "%PHP_CMD%" (
        echo [错误] 未找到 PHP 环境！
        echo 请安装 PHP 8.4 或将 php.exe 加入 PATH 环境变量。
        pause
        exit /b 1
    )
)

rem 2. 自动定位 Python（优先虚拟环境）
if exist "%~dp0.venv\Scripts\python.exe" (
    set "PYTHON_CMD=%~dp0.venv\Scripts\python.exe"
) else if exist "%~dp0venv\Scripts\python.exe" (
    set "PYTHON_CMD=%~dp0venv\Scripts\python.exe"
) else (
    where python >nul 2>&1
    if not errorlevel 1 (
        set "PYTHON_CMD=python"
    ) else (
        echo [错误] 未找到 Python 环境！
        echo 请安装 Python 3 或将其加入 PATH 环境变量。
        pause
        exit /b 1
    )
)

if not exist "%~dp0bin\rembg_service.py" (
    echo [错误] 未找到 bin\rembg_service.py 核心服务！
    pause
    exit /b 1
)

rem 3. 检查 PHP 依赖 vendor
if not exist "%~dp0vendor\autoload.php" (
    echo [提示] 检测到 vendor 依赖缺失，自动安装中...
    "%PHP_CMD%" "%~dp0bin\composer" install --no-dev --optimize-autoloader
    if not exist "%~dp0vendor\autoload.php" (
        echo [错误] vendor 依赖安装失败，请检查 PHP 与网络。
        pause
        exit /b 1
    )
)

if not exist "%~dp0var\log" mkdir "%~dp0var\log" >nul 2>&1

echo [1/3] 清理旧端口占用 (8000 / 8001)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000 " 2^>nul') do (
    if not "%%a"=="0" taskkill /f /pid %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8001 " 2^>nul') do (
    if not "%%a"=="0" taskkill /f /pid %%a >nul 2>&1
)

echo [2/3] 启动 AI 抠图换脸微服务 (http://127.0.0.1:8001)...
start "Photobooth AI Service" /min "%PYTHON_CMD%" -X utf8 "%~dp0bin\rembg_service.py"

echo [3/3] 启动 Web 前端服务并在默认浏览器中打开...
echo.
echo ========================================================
echo   服务地址: http://127.0.0.1:8000
echo   当前为 [窗口测试模式]，随时可按 F12 打开控制台调试。
echo   关闭本窗口或双击 stop.bat 即可完全停止服务。
echo ========================================================
echo.

rem 后台异步检测并在服务就绪后用普通窗口打开默认浏览器
start /min "" powershell -NoProfile -WindowStyle Hidden -Command "$ready = $false; for ($i=0; $i -lt 30; $i++) { Start-Sleep -Milliseconds 300; try { $res = Invoke-WebRequest -Uri 'http://127.0.0.1:8000/' -UseBasicParsing -TimeoutSec 1; if ($res.StatusCode -eq 200) { $ready = $true; break } } catch {} }; Start-Process 'http://127.0.0.1:8000'"

"%PHP_CMD%" -d memory_limit=512M -d upload_max_filesize=64M -d post_max_size=64M -S 127.0.0.1:8000

rem 当用户关闭 PHP 时，联动关闭 AI 服务
echo.
echo 正在停止 Photobooth 关联服务...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8001 " 2^>nul') do (
    if not "%%a"=="0" taskkill /f /pid %%a >nul 2>&1
)

endlocal
