#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Photobooth SOTA AI Beauty & FaceSwap Models Downloader (V2 Resilient)
"""

import os
import sys
import time
import urllib.request
import ssl

MODELS_DIR = os.path.expanduser(r"~/.insightface/models")
os.makedirs(MODELS_DIR, exist_ok=True)

BASE_URL = "https://hf-mirror.com/facefusion/models-3.0.0/resolve/main/"

TARGET_MODELS = [
    {
        "filename": "codeformer.onnx",
        "size": 376951650,
        "desc": "CodeFormer (Tencent ARC S-Lab 高保真美颜精修与人脸复原)"
    },
    {
        "filename": "bisenet_resnet_34.onnx",
        "size": 93632546,
        "desc": "BiSeNet ResNet34 (19类面部语义分割：精准隔离皮肤、眼睛、嘴唇与发丝)"
    },
    {
        "filename": "dfl_xseg.onnx",
        "size": 70343569,
        "desc": "DFL XSeg (超精细面部轮廓掩膜)"
    },
    {
        "filename": "arcface_converter_simswap.onnx",
        "size": 20993559,
        "desc": "ArcFace Converter SimSwap (512维身份特征投影转换器)"
    },
    {
        "filename": "simswap_unofficial_512.onnx",
        "size": 239249034,
        "desc": "SimSwap 512 (512x512 原生高清换脸主干网络)"
    },
    {
        "filename": "restoreformer_plus_plus.onnx",
        "size": 294264232,
        "desc": "RestoreFormer++ (真实质感皮肤微结构复原)"
    },
    {
        "filename": "gpen_bfr_512.onnx",
        "size": 284340240,
        "desc": "GPEN 512 (阿里 GAN Prior 肖像增强)"
    }
]

def download_file(filename, expected_size, desc, max_retries=30):
    target_path = os.path.join(MODELS_DIR, filename)
    part_path = target_path + ".part"

    if os.path.exists(target_path):
        cur_size = os.path.getsize(target_path)
        if cur_size == expected_size:
            print(f"[OK 已存在] {filename} ({cur_size / 1024 / 1024:.1f} MB) - {desc}", flush=True)
            return True

    url = BASE_URL + filename
    print(f"\n=======================================================", flush=True)
    print(f"[开始下载] {filename} ({expected_size / 1024 / 1024:.1f} MB)", flush=True)
    print(f"[功能说明] {desc}", flush=True)

    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE

    for attempt in range(1, max_retries + 1):
        start_byte = os.path.getsize(part_path) if os.path.exists(part_path) else 0
        if start_byte >= expected_size:
            os.replace(part_path, target_path)
            print(f"[成功校验] {filename} 已就绪！", flush=True)
            return True

        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Connection": "keep-alive"
        }
        if start_byte > 0:
            headers["Range"] = f"bytes={start_byte}-"
            print(f"--> 断点续传：从 {start_byte / 1024 / 1024:.1f} MB 继续 (第 {attempt}/{max_retries} 次)...", flush=True)
        else:
            print(f"--> 建立连接 (第 {attempt}/{max_retries} 次)...", flush=True)

        req = urllib.request.Request(url, headers=headers)
        try:
            with urllib.request.urlopen(req, timeout=35, context=ssl_context) as resp:
                mode = "ab" if start_byte > 0 else "wb"
                with open(part_path, mode) as f:
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
                        if now - last_print >= 2.5:
                            speed = (downloaded - start_byte) / max(now - t0, 0.001) / 1024 / 1024
                            pct = (downloaded / expected_size * 100) if expected_size else 0
                            print(f"    进度: {downloaded / 1024 / 1024:.1f}/{expected_size / 1024 / 1024:.1f} MB ({pct:.1f}%) | 速度: {speed:.2f} MB/s", flush=True)
                            last_print = now

            if os.path.getsize(part_path) == expected_size:
                os.replace(part_path, target_path)
                print(f"[下载完成] {filename} ({os.path.getsize(target_path) / 1024 / 1024:.1f} MB) 写入完成！", flush=True)
                return True
        except Exception as exc:
            cur = os.path.getsize(part_path) if os.path.exists(part_path) else 0
            print(f"[网络抖动] 第 {attempt} 次 (已存 {cur/1024/1024:.1f} MB): {exc}，1.5秒后自动续传...", flush=True)
            time.sleep(1.5)

    return False

def main():
    print("=======================================================")
    print("Photobooth SOTA AI 开源模型下载任务 (CodeFormer / BiSeNet / SimSwap512)")
    print(f"保存目录: {MODELS_DIR}")
    print("=======================================================")

    success_count = 0
    for item in TARGET_MODELS:
        ok = download_file(item["filename"], item["size"], item["desc"])
        if ok:
            success_count += 1

    print("\n=======================================================")
    print(f"全部下载完毕: {success_count}/{len(TARGET_MODELS)} 个模型就绪！")
    print("=======================================================")

if __name__ == "__main__":
    main()
