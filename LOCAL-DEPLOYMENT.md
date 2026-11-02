# 本地部署（Windows）

项目目录：`D:\photobooth`，Git 分支为 `main`，`origin` 指向 https://github.com/sugaral/photobooth-dev.git。

2026-10-21 更新到远程 `main` 的 `adb567533b6bbd06f0257dc0f2b6457294493eb1`。旧版本保存在分支 `codex/local-before-update-20261021`；更新前的本地修改另存于 Git stash，配置、照片和补丁备份在 `D:\photobooth-local-backup-20261021`。

双击 `start.bat`（或 `start-photobooth.bat`）启动，浏览器访问 http://127.0.0.1:8000/；后台在 http://127.0.0.1:8000/admin/。双击 `stop.bat`（或 `stop-photobooth.bat`）停止本项目记录的服务；端口被其他程序占用时启动器会报错，不会结束其他程序。

运行环境：`.runtime/php/` 中的 PHP 8.4.26、`.venv-ai/` 中独立的 Python 3.12.13，前端依赖在 `node_modules/`。原 `.venv/` 保留。PHP 已启用 SQLite/PDO SQLite 等新版所需扩展。AI 使用 ONNX Runtime GPU 1.26.0、CUDA 12 运行库和 cuDNN 9；1.31.0 要求 CUDA 13，不适用本次环境组合，因此固定为项目安装脚本指定的 1.26.0。

2026-10-29 启动修复：Python 3.12.13 的基础运行时已复制到 `.runtime/python/`，启动器会核对版本并将 `.venv-ai/pyvenv.cfg` 的 `home` 指向它，保留原有 AI 依赖。项目启动不再依赖用户目录中的 uv Python 安装。旧配置备份为 `.runtime/pyvenv-before-startup-fix.cfg`。启动前检查 PHP 和 Python 是否实际可执行；服务退出时直接显示对应日志末尾，首次网页加载允许等待 10 秒。

如果窗口仍显示 `DOSKEY is not recognized`，这是 Windows 命令行在执行本项目脚本前运行 Conda 的 AutoRun，而当前 PATH 缺少 Windows 系统目录导致的提示，与 AI 服务能否启动无关。项目批处理仅为自身及子进程补齐系统目录，不修改全局环境变量或 Conda 设置。

模型在 `models/`：BiRefNet-Portrait、RMBG-2.0、MediaPipe FaceLandmarker，以及 `models/faceswap/` 中的 SCRFD、ArcFace、Inswapper、BiSeNet 和 CodeFormer。启动器设置 `PHOTOBOOTH_MODELS_DIR`、`PHOTOBOOTH_FACE_MODELS_DIR`。这些运行依赖、模型、照片 `data/` 和日志 `var/` 均排除 Git 提交。

部署适配包括：本机运行时与模型路径、一键启停、PHP 接口 UTF-8 BOM 修复和上海时区。前端已重新构建。所有适配保留为未提交的本地改动，本次没有向 GitHub 推送。

部署验证：浏览器首页、后台无 JavaScript 或 HTTP 错误；图片上传、美颜预览、CUDA 换脸、BiRefNet 抠图，以及 CPU 模式 RMBG-2.0 抠图已通过样图检查。原有照片与备份逐一比对，内容一致。实体摄像头拍摄和打印尚未验证。

本机显卡为 8GB 显存的 RTX 4060 Laptop，内存为 16GB。连续加载换脸和两种抠图模型时，显存与内存接近耗尽，会明显拖慢处理。日常建议固定使用一种抠图引擎；需要切换模型且处理变慢时，可先停止并重新启动服务以释放模型内存。RMBG-2.0 的 CPU 模式已验证，但本次首次处理约 73 秒，可能超过网页接口等待时间；其在多模型同时驻留时的 GPU 处理未完成验证。默认设备仍为 CUDA，默认抠图引擎仍为 BiRefNet。

日志位于 `var/log/`。查看进程状态：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/local-services.ps1 status
```

前端源码位于 `assets/`，仓库已经包含编译后的 `resources/` 文件。修改前端后构建（只编译，不批量格式化源码）：

```powershell
npm ci --legacy-peer-deps
npm run build:gulp
```

在另一台 Windows NVIDIA 机器上重建 AI 环境时，使用 Python 3.12 创建 `.venv-ai`，再安装 `requirements-ai.txt` 中的依赖。模型文件需要单独准备，不能只克隆仓库后直接运行。

后续上传修改：

```powershell
cd D:\photobooth
git status
git diff
git add <需要上传的文件>
git commit -m "描述本次修改"
git push origin main
```

首次推送可能需要在 Git Credential Manager 弹出的登录流程中授权 GitHub 账号；账号需要拥有该仓库写权限。本次部署未执行远程推送。

如果 GitHub 直连失败，可以只为当前命令使用本机 Clash 代理（确保它正在运行）：

```powershell
git -c http.proxy=http://127.0.0.1:7890 push origin main
```

当前服务只监听本机。电脑/USB 摄像头由浏览器授权使用，单反和实体打印机需要按具体硬件另行配置；手机扫码访问需要另行配置局域网地址和可访问的服务。

## 机柜照片屏保（2026-10-21，仅本地修改）

已启用：拍照首页空闲 1 分钟后进入屏保，每张停留 8 秒，再横向滑动至下一张；触摸、点击或按键返回首页，首次操作只负责唤醒。拍摄、编辑、支付及设置期间不弹出。

本次将 `picture/1.jpg`～`4.jpg` 的副本放入 `private/screensavers/`，按文件名顺序循环。四张原图均为 1706×1279，显示在 16:9 画框内时左右留黑边，不裁剪、不拉伸。原图保留不变；`picture/` 不会自动同步到播放目录。

立即预览：http://127.0.0.1:8000/?screensaverPreview=1

上传照片：http://127.0.0.1:8000/admin/upload/?folder=screensavers 。建议使用 1920×1080 的 JPG/PNG/WebP 横图，以 `01.jpg`、`02.jpg` 命名来安排顺序。此页面显示当前照片、尺寸和播放顺序；替换或移除已有素材可在 `private/screensavers/` 内操作。照片列表下次进入屏保时重新读取；时间及文字在后台“屏保”设置中调整，保存后刷新机柜首页。

浏览器可按 F11 全屏。本功能不会修改 Windows 的熄屏或睡眠设置。屏保代码、配置及照片均仅保留本地，本次未提交或推送 GitHub。

已通过浏览器自动验证：四张照片顺序及循环、空闲计时重置、触摸/点击/键盘唤醒、长按按键防误触、拍照流程及设置/支付弹窗保护、空目录/单张/损坏图片、异步加载取消、关闭自动屏保时的手动预览退出、减少动态效果偏好，以及横屏/小屏布局。四张播放副本的 SHA-256 与原图一致。验证脚本为 `scripts/test-screensaver.cjs`。
