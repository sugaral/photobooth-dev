#!/usr/bin/env python3
import os
import sys
import time
import urllib.request

FACE_MODELS = {
    "det_10g": {
        "url": "https://hf-mirror.com/public-data/insightface/resolve/main/models/buffalo_l/det_10g.onnx",
        "dir": os.path.expanduser(r"~/.insightface/models/buffalo_l"),
        "filename": "det_10g.onnx",
        "expected_size": 16923827,
    },
    "w600k_r50": {
        "url": "https://hf-mirror.com/public-data/insightface/resolve/main/models/buffalo_l/w600k_r50.onnx",
        "dir": os.path.expanduser(r"~/.insightface/models/buffalo_l"),
        "filename": "w600k_r50.onnx",
        "expected_size": 174383860,
    },
    "2d106det": {
        "url": "https://hf-mirror.com/public-data/insightface/resolve/main/models/buffalo_l/2d106det.onnx",
        "dir": os.path.expanduser(r"~/.insightface/models/buffalo_l"),
        "filename": "2d106det.onnx",
        "expected_size": 5030888,
    },
    "inswapper_128": {
        "url": "https://hf-mirror.com/countfloyd/deepfake/resolve/main/inswapper_128.onnx",
        "dir": os.path.expanduser(r"~/.insightface/models"),
        "filename": "inswapper_128.onnx",
        "expected_size": 554253681,
    }
}

def download_file(url, target_path, expected_size=None, max_retries=10):
    os.makedirs(os.path.dirname(target_path), exist_ok=True)
    if os.path.exists(target_path):
        cur_size = os.path.getsize(target_path)
        if expected_size and cur_size == expected_size:
            print(f"[OK] {os.path.basename(target_path)} already exists ({cur_size} bytes).", flush=True)
            return True

    temp_path = target_path + ".part"

    for attempt in range(1, max_retries + 1):
        start_byte = os.path.getsize(temp_path) if os.path.exists(temp_path) else 0
        if expected_size and start_byte >= expected_size:
            os.replace(temp_path, target_path)
            print(f"[SUCCESS] Saved {target_path} ({os.path.getsize(target_path)} bytes).", flush=True)
            return True

        print(f"Downloading {os.path.basename(target_path)} (attempt {attempt}/{max_retries}, resume from {start_byte / 1024 / 1024:.1f} MB) ...", flush=True)
        headers = {"User-Agent": "Mozilla/5.0"}
        if start_byte > 0:
            headers["Range"] = f"bytes={start_byte}-"

        req = urllib.request.Request(url, headers=headers)
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                total_size = start_byte + int(resp.headers.get("Content-Length", 0))
                mode = "ab" if start_byte > 0 else "wb"
                with open(temp_path, mode) as f:
                    downloaded = start_byte
                    t0 = time.time()
                    last_print = t0
                    while True:
                        chunk = resp.read(1024 * 512)
                        if not chunk:
                            break
                        f.write(chunk)
                        downloaded += len(chunk)
                        now = time.time()
                        if now - last_print >= 5:
                            speed = (downloaded - start_byte) / max(now - t0, 0.001) / 1024 / 1024
                            pct = (downloaded / total_size * 100) if total_size else 0
                            print(f"[{os.path.basename(target_path)}] {downloaded / 1024 / 1024:.1f}/{total_size / 1024 / 1024:.1f} MB ({pct:.1f}%) @ {speed:.2f} MB/s", flush=True)
                            last_print = now

            if expected_size is None or os.path.getsize(temp_path) == expected_size:
                os.replace(temp_path, target_path)
                print(f"[SUCCESS] Saved {target_path} ({os.path.getsize(target_path)} bytes).", flush=True)
                return True
            else:
                print(f"[WARN] Size mismatch: got {os.path.getsize(temp_path)}, expected {expected_size}. Retrying...", flush=True)
        except Exception as exc:
            print(f"[RETRY] Error on attempt {attempt}: {exc}. Reconnecting in 3s...", flush=True)
            time.sleep(3)

    return False

def download_all():
    for name, conf in FACE_MODELS.items():
        dest = os.path.join(conf["dir"], conf["filename"])
        download_file(conf["url"], dest, conf.get("expected_size"))

if __name__ == "__main__":
    download_all()
