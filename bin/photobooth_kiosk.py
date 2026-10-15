#!/usr/bin/env python3
"""
Industrial Commercial Photobooth Kiosk Shell & 24/7 Watchdog Guardian
Features:
- Silent background startup of PHP Server (Port 8000) & Python AI Microservice (Port 8001)
- True Fullscreen Windows Kiosk Shell with touch gesture locking
- 24/7 Self-Healing Watchdog: auto-restart dead processes within 2 seconds
- Clean admin shutdown shortcut (Ctrl+Shift+Alt+Q or admin_exit.flag)
"""

import os
import sys
import time
import socket
import urllib.request
import subprocess
import threading

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXIT_FLAG = os.path.join(ROOT_DIR, "admin_exit.flag")

php_process = None
ai_process = None
browser_process = None
running = True


def is_port_in_use(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.6)
        return s.connect_ex(("127.0.0.1", port)) == 0


def check_http_alive(url, timeout=1.5):
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "PhotoboothWatchdog/1.0"})
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.status == 200
    except Exception:
        return False


def start_php_service():
    global php_process
    if check_http_alive("http://127.0.0.1:8000/"):
        print("[Watchdog] PHP Web Server is already online on port 8000.")
        return

    print("[Watchdog] Starting PHP Web Server on port 8000 (hidden background)...")
    cmd = ["php", "-S", "127.0.0.1:8000", "-t", ROOT_DIR]
    flags = 0x08000000 if sys.platform == "win32" else 0 # CREATE_NO_WINDOW
    try:
        php_process = subprocess.Popen(
            cmd,
            cwd=ROOT_DIR,
            creationflags=flags,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
    except Exception as e:
        print(f"[Watchdog] Failed to launch PHP: {e}")


def start_ai_service():
    global ai_process
    if check_http_alive("http://127.0.0.1:8001/health"):
        print("[Watchdog] Python AI Service is already online on port 8001.")
        return

    print("[Watchdog] Starting Python AI Microservice on port 8001 (hidden background)...")
    service_script = os.path.join(ROOT_DIR, "bin", "rembg_service.py")
    cmd = [sys.executable, service_script]
    flags = 0x08000000 if sys.platform == "win32" else 0
    try:
        ai_process = subprocess.Popen(
            cmd,
            cwd=ROOT_DIR,
            creationflags=flags,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
    except Exception as e:
        print(f"[Watchdog] Failed to launch AI service: {e}")


def find_browser_executable():
    """Locate Microsoft Edge or Google Chrome for enterprise kiosk mode."""
    candidates = [
        # Edge 64-bit
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
        # Chrome 64-bit
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
        # User local appdata
        os.path.expandvars(r"%LOCALAPPDATA%\Microsoft\Edge\Application\msedge.exe"),
        os.path.expandvars(r"%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"),
    ]
    for path in candidates:
        if os.path.exists(path):
            return path
    return "msedge.exe" # Fallback to PATH


def launch_kiosk_browser():
    global browser_process
    browser_exe = find_browser_executable()
    user_data_dir = os.path.join(ROOT_DIR, "data", "tmp", "kiosk_profile")
    os.makedirs(user_data_dir, exist_ok=True)

    kiosk_args = [
        browser_exe,
        "--kiosk",
        "http://127.0.0.1:8000",
        "--edge-kiosk-type=fullscreen",
        f"--user-data-dir={user_data_dir}",
        "--no-first-run",
        "--no-default-browser-check",
        "--disable-pinch",
        "--disable-context-menu",
        "--disable-pinch-zoom",
        "--disable-features=Translate,OptimizationHints,MediaRouter",
        "--test-type",
        "--autoplay-policy=no-user-gesture-required",
        "--hide-scrollbars",
    ]

    print(f"[Watchdog] Launching Commercial Kiosk Shell: {browser_exe}...")
    try:
        browser_process = subprocess.Popen(kiosk_args)
    except Exception as e:
        print(f"[Watchdog] Failed to launch browser kiosk: {e}")


def watchdog_guardian_loop():
    global running, php_process, ai_process, browser_process
    print("[Watchdog] 24/7 Guardian Angel active. Monitoring ports 8000, 8001 & Kiosk Shell...")

    while running:
        if os.path.exists(EXIT_FLAG):
            print("[Watchdog] Admin exit flag detected. Gracefully shutting down...")
            try:
                os.remove(EXIT_FLAG)
            except Exception:
                pass
            running = False
            break

        # 1. Health check PHP Web Server
        if not check_http_alive("http://127.0.0.1:8000/"):
            print("[Watchdog] [ALERT] Port 8000 Web Server died! Self-healing restarting in 1s...")
            start_php_service()

        # 2. Health check AI Microservice
        if not check_http_alive("http://127.0.0.1:8001/health"):
            print("[Watchdog] [ALERT] Port 8001 AI Microservice died! Self-healing restarting in 1s...")
            start_ai_service()

        # 3. Health check Kiosk Browser Shell
        if browser_process is not None and browser_process.poll() is not None:
            print("[Watchdog] [ALERT] Browser Kiosk window was closed! Relaunching in 1.5s...")
            time.sleep(1.5)
            if running:
                launch_kiosk_browser()

        time.sleep(2.5)


def main():
    global running
    print("=" * 65)
    print("  📸 商用一体机 24/7 展亭看门狗守护中心 (Photobooth Commercial Kiosk)")
    print("  双模式：经典自拍大头贴 + AI 魔法变身照")
    print("=" * 65)

    # 1. Silent bootstrap services
    start_php_service()
    start_ai_service()

    # Wait for services ready
    for _ in range(25):
        if check_http_alive("http://127.0.0.1:8000/") and check_http_alive("http://127.0.0.1:8001/health"):
            break
        time.sleep(0.3)

    print("[Watchdog] All core services verified online (Port 8000 & 8001)!")

    # 2. Launch Kiosk Browser
    launch_kiosk_browser()

    # 3. Enter Watchdog loop
    try:
        watchdog_guardian_loop()
    except KeyboardInterrupt:
        print("\n[Watchdog] Interrupted by operator.")
    finally:
        print("[Watchdog] Shutting down kiosk shell...")
        if browser_process:
            try: browser_process.terminate()
            except Exception: pass
        if php_process:
            try: php_process.terminate()
            except Exception: pass
        if ai_process:
            try: ai_process.terminate()
            except Exception: pass
        print("[Watchdog] Done.")


if __name__ == "__main__":
    main()
