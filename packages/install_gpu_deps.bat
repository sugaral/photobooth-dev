@echo off
chcp 65001 >nul
echo ========================================================
echo   Photobooth AI GPU 加速环境一键安装部署 (CUDA 12 + cuDNN 9)
echo ========================================================
echo.
echo 正在卸载冲突的 CPU onnxruntime 版本...
python -m pip uninstall -y onnxruntime >nul 2>&1

echo 正在从本地 packages 目录离线安装 onnxruntime-gpu 1.26.0 与 nvidia-cudnn-cu12...
python -m pip install --no-index --find-links="%~dp0." onnxruntime-gpu==1.26.0 nvidia-cudnn-cu12
if %ERRORLEVEL% NEQ 0 (
    echo [提示] 离线安装失败，尝试在线通过阿里云镜像源安装...
    python -m pip install -i https://mirrors.aliyun.com/pypi/simple/ onnxruntime-gpu==1.26.0 nvidia-cudnn-cu12
)

echo.
echo 验证环境与 DLL 动态注册...
python -c "import sys; sys.path.insert(0, '%~dp0..\bin'); import cuda_init; dirs=cuda_init.setup_cuda_dll_paths(verbose=True); import onnxruntime as ort; print('ONNX Runtime 版本:', ort.__version__); print('可用推理设备:', ort.get_available_providers())"

echo.
echo ========================================================
echo   GPU 加速环境安装与配置已完成！
echo ========================================================
pause
