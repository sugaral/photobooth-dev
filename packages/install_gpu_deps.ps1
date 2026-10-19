# Photobooth AI GPU 加速环境一键安装部署脚本 (PowerShell)
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   Photobooth AI GPU 加速环境一键安装部署 (CUDA 12 + cuDNN 9)" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir

Write-Host "`n[1/3] 正在卸载冲突的 CPU onnxruntime 版本..." -ForegroundColor Yellow
& python -m pip uninstall -y onnxruntime 2>$null

Write-Host "`n[2/3] 正在从本地 packages 目录离线安装 onnxruntime-gpu 1.26.0 与 nvidia-cudnn-cu12..." -ForegroundColor Yellow
& python -m pip install --no-index --find-links="$scriptDir" onnxruntime-gpu==1.26.0 nvidia-cudnn-cu12

if ($LASTEXITCODE -ne 0) {
    Write-Host "[提示] 离线安装失败，尝试在线通过阿里云镜像源安装..." -ForegroundColor Yellow
    & python -m pip install -i https://mirrors.aliyun.com/pypi/simple/ onnxruntime-gpu==1.26.0 nvidia-cudnn-cu12
}

Write-Host "`n[3/3] 验证环境与 DLL 动态注册..." -ForegroundColor Yellow
$testCmd = @"
import sys
sys.path.insert(0, r'$projectRoot\bin')
import cuda_init
dirs = cuda_init.setup_cuda_dll_paths(verbose=True)
import onnxruntime as ort
print(f'ONNX Runtime 版本: {ort.__version__}')
print(f'可用推理设备: {ort.get_available_providers()}')
"@

& python -c $testCmd

Write-Host "`n========================================================" -ForegroundColor Green
Write-Host "   GPU 加速环境安装与配置完成！" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
