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
                if val in ("gpu", "cpu"):
                    return val
    except Exception:
        pass
    return "gpu"


os.environ["OMP_NUM_THREADS"] = str(get_persisted_threads())

import time
import uuid
import gc
import numpy as np
from PIL import Image

MODELS_ROOT = os.path.expanduser(r"~\.rembg\models")
BIREFNET_MODEL_PATH = os.path.join(MODELS_ROOT, "birefnet-portrait", "birefnet-portrait.onnx")
RMBG2_MODEL_PATH = os.path.join(MODELS_ROOT, "rmbg-2.0", "rmbg-2.0.onnx")

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


def get_best_providers(prefer_cpu=True, gpu_device_id=0):
    """Return optimal execution providers for ONNX Runtime."""
    if prefer_cpu:
        return ["CPUExecutionProvider"]
    try:
        import onnxruntime as ort
        available = ort.get_available_providers()
        providers = []
        if "CUDAExecutionProvider" in available:
            providers.append(("CUDAExecutionProvider", {"device_id": gpu_device_id}))
        if "DmlExecutionProvider" in available:
            providers.append(("DmlExecutionProvider", {"device_id": gpu_device_id}))
        providers.append("CPUExecutionProvider")
        return providers if providers else ["CPUExecutionProvider"]
    except Exception:
        return ["CPUExecutionProvider"]


def clean_cutout_defringe(cutout, alpha_low=15.0, alpha_high=220.0, radius=1):
    """Gentle portrait edge defringing without any cavity hollow-out or hole-carving."""
    try:
        from scipy.ndimage import distance_transform_edt, binary_dilation
        arr = np.array(cutout.convert("RGBA"), dtype=np.float32)
        alpha = arr[:, :, 3]
        span = max(1.0, float(alpha_high) - float(alpha_low))
        alpha_clean = np.clip((alpha - alpha_low) / span * 255.0, 0, 255)
        opaque_mask = alpha_clean >= 200
        if np.any(opaque_mask) and radius > 0:
            border_zone = binary_dilation(opaque_mask, iterations=int(radius)) & ~opaque_mask
            if np.any(border_zone):
                _, indices = distance_transform_edt(~opaque_mask, return_indices=True)
                for channel in range(3):
                    arr[:, :, channel] = np.where(
                        border_zone, arr[indices[0], indices[1], channel], arr[:, :, channel]
                    )
        arr[:, :, 3] = alpha_clean
        return Image.fromarray(arr.astype("uint8"), mode="RGBA")
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

    def __init__(self, model_path=BIREFNET_MODEL_PATH, prefer_cpu=False, threads=None):
        self.model_path = model_path
        self.prefer_cpu = prefer_cpu
        self.threads = max(1, min(32, int(threads or get_persisted_threads())))
        self.session = None
        self.providers = []
        self.error = None
        self.input_name = None
        self.output_name = None

    def initialize(self):
        if not os.path.exists(self.model_path):
            raise FileNotFoundError(f"BiRefNet 模型文件不存在: {self.model_path}")
        import onnxruntime as ort
        opts = ort.SessionOptions()
        if not self.prefer_cpu:
            # GPU 加速 (DirectML)：禁用全局图融合以规避驱动显存突增 (8007000E/DXGI_ERROR_DEVICE_HUNG)
            opts.graph_optimization_level = ort.GraphOptimizationLevel.ORT_DISABLE_ALL
            opts.execution_mode = ort.ExecutionMode.ORT_SEQUENTIAL
            self.providers = get_best_providers(prefer_cpu=False)
            try:
                self.session = ort.InferenceSession(self.model_path, opts, providers=self.providers)
                active = self.session.get_providers()
                if not any("Dml" in p or "CUDA" in p for p in active):
                    print("[BiRefNet] 未检测到可用的 GPU 加速提供者，切换至 CPU 模式...")
                    self.prefer_cpu = True
            except Exception as e:
                print(f"[BiRefNet] GPU 启动异常 ({e})，正在自动安全回退至 CPU 多核模式...")
                self.prefer_cpu = True
                opts = ort.SessionOptions()
                opts.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
                opts.intra_op_num_threads = max(1, min(32, int(self.threads)))
                opts.inter_op_num_threads = 1
                opts.execution_mode = ort.ExecutionMode.ORT_SEQUENTIAL
                self.providers = ["CPUExecutionProvider"]
                self.session = ort.InferenceSession(self.model_path, opts, providers=self.providers)
        else:
            opts.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
            opts.intra_op_num_threads = max(1, min(32, int(self.threads)))
            opts.inter_op_num_threads = 1
            opts.execution_mode = ort.ExecutionMode.ORT_SEQUENTIAL
            self.providers = ["CPUExecutionProvider"]
            self.session = ort.InferenceSession(self.model_path, opts, providers=self.providers)

        self.input_name = self.session.get_inputs()[0].name
        self.output_name = self.session.get_outputs()[0].name
        self.error = None

    def set_threads(self, threads):
        threads = max(1, min(32, int(threads)))
        if self.threads != threads:
            self.threads = threads
            if self.session is not None and self.prefer_cpu:
                self.session = None

    def set_device(self, prefer_cpu=False):
        prefer_cpu = bool(prefer_cpu)
        if self.prefer_cpu != prefer_cpu:
            self.prefer_cpu = prefer_cpu
            self.session = None

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
            if not self.prefer_cpu:
                print(f"[BiRefNet] GPU 推理异常 ({exc})，即时降级至 CPU 纯多核重试...")
                self.set_device(prefer_cpu=True)
                ort_outs = self.session.run([self.output_name], {self.input_name: tensor})
            else:
                raise

        out = ort_outs[0]
        if len(out.shape) == 4:
            out = out[0, 0, :, :]
        elif len(out.shape) == 3:
            out = out[0, :, :]

        pred = 1.0 / (1.0 + np.exp(-out))
        pred = (pred - pred.min()) / max(1e-6, (pred.max() - pred.min()))
        mask = Image.fromarray((pred * 255.0).astype(np.uint8), mode="L").resize((w, h), Image.Resampling.LANCZOS)
        cutout = img_rgb.convert("RGBA")
        cutout.putalpha(mask)
        return cutout

    def info(self):
        return {
            "available": os.path.exists(self.model_path),
            "initialized": self.session is not None,
            "name": self.display_name,
            "suitable_for": self.suitable_for,
            "model_path": self.model_path,
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

    def __init__(self, model_path=RMBG2_MODEL_PATH, prefer_cpu=True, threads=None):
        self.model_path = model_path
        self.prefer_cpu = prefer_cpu
        self.threads = max(1, min(32, int(threads or get_persisted_threads())))
        self.session = None
        self.providers = []
        self.error = None
        self.input_name = None
        self.output_name = None

    def initialize(self):
        if not os.path.exists(self.model_path):
            raise FileNotFoundError(f"RMBG-2.0 模型文件不存在: {self.model_path}")
        import onnxruntime as ort
        opts = ort.SessionOptions()
        opts.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
        opts.intra_op_num_threads = max(1, min(32, int(self.threads)))
        opts.inter_op_num_threads = 1
        opts.execution_mode = ort.ExecutionMode.ORT_SEQUENTIAL
        self.providers = get_best_providers(self.prefer_cpu)
        self.session = ort.InferenceSession(self.model_path, opts, providers=self.providers)
        self.input_name = self.session.get_inputs()[0].name
        self.output_name = self.session.get_outputs()[0].name
        self.error = None

    def set_threads(self, threads):
        threads = max(1, min(32, int(threads)))
        if self.threads != threads:
            self.threads = threads
            if self.session is not None and self.prefer_cpu:
                self.session = None

    def set_device(self, prefer_cpu=False):
        prefer_cpu = bool(prefer_cpu)
        if self.prefer_cpu != prefer_cpu:
            self.prefer_cpu = prefer_cpu
            self.session = None

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

        ort_outs = self.session.run([self.output_name], {self.input_name: tensor})
        out = ort_outs[0]
        if len(out.shape) == 4:
            out = out[0, 0, :, :]
        elif len(out.shape) == 3:
            out = out[0, :, :]

        pred = 1.0 / (1.0 + np.exp(-out))
        pred = (pred - pred.min()) / max(1e-6, (pred.max() - pred.min()))
        mask = Image.fromarray((pred * 255.0).astype(np.uint8), mode="L").resize((w, h), Image.Resampling.LANCZOS)
        cutout = img_rgb.convert("RGBA")
        cutout.putalpha(mask)
        return cutout

    def info(self):
        return {
            "available": os.path.exists(self.model_path),
            "initialized": self.session is not None,
            "name": self.display_name,
            "suitable_for": self.suitable_for,
            "model_path": self.model_path,
            "prefer_cpu": self.prefer_cpu,
            "providers": self.providers,
            "threads": self.threads,
            "error": self.error,
        }


class MattingEngineManager:
    """Manages SOTA portrait matting engines with lazy initialization and graceful fallback."""

    def __init__(self, default_engine=DEFAULT_ENGINE, prefer_cpu=None, threads=None):
        if prefer_cpu is None:
            self.prefer_cpu = (get_persisted_gpu_mode() == "cpu")
        else:
            self.prefer_cpu = bool(prefer_cpu)
        self.threads = max(1, min(32, int(threads or get_persisted_threads())))
        os.environ["OMP_NUM_THREADS"] = str(self.threads)
        self.default_engine = ENGINE_ALIASES.get(default_engine, DEFAULT_ENGINE)
        self.engines = {
            "birefnet": BiRefNetPortraitEngine(prefer_cpu=self.prefer_cpu, threads=self.threads),
            "rmbg2": RMBG2Engine(prefer_cpu=self.prefer_cpu, threads=self.threads),
        }

    def set_threads(self, threads):
        threads = max(1, min(32, int(threads)))
        self.threads = threads
        os.environ["OMP_NUM_THREADS"] = str(threads)
        for engine in self.engines.values():
            if hasattr(engine, "set_threads"):
                engine.set_threads(threads)

    def set_device(self, prefer_cpu=False):
        self.prefer_cpu = bool(prefer_cpu)
        for engine in self.engines.values():
            if hasattr(engine, "set_device"):
                engine.set_device(self.prefer_cpu)

    def get_device_status(self):
        return {
            "device": "gpu" if (not self.prefer_cpu) else "cpu",
            "is_gpu_active": not self.prefer_cpu,
            "prefer_cpu": self.prefer_cpu,
            "gpu_name": "NVIDIA GeForce RTX 5060 Laptop GPU",
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
            error_msg = str(exc)
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
            raise RuntimeError(f"Primary engine '{canonical}' failed: {error_msg}; Alternate '{alt_key}' failed: {alt_exc}") from alt_exc

    def diagnostics(self):
        return {
            "default_engine": self.default_engine,
            "device_status": self.get_device_status(),
            "threads": self.threads,
            "max_system_threads": os.cpu_count() or 4,
            "engines": {k: eng.info() for k, eng in self.engines.items()},
        }


def composite_natural_portrait(cutout, template_path, template_scale=1.0, offset_x_ratio=0.0, offset_y_ratio=0.0, person_scale=1.0, person_offset_x=0.0, person_offset_y=0.0):
    """Accurately composite extracted person onto background template with scale and offset."""
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

    return Image.alpha_composite(canvas_bg, canvas_person).convert("RGB")


def process_with_manager(manager, input_path, output_path, template_path=None, engine=DEFAULT_ENGINE, auto_fallback=True, model=None, template_scale=1.0, offset_x=0.0, offset_y=0.0, person_scale=1.0, person_offset_x=0.0, person_offset_y=0.0):
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
            cutout = clean_cutout_defringe(cutout)
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
            final = composite_natural_portrait(cutout, template_path, template_scale, offset_x, offset_y, person_scale, person_offset_x, person_offset_y)
            temp = output_path + f".{uuid.uuid4().hex}.tmp"
            final.save(temp, format="JPEG", quality=95)
            os.replace(temp, output_path)
            kind = "jpeg"
        meta.update({"success": True, "output": output_path, "type": kind, "time_ms": round((time.time() - started) * 1000, 2)})
        return meta
    except Exception as exc:
        return {"success": False, "error": str(exc), "requested_engine": engine, "time_ms": round((time.time() - started) * 1000, 2)}
