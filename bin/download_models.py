#!/usr/bin/env python3
import os
import sys
import time
import urllib.request

MODELS_ROOT = os.environ.get("PHOTOBOOTH_MODELS_DIR", os.path.join(os.path.expanduser("~"), ".rembg", "models"))

MODELS = {
    "birefnet-portrait": {
        "url": "https://hf-mirror.com/onnx-community/BiRefNet-portrait-ONNX/resolve/main/onnx/model.onnx",
        "dir": os.path.join(MODELS_ROOT, "birefnet-portrait"),
        "filename": "birefnet-portrait.onnx",
        "expected_size": 972666916,
    },
    "rmbg-2.0": {
        "url": "https://hf-mirror.com/yuvraj108c/RMBG-2.0/resolve/main/onnx/model_int8.onnx",
        "dir": os.path.join(MODELS_ROOT, "rmbg-2.0"),
        "filename": "rmbg-2.0.onnx",
        "expected_size": 366087445,
    }
}

def download_file(url, target_path, expected_size=None):
    os.makedirs(os.path.dirname(target_path), exist_ok=True)
    
    # Check if already completed
    if os.path.exists(target_path):
        cur_size = os.path.getsize(target_path)
        if expected_size and cur_size == expected_size:
            print(f"[OK] {os.path.basename(target_path)} already exists with correct size ({cur_size} bytes).")
            return True

    temp_path = target_path + ".part"
    if os.path.exists(target_path) and not os.path.exists(temp_path):
        os.replace(target_path, temp_path)
    start_byte = os.path.getsize(temp_path) if os.path.exists(temp_path) else 0

    print(f"Downloading from {url}")
    print(f"Destination: {target_path} (resuming from {start_byte / 1024 / 1024:.2f} MB)")

    headers = {"User-Agent": "Mozilla/5.0"}
    if start_byte > 0:
        headers["Range"] = f"bytes={start_byte}-"

    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            if start_byte > 0 and resp.status != 206:
                raise RuntimeError("Server did not honor the resume request; partial file preserved")
            if start_byte > 0 and not resp.headers.get("Content-Range", "").startswith(f"bytes {start_byte}-"):
                raise RuntimeError("Resume response has an unexpected Content-Range")
            total_size = start_byte + int(resp.headers.get("Content-Length", 0))
            mode = "ab" if start_byte > 0 else "wb"
            with open(temp_path, mode) as f:
                downloaded = start_byte
                t0 = time.time()
                last_print = t0
                while True:
                    chunk = resp.read(1024 * 512) # 512KB
                    if not chunk:
                        break
                    f.write(chunk)
                    downloaded += len(chunk)
                    now = time.time()
                    if now - last_print >= 5:
                        speed = (downloaded - start_byte) / (now - t0) / 1024 / 1024
                        pct = (downloaded / total_size * 100) if total_size else 0
                        print(f"Progress: {downloaded / 1024 / 1024:.1f}/{total_size / 1024 / 1024:.1f} MB ({pct:.1f}%) @ {speed:.2f} MB/s", flush=True)
                        last_print = now

        actual_size = os.path.getsize(temp_path)
        if actual_size != total_size or (expected_size and actual_size != expected_size):
            raise RuntimeError(f"Incomplete model: received {actual_size} bytes, expected {expected_size or total_size}; retry to resume")
        os.replace(temp_path, target_path)
        print(f"[SUCCESS] Downloaded {target_path} ({os.path.getsize(target_path)} bytes).", flush=True)
        return True
    except Exception as exc:
        print(f"[ERROR] Failed to download {url}: {exc}", flush=True)
        return False

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "all"
    succeeded = True
    for name, conf in MODELS.items():
        if target != "all" and target != name:
            continue
        dest = os.path.join(conf["dir"], conf["filename"])
        succeeded = download_file(conf["url"], dest, conf.get("expected_size")) and succeeded
    sys.exit(0 if succeeded else 1)
