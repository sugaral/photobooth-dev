# 📦 Photobooth AI 离线依赖环境包 (Offline Packages)

本目录用于存放系统 GPU 加速与 AI 推理所需的离线二进制环境依赖包（Wheel 文件及一键安装脚本）。

---

## 📂 目录清单

- **`onnxruntime_gpu-1.26.0-cp313-cp313-win_amd64.whl`**  
  微软官方 ONNX Runtime GPU 核心计算引擎二进制包（针对 Python 3.13 与 CUDA 12 构建）。针对 RTX 40/50 系列在 CUDA 12 环境下完美适配，动态调用 `cublas64_12.dll`、`cublasLt64_12.dll` 与 `cudnn64_9.dll`，彻底杜绝高版本 (1.27+/1.31) 强行调用不存在的 CUDA 13 DLL (`cublasLt64_13.dll`) 导致的运行时异常与 CPU 虚高回退。

- **`nvidia_cudnn_cu12-9.27.0.42-py3-none-win_amd64.whl`**  
  NVIDIA cuDNN 9 官方独立预编译二进制包（针对 CUDA 12 构建），内含完整的 `cudnn64_9.dll`、`cudnn_cnn64_9.dll`、`cudnn_ops64_9.dll`、`cudnn_adv64_9.dll` 等动态链接库。

- **`install_gpu_deps.bat`**  
  Windows 平台批处理一键安装脚本，自动卸载冲突的 CPU 版 onnxruntime，并调用当前 Python 解释器从本地目录离线安装 GPU 依赖与 cuDNN，即时验证 DLL 动态注册与 GPU Provider。

- **`install_gpu_deps.ps1`**  
  PowerShell 跨平台自动化安装脚本，具备彩色控制台输出与自检功能。

---

## 🚀 安装方法

### 方式 1：双击批处理一键安装（推荐）
在 Windows 资源管理器中直接双击运行：
```
packages\install_gpu_deps.bat
```

### 方式 2：PowerShell 终端执行
打开 PowerShell 并运行：
```powershell
.\packages\install_gpu_deps.ps1
```

### 方式 3：手动 pip 离线安装命令
在项目根目录下执行：
```bash
python -m pip uninstall -y onnxruntime
python -m pip install --no-index --find-links=packages onnxruntime-gpu==1.26.0 nvidia-cudnn-cu12
```

---

## 🔍 原理解析与自动挂载

1. **CUDA 12 与 cuDNN 9 兼容基石**：  
   `onnxruntime-gpu` 1.27.0 以上版本默认基于 CUDA 13 构建，会强制导入 `cublasLt64_13.dll`。而系统安装的是 CUDA 12 驱动体系（PyTorch 2.14+cu126、cuDNN 9），版本不匹配会导致 Error 126 / Error 2 并被隐式降级至 CPU，从而引发 100% CPU 占用与数十秒卡顿。`onnxruntime-gpu==1.26.0` 为 CUDA 12 体系最稳定、最精确的适配版本。

2. **Windows 动态链接自动注入**：  
   在 Windows 平台（Python 3.8+），操作系统的动态链接器（`LoadLibrary`）出于安全原因默认不再隐式搜索 Python 虚拟环境内部的 `site-packages` 目录。本项目在 `bin/cuda_init.py` 中实现了**多源动态扫描与原生注入机制**：
   - 自动探查本地 `packages/`、`torch/lib`、`nvidia/cudnn/bin` 及系统 `CUDA_PATH`；
   - 捕获到有效 DLL 后，通过 Windows 底层原生 API `os.add_dll_directory()` 动态注入至受信任的搜索路径表中；
   - 保证了 `CUDAExecutionProvider` 零配置、零环境变量污染即可满血启动，抠图推理进入 100ms 级别高速 GPU 运算。
