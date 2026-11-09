<div align="center">

# 📸 Photobooth AI Smart Photography System (Commercial Edition)

<p align="center">
  <a href="README.md"><b>🇨🇳 简体中文</b></a> |
  <a href="README_EN.md"><b>🇺🇸 English</b></a> |
  <a href="README_JA.md"><b>🇯🇵 日本語</b></a> |
  <a href="README_KO.md"><b>🇰🇷 한국어</b></a>
</p>

</div>

> **Industrial-grade Dual-Mode Smart Photobooth System**: Classic Hairline Portrait Matting & Stickers + AI High-Fidelity Portrait Transformation + Korean Life4Cuts Film Burst Workbench + Fujifilm Crystal 300 DPI Commercial Print Standards.
>
> 👤 **Author**: **sugaral** (GitHub: [sugaral](https://github.com/sugaral))  
> ⚖️ **License**: [PolyForm Noncommercial 1.0.0](LICENSE) · **Commercial License Required for Business Use**

---

## 📖 Overview

Photobooth AI is an industrial-grade dual-mode interactive photography and photobooth system engineered for commercial kiosks, shopping mall selfie booths, tourist photography pop-ups, wedding receptions, and exhibitions. Built with a high-performance **PHP 8 modern dispatch core** and a standalone **Python AI/CV microservice engine**, the system provides:

1. **Classic Photobooth Studio**: Real-time hairline portrait cutout, 6-dimensional parametric live face beautification, artistic background blending, and interactive draggable stickers & handwriting canvas.
2. **AI Magic Portrait Photography**: Deep facial feature extraction and bone structure lighting transfer, transforming customers into ancient Hanfu, wedding dresses, cyber mecha, and business portraits with high fidelity.
3. **Korean Life4Cuts Burst Mode**: Complete 1×4 strip dual-film and 2×2 grid workflow with burst capture, single-photo retake, layout arrangement, and 300 DPI industrial print proofing.

---

## 🌟 Core Advantages

1. **🎭 Instant Dual-Mode Switching**
   - Seamlessly combines "Classic Photobooth" and "AI Magic Studio" in a single kiosk.
   - Interactive neo-brutalist onboarding cards guide visitors to choose their preferred experience with zero friction.

2. **⚡ 0ms Zero-Flicker Shutter Warp Transition**
   - Eliminates desktop flickers, black flashes, or OS wallpaper leaks during shutter releases.
   - The shutter triggers a full-screen warp overlay at 0ms while processing proceeds asynchronously in the background.

3. **✂️ SOTA Hairline Portrait Matting**
   - Powered by **BiRefNet-Portrait** and **RMBG-2.0** dual matting models.
   - The matting workbench supports free dragging, proportional scaling, fine repositioning, and one-click centering of the cutout portrait.

4. **💄 6-D Live Face Beautification Engine**
   - Real-time parametric controls for Skin Smoothing, Whitening, Rosy Tone, Clarity, Eye Enlargement, and Face Slimming.
   - Based on globally compact $C^2$ continuous displacement field deformation algorithms to prevent image artifacts. Supports multi-person group photo beautification.

5. **🎞️ Korean Life4Cuts & Film Burst Workbench**
   - Guided burst shooting cadence with instant single-shot retake (choose 4 best photos out of 6 shots).
   - Perfectly calibrated for 2" × 6" dual-strip photo paper and 4" × 6" classic 4-grid prints.

6. **🖨️ Industrial 300 DPI Print Proofing & Paper Textures**
   - Standard commercial print specifications (600×1800px, 1800×1200px at 300 DPI).
   - Built-in proofing modal simulates glossy photo paper, matte velvet, and pearlescent finishes, with bleed safety lines and anti-counterfeiting watermark guides.

7. **🚀 Automated CUDA & cuDNN 9 Dynamic DLL Bridge**
   - Auto-detects NVIDIA RTX 30 / 40 / 50 GPUs and safely injects cuDNN 9 runtime DLLs, resolving ONNX Runtime error code 9 under Windows.
   - Graceful automatic fallback to multi-threaded CPU inference on non-GPU setups.

8. **🛡️ Complete Windows Chinese & Unicode Path Compatibility**
   - Rewritten image I/O pipelines using in-memory binary byte streams (`imdecode`/`imencode`), eliminating C++ `fopen` crashes with non-ASCII directory paths.

---

## 🚀 Feature Highlights

| Module | Feature | Status | Description |
| :--- | :--- | :---: | :--- |
| **AI Studio** | **AI Magic Portrait Swap** | 🌟 New | SCRFD + ArcFace + Inswapper bone structure & lighting fusion with built-in male/female Hanfu, wedding, cyber, and business templates. |
| **UX & Motion** | **0ms Zero-Flicker Warp Mask** | 🌟 New | Full-screen interactive mask locks in 0ms on shutter release, eliminating window and wallpaper leaks. |
| **Face Beauty** | **6-D Parametric Beauty Engine** | 🌟 New | Smoothing, whitening, rosy, clarity, eyes, and slimming with live interactive split-screen comparison. |
| **Matting** | **Hairline Cutout Workbench** | 🌟 New | BiRefNet-Portrait AI background removal with real-time drag, scale, and multi-template composite. |
| **Film Layout** | **Life4Cuts Burst Studio** | 🌟 New | 6-shot burst capture, instant single retakes, 4-grid arrangement, and dual-strip 300 DPI output. |
| **Artwork** | **Stickers & Handwriting Canvas** | 🌟 New | Multi-category sticker placement, rotation, z-index control, and neon handwriting signature strokes. |
| **Print Output** | **Commercial Print Proofing** | 🌟 New | Glossy, matte, and pearl paper simulation, bleed margin inspection, and direct printer mapping. |
| **Core Architecture** | **CUDA / cuDNN 9 Injection** | 🌟 New | Automated DLL discovery and safe injection for RTX 40/50 hardware acceleration; CPU fallback. |
| **Core Architecture** | **Unicode Path Barrier-Free** | 🌟 New | Memory-level byte stream encoding/decoding, eliminating OpenCV Windows non-ASCII path crashes. |
| **Core Camera** | Single Shot & Custom Countdown | 📦 Base | 1–10s countdown, voice Cheese countdown prompts, and high-speed shutter animations. |
| **Color Filters** | 36 Classic Art Filters | 📦 Base | Black & white, retro, film, freshness, and cinematic color correction presets. |
| **Delivery** | Instant QR Code Retrieval | 📦 Base | Dynamic QR generation for mobile download of ultra-high-definition final composites. |
| **Kiosk Display** | Gallery & Fullscreen Screensaver | 📦 Base | Waterfall gallery, idle kiosk screensaver, and hardware button/buzzer integrations. |

---

## 💻 System & Hardware Requirements

- **Operating System**: Windows 10 / Windows 11 (64-bit)
- **Web Runtime**: PHP 8.2 ~ 8.4
  - Required Extensions: `curl`, `gd`, `mbstring`, `sockets`, `fileinfo`, `openssl`
- **AI/CV Runtime**: Python 3.10 ~ 3.12 (Virtual environment recommended)
- **Hardware Acceleration**:
  - **GPU Mode (Recommended)**: NVIDIA discrete graphics card (GTX 1060+, RTX 3060 / 4060 / 5060 recommended) with CUDA 11.8 or 12.x.
  - **CPU Mode**: Supported via automatic multi-threaded CPU inference.
- **Capture Devices**:
  - USB 1080P/4K UVC Driverless Webcam
  - Canon EOS / Sony / Nikon DSLR/Mirrorless with HDMI Capture Card for maximum image fidelity.
- **Display**: 1920×1080 Landscape or 1080×1920 Portrait Touchscreen Monitor / Kiosk.

---

## 🛠️ Quick Start Guide

### 1. Clone Repository
```bash
git clone https://github.com/sugaral/photobooth-dev.git
cd photobooth-dev
```

### 2. Configure PHP Runtime
- Install PHP 8.4 (e.g. via Windows WinGet):
  ```powershell
  winget install PHP.PHP.8.4
  ```
- Ensure `php.exe` is added to your system `PATH`.
- Verify the following extensions are enabled in `php.ini`:
  ```ini
  extension=curl
  extension=fileinfo
  extension=gd
  extension=mbstring
  extension=openssl
  extension=sockets
  ```

### 3. Setup Python Virtual Environment
Open PowerShell or Command Prompt in the repository root:
```bash
# 1. Create virtual environment
python -m venv .venv

# 2. Activate virtual environment (Windows CMD)
.venv\Scripts\activate.bat

# 3. Install AI core dependencies
pip install --upgrade pip
pip install -r requirements.txt
```
*(For GPU acceleration, run `packages/install_gpu_deps.bat` to auto-install onnxruntime-gpu).*

### 4. Launch with One Click
This system includes automated Windows batch controllers:
- **`start.bat`**: Auto-detects runtime paths, frees stale ports, boots the Python AI microservice (port 8001), starts the PHP web server (port 8000), and automatically opens the photobooth in your browser.
- **`stop.bat`**: Safely terminates web and AI servers, killing orphaned worker processes and releasing GPU memory and camera handles.

---

## ⚖️ License & Commercial Terms

- **Author & Copyright Holder**: **sugaral** (GitHub: [sugaral](https://github.com/sugaral))
- **License**: This project is licensed under the **[PolyForm Noncommercial License 1.0.0](LICENSE)**.
  - **Permitted Free Use**: Personal education, non-profit academic research, local testing, and code evaluation.
  - **Commercial Restrictions**: Unauthorized commercial use of this software, in source or compiled form, is **strictly prohibited**. Prohibited commercial activities include, but are not limited to:
    1. Deploying in commercial self-service photo kiosks, photobooths, or paid studio operations;
    2. Bundling, pre-installing, or reselling the software with commercial kiosks or hardware;
    3. Charging end users for photo-taking, AI face-swapping, or photo printing generated by this system.
- **Obtaining a Commercial License**: For commercial deployments, custom hardware integration, enterprise procurement, or franchise operations, please contact author **[sugaral](https://github.com/sugaral)** via GitHub for official commercial licensing and technical support.
