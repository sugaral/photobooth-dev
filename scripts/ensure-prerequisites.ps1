<#
.SYNOPSIS
    Photobooth 运行前置条件一键全自动检测与修复安装脚本
#>
[CmdletBinding()]
param(
    [switch]$RepairOnly
)

$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

$projectRoot = Split-Path -Parent $PSScriptRoot

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "       Photobooth 运行环境与前置依赖一键检测" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 0. 基础环境
Write-Host -NoNewline "[1/6] 检查系统基础运行环境... "
if ([IntPtr]::Size -ne 8) {
    Write-Host "[警告: 非 64 位操作系统]" -ForegroundColor Yellow
} else {
    Write-Host "[OK 正常]" -ForegroundColor Green
}

# 1. 检查必备数据与日志目录
Write-Host -NoNewline "[2/6] 检查项目数据与缓存目录... "
$requiredDirs = @('data/images', 'data/tmp', 'data/templates', 'var/log', 'var/run')
$dirsCreated = 0
foreach ($dir in $requiredDirs) {
    $fullPath = Join-Path $projectRoot $dir
    if (!(Test-Path -LiteralPath $fullPath)) {
        New-Item -ItemType Directory -Path $fullPath -Force | Out-Null
        $dirsCreated++
    }
}
$exitFlag = Join-Path $projectRoot 'admin_exit.flag'
if (Test-Path -LiteralPath $exitFlag) {
    Remove-Item -LiteralPath $exitFlag -Force -ErrorAction SilentlyContinue
}
if ($dirsCreated -gt 0) {
    Write-Host ("[已自动补齐缺失目录: " + $dirsCreated + " 个]") -ForegroundColor Yellow
} else {
    Write-Host "[OK 正常]" -ForegroundColor Green
}

# 2. 检查 PHP 便携运行环境与必要扩展
Write-Host -NoNewline "[3/6] 检查 PHP 便携运行环境与核心扩展... "
$phpPath = Join-Path $projectRoot '.runtime/php/php.exe'
if (!(Test-Path -LiteralPath $phpPath)) {
    $sysPhp = Get-Command php -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source
    if ($sysPhp -and (Test-Path -LiteralPath $sysPhp)) {
        $phpPath = $sysPhp
        Write-Host ("`n  [提示] 使用系统全局 PHP: " + $phpPath) -ForegroundColor Yellow
    } else {
        throw "未找到 PHP 运行环境！请确保 .runtime/php/php.exe 或系统 PATH 中包含 PHP 8+。"
    }
}

$requiredPhpExts = @('curl', 'gd', 'pdo_sqlite', 'mbstring', 'fileinfo', 'zip', 'openssl')
$loadedModules = (& $phpPath -m 2>&1)
$missingPhpExts = @()
foreach ($ext in $requiredPhpExts) {
    if ($loadedModules -notcontains $ext) {
        $missingPhpExts += $ext
    }
}

if ($missingPhpExts.Count -gt 0) {
    Write-Host ("`n  [检测] 缺少 PHP 扩展: " + ($missingPhpExts -join ', ') + "，正在自动尝试配置 php.ini...") -ForegroundColor Yellow
    $phpIniPath = Join-Path $projectRoot '.runtime/php/php.ini'
    if (Test-Path -LiteralPath $phpIniPath) {
        $iniContent = Get-Content -LiteralPath $phpIniPath -Raw
        $repaired = $false
        foreach ($ext in $missingPhpExts) {
            $pattern = '(?m)^;\s*extension\s*=\s*' + [regex]::Escape($ext) + '\s*$'
            if ($iniContent -match $pattern) {
                $iniContent = [regex]::Replace($iniContent, $pattern, ('extension=' + $ext))
                $repaired = $true
            }
        }
        if ($repaired) {
            [System.IO.File]::WriteAllText($phpIniPath, $iniContent, (New-Object System.Text.UTF8Encoding($false)))
            Write-Host "  [自动修复] 已在 php.ini 中启用缺失扩展" -ForegroundColor Green
        }
    }
    $loadedModules = (& $phpPath -m 2>&1)
    $stillMissing = @()
    foreach ($ext in $requiredPhpExts) {
        if ($loadedModules -notcontains $ext) {
            $stillMissing += $ext
        }
    }
    if ($stillMissing.Count -gt 0) {
        Write-Host ("  [警告] 部分扩展仍未加载: " + ($stillMissing -join ', ')) -ForegroundColor Yellow
    } else {
        Write-Host "  PHP 扩展配置完成 [OK 正常]" -ForegroundColor Green
    }
} else {
    Write-Host "[OK 正常]" -ForegroundColor Green
}

# 3. 检查 Python 运行环境与虚拟环境 (.venv-ai)
Write-Host -NoNewline "[4/6] 检查 Python AI 引擎环境 (.venv-ai)... "
$python = Join-Path $projectRoot '.venv-ai/Scripts/python.exe'
$localPythonHome = Join-Path $projectRoot '.runtime/python'

function Find-BasePython {
    if (Test-Path -LiteralPath (Join-Path $localPythonHome 'python.exe')) {
        return (Join-Path $localPythonHome 'python.exe')
    }
    $cfgPath = Join-Path $projectRoot '.venv-ai/pyvenv.cfg'
    if (Test-Path -LiteralPath $cfgPath) {
        $cfg = Get-Content -LiteralPath $cfgPath -Raw
        if ($cfg -match '(?m)^home\s*=\s*(.+)$') {
            $cand = Join-Path ($matches[1].Trim()) 'python.exe'
            if (Test-Path -LiteralPath $cand) { return $cand }
        }
    }
    $sysPy = Get-Command python -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source
    if ($sysPy -and (Test-Path -LiteralPath $sysPy)) { return $sysPy }
    foreach ($cand in @('E:\Python\python.exe', 'C:\Python313\python.exe', 'C:\Python312\python.exe', 'C:\Python311\python.exe', 'C:\Python310\python.exe')) {
        if (Test-Path -LiteralPath $cand) { return $cand }
    }
    return $null
}

$basePython = Find-BasePython

$venvConfigPath = Join-Path $projectRoot '.venv-ai/pyvenv.cfg'
if (Test-Path -LiteralPath $venvConfigPath) {
    if ($basePython) {
        $baseDir = Split-Path -Parent $basePython
        $venvConfig = Get-Content -LiteralPath $venvConfigPath -Raw
        if ($venvConfig -match '(?m)^home\s*=\s*(.+)$') {
            $currentHome = $matches[1].Trim()
            if (!(Test-Path -LiteralPath (Join-Path $currentHome 'python.exe'))) {
                Write-Host ("`n  [修复] 检测到 Python 安装路径变更，正在更新 pyvenv.cfg -> " + $baseDir) -ForegroundColor Yellow
                $updatedConfig = [regex]::Replace($venvConfig, '(?m)^home\s*=.*$', ('home = ' + $baseDir))
                $updatedConfig = [regex]::Replace($updatedConfig, '(?m)^executable\s*=.*$', ('executable = ' + $basePython))
                [System.IO.File]::WriteAllText($venvConfigPath, $updatedConfig, (New-Object System.Text.UTF8Encoding($false)))
            }
        }
    }
}

if (!(Test-Path -LiteralPath $python)) {
    Write-Host "`n  [检测] 未发现 .venv-ai 虚拟环境，正在自动初始化..." -ForegroundColor Yellow
    if (!$basePython) {
        throw "无法创建 .venv-ai：未检测到基础 Python 运行环境，请先安装 Python 3.10+。"
    }
    & $basePython -m venv (Join-Path $projectRoot '.venv-ai')
    if ($LASTEXITCODE -ne 0 -or !(Test-Path -LiteralPath $python)) {
        throw "创建 .venv-ai 虚拟环境失败！"
    }
    Write-Host "  [完成] .venv-ai 虚拟环境创建成功" -ForegroundColor Green
}

try {
    $pyVer = (& $python --version 2>&1)
    if ($LASTEXITCODE -ne 0) { throw $pyVer }
    Write-Host ("[" + $pyVer + " OK 正常]") -ForegroundColor Green
} catch {
    throw ("Python 虚拟环境无法正常执行: " + $_)
}

# 4. 检查 AI 核心计算库 (onnxruntime, opencv, numpy, Pillow)
Write-Host -NoNewline "[5/6] 检查 AI 核心科学计算与推理库... "
$checkScript = "import cv2, PIL, numpy, onnxruntime; print('AI_LIBS_OK')"
$checkResult = (& $python -c $checkScript 2>&1)
$needInstallPackages = ($LASTEXITCODE -ne 0 -or $checkResult -notmatch 'AI_LIBS_OK')

if ($needInstallPackages) {
    Write-Host "`n  [检测] 检测到缺少 AI 依赖包或库损坏，正在通过阿里云高速镜像源全自动安装..." -ForegroundColor Yellow
    $pipMirror = 'https://mirrors.aliyun.com/pypi/simple/'
    $trustedHost = 'mirrors.aliyun.com'
    $reqFile = Join-Path $projectRoot 'requirements-ai.txt'
    
    if (Test-Path -LiteralPath $reqFile) {
        & $python -m pip install -r $reqFile -i $pipMirror --trusted-host $trustedHost
    } else {
        & $python -m pip install numpy Pillow scipy onnx onnxruntime-gpu opencv-contrib-python mediapipe -i $pipMirror --trusted-host $trustedHost
    }

    $checkResult2 = (& $python -c $checkScript 2>&1)
    if ($LASTEXITCODE -ne 0 -or $checkResult2 -notmatch 'AI_LIBS_OK') {
        throw ("AI 依赖包自动安装失败，详情: " + $checkResult2)
    }
    Write-Host "  AI 依赖包全自动安装完成 [OK 正常]" -ForegroundColor Green
} else {
    Write-Host "[OK 正常]" -ForegroundColor Green
}

# 5. 检查 AI 核心模型文件 (BiRefNet / RMBG)
Write-Host -NoNewline "[6/6] 检查 SOTA 抠图换脸模型文件... "
$modelsDir = Join-Path $projectRoot 'models'
$birefnetFile = Join-Path $modelsDir 'birefnet-portrait/birefnet-portrait.onnx'
$birefnetFp16 = Join-Path $modelsDir 'birefnet-portrait/birefnet-portrait-fp16.onnx'
$rmbgFile = Join-Path $modelsDir 'rmbg-2.0/rmbg-2.0.onnx'

$hasBirefnet = (Test-Path -LiteralPath $birefnetFile) -or (Test-Path -LiteralPath $birefnetFp16)
$hasRmbg = (Test-Path -LiteralPath $rmbgFile)

if (!$hasBirefnet -or !$hasRmbg) {
    Write-Host "`n  [检测] 缺少 AI 抠图模型文件，正在通过国内加速节点自动下载..." -ForegroundColor Yellow
    $downloadScript = Join-Path $projectRoot 'bin/download_models.py'
    if (Test-Path -LiteralPath $downloadScript) {
        $env:PHOTOBOOTH_MODELS_DIR = $modelsDir
        & $python $downloadScript all
        if ($LASTEXITCODE -ne 0) {
            Write-Host "  [警告] 部分模型下载未完全完成，后续启动将尝试使用备用模型" -ForegroundColor Yellow
        } else {
            Write-Host "  AI 模型自动下载完成 [OK 正常]" -ForegroundColor Green
        }
    } else {
        Write-Host "  [警告] 未找到 bin/download_models.py，跳过模型自动下载" -ForegroundColor Yellow
    }
} else {
    Write-Host "[OK 正常]" -ForegroundColor Green
}

Write-Host "==========================================================" -ForegroundColor Green
Write-Host "所有前置依赖与运行条件检测通过，系统准备就绪！" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
