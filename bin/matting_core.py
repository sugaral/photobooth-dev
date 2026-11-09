#!/usr/bin/env python3
"""Photobooth SOTA AI 人像抠图核心模块.

已全面升级为当前计算机视觉界最顶级的两大 SOTA 开源模型：
1. BiRefNet (BiRefNet-Portrait):
   - 专为人像发丝与边缘半透明细节优化，发丝缕空精度极高。
   - 【最适合场景】：半身照、自拍照、大头贴、披肩散发、近景肖像。
2. RMBG-2.0 (BRIA RMBG-2.0):
   - 商业级通用高清去底模型，主体识别稳定，严防误扣衣服与身体。
   - 【最适合场景】：全身照、站姿、多人合影、复杂服装与手势、杂乱背景。
"""
import os

# Ensure CUDA and cuDNN DLL paths are initialized before any native inference module loads
try:
    import cuda_init
except ImportError:
    try:
        from bin import cuda_init
    except Exception:
        pass

# Configure OpenMP and MKL thread pools to immediately sleep on idle (no spin-wait / no CPU heating)
os.environ["OMP_WAIT_POLICY"] = "PASSIVE"
os.environ["KMP_BLOCKTIME"] = "0"

def get_persisted_threads():
    try:
        cfg_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "config", "my.config.inc.php")
        if os.path.exists(cfg_path):
            with open(cfg_path, "r", encoding="utf-8") as f:
                content = f.read()
            import re
            m = re.search(r"['\"]cpu_threads['\"]\s*=>\s*(\d+)", content)
            if m:
                val = int(m.group(1))
                return max(1, min(32, val))
    except Exception:
        pass
    return 8


def get_persisted_gpu_mode():
    try:
        cfg_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "config", "my.config.inc.php")
        if os.path.exists(cfg_path):
            with open(cfg_path, "r", encoding="utf-8") as f:
                content = f.read()
            import re
            m = re.search(r"['\"]gpu_mode['\"]\s*=>\s*['\"]([^'\"]+)['\"]", content)
            if m:
                val = m.group(1).lower().strip()
                if val == "gpu":
                    return "auto"
                if val in ("auto", "cuda", "directml", "cpu"):
                    return val
    except Exception:
        pass
    return "auto"


def normalize_device_mode(mode):
    value = str(mode or "auto").lower().strip()
    return "auto" if value == "gpu" or value not in ("auto", "cuda", "directml", "cpu") else value


os.environ["OMP_NUM_THREADS"] = str(get_persisted_threads())

import time
import uuid
import gc
import numpy as np
from PIL import Image

MODELS_ROOT = os.environ.get("PHOTOBOOTH_MODELS_DIR", os.path.join(os.path.expanduser("~"), ".rembg", "models"))
BIREFNET_MODEL_PATH = os.path.join(MODELS_ROOT, "birefnet-portrait", "birefnet-portrait.onnx")
RMBG2_MODEL_PATH = os.path.join(MODELS_ROOT, "rmbg-2.0", "rmbg-2.0.onnx")

def _get_model_search_roots():
    roots = []
    if "PHOTOBOOTH_MODELS_DIR" in os.environ:
        roots.append(os.environ["PHOTOBOOTH_MODELS_DIR"])
    local_root = os.path.join(os.path.dirname(os.path.dirname(os.path.realpath(__file__))), "models")
    if os.path.isdir(local_root):
        roots.append(local_root)
    roots.append(os.path.join(os.path.expanduser("~"), ".rembg", "models"))
    # Deduplicate while preserving order
    seen = set()
    uniq = []
    for r in roots:
        norm = os.path.normpath(r)
        if norm not in seen:
            seen.add(norm)
            uniq.append(norm)
    return uniq

def resolve_birefnet_model_path(device_mode="auto"):
    """Find the optimal BiRefNet model. On CUDA/DirectML GPU, prioritizes FP16 for 3x speed and 60% less VRAM."""
    is_gpu = str(device_mode).lower().strip() in ("cuda", "directml", "auto")
    roots = _get_model_search_roots()
    if is_gpu:
        for r in roots:
            fp16 = os.path.join(r, "birefnet-portrait", "birefnet-portrait-fp16.onnx")
            if os.path.isfile(fp16):
                return fp16
    for r in roots:
        fp32 = os.path.join(r, "birefnet-portrait", "birefnet-portrait.onnx")
        if os.path.isfile(fp32):
            return fp32
    return BIREFNET_MODEL_PATH

def resolve_rmbg2_model_path(device_mode="auto"):
    """Find the RMBG-2.0 model path."""
    roots = _get_model_search_roots()
    for r in roots:
        fp32 = os.path.join(r, "rmbg-2.0", "rmbg-2.0.onnx")
        if os.path.isfile(fp32):
            return fp32
    return RMBG2_MODEL_PATH

VALID_ENGINES = ("birefnet", "rmbg2")
DEFAULT_ENGINE = "birefnet"

ENGINE_ALIASES = {
    "birefnet": "birefnet",
    "birefnet-portrait": "birefnet",
    "birefnet_portrait": "birefnet",
    "rmbg2": "rmbg2",
    "rmbg-2.0": "rmbg2",
    "rmbg_2": "rmbg2",
    "bria-rmbg-2.0": "rmbg2",
    # 兼容历史调用别名
    "rembg": "birefnet",
    "feynobg": "rmbg2",
}


def safe_exception_msg(exc):
    """Safely format exceptions on Windows to prevent UnicodeDecodeError with GBK/ANSI error bytes."""
    try:
        return str(exc)
    except Exception:
        try:
            if hasattr(exc, "args") and exc.args:
                parts = []
                for a in exc.args:
                    if isinstance(a, bytes):
                        parts.append(a.decode("gbk", errors="replace"))
                    else:
                        parts.append(repr(a))
                return " ".join(parts)
            return repr(exc)
        except Exception:
            return "Internal Execution Exception"


def get_best_providers(prefer_cpu=True, gpu_device_id=0, device_mode=None):
    """Return optimal execution providers for ONNX Runtime."""
    mode = normalize_device_mode(device_mode or ("cpu" if prefer_cpu else "auto"))
    if mode == "cpu":
        return ["CPUExecutionProvider"]
    try:
        import onnxruntime as ort
        available = ort.get_available_providers()
        cuda_options = {
            "device_id": gpu_device_id,
            "cudnn_conv_algo_search": "HEURISTIC",
            "arena_extend_strategy": "kNextPowerOfTwo",
            "do_copy_in_default_stream": True,
        }
        if mode == "cuda":
            if "CUDAExecutionProvider" not in available:
                raise RuntimeError("CUDAExecutionProvider 不可用")
            return [("CUDAExecutionProvider", cuda_options), "CPUExecutionProvider"]
        if mode == "directml":
            if "DmlExecutionProvider" not in available:
                raise RuntimeError("DmlExecutionProvider 不可用")
            return [("DmlExecutionProvider", {"device_id": gpu_device_id}), "CPUExecutionProvider"]
        providers = []
        if "CUDAExecutionProvider" in available:
            providers.append(("CUDAExecutionProvider", cuda_options))
        if "DmlExecutionProvider" in available:
            providers.append(("DmlExecutionProvider", {"device_id": gpu_device_id}))
        providers.append("CPUExecutionProvider")
        return providers
    except Exception:
        if mode != "auto":
            raise
        return ["CPUExecutionProvider"]


def validate_device_mode(device_mode):
    """Validate an explicitly selected provider before changing live state."""
    mode = normalize_device_mode(device_mode)
    if mode in ("auto", "cpu"):
        return {"mode": mode, "available": True, "providers": ["CPUExecutionProvider"]}
    try:
        import onnxruntime as ort
        available = list(ort.get_available_providers())
    except Exception as exc:
        raise RuntimeError(f"无法读取 ONNX Runtime provider: {exc}") from exc
    provider = "CUDAExecutionProvider" if mode == "cuda" else "DmlExecutionProvider"
    if provider not in available:
        label = "CUDA" if mode == "cuda" else "DirectML"
        raise RuntimeError(f"{label} 推理 provider 不可用，未切换设备")
    return {"mode": mode, "available": True, "providers": available}


def clean_cutout_defringe(cutout, orig_image=None):
    """Accurately recover pure foreground colors for semi-transparent edge pixels (despill/unblending)
    and cleanly prune spurious edge debris/corner artifacts.
    """
    try:
        import cv2
        arr = np.array(cutout.convert("RGBA"), dtype=np.uint8)
        alpha = arr[:, :, 3]
        h, w = alpha.shape

        # 1. Clean small disconnected islands / floating noise (< 2% of main foreground)
        bin_mask = (alpha > 16).astype(np.uint8)
        num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(bin_mask, connectivity=8)
        if num_labels > 2:
            areas = stats[1:, cv2.CC_STAT_AREA]
            max_idx = np.argmax(areas) + 1
            max_area = areas[max_idx - 1]
            for lbl in range(1, num_labels):
                if stats[lbl, cv2.CC_STAT_AREA] < max_area * 0.02:
                    alpha[labels == lbl] = 0

        # 2. Bottom corner edge-guided flare prune (removes shelf/props touching lower border)
        src_for_edge = None
        if orig_image is not None:
            src_for_edge = np.array(orig_image.convert("RGB"))
        else:
            src_for_edge = arr[:, :, :3]

        if src_for_edge is not None:
            gray = cv2.cvtColor(src_for_edge, cv2.COLOR_RGB2GRAY)
            y_thresh = int(h * 0.88)
            # Bottom-right corner check
            x_r_start = int(w * 0.65)
            patch_r = alpha[y_thresh:, x_r_start:]
            if np.any(patch_r > 30):
                gray_p = gray[y_thresh:, x_r_start:]
                grad_x = np.abs(cv2.Sobel(cv2.GaussianBlur(gray_p, (5, 5), 0), cv2.CV_32F, 1, 0, ksize=3))
                col_grads = grad_x.mean(axis=0)
                if col_grads.max() > 40:
                    edge_col = int(np.argmax(col_grads))
                    if 10 < edge_col < patch_r.shape[1] - 5:
                        patch_r[:, edge_col + 2:] = 0
                        alpha[y_thresh:, x_r_start:] = patch_r

        arr[:, :, 3] = alpha

        # 3. Dynamic multi-band edge despill / color unblending for hair edge transparency
        solid_mask = (alpha >= 235).astype(np.uint8)
        fringe_mask = (alpha >= 6) & (alpha < 235)

        if np.any(fringe_mask) and np.any(solid_mask):
            rgb = arr[:, :, :3]
            # Dynamic dilation radius scaled to image dimensions
            rad = max(3, min(12, int(max(h, w) / 220)))
            kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (rad * 2 + 1, rad * 2 + 1))
            dilated_solid = cv2.dilate(solid_mask, kernel)
            despill_zone = (dilated_solid > 0) & (alpha < 235) & (alpha >= 6)

            if np.any(despill_zone):
                inp_mask = np.zeros((h, w), dtype=np.uint8)
                inp_mask[despill_zone] = 255
                recovered_rgb = cv2.inpaint(rgb, inp_mask, rad, cv2.INPAINT_TELEA)

                blend_w = (alpha.astype(np.float32) / 235.0)[:, :, np.newaxis]
                clean_rgb = (blend_w * rgb.astype(np.float32) + (1.0 - blend_w) * recovered_rgb.astype(np.float32)).astype(np.uint8)
                arr[:, :, :3] = clean_rgb

        return Image.fromarray(arr, mode="RGBA")
    except Exception:
        return cutout.convert("RGBA")


def inspect_quality(cutout):
    """Return lightweight alpha diagnostics and a validity decision."""
    try:
        alpha = np.asarray(cutout.convert("RGBA"))[:, :, 3]
        foreground = alpha > 8
        ratio = float(foreground.mean()) if foreground.size else 0.0
        edge = np.concatenate((alpha[0, :], alpha[-1, :], alpha[:, 0], alpha[:, -1]))
        edge_ratio = float((edge > 8).mean()) if edge.size else 0.0
        valid = bool(alpha.size and alpha.max() > 8 and ratio >= 0.001 and ratio <= 0.995)
        return {
            "valid": valid,
            "foreground_ratio": round(ratio, 6),
            "edge_foreground_ratio": round(edge_ratio, 6),
            "alpha_min": int(alpha.min()) if alpha.size else 0,
            "alpha_max": int(alpha.max()) if alpha.size else 0,
        }
    except Exception as exc:
        return {"valid": True, "quality_check_error": str(exc)}


class BiRefNetPortraitEngine:
    """BiRefNet-Portrait 人像精细抠图引擎.

    适合场景：【半身照 / 自拍照 / 大头贴 / 精细发丝】
    优势：对细软碎发、半透明发丝提取极其出色，具有发丝级 Alpha 透光质感。
    """
    name = "birefnet"
    display_name = "BiRefNet-Portrait"
    suitable_for = "适合半身照 / 自拍照 / 大头贴 / 精细发丝"

    def __init__(self, model_path=None, prefer_cpu=False, threads=None, device_mode=None):
        self.explicit_path = model_path is not None
        self.model_path = model_path
        self.prefer_cpu = prefer_cpu
        self.device_mode = normalize_device_mode(device_mode or ("cpu" if prefer_cpu else "auto"))
        self.threads = max(1, min(32, int(threads or get_persisted_threads())))
        self.session = None
        self.providers = []
        self.error = None
        self.input_name = None
        self.output_name = None

    def initialize(self):
        self.providers = get_best_providers(self.prefer_cpu, device_mode=self.device_mode)
        names = [p[0] if isinstance(p, tuple) else p for p in self.providers]
        is_gpu = 'CUDAExecutionProvider' in names or 'DmlExecutionProvider' in names

        if not self.explicit_path or not self.model_path:
            self.model_path = resolve_birefnet_model_path("cuda" if is_gpu else "cpu")

        if not os.path.exists(self.model_path):
            raise FileNotFoundError(f"BiRefNet 模型文件不存在: {self.model_path}")
        import onnxruntime as ort
        opts = ort.SessionOptions()
        opts.intra_op_num_threads = 2 if is_gpu else max(1, min(32, int(self.threads)))
        opts.inter_op_num_threads = 1
        opts.execution_mode = ort.ExecutionMode.ORT_SEQUENTIAL
        if 'CUDAExecutionProvider' in names and hasattr(ort, 'preload_dlls'):
            try:
                ort.preload_dlls()
            except Exception:
                pass
        opts.enable_mem_pattern = False
        if 'DmlExecutionProvider' in names:
            opts.graph_optimization_level = ort.GraphOptimizationLevel.ORT_DISABLE_ALL
        else:
            opts.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
        try:
            self.session = ort.InferenceSession(self.model_path, opts, providers=self.providers)
        except Exception as exc:
            print(f"[BiRefNet] Session init with {self.providers} failed: {safe_exception_msg(exc)}. Fallback to CPU.")
            self.providers = ["CPUExecutionProvider"]
            self.prefer_cpu = True
            self.model_path = resolve_birefnet_model_path("cpu")
            opts.intra_op_num_threads = max(1, min(32, int(self.threads)))
            opts.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
            self.session = ort.InferenceSession(self.model_path, opts, providers=self.providers)
        active = self.session.get_providers()
        self.providers = active

        self.input_name = self.session.get_inputs()[0].name
        self.output_name = self.session.get_outputs()[0].name
        self.error = None

    def set_threads(self, threads):
        threads = max(1, min(32, int(threads)))
        if self.threads != threads:
            self.threads = threads
            if self.session is not None and self.prefer_cpu:
                self.session = None

    def set_device(self, prefer_cpu=False, device_mode=None):
        prefer_cpu = bool(prefer_cpu)
        mode = normalize_device_mode(device_mode or ("cpu" if prefer_cpu else "auto"))
        if self.prefer_cpu != prefer_cpu or self.device_mode != mode:
            self.prefer_cpu = prefer_cpu
            self.device_mode = mode
            if not self.explicit_path:
                self.model_path = None
            if self.session is not None:
                del self.session
                self.session = None
                import gc
                gc.collect()
            self.providers = []

    def predict(self, image):
        if self.session is None:
            self.initialize()
        w, h = image.size
        img_rgb = image.convert("RGB")
        img_1024 = img_rgb.resize((1024, 1024), Image.Resampling.BILINEAR)

        arr = np.array(img_1024, dtype=np.float32) / 255.0
        mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
        std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
        tensor = np.transpose((arr - mean) / std, (2, 0, 1))[np.newaxis, ...]

        try:
            ort_outs = self.session.run([self.output_name], {self.input_name: tensor})
        except Exception as exc:
            print(f"[BiRefNet] GPU 推理异常 ({safe_exception_msg(exc)})，使用 CPU 纯多核临时重试...")
            import onnxruntime as ort
            cpu_opts = ort.SessionOptions()
            cpu_opts.intra_op_num_threads = max(1, min(32, int(self.threads)))
            cpu_opts.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
            cpu_model_path = resolve_birefnet_model_path("cpu")
            cpu_sess = ort.InferenceSession(cpu_model_path, cpu_opts, providers=["CPUExecutionProvider"])
            ort_outs = cpu_sess.run([self.output_name], {self.input_name: tensor})

        out = ort_outs[0]
        if len(out.shape) == 4:
            out = out[0, 0, :, :]
        elif len(out.shape) == 3:
            out = out[0, :, :]

        # BiRefNet outputs raw logits; sigmoid maps them to [0, 1] probabilities
        prob = 1.0 / (1.0 + np.exp(-out))
        # Precise threshold curve: eliminates background noise, solidifies core subject
        low_th, high_th = 0.05, 0.82
        norm = np.clip((prob - low_th) / (high_th - low_th), 0.0, 1.0)
        norm = norm * norm * (3.0 - 2.0 * norm)

        mask_img = Image.fromarray((norm * 255.0).astype(np.uint8), mode="L").resize((w, h), Image.Resampling.LANCZOS)
        alpha_np = np.array(mask_img, dtype=np.uint8)
        alpha_np[alpha_np < 8] = 0
        alpha_np[alpha_np > 248] = 255

        cutout = img_rgb.convert("RGBA")
        cutout.putalpha(Image.fromarray(alpha_np, mode="L"))
        return cutout

    def info(self):
        resolved = self.model_path or resolve_birefnet_model_path(self.device_mode)
        return {
            "available": os.path.exists(resolved) if resolved else False,
            "initialized": self.session is not None,
            "name": self.display_name,
            "suitable_for": self.suitable_for,
            "model_path": self.model_path or resolved,
            "prefer_cpu": self.prefer_cpu,
            "providers": self.providers,
            "threads": self.threads,
            "error": self.error,
        }


class RMBG2Engine:
    """RMBG-2.0 商业级通用高清抠图引擎.

    适合场景：【全身照 / 站姿 / 多人合影 / 复杂服装与手势】
    优势：主体识别极稳健，不会误把衣服褶皱/胸口掏空，对复杂全身照鲁棒性极高。
    """
    name = "rmbg2"
    display_name = "RMBG-2.0"
    suitable_for = "适合全身照 / 站姿 / 多人合影 / 复杂服装与手势"

    def __init__(self, model_path=None, prefer_cpu=True, threads=None, device_mode=None):
        self.explicit_path = model_path is not None
        self.model_path = model_path
        self.prefer_cpu = prefer_cpu
        self.device_mode = normalize_device_mode(device_mode or ("cpu" if prefer_cpu else "auto"))
        self.threads = max(1, min(32, int(threads or get_persisted_threads())))
        self.session = None
        self.providers = []
        self.error = None
        self.input_name = None
        self.output_name = None

    def initialize(self):
        self.providers = get_best_providers(self.prefer_cpu, device_mode=self.device_mode)
        names = [p[0] if isinstance(p, tuple) else p for p in self.providers]
        is_gpu = 'CUDAExecutionProvider' in names or 'DmlExecutionProvider' in names

        if not self.explicit_path or not self.model_path:
            self.model_path = resolve_rmbg2_model_path("cuda" if is_gpu else "cpu")

        if not os.path.exists(self.model_path):
            raise FileNotFoundError(f"RMBG-2.0 模型文件不存在: {self.model_path}")
        import onnxruntime as ort
        opts = ort.SessionOptions()
        opts.intra_op_num_threads = 2 if is_gpu else max(1, min(32, int(self.threads)))
        opts.inter_op_num_threads = 1
        opts.execution_mode = ort.ExecutionMode.ORT_SEQUENTIAL
        if 'CUDAExecutionProvider' in names and hasattr(ort, 'preload_dlls'):
            try:
                ort.preload_dlls()
            except Exception:
                pass
        opts.enable_mem_pattern = False
        if 'DmlExecutionProvider' in names:
            opts.graph_optimization_level = ort.GraphOptimizationLevel.ORT_DISABLE_ALL
        else:
            opts.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
        try:
            self.session = ort.InferenceSession(self.model_path, opts, providers=self.providers)
        except Exception as exc:
            print(f"[RMBG-2.0] Session init with {self.providers} failed: {safe_exception_msg(exc)}. Fallback to CPU.")
            self.providers = ["CPUExecutionProvider"]
            self.prefer_cpu = True
            self.model_path = resolve_rmbg2_model_path("cpu")
            opts.intra_op_num_threads = max(1, min(32, int(self.threads)))
            opts.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
            self.session = ort.InferenceSession(self.model_path, opts, providers=self.providers)
        active = self.session.get_providers()
        self.providers = active
        self.input_name = self.session.get_inputs()[0].name
        self.output_name = self.session.get_outputs()[0].name
        self.error = None

    def set_threads(self, threads):
        threads = max(1, min(32, int(threads)))
        if self.threads != threads:
            self.threads = threads
            if self.session is not None and self.prefer_cpu:
                self.session = None

    def set_device(self, prefer_cpu=False, device_mode=None):
        prefer_cpu = bool(prefer_cpu)
        mode = normalize_device_mode(device_mode or ("cpu" if prefer_cpu else "auto"))
        if self.prefer_cpu != prefer_cpu or self.device_mode != mode:
            self.prefer_cpu = prefer_cpu
            self.device_mode = mode
            if not self.explicit_path:
                self.model_path = None
            if self.session is not None:
                del self.session
                self.session = None
                import gc
                gc.collect()
            self.providers = []

    def predict(self, image):
        if self.session is None:
            self.initialize()
        w, h = image.size
        img_rgb = image.convert("RGB")
        img_1024 = img_rgb.resize((1024, 1024), Image.Resampling.BILINEAR)

        arr = np.array(img_1024, dtype=np.float32) / 255.0
        mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
        std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
        tensor = np.transpose((arr - mean) / std, (2, 0, 1))[np.newaxis, ...]

        try:
            ort_outs = self.session.run([self.output_name], {self.input_name: tensor})
        except Exception as exc:
            print(f"[RMBG-2.0] GPU 推理异常 ({safe_exception_msg(exc)})，使用 CPU 纯多核临时重试...")
            import onnxruntime as ort
            cpu_opts = ort.SessionOptions()
            cpu_opts.intra_op_num_threads = max(1, min(32, int(self.threads)))
            cpu_opts.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
            cpu_model_path = resolve_rmbg2_model_path("cpu")
            cpu_sess = ort.InferenceSession(cpu_model_path, cpu_opts, providers=["CPUExecutionProvider"])
            ort_outs = cpu_sess.run([self.output_name], {self.input_name: tensor})
        out = ort_outs[0]
        if len(out.shape) == 4:
            out = out[0, 0, :, :]
        elif len(out.shape) == 3:
            out = out[0, :, :]

        prob = np.clip(out.astype(np.float32), 0.0, 1.0)
        low_th, high_th = 0.05, 0.82
        norm = np.clip((prob - low_th) / (high_th - low_th), 0.0, 1.0)
        norm = norm * norm * (3.0 - 2.0 * norm)

        mask_img = Image.fromarray((norm * 255.0).astype(np.uint8), mode="L").resize((w, h), Image.Resampling.LANCZOS)
        alpha_np = np.array(mask_img, dtype=np.uint8)
        alpha_np[alpha_np < 8] = 0
        alpha_np[alpha_np > 248] = 255

        cutout = img_rgb.convert("RGBA")
        cutout.putalpha(Image.fromarray(alpha_np, mode="L"))
        return cutout

    def info(self):
        resolved = self.model_path or resolve_rmbg2_model_path(self.device_mode)
        return {
            "available": os.path.exists(resolved) if resolved else False,
            "initialized": self.session is not None,
            "name": self.display_name,
            "suitable_for": self.suitable_for,
            "model_path": self.model_path or resolved,
            "prefer_cpu": self.prefer_cpu,
            "providers": self.providers,
            "threads": self.threads,
            "error": self.error,
        }


class MattingEngineManager:
    """Manages SOTA portrait matting engines with lazy initialization and graceful fallback."""

    def __init__(self, default_engine=DEFAULT_ENGINE, prefer_cpu=None, threads=None):
        if prefer_cpu is None:
            self.device_mode = normalize_device_mode(get_persisted_gpu_mode())
            self.prefer_cpu = self.device_mode == "cpu"
        else:
            self.prefer_cpu = bool(prefer_cpu)
            self.device_mode = "cpu" if self.prefer_cpu else "auto"
        self.threads = max(1, min(32, int(threads or get_persisted_threads())))
        os.environ["OMP_NUM_THREADS"] = str(self.threads)
        self.default_engine = ENGINE_ALIASES.get(default_engine, DEFAULT_ENGINE)
        self.engines = {
            "birefnet": BiRefNetPortraitEngine(prefer_cpu=self.prefer_cpu, device_mode=self.device_mode, threads=self.threads),
            "rmbg2": RMBG2Engine(prefer_cpu=self.prefer_cpu, device_mode=self.device_mode, threads=self.threads),
        }

    def set_threads(self, threads):
        threads = max(1, min(32, int(threads)))
        self.threads = threads
        os.environ["OMP_NUM_THREADS"] = str(threads)
        for engine in self.engines.values():
            if hasattr(engine, "set_threads"):
                engine.set_threads(threads)

    def set_device(self, prefer_cpu=False, device_mode=None):
        self.prefer_cpu = bool(prefer_cpu)
        self.device_mode = normalize_device_mode(device_mode or ("cpu" if self.prefer_cpu else "auto"))
        for engine in self.engines.values():
            if hasattr(engine, "set_device"):
                engine.set_device(self.prefer_cpu, self.device_mode)

    def warmup(self, engine_name=None):
        """Warm up engine model session asynchronously or synchronously to eliminate cold-start latency."""
        eng_key = self.resolve_engine_name(engine_name or self.default_engine)
        eng = self.engines.get(eng_key)
        if eng:
            try:
                dummy = Image.new("RGB", (64, 64), (128, 128, 128))
                eng.predict(dummy)
                return True
            except Exception as exc:
                print(f"[MattingManager] Warmup for {eng_key} failed: {exc}")
        return False

    def get_device_status(self):
        providers = []
        for engine in self.engines.values():
            if engine.session is not None:
                providers.extend(engine.session.get_providers())
        active = list(dict.fromkeys(providers))
        # Installed providers and requested settings are not live sessions.
        # A failed/reset session may also leave stale engine.providers behind.
        active_gpu = any("CUDA" in str(p) or "Dml" in str(p) for p in active)
        return {
            "device": self.device_mode,
            "device_mode": self.device_mode,
            "is_gpu_active": active_gpu,
            "session_initialized": bool(active),
            "prefer_cpu": self.prefer_cpu,
            "gpu_name": next((p for p in active if "CUDA" in p or "Dml" in p), ""),
            "providers": active,
            "threads": self.threads,
        }

    def resolve_engine_name(self, requested):
        req = str(requested or "").lower().strip()
        return ENGINE_ALIASES.get(req, self.default_engine)

    def predict(self, image, requested_engine=None, auto_fallback=True):
        canonical = self.resolve_engine_name(requested_engine)
        target = self.engines.get(canonical)
        fallback_used = False
        error_msg = None

        try:
            cutout = target.predict(image)
            return cutout, {
                "requested_engine": requested_engine,
                "used_engine": canonical,
                "engine_name": target.display_name,
                "suitable_for": target.suitable_for,
                "fallback": False,
                "quality": inspect_quality(cutout),
            }
        except Exception as exc:
            error_msg = safe_exception_msg(exc)
            if not auto_fallback:
                raise

        # Fallback to the other engine
        alt_key = "rmbg2" if canonical == "birefnet" else "birefnet"
        alt_target = self.engines[alt_key]
        try:
            print(f"[MattingManager] Engine '{canonical}' failed ({error_msg}). Falling back to '{alt_key}'.")
            cutout = alt_target.predict(image)
            return cutout, {
                "requested_engine": requested_engine,
                "used_engine": alt_key,
                "engine_name": alt_target.display_name,
                "suitable_for": alt_target.suitable_for,
                "fallback": True,
                "fallback_reason": error_msg,
                "quality": inspect_quality(cutout),
            }
        except Exception as alt_exc:
            alt_msg = safe_exception_msg(alt_exc)
            raise RuntimeError(f"Primary engine '{canonical}' failed: {error_msg}; Alternate '{alt_key}' failed: {alt_msg}") from alt_exc

    def diagnostics(self):
        return {
            "default_engine": self.default_engine,
            "device_status": self.get_device_status(),
            "threads": self.threads,
            "max_system_threads": os.cpu_count() or 4,
            "engines": {k: eng.info() for k, eng in self.engines.items()},
        }


def harmonize_portrait_relighting(person_rgba, bg_rgba, strength=0.36):
    """Intelligently harmonizes portrait lighting and color temperature to match the background scene.
    1. Skin-tone protected dual-zone ambient lighting harmonization (LAB space statistical transfer).
    2. Edge environmental light wrap (rim lighting bleed) around person silhouette to eliminate cutout cardboard look.
    """
    try:
        import cv2
        if person_rgba.mode != "RGBA" or bg_rgba.mode != "RGBA":
            return person_rgba

        p_np = np.array(person_rgba)
        bg_np = np.array(bg_rgba)

        alpha = p_np[:, :, 3]
        h, w = alpha.shape
        mask = alpha > 25
        if not np.any(mask):
            return person_rgba

        # Fast downsampled ambient statistics
        sw, sh = max(32, w // 4), max(32, h // 4)
        p_small = cv2.resize(p_np[:, :, :3], (sw, sh), interpolation=cv2.INTER_AREA)
        bg_small = cv2.resize(bg_np[:, :, :3], (sw, sh), interpolation=cv2.INTER_AREA)
        mask_small = cv2.resize(mask.astype(np.uint8), (sw, sh), interpolation=cv2.INTER_NEAREST) > 0

        p_rgb = p_np[:, :, :3].astype(np.float32)
        if np.any(mask_small):
            p_small_lab = cv2.cvtColor(p_small, cv2.COLOR_RGB2LAB).astype(np.float32)
            bg_small_lab = cv2.cvtColor(bg_small, cv2.COLOR_RGB2LAB).astype(np.float32)

            mu_fg = p_small_lab[mask_small].mean(axis=0)
            std_fg = p_small_lab[mask_small].std(axis=0) + 1e-4
            mu_bg = bg_small_lab.reshape(-1, 3).mean(axis=0)
            std_bg = bg_small_lab.reshape(-1, 3).std(axis=0) + 1e-4

            scale_std = np.clip(std_bg / std_fg, 0.78, 1.22)
            p_lab = cv2.cvtColor(p_np[:, :, :3], cv2.COLOR_RGB2LAB).astype(np.float32)
            p_trans = (p_lab - mu_fg) * scale_std + mu_bg
            p_trans[:, :, 0] = np.clip(p_trans[:, :, 0], 25.0, 240.0)
            p_trans[:, :, 1] = np.clip(p_trans[:, :, 1], 0.0, 255.0)
            p_trans[:, :, 2] = np.clip(p_trans[:, :, 2], 0.0, 255.0)
            harmonized_rgb = cv2.cvtColor(np.clip(p_trans, 0, 255).astype(np.uint8), cv2.COLOR_LAB2RGB).astype(np.float32)

            # Skin tone detection in YCrCb for protection
            p_uint8 = np.clip(p_rgb, 0, 255).astype(np.uint8)
            ycrcb = cv2.cvtColor(p_uint8, cv2.COLOR_RGB2YCrCb)
            cr = ycrcb[:, :, 1]
            cb = ycrcb[:, :, 2]
            skin_mask = ((cr >= 133) & (cr <= 173) & (cb >= 77) & (cb <= 127)).astype(np.float32)
            skin_mask = cv2.GaussianBlur(skin_mask, (15, 15), 0)[:, :, np.newaxis]

            # Dual-zone blending: preserve natural radiant skin, harmonize hair/body/clothing
            base_strength = max(0.0, min(0.42, float(strength)))
            zone_weights = base_strength * (1.0 - skin_mask * 0.72)
            p_rgb = (1.0 - zone_weights) * p_rgb + zone_weights * harmonized_rgb

        # Rim light wrap around outer contour
        k_size = max(5, int(min(h, w) * 0.007)) | 1
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (k_size, k_size))
        dilated = cv2.dilate((alpha > 12).astype(np.uint8), kernel)
        eroded = cv2.erode((alpha > 235).astype(np.uint8), kernel)
        rim_band = ((dilated > 0) & (eroded == 0)).astype(np.float32)
        rim_band = cv2.GaussianBlur(rim_band, (k_size, k_size), 0)[:, :, np.newaxis]

        bg_light_small = cv2.GaussianBlur(bg_small.astype(np.float32), (15, 15), 0)
        bg_light = cv2.resize(bg_light_small, (w, h), interpolation=cv2.INTER_LINEAR)
        screen_blend = 255.0 - ((255.0 - p_rgb) * (255.0 - bg_light)) / 255.0
        rim_intensity = 0.35
        final_rgb = (1.0 - rim_band * rim_intensity) * p_rgb + (rim_band * rim_intensity) * screen_blend
        final_rgb = np.clip(final_rgb, 0, 255).astype(np.uint8)

        out_np = np.dstack([final_rgb, alpha])
        return Image.fromarray(out_np, "RGBA")
    except Exception:
        return person_rgba


def composite_natural_portrait(cutout, template_path, template_scale=1.0, offset_x_ratio=0.0, offset_y_ratio=0.0, person_scale=1.0, person_offset_x=0.0, person_offset_y=0.0, harmonize=True):
    """Accurately composite extracted person onto background template with scale, offset, contact shadow, and environmental lighting harmonization."""
    with Image.open(template_path) as template_file:
        bg = template_file.convert("RGBA")

    photo_w, photo_h = cutout.size
    bg_w, bg_h = bg.size

    scale = max(bg_w / float(photo_w), bg_h / float(photo_h))
    target_w = max(10, int(photo_w * scale))
    target_h = max(10, int(photo_h * scale))

    if template_scale != 1.0 or offset_x_ratio != 0.0 or offset_y_ratio != 0.0:
        canvas_w = target_w
        canvas_h = target_h
        new_bg_w = max(10, int(bg_w * template_scale))
        new_bg_h = max(10, int(bg_h * template_scale))
        bg_scaled = bg.resize((new_bg_w, new_bg_h), Image.Resampling.LANCZOS)
        bg_pos_x = (canvas_w - new_bg_w) // 2 + int(offset_x_ratio * canvas_w)
        bg_pos_y = (canvas_h - new_bg_h) // 2 + int(offset_y_ratio * canvas_h)
        canvas_bg = Image.new("RGBA", (canvas_w, canvas_h), (255, 255, 255, 255))
        canvas_bg.paste(bg_scaled, (bg_pos_x, bg_pos_y), bg_scaled if bg_scaled.mode == "RGBA" else None)
    else:
        if abs(photo_w / float(photo_h) - bg_w / float(bg_h)) < 0.06:
            canvas_w = bg_w
            canvas_h = bg_h
            canvas_bg = bg.copy()
        else:
            canvas_w = bg_w
            canvas_h = bg_h
            canvas_bg = Image.new("RGBA", (canvas_w, canvas_h), (255, 255, 255, 255))
            canvas_bg.paste(bg, (0, 0), bg if bg.mode == "RGBA" else None)

    person_scale = max(0.1, min(5.0, float(person_scale)))
    person_scale_base = max(canvas_w / float(photo_w), canvas_h / float(photo_h))
    base_person_w = max(10, int(photo_w * person_scale_base))
    base_person_h = max(10, int(photo_h * person_scale_base))

    final_person_w = max(10, int(base_person_w * person_scale))
    final_person_h = max(10, int(base_person_h * person_scale))

    shift_x = int(person_offset_x * canvas_w)
    shift_y = int(person_offset_y * canvas_h)
    person_pos_x = (canvas_w - final_person_w) // 2 + shift_x
    person_pos_y = (canvas_h - final_person_h) // 2 + shift_y

    resized_cutout = cutout.resize((final_person_w, final_person_h), Image.Resampling.LANCZOS)
    canvas_person = Image.new("RGBA", (canvas_w, canvas_h), (0, 0, 0, 0))
    canvas_person.paste(resized_cutout, (person_pos_x, person_pos_y), resized_cutout)

    # 1. Spatial Contact Shadow / Ambient Occlusion
    try:
        import cv2
        p_alpha = np.array(canvas_person)[:, :, 3]
        if np.any(p_alpha > 20):
            sw, sh = max(16, canvas_w // 4), max(16, canvas_h // 4)
            alpha_sm = cv2.resize((p_alpha > 20).astype(np.float32), (sw, sh), interpolation=cv2.INTER_AREA)
            shadow_k = max(7, int(min(sh, sw) * 0.038)) | 1
            shadow_sm = cv2.GaussianBlur(alpha_sm, (shadow_k, shadow_k), 0)
            shadow_full = cv2.resize(shadow_sm, (canvas_w, canvas_h), interpolation=cv2.INTER_LINEAR)

            dx = int(canvas_w * 0.005)
            dy = int(canvas_h * 0.012)
            M = np.float32([[1, 0, dx], [0, 1, dy]])
            shadow_full = cv2.warpAffine(shadow_full, M, (canvas_w, canvas_h))

            shadow_rgba = np.zeros((canvas_h, canvas_w, 4), dtype=np.uint8)
            shadow_rgba[:, :, :3] = 0
            shadow_rgba[:, :, 3] = np.clip(shadow_full * 72.0, 0, 255).astype(np.uint8)  # ~28% max opacity
            shadow_layer = Image.fromarray(shadow_rgba, mode="RGBA")
            canvas_bg = Image.alpha_composite(canvas_bg, shadow_layer)
    except Exception:
        pass

    # 2. Lighting Harmonization & Rim Light Wrap
    if harmonize:
        canvas_person = harmonize_portrait_relighting(canvas_person, canvas_bg, strength=0.36)

    return Image.alpha_composite(canvas_bg, canvas_person).convert("RGB")


def process_with_manager(manager, input_path, output_path, template_path=None, engine=DEFAULT_ENGINE, auto_fallback=True, model=None, template_scale=1.0, offset_x=0.0, offset_y=0.0, person_scale=1.0, person_offset_x=0.0, person_offset_y=0.0, harmonize=True):
    started = time.time()
    if not os.path.isfile(input_path):
        return {"success": False, "error": f"Input file not found: {input_path}"}
    try:
        os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
        base = os.path.splitext(os.path.basename(input_path))[0]
        with Image.open(input_path) as source:
            image = source.copy()
        try:
            from PIL import ImageOps
            image = ImageOps.exif_transpose(image)
        except Exception:
            pass

        canonical_engine = manager.resolve_engine_name(engine)
        cache = os.path.join(
            os.path.dirname(os.path.abspath(output_path)),
            f"{base}_cutout_cache_{canonical_engine}.png",
        )
        cutout = None
        meta = None
        if os.path.exists(cache):
            try:
                with Image.open(cache) as cached:
                    candidate = cached.convert("RGBA")
                cached_quality = inspect_quality(candidate)
                if cached_quality.get("valid"):
                    cutout = candidate
                    eng_obj = manager.engines.get(canonical_engine)
                    meta = {
                        "requested_engine": engine,
                        "used_engine": canonical_engine,
                        "engine_name": eng_obj.display_name if eng_obj else canonical_engine,
                        "suitable_for": eng_obj.suitable_for if eng_obj else "",
                        "fallback": False,
                        "cache": True,
                        "quality": cached_quality,
                    }
            except Exception:
                cutout = None

        if cutout is None:
            cutout, meta = manager.predict(image, canonical_engine, auto_fallback)
            cutout = clean_cutout_defringe(cutout, orig_image=image)
            temp_cache = cache + f".{uuid.uuid4().hex}.tmp"
            try:
                cutout.save(temp_cache, format="PNG")
                os.replace(temp_cache, cache)
            except Exception:
                if os.path.exists(temp_cache):
                    os.remove(temp_cache)

        photo_w, photo_h = cutout.size
        if not template_path or template_path == "transparent" or not os.path.exists(template_path):
            if person_scale != 1.0 or person_offset_x != 0.0 or person_offset_y != 0.0:
                final_w = max(10, int(photo_w * person_scale))
                final_h = max(10, int(photo_h * person_scale))
                shift_x = int(person_offset_x * photo_w)
                shift_y = int(person_offset_y * photo_h)
                pos_x = (photo_w - final_w) // 2 + shift_x
                pos_y = (photo_h - final_h) // 2 + shift_y
                canvas_person = Image.new("RGBA", (photo_w, photo_h), (0, 0, 0, 0))
                resized = cutout.resize((final_w, final_h), Image.Resampling.LANCZOS)
                canvas_person.paste(resized, (pos_x, pos_y), resized)
                output_cutout = canvas_person
            else:
                output_cutout = cutout
            temp = output_path + f".{uuid.uuid4().hex}.tmp"
            output_cutout.save(temp, format="PNG")
            os.replace(temp, output_path)
            kind = "png"
        else:
            final = composite_natural_portrait(cutout, template_path, template_scale, offset_x, offset_y, person_scale, person_offset_x, person_offset_y, harmonize=harmonize)
            temp = output_path + f".{uuid.uuid4().hex}.tmp"
            final.save(temp, format="JPEG", quality=95)
            os.replace(temp, output_path)
            kind = "jpeg"
        meta.update({"success": True, "output": output_path, "type": kind, "time_ms": round((time.time() - started) * 1000, 2)})
        return meta
    except Exception as exc:
        return {"success": False, "error": safe_exception_msg(exc), "requested_engine": engine, "time_ms": round((time.time() - started) * 1000, 2)}
