@echo off
chcp 65001 >nul
setlocal EnableExtensions
title Photobooth 拍照系统 (窗口测试模式)

cd /d "%~dp0"

echo ========================================================
echo   Photobooth 智能拍照系统 [窗口测试模式]
echo   经典大头贴 + AI变身写真 (非全屏 · 方便调试)
echo ========================================================
echo.

rem ========================================================
rem [1/4] 环境依赖与系统完整性检测
rem ========================================================
echo [1/4] 执行环境与文件完整性自检...

rem 1.1 自动定位并检测 PHP
where php >nul 2>&1
if not errorlevel 1 (
    set "PHP_CMD=php"
) else (
    set "PHP_CMD=%LOCALAPPDATA%\Microsoft\WinGet\Packages\PHP.PHP.8.4_Microsoft.Winget.Source_8wekyb3d8bbwe\php.exe"
    if not exist "%PHP_CMD%" (
        echo [错误] 未找到 PHP 环境！
        echo 请安装 PHP 8.4 或将 php.exe 所在目录加入系统 PATH 环境变量。
        pause
        exit /b 1
    )
)

"%PHP_CMD%" -r "exit(version_compare(PHP_VERSION, '8.2.0', '>=') ? 0 : 1);" >nul 2>&1
if errorlevel 1 (
    echo   [警告] 当前 PHP 版本较低，推荐使用 PHP 8.4 或更高版本。
)

"%PHP_CMD%" -r "exit(extension_loaded('gd') ? 0 : 1);" >nul 2>&1
if errorlevel 1 (
    echo   [警告] PHP 未启用 GD 扩展，相纸生成与图像缩放功能可能受影响！
)

rem 1.2 自动定位并检测 Python
if exist "%~dp0.venv\Scripts\python.exe" (
    set "PYTHON_CMD=%~dp0.venv\Scripts\python.exe"
) else if exist "%~dp0venv\Scripts\python.exe" (
    set "PYTHON_CMD=%~dp0venv\Scripts\python.exe"
) else if exist "%~dp0.venv-ai\Scripts\python.exe" (
    set "PYTHON_CMD=%~dp0.venv-ai\Scripts\python.exe"
) else (
    where python >nul 2>&1
    if not errorlevel 1 (
        set "PYTHON_CMD=python"
    ) else (
        echo [错误] 未找到 Python 环境！
        echo 请安装 Python 3 或将其加入系统 PATH 环境变量。
        pause
        exit /b 1
    )
)

"%PYTHON_CMD%" -c "import cv2, numpy" >nul 2>&1
if errorlevel 1 (
    echo   [提示] Python 缺少 opencv-python 或 numpy 库，AI 抠图与换脸可能受影响。
)

rem 1.3 核心文件与基础目录检测
if not exist "%~dp0bin\rembg_service.py" (
    echo [错误] 未找到 bin\rembg_service.py 核心算法服务！
    pause
    exit /b 1
)

if not exist "%~dp0index.php" (
    echo [错误] 未找到 index.php 系统入口文件！
    pause
    exit /b 1
)

if not exist "%~dp0var\log" mkdir "%~dp0var\log" >nul 2>&1
if not exist "%~dp0data\tmp" mkdir "%~dp0data\tmp" >nul 2>&1
if not exist "%~dp0data\images" mkdir "%~dp0data\images" >nul 2>&1

rem 1.4 检查并自动安装 vendor 依赖
if not exist "%~dp0vendor\autoload.php" (
    echo   [提示] 检测到 vendor 依赖缺失，自动执行安装部署...
    "%PHP_CMD%" "%~dp0bin\composer" install --no-dev --optimize-autoloader --no-scripts
    if not exist "%~dp0vendor\autoload.php" (
        echo [错误] vendor 依赖安装失败，请检查 PHP 环境与网络连接。
        pause
        exit /b 1
    )
)

rem 1.5 检查并自动安装前端依赖 (node_modules)
if not exist "%~dp0node_modules\jquery\dist\jquery.min.js" (
    echo   [提示] 检测到前端核心依赖 node_modules 缺失...
    where npm >nul 2>&1
    if not errorlevel 1 (
        echo   [自动修复] 正在运行 npm install 安装必要前端资源，请稍候...
        call npm install --omit=dev --no-audit --no-fund
        if not exist "%~dp0node_modules\jquery\dist\jquery.min.js" (
            echo [错误] 前端依赖安装失败，请手动在根目录执行: npm install
            pause
            exit /b 1
        )
        echo   [成功] 前端依赖库安装完成！
    ) else (
        echo [错误] 前端基础库 node_modules\jquery 缺失且系统未安装 Node.js/npm。
        echo        请安装 Node.js 后执行 npm install，或解压包含完整依赖的发布包。
        pause
        exit /b 1
    )
)

echo   [成功] 运行环境自检通过！
echo.

rem ========================================================
rem [2/4] 清理旧端口占用 (8000 / 8001)
rem ========================================================
echo [2/4] 清理旧端口占用与残留进程 (8000 / 8001)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr /i /r /c:":8000 .*LISTENING" 2^>nul') do (
    taskkill /f /t /pid %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr /i /r /c:":8001 .*LISTENING" 2^>nul') do (
    taskkill /f /t /pid %%a >nul 2>&1
)
powershell -ExecutionPolicy Bypass -NoProfile -Command "Get-CimInstance Win32_Process -ErrorAction SilentlyContinue | Where-Object { ($_.ProcessId -ne $PID) -and ($_.Name -notlike '*powershell*') -and (($_.CommandLine -like '*rembg_service*') -or ($_.CommandLine -like '*-S 127.0.0.1:8000*')) } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }" >nul 2>&1

rem ========================================================
rem [3/4] 启动 Python AI 算法微服务 (8001)
rem ========================================================
echo [3/4] 启动 AI 抠图换脸微服务 (http://127.0.0.1:8001)...
start "Photobooth AI Service" /min "%PYTHON_CMD%" -X utf8 "%~dp0bin\rembg_service.py"

rem ========================================================
rem [4/4] 启动 Web 前端服务并自动打开浏览器 (8000)
rem ========================================================
echo [4/4] 启动 Web 前端服务并在默认浏览器中打开...
echo.
echo ========================================================
echo   服务地址: http://127.0.0.1:8000
echo   当前为 [窗口测试模式]，随时可按 F12 打开控制台调试。
echo   关闭本窗口或双击 stop.bat 即可完全停止服务。
echo ========================================================
echo.

rem 后台异步探测服务就绪并弹出浏览器
start /min "" powershell -NoProfile -WindowStyle Hidden -Command "$ready = $false; for ($i=0; $i -lt 30; $i++) { Start-Sleep -Milliseconds 300; try { $res = Invoke-WebRequest -Uri 'http://127.0.0.1:8000/' -UseBasicParsing -TimeoutSec 1; if ($res.StatusCode -eq 200) { $ready = $true; break } } catch {} }; Start-Process 'http://127.0.0.1:8000'"

"%PHP_CMD%" -d memory_limit=512M -d upload_max_filesize=64M -d post_max_size=64M -S 127.0.0.1:8000
set "EXIT_CODE=%ERRORLEVEL%"

rem 当用户关闭 PHP 时，联动关闭 AI 服务
echo.
echo 正在停止 Photobooth 关联服务...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr /i /r /c:":8001 .*LISTENING" 2^>nul') do (
    taskkill /f /t /pid %%a >nul 2>&1
)
powershell -ExecutionPolicy Bypass -NoProfile -Command "Get-CimInstance Win32_Process -ErrorAction SilentlyContinue | Where-Object { ($_.ProcessId -ne $PID) -and ($_.Name -notlike '*powershell*') -and ($_.CommandLine -like '*rembg_service*') } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }" >nul 2>&1

if not "%EXIT_CODE%"=="0" (
    echo.
    echo [提示] Web 服务已停止 [退出代码: %EXIT_CODE%]。
    pause
)

endlocal
