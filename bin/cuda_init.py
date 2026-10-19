# -*- coding: utf-8 -*-
"""CUDA & cuDNN DLL auto-discovery and initialization for Windows & ONNX Runtime.

Resolves Windows Python 3.8+ DLL loading rules where C++ dynamic libraries
(e.g., onnxruntime_providers_cuda.dll) fail to locate cudnn64_9.dll with Error 2.
"""
import os
import sys
from pathlib import Path

_INITIALIZED = False
_ADDED_DIRS = []


def setup_cuda_dll_paths(verbose=False):
    """Auto-detect and register CUDA, cuDNN and torch DLL paths into Windows DLL search path."""
    global _INITIALIZED, _ADDED_DIRS
    if _INITIALIZED:
        return _ADDED_DIRS

    if os.name != 'nt':
        _INITIALIZED = True
        return _ADDED_DIRS

    root_dir = Path(__file__).resolve().parents[1]
    candidates = []

    # 1. Check local project packages / bin
    candidates.append(root_dir / "bin")
    candidates.append(root_dir / "packages")
    candidates.append(root_dir / "packages" / "cudnn" / "bin")

    # 2. Check active Python virtualenv site-packages
    site_packages_list = []
    try:
        import site
        site_packages_list.extend(site.getsitepackages())
    except Exception:
        pass
    if hasattr(site, "getusersitepackages"):
        try:
            site_packages_list.append(site.getusersitepackages())
        except Exception:
            pass

    # Include sys.prefix Lib/site-packages
    site_packages_list.append(str(Path(sys.prefix) / "Lib" / "site-packages"))
    site_packages_list.append(str(root_dir / ".venv-ai" / "Lib" / "site-packages"))
    site_packages_list.append(r"C:\Users\WS\AppData\Local\hermes\hermes-agent\venv\Lib\site-packages")

    # Deduplicate while preserving order
    seen_sp = set()
    unique_sp = []
    for sp in site_packages_list:
        p = Path(sp).resolve()
        if p not in seen_sp and p.is_dir():
            seen_sp.add(p)
            unique_sp.append(p)

    for sp in unique_sp:
        # torch/lib contains complete cuDNN 9 dlls when torch-cuda is installed
        candidates.append(sp / "torch" / "lib")
        # nvidia-cudnn-cu12 pip package binaries
        candidates.append(sp / "nvidia" / "cudnn" / "bin")
        candidates.append(sp / "nvidia" / "cublas" / "bin")
        candidates.append(sp / "nvidia" / "cuda_nvrtc" / "bin")
        candidates.append(sp / "nvidia" / "cuda_runtime" / "bin")
        candidates.append(sp / "cv2")

    # 3. Check system CUDA_PATH
    cuda_path = os.environ.get("CUDA_PATH", "")
    if cuda_path:
        candidates.append(Path(cuda_path) / "bin")
    candidates.append(Path(r"E:\CUDA\bin"))
    candidates.append(Path(r"C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v12.0\bin"))
    candidates.append(Path(r"C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v12.1\bin"))
    candidates.append(Path(r"C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v12.2\bin"))
    candidates.append(Path(r"C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v12.4\bin"))
    candidates.append(Path(r"C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v12.6\bin"))
    candidates.append(Path(r"C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v12.8\bin"))

    # 4. Register existing directories that contain DLLs
    registered = set()
    path_prepend = []

    for cand in candidates:
        try:
            cand_path = Path(cand).resolve()
            if not cand_path.is_dir() or cand_path in registered:
                continue

            # Check if directory actually contains any .dll files
            has_dll = any(cand_path.glob("*.dll"))
            if not has_dll:
                continue

            try:
                os.add_dll_directory(str(cand_path))
                registered.add(cand_path)
                path_prepend.append(str(cand_path))
                _ADDED_DIRS.append(str(cand_path))
                if verbose:
                    print(f"[cuda_init] Registered DLL directory: {cand_path}")
            except Exception as e:
                if verbose:
                    print(f"[cuda_init] Failed to register {cand_path}: {e}")
        except Exception:
            pass

    # Also prepend to os.environ["PATH"] for any sub-executables / C runtime loaders
    if path_prepend:
        current_path = os.environ.get("PATH", "")
        os.environ["PATH"] = os.pathsep.join(path_prepend) + os.pathsep + current_path

    _INITIALIZED = True
    return _ADDED_DIRS


# Auto-run upon import
setup_cuda_dll_paths()
