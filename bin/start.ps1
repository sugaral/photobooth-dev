# Photobooth 智能拍照系统 启动脚本 (PowerShell 核心驱动)
$Host.UI.RawUI.WindowTitle = "Photobooth 智能拍照系统 [窗口测试模式]"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$rootDir = Split-Path -Parent $PSScriptRoot

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Photobooth 智能拍照系统 [窗口测试模式]" -ForegroundColor Cyan
Write-Host "  经典大头贴 + AI变身写真 (非全屏 · 方便调试)" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

# ========================================================
# [1/4] 执行环境与文件完整性自检
# ========================================================
Write-Host "[1/4] 执行环境与文件完整性自检..." -ForegroundColor Yellow

# 1.1 查找 PHP
$phpCmd = $null
if (Get-Command php -ErrorAction SilentlyContinue) {
    $phpCmd = "php"
} elseif (Test-Path "$rootDir\php\php.exe") {
    $phpCmd = "$rootDir\php\php.exe"
} elseif (Test-Path "C:\php\php.exe") {
    $phpCmd = "C:\php\php.exe"
}

if (-not $phpCmd) {
    Write-Host "[错误] 系统未检测到 PHP 环境！" -ForegroundColor Red
    Write-Host "       请安装 PHP 8.2+ 并将其加入系统环境变量 PATH 中。" -ForegroundColor Red
    pause
    exit 1
}

$phpVer = & $phpCmd -v 2>$null | Select-Object -First 1
Write-Host "  [OK] 检测到 PHP: $phpVer" -ForegroundColor Green

$phpExts = & $phpCmd -m 2>$null
if ($phpExts -notcontains "gd") {
    Write-Host "  [警告] PHP 缺少 gd 图像扩展，滤镜与拼图处理可能会受限。" -ForegroundColor Yellow
}
if ($phpExts -notcontains "mbstring") {
    Write-Host "  [警告] PHP 缺少 mbstring 扩展，中文字符处理可能会受限。" -ForegroundColor Yellow
}

# 1.2 查找 Python
$pythonCmd = $null
if (Test-Path "$rootDir\.venv\Scripts\python.exe") {
    $pythonCmd = "$rootDir\.venv\Scripts\python.exe"
} elseif (Test-Path "$rootDir\venv\Scripts\python.exe") {
    $pythonCmd = "$rootDir\venv\Scripts\python.exe"
} elseif (Get-Command python -ErrorAction SilentlyContinue) {
    $pythonCmd = "python"
}

if (-not $pythonCmd) {
    Write-Host "[错误] 系统未检测到 Python 环境！" -ForegroundColor Red
    Write-Host "       AI 换脸抠图服务需要 Python 3.10+ 环境。" -ForegroundColor Red
    pause
    exit 1
}

$pyVer = & $pythonCmd --version 2>$null
Write-Host "  [OK] 检测到 Python: $pyVer" -ForegroundColor Green

# 检查 Python 核心图像库
$pyCheck = & $pythonCmd -c "import cv2, PIL, numpy; print('CV_OK')" 2>$null
if ($pyCheck -ne "CV_OK") {
    Write-Host "  [警告] Python 缺少 opencv-python / Pillow / numpy，AI 服务可能无法正常使用。" -ForegroundColor Yellow
    Write-Host "         可运行: pip install opencv-python pillow numpy" -ForegroundColor Yellow
}

# 1.3 核心文件与目录检测
if (-not (Test-Path "$rootDir\bin\rembg_service.py")) {
    Write-Host "[错误] 未找到 bin\rembg_service.py 核心算法服务！" -ForegroundColor Red
    pause
    exit 1
}
if (-not (Test-Path "$rootDir\index.php")) {
    Write-Host "[错误] 未找到 index.php 系统入口文件！" -ForegroundColor Red
    pause
    exit 1
}

@("$rootDir\var\log", "$rootDir\data\tmp", "$rootDir\data\images") | ForEach-Object {
    if (-not (Test-Path $_)) { New-Item -ItemType Directory -Path $_ -Force | Out-Null }
}

# 1.4 检查 Composer vendor 依赖
if (-not (Test-Path "$rootDir\vendor\autoload.php")) {
    Write-Host "  [提示] 检测到 vendor 依赖缺失，自动执行安装部署..." -ForegroundColor Yellow
    & $phpCmd "$rootDir\bin\composer" install --no-dev --optimize-autoloader --no-scripts
    if (-not (Test-Path "$rootDir\vendor\autoload.php")) {
        Write-Host "[错误] vendor 依赖安装失败，请检查 PHP 环境与网络连接。" -ForegroundColor Red
        pause
        exit 1
    }
}

# 1.5 检查 前端 node_modules 依赖
if (-not (Test-Path "$rootDir\node_modules\jquery\dist\jquery.min.js")) {
    Write-Host "  [提示] 检测到前端核心依赖 node_modules 缺失..." -ForegroundColor Yellow
    if (Get-Command npm -ErrorAction SilentlyContinue) {
        Write-Host "  [自动修复] 正在运行 npm install 安装必要前端资源，请稍候..." -ForegroundColor Yellow
        cmd.exe /c "npm install --omit=dev --no-audit --no-fund"
        if (-not (Test-Path "$rootDir\node_modules\jquery\dist\jquery.min.js")) {
            Write-Host "[错误] 前端依赖安装失败，请手动在项目根目录下执行: npm install" -ForegroundColor Red
            pause
            exit 1
        }
        Write-Host "  [成功] 前端依赖库安装完成！" -ForegroundColor Green
    } else {
        Write-Host "[错误] 前端核心库 node_modules\jquery 缺失且系统未安装 Node.js/npm。" -ForegroundColor Red
        Write-Host "       请安装 Node.js 后执行 npm install，或解压包含完整依赖的发布包。" -ForegroundColor Red
        pause
        exit 1
    }
}

Write-Host "  [成功] 运行环境自检通过！" -ForegroundColor Green
Write-Host ""

# ========================================================
# [2/4] 清理旧端口占用与残留进程 (8000 / 8001)
# ========================================================
Write-Host "[2/4] 清理旧端口占用与残留进程 (8000 / 8001)..." -ForegroundColor Yellow

Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Where-Object { $_.LocalPort -in 8000, 8001 } | ForEach-Object {
    $procId = $_.OwningProcess
    if ($procId -gt 0) {
        Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
    }
}

Get-CimInstance Win32_Process -ErrorAction SilentlyContinue | Where-Object {
    ($_.ProcessId -ne $PID) -and
    ($_.Name -notlike '*powershell*') -and
    (($_.CommandLine -like '*rembg_service*') -or ($_.CommandLine -like '*-S 127.0.0.1:8000*'))
} | ForEach-Object {
    Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
}

# ========================================================
# [3/4] 启动 Python AI 算法微服务 (8001)
# ========================================================
Write-Host "[3/4] 启动 AI 抠图换脸微服务 (http://127.0.0.1:8001)..." -ForegroundColor Yellow
Start-Process -FilePath $pythonCmd -ArgumentList "-X utf8 `"$rootDir\bin\rembg_service.py`"" -WindowStyle Minimized

# ========================================================
# [4/4] 启动 Web 前端服务并自动打开浏览器 (8000)
# ========================================================
Write-Host "[4/4] 启动 Web 前端服务并在默认浏览器中打开..." -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  服务地址: http://127.0.0.1:8000" -ForegroundColor Cyan
Write-Host "  当前为 [窗口测试模式]，随时可按 F12 打开控制台调试。" -ForegroundColor Cyan
Write-Host "  关闭本窗口或运行 stop.bat 即可完全停止服务。" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

# 后台异步探测服务就绪并弹出浏览器
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoProfile -WindowStyle Hidden -Command `"`$ready = `$false; for (`$i=0; `$i -lt 30; `$i++) { Start-Sleep -Milliseconds 300; try { `$res = Invoke-WebRequest -Uri 'http://127.0.0.1:8000/' -UseBasicParsing -TimeoutSec 1; if (`$res.StatusCode -eq 200) { `$ready = `$true; break } } catch {} }; Start-Process 'http://127.0.0.1:8000'`"" -WindowStyle Hidden

try {
    # 在前台运行 PHP 内置 Web 服务器
    & $phpCmd -d memory_limit=512M -d upload_max_filesize=64M -d post_max_size=64M -S 127.0.0.1:8000
} finally {
    Write-Host ""
    Write-Host "正在停止 Photobooth 关联服务..." -ForegroundColor Yellow
    Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Where-Object { $_.LocalPort -eq 8001 } | ForEach-Object {
        if ($_.OwningProcess -gt 0) {
            Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
        }
    }
    Get-CimInstance Win32_Process -ErrorAction SilentlyContinue | Where-Object {
        ($_.ProcessId -ne $PID) -and
        ($_.Name -notlike '*powershell*') -and
        ($_.CommandLine -like '*rembg_service*')
    } | ForEach-Object {
        Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
    }
}
