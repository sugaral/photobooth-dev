# Photobooth 智能照相亭一体化系统

> 专业级线下互动照相亭系统，集成现代 Web 前端交互、AI 智能发丝级人像抠图、智能换脸、多风格画风融合与移动端扫码取照功能。

---

## 🌟 2026-11-09 版本更新记录 (Branch: `phb_1109`)

本分支（`phb_1109`）包含了针对系统稳定性、启动流程、移动热点管理与图像编辑核心体验的全面升级：

### 1. 移动热点按需启动（杜绝开机/测试自启）
- **按需拉起机制**：彻底移除了先前本地服务在 `start` 或 `restart` 阶段无条件启动 Windows 移动热点的逻辑。系统在日常开机、开发调试及待机测试时，无线网卡保持休眠与正常网络连接，不再强开热点。
- **全链路非阻塞触发**：
  - 新增 `src/Utility/HotspotUtility.php` 与 `api/hotspotControl.php`，采用 Windows 后台非阻塞管道异步调度 `scripts/enable-hotspot.ps1`，毫秒级响应（约 38ms），不占用 Web 线程，不卡顿页面。
  - 顾客在机台完成拍照并点击**“扫码取照片”**呼出双二维码弹窗时，系统自动在后台异步启动移动热点。
  - 手机扫码访问取照落地页（`photo.php`）、成片下载（`api/download.php`）及二维码请求（`api/qrcode.php`）均配备自动按需保障与 90 秒防抖保护。

### 2. 一键启动脚本全面重构（CMD 封装 + 6层前置环境自动检测安装）
- **双击即用 CMD 入口**：
  - 新增 `start.bat`、`restart.bat`、`stop.bat`，解决 Windows 默认双击 `.ps1` 文件会唤起记事本或受限于 PowerShell 执行策略的问题，支持任意环境双击极速启动。
- **全自动前置依赖自检与自愈安装（`scripts/ensure-prerequisites.ps1`）**：
  1. **系统运行环境**：自动检测 Windows x64 架构与 PowerShell 5.1+ 环境。
  2. **数据与缓存目录**：自动补齐 `data/images`、`data/tmp`、`var/log`、`var/run` 等核心目录并清理孤儿标志。
  3. **PHP 便携环境与必要扩展**：自动校验 `.runtime/php` 运行库及 7 大核心扩展（`curl`、`gd`、`pdo_sqlite`、`mbstring`、`fileinfo`、`zip`、`openssl`），若未激活则自动配置并修复 `php.ini`。
  4. **Python AI 虚拟环境**：自动检测 `.venv-ai`；若项目目录发生变更，自动自愈 `pyvenv.cfg` 中的 Python 根路径；若环境缺失，则自动通过本地基础 Python 进行重建。
  5. **AI 核心科学计算库**：自动检测 `onnxruntime`、`opencv-python`、`numpy`、`Pillow` 等库；若检测到缺失或损毁，全自动调用阿里云高速镜像源执行 `pip install -r requirements-ai.txt` 进行自动安装。
  6. **SOTA AI 抠图换脸模型**：自动校验 `BiRefNet-Portrait`、`RMBG-2.0`、`Buffalo_l` 模型文件，缺失时自动通过国内高速节点下载补全。
- **端口清理与服务就绪检查**：启动时自动回收 8000 与 8001 端口上的孤儿残留进程，启动就绪后自动拉起默认浏览器打开机台主页。

### 3. 图像处理与编辑器交互体验升级
- **SOTA 发丝级人像抠图融合**：
  - 深度整合 BiRefNet 与 RMBG-2.0 双模推理引擎，优先启用 DirectML / CUDA 硬件加速。
  - 在 `bin/matting_core.py` 中引入多频带去杂色融合算法（Defringe）与环境光边缘包裹渲染，消除抠图边缘白边、黑边与溢色。
- **贴纸与文字缩放几何锚点修复**：
  - 重构 `api.initPlacedStickerInteraction` 变换矩阵算法，强制锁定几何中心锚点（`centerOverlayX`, `centerOverlayY`），彻底解决用户双指缩放/鼠标滚轮缩放贴纸及文字时向 `(0, 0)` 坐标漂移的缺陷。
- **界面按钮与抽屉互斥高亮**：
  - 统一编辑栏按钮高对比度激活态，优化经典换背景按钮与抽屉互斥逻辑，关闭弹窗时自动恢复基准原图。

### 4. 工程架构规范化与垃圾文件清理
- **Session 存储隔离**：彻底修复 `lib/boot.php` 此前向项目父目录泄漏 `sessions/` 垃圾文件夹的问题，将会话持久化规范隔离至私有临时目录。
- **代码整洁化**：清理了废弃的测试脚本、临时文件、旧开发配置及非必要编译产物。

---

## 🚀 快速启动指南

### 1. 启动服务
在项目根目录下，直接双击运行：
```bat
start.bat
```
脚本将全自动检测所需依赖、自动补齐缺失项、拉起 AI 引擎与 Web 服务，并自动在浏览器中打开：
- **机台拍照首页**：`http://127.0.0.1:8000/`
- **后台管理系统**：`http://127.0.0.1:8000/admin/`
- **AI 抠图引擎健康检查**：`http://127.0.0.1:8001/ready`

### 2. 重启与停止服务
- **重启**：双击运行 `restart.bat`
- **停止**：双击运行 `stop.bat`

---

## 🛠️ 系统架构说明

```
Photobooth/
├── start.bat / restart.bat / stop.bat       # Windows 一键操作批处理入口
├── start.ps1 / restart.ps1 / stop.ps1       # 核心 PowerShell 启动编排脚本
├── scripts/
│   ├── ensure-prerequisites.ps1            # 6 层前置环境自动检测与安装自愈脚本
│   ├── local-services.ps1                  # Web 与 AI 后台守护进程管理器
│   ├── enable-hotspot.ps1                  # WinRT 移动热点底层配置驱动
│   └── local-router.php                    # 内置 PHP 本地静态资源路由
├── api/
│   ├── hotspotControl.php                  # 移动热点按需启动控制接口
│   ├── qrcode.php                          # 取照/Wi-Fi 双二维码动态生成
│   ├── download.php                        # 手机端极速出图下载端点
│   └── rembgProcess.php                    # AI 抠图处理转发接口
├── bin/
│   ├── rembg_service.py                    # AI 异步常驻服务
│   ├── matting_core.py                     # SOTA 抠图与自然环境光融合核心
│   └── download_models.py                  # AI 模型镜像断点续传下载器
├── models/                                 # ONNX 模型存储库 (BiRefNet, RMBG, InsightFace)
├── data/                                   # 拍摄成片、模板与运行时数据
└── private/                                # 界面定制化样式与功能增强覆盖层
```

---

## 📄 授权与许可

本项目采用开源与商业双重授权模式，遵循 LICENSE 与相关许可条款。
