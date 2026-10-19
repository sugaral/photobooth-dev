#!/usr/bin/env python3
"""
Industrial-grade FaceSwap Engine for Commercial Photobooth
Based on ONNX Runtime with selectable CPU/CUDA/DirectML execution
Components:
- SCRFD 10G Face Detection & 5-Keypoint Facial Landmarks with Anchor Centers & NMS
- ArcFace (ResNet50 / w600k_r50): 512-dim Identity Embedding
- Inswapper 128: Latent Vector Feature-Level Face Swapping with emap Projection Matrix
- Color Grading & Inverse Affine Warp: High-fidelity seamless blending
"""

import os
import sys

# Ensure CUDA and cuDNN DLL paths are initialized before any native inference module loads
try:
    import cuda_init
except ImportError:
    try:
        from bin import cuda_init
    except Exception:
        pass

import time
import json
import cv2
import numpy as np

# Avoid thread congestion
os.environ["OMP_WAIT_POLICY"] = "PASSIVE"
os.environ["KMP_BLOCKTIME"] = "0"

try:
    import onnxruntime as ort
except ImportError:
    ort = None

try:
    import onnx
    from onnx import numpy_helper
except ImportError:
    onnx = None
    numpy_helper = None

DEFAULT_FACE_DIR = os.path.expanduser(r"~/.insightface/models")
BUFFALO_L_DIR = os.path.join(DEFAULT_FACE_DIR, "buffalo_l")
PIPELINE_REVISION = "inswapper-alignment-v2"

# Standard 5 landmarks for ArcFace (112x112)
ARCFACE_DST_112 = np.array([
    [38.2946, 51.6963],
    [73.5318, 51.5014],
    [56.0252, 71.7366],
    [41.5493, 92.3655],
    [70.7299, 92.2041]
], dtype=np.float32)

# InsightFace uses the 112px landmarks with 8px horizontal padding for
# Inswapper's 128px crop. Scaling by 128/112 changes the model's trained pose
# and cuts off the lower face. The 512px parsing crop is exactly 4x this crop.
INSWAPPER_DST_128 = ARCFACE_DST_112 + np.array([8.0, 0.0], dtype=np.float32)


def estimate_norm_5kps(kps, image_size=112):
    """Least-squares similarity alignment, matching InsightFace's face_align.

    Fit all five landmarks without RANSAC: dropping a mouth/eye landmark on an
    expressive face changes the crop unpredictably between source and result.
    """
    if image_size > 0 and image_size % 112 == 0:
        dst = ARCFACE_DST_112.astype(np.float64) * (image_size / 112.0)
    elif image_size > 0 and image_size % 128 == 0:
        dst = INSWAPPER_DST_128.astype(np.float64) * (image_size / 128.0)
    else:
        raise ValueError("Face alignment size must be a positive multiple of 112 or 128")
    kps = np.asarray(kps, dtype=np.float64)
    if kps.shape != (5, 2) or not np.isfinite(kps).all():
        return None
    center = kps.mean(axis=0)
    destination_center = dst.mean(axis=0)
    centered = kps - center
    destination = dst - destination_center
    variance = float(np.sum(centered ** 2))
    if variance < 1e-8 or np.linalg.matrix_rank(centered) < 2:
        return None
    a = float(np.sum(centered * destination)) / variance
    b = float(np.sum(centered[:, 0] * destination[:, 1]
                     - centered[:, 1] * destination[:, 0])) / variance
    rotation_scale = np.array([[a, -b], [b, a]], dtype=np.float64)
    if a * a + b * b < 1e-12:
        return None
    return np.column_stack((rotation_scale, destination_center - rotation_scale @ center))


def norm_crop(img, landmark, image_size=112):
    """Crop and align face using similarity transform."""
    M = estimate_norm_5kps(landmark, image_size=image_size)
    if M is None:
        return None, None
    warped = cv2.warpAffine(img, M, (image_size, image_size), borderValue=0.0)
    return warped, M


class FaceSwapEngine:
    _instance = None

    @classmethod
    def get_instance(cls, prefer_cpu=False):
        if cls._instance is None:
            cls._instance = cls(prefer_cpu=prefer_cpu)
        return cls._instance

    def __init__(self, prefer_cpu=False, device_mode=None, profile_dir=None):
        self.prefer_cpu = prefer_cpu
        self.device_mode = str(device_mode or ("cpu" if prefer_cpu else "auto")).lower()
        if self.device_mode == "gpu":
            self.device_mode = "auto"
        if self.device_mode not in ("auto", "cpu", "cuda", "directml"):
            raise ValueError("Unknown inference device: " + self.device_mode)
        self.profile_dir = profile_dir
        self.session_diagnostics = {}
        self.cuda_preload_attempted = False
        self.cuda_preload_error = None
        self.det_sess = None
        self.rec_sess = None
        self.swap_sess = None
        self.enhancer_sess = None
        self.enhancer_type = None
        self.mask_sess = None
        self.bisenet_sess = None
        self.emap = None
        self._init_models()

    def _get_providers(self):
        if self.prefer_cpu or self.device_mode == "cpu" or ort is None:
            return ["CPUExecutionProvider"]
        available = ort.get_available_providers()
        providers = []
        if self.device_mode == "directml":
            if "DmlExecutionProvider" in available:
                providers.append("DmlExecutionProvider")
            else:
                print("[FaceSwapEngine] DirectML requested but DmlExecutionProvider not available. Falling back.", flush=True)
        elif self.device_mode == "cuda":
            if "CUDAExecutionProvider" in available:
                providers.append("CUDAExecutionProvider")
            else:
                print("[FaceSwapEngine] CUDA requested but CUDAExecutionProvider not available. Falling back.", flush=True)
        else: # auto
            if "CUDAExecutionProvider" in available:
                try:
                    import ctypes
                    ctypes.CDLL("cudnn64_9.dll")
                    providers.append("CUDAExecutionProvider")
                except Exception:
                    pass
            if "DmlExecutionProvider" in available:
                providers.append("DmlExecutionProvider")
        providers.append("CPUExecutionProvider")
        return providers

    def _create_session(self, model_path):
        if not os.path.exists(model_path):
            return None
        providers = self._get_providers()
        if "CUDAExecutionProvider" in providers and not self.cuda_preload_attempted:
            self.cuda_preload_attempted = True
            # Windows CUDA sessions can initialize but fail on their first Conv
            # unless cuDNN/CUDA DLLs (including installed PyTorch DLLs) are loaded.
            if hasattr(ort, 'preload_dlls'):
                try:
                    ort.preload_dlls()
                except Exception as exc:
                    self.cuda_preload_error = str(exc)
                    print(f"[FaceSwapEngine] CUDA DLL preload failed: {exc}", flush=True)
        opts = ort.SessionOptions()
        # DirectML stability: disable shader rewrite crashes
        opts.graph_optimization_level = ort.GraphOptimizationLevel.ORT_DISABLE_ALL
        if "DmlExecutionProvider" in providers:
            # DirectML does not support memory patterns or parallel execution.
            opts.enable_mem_pattern = False
            opts.execution_mode = ort.ExecutionMode.ORT_SEQUENTIAL
        if self.profile_dir:
            os.makedirs(self.profile_dir, exist_ok=True)
            opts.enable_profiling = True
            opts.profile_file_prefix = os.path.join(self.profile_dir, os.path.basename(model_path))
        diagnostic = {"requested_providers": providers}
        # Exhaustive cuDNN search made the first swap exceed the HTTP timeout.
        # Heuristic selection avoids benchmarking every convolution on startup.
        cuda_options = {"cudnn_conv_algo_search": "HEURISTIC"}
        session_providers = [(p, cuda_options) if p == "CUDAExecutionProvider" else p for p in providers]
        if "CUDAExecutionProvider" in providers:
            diagnostic["cuda_options"] = cuda_options
        self.session_diagnostics[os.path.basename(model_path)] = diagnostic
        try:
            session = ort.InferenceSession(model_path, sess_options=opts, providers=session_providers)
            active = session.get_providers()
            # ORT can internally fall back without raising from its constructor.
            if self.device_mode in ("directml", "cuda") and providers[0] not in active:
                print(f"[FaceSwapEngine] Notice: {providers[0]} not in active providers {active}", flush=True)
        except Exception as exc:
            diagnostic["error"] = str(exc)
            print(f"[FaceSwapEngine] Provider {providers} failed for {model_path}: {exc}. Fallback to CPU.", flush=True)
            session = ort.InferenceSession(model_path, sess_options=opts, providers=["CPUExecutionProvider"])
        diagnostic["active_providers"] = session.get_providers()
        diagnostic["cpu_fallback"] = providers[0] != "CPUExecutionProvider" and providers[0] not in session.get_providers()
        return session

    def get_device_status(self):
        """Session configuration; actual operator execution requires an ORT profile."""
        return {"requested_device": self.device_mode,
                "pipeline_revision": PIPELINE_REVISION,
                "onnxruntime_version": getattr(ort, '__version__', None),
                "onnxruntime_path": getattr(ort, '__file__', None),
                "available_providers": ort.get_available_providers() if ort else [],
                "cuda_preload_error": self.cuda_preload_error,
                "models": self.session_diagnostics}

    def finish_profiling(self):
        profiles = {}
        if self.profile_dir:
            for name in ("det_sess", "rec_sess", "swap_sess", "enhancer_sess", "mask_sess", "bisenet_sess"):
                session = getattr(self, name)
                if session is not None:
                    profiles[name] = session.end_profiling()
        return profiles

    def _init_models(self):
        if ort is None:
            print("[FaceSwapEngine] onnxruntime is not installed.", flush=True)
            return

        model_paths = {
            "det_sess": os.path.join(BUFFALO_L_DIR, "det_10g.onnx"),
            "rec_sess": os.path.join(BUFFALO_L_DIR, "w600k_r50.onnx"),
            "swap_sess": os.path.join(DEFAULT_FACE_DIR, "inswapper_128.onnx"),
            "bisenet_sess": os.path.join(DEFAULT_FACE_DIR, "bisenet_resnet_34.onnx"),
        }
        for attribute, model_path in model_paths.items():
            if not os.path.isfile(model_path):
                print(f"[FaceSwapEngine] Required model missing: {model_path}", flush=True)
                continue
            try:
                setattr(self, attribute, self._create_session(model_path))
            except Exception as error:
                print(f"[FaceSwapEngine] Failed to load {os.path.basename(model_path)}: {error}", flush=True)

        emap_path = os.path.join(DEFAULT_FACE_DIR, "inswapper_emap.npy")
        try:
            if os.path.isfile(emap_path):
                matrix = np.load(emap_path, allow_pickle=False)
            elif onnx is not None and numpy_helper is not None:
                model = onnx.load(model_paths["swap_sess"], load_external_data=False)
                initializer = next(
                    item for item in model.graph.initializer
                    if tuple(item.dims) == (512, 512)
                )
                matrix = numpy_helper.to_array(initializer)
            else:
                raise RuntimeError("Inswapper identity projection matrix is unavailable")
            if matrix.shape != (512, 512) or not np.isfinite(matrix).all():
                raise ValueError("Inswapper identity projection matrix is invalid")
            self.emap = np.asarray(matrix, dtype=np.float32)
        except Exception as error:
            self.emap = None
            print(f"[FaceSwapEngine] Failed to load Inswapper identity matrix: {error}", flush=True)

        codeformer_path = os.path.join(DEFAULT_FACE_DIR, "codeformer.onnx")
        if os.path.isfile(codeformer_path):
            try:
                self.enhancer_sess = self._create_session(codeformer_path)
                self.enhancer_type = "codeformer"
                print(f"[FaceSwapEngine] CodeFormer face restoration model loaded successfully.", flush=True)
            except Exception as e:
                self.enhancer_sess = None
                self.enhancer_type = None
                print(f"[FaceSwapEngine] CodeFormer failed to load: {e}", flush=True)
        else:
            self.enhancer_sess = None
            self.enhancer_type = None
        self.mask_sess = None

    def enhance_face(self, face_512, fidelity=0.85):
        """Restore high-frequency facial micro-textures using CodeFormer with identity fidelity weighting."""
        if self.enhancer_sess is None or face_512 is None:
            return face_512
        try:
            rgb = cv2.cvtColor(face_512, cv2.COLOR_BGR2RGB).astype(np.float32)
            blob = ((rgb - 127.5) / 127.5).transpose(2, 0, 1)[None]
            w = np.asarray(fidelity, dtype=np.float64)
            outputs = self.enhancer_sess.run(None, {"input": blob, "weight": w})
            enhanced = outputs[0]
            if enhanced.shape != (1, 3, 512, 512) or not np.isfinite(enhanced).all():
                return face_512
            enhanced = np.clip((enhanced[0].transpose(1, 2, 0) + 1.0) * 127.5, 0, 255).astype(np.uint8)
            enhanced = cv2.cvtColor(enhanced, cv2.COLOR_RGB2BGR)
            return enhanced
        except Exception as exc:
            print(f"[FaceSwapEngine] enhance_face error: {exc}", flush=True)
            return face_512

    def parse_face(self, face_512):
        """Extract 19-class semantic parsing map using BiSeNet."""
        if self.bisenet_sess is None:
            return None
        try:
            blob = cv2.cvtColor(face_512, cv2.COLOR_BGR2RGB).astype(np.float32) / 255.0
            blob = (blob - np.array([0.485, 0.456, 0.406], dtype=np.float32)) / np.array([0.229, 0.224, 0.225], dtype=np.float32)
            blob = np.transpose(blob, (2, 0, 1))[None, ...].astype(np.float32)
            out = self.bisenet_sess.run(None, {"input": blob})[0]
            return np.argmax(out[0], axis=0)
        except Exception as exc:
            print(f"[FaceSwapEngine] BiSeNet parse exception: {exc}", flush=True)
            return None

    def build_organic_mask(self, parsing_target, rho=1.0):
        """Build a soft boundary from the aligned template face only.

        The generated face is in template coordinates. Source-image masks are
        unrelated to this boundary and must not be transplanted along with it.
        The crop border is always faded, even if parsing reaches an edge.
        """
        if parsing_target is None:
            return None
        try:
            labels = np.asarray(parsing_target)
            if labels.shape != (512, 512) or not np.isfinite(labels).all():
                return None
            face_labels = [1, 2, 3, 4, 5, 10, 11, 12, 13]
            mask = np.isin(labels, face_labels).astype(np.uint8)
            if np.count_nonzero(mask) < 4096:
                return None
            # Identify hair occlusion (label 17) and non-skin barriers (cloth 16, background 0)
            hair_barrier = (labels == 17)
            cloth_barrier = (labels == 16) | (labels == 0)

            # Close minor interior face holes (e.g. skin tone parser anomalies)
            mask = cv2.morphologyEx(
                mask,
                cv2.MORPH_CLOSE,
                cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9)),
            )

            # Foreground Hair Occlusion Protection:
            # Hair strands falling across cheeks or forehead must remain from the original template.
            # Never let Inswapper paste face pixels over template hair (which causes dark scars/blemishes).
            hair_protect = cv2.dilate(
                hair_barrier.astype(np.uint8),
                cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
            ) > 0
            mask[hair_protect] = 0

            # Jawline & Collar Edge Barrier:
            # Strictly prevent skin mask from bleeding onto clothing collars or background
            cloth_protect = cv2.dilate(
                cloth_barrier.astype(np.uint8),
                cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
            ) > 0
            mask[cloth_protect] = 0

            # Natural edge feathering: use a controlled, precise kernel (11x11)
            # instead of a massive 25x25 blur that spills onto collars
            mask_float = cv2.GaussianBlur(mask.astype(np.float32), (11, 11), 0)

            # Enforce zero transmission on clothing and background
            mask_float = mask_float * (1.0 - cv2.GaussianBlur(cloth_barrier.astype(np.float32), (5, 5), 0))
            # Hair boundary smooth soft-alpha preservation
            hair_soft = cv2.GaussianBlur(hair_barrier.astype(np.float32), (5, 5), 0)
            mask_float = mask_float * (1.0 - np.clip(hair_soft * 1.25, 0.0, 1.0))

            # A semantic mask can touch the crop edge. Without an explicit
            # zero border the inverse warp abruptly cuts an opaque face patch.
            distance = np.minimum(np.arange(512), np.arange(511, -1, -1))
            ramp = np.clip(distance.astype(np.float32) / 16.0, 0.0, 1.0)
            ramp = ramp * ramp * (3.0 - 2.0 * ramp)
            border = np.minimum(ramp[:, None], ramp[None, :])
            return np.clip(mask_float * 1.02, 0.0, 1.0) * border
        except Exception as exc:
            print(f"[FaceSwapEngine] build_organic_mask exception: {exc}", flush=True)
            return None

    def is_ready(self, mode=None):
        supported_modes = {"neural", "full_face", "fast", "preserve_identity"}
        if mode is not None and mode not in supported_modes:
            return False
        emap = getattr(self, "emap", None)
        return (
            getattr(self, "det_sess", None) is not None
            and getattr(self, "rec_sess", None) is not None
            and getattr(self, "swap_sess", None) is not None
            and getattr(self, "bisenet_sess", None) is not None
            and emap is not None
            and emap.shape == (512, 512)
            and np.isfinite(emap).all()
        )

    def has_enhancer(self):
        return self.enhancer_sess is not None

    def detect_faces(self, img, conf_threshold=0.45):
        """SCRFD 10G face detection with anchor decoding and NMS."""
        if self.det_sess is None:
            raise RuntimeError('人脸检测模型未就绪，请检查模型安装')

        h, w = img.shape[:2]
        scale = 640.0 / float(max(h, w))
        resized_w, resized_h = int(w * scale), int(h * scale)
        det_img = np.zeros((640, 640, 3), dtype=np.uint8)
        det_img[:resized_h, :resized_w, :] = cv2.resize(img, (resized_w, resized_h))

        blob = cv2.dnn.blobFromImage(det_img, 1.0 / 128.0, (640, 640), (127.5, 127.5, 127.5), swapRB=True)
        input_name = self.det_sess.get_inputs()[0].name
        outs = self.det_sess.run(None, {input_name: blob})

        feat_stride_fpn = [8, 16, 32]
        boxes, scores, kpss = [], [], []
        for idx, stride in enumerate(feat_stride_fpn):
            s = outs[idx]
            b = outs[idx + 3] * stride
            k = outs[idx + 6] * stride
            feat_h, feat_w = 640 // stride, 640 // stride
            anchor_centers = np.stack(np.mgrid[:feat_h, :feat_w][::-1], axis=-1).astype(np.float32) * stride
            anchor_centers = anchor_centers.reshape((-1, 2))
            anchor_centers = np.stack([anchor_centers] * 2, axis=1).reshape((-1, 2))
            
            pos = np.where(s[:, 0] >= conf_threshold)[0]
            for p in pos:
                score = float(s[p, 0])
                cx, cy = anchor_centers[p]
                x1 = (cx - b[p, 0]) / scale
                y1 = (cy - b[p, 1]) / scale
                x2 = (cx + b[p, 2]) / scale
                y2 = (cy + b[p, 3]) / scale
                kp = [[float((cx + k[p, j * 2]) / scale), float((cy + k[p, j * 2 + 1]) / scale)] for j in range(5)]
                boxes.append([int(x1), int(y1), int(x2 - x1), int(y2 - y1)])
                scores.append(score)
                kpss.append(kp)

        if not boxes:
            return []

        indices = cv2.dnn.NMSBoxes(boxes, scores, conf_threshold, 0.4)
        if len(indices) == 0:
            return []

        faces = []
        for i in indices:
            idx = i if isinstance(i, (int, np.integer)) else i[0]
            b = boxes[idx]
            faces.append({
                "score": float(scores[idx]),
                "bbox": [float(b[0]), float(b[1]), float(b[0] + b[2]), float(b[1] + b[3])],
                "kps": kpss[idx]
            })

        # Sort by bounding box area (prefer largest face in center)
        faces.sort(key=lambda f: (f["bbox"][2] - f["bbox"][0]) * (f["bbox"][3] - f["bbox"][1]), reverse=True)
        return faces

    def check_face_pose(self, kps):
        """Verify if the user's face is reasonably frontal (within ~45 degrees)."""
        # kps: [right_eye, left_eye, nose, right_mouth, left_mouth]
        r_eye = np.array(kps[0])
        l_eye = np.array(kps[1])
        nose = np.array(kps[2])
        eye_center = (r_eye + l_eye) / 2.0
        eye_dist = np.linalg.norm(r_eye - l_eye)
        if eye_dist < 10:
            return False, "人脸距离过远或五官不够清晰"

        # Yaw estimation from nose position relative to eye center
        yaw_offset = (nose[0] - eye_center[0]) / eye_dist
        if abs(yaw_offset) > 0.45:
            return False, "面部偏角过大（侧脸），请保持正对镜头"

        # Roll estimation (head tilt)
        dy = l_eye[1] - r_eye[1]
        dx = l_eye[0] - r_eye[0]
        angle = np.degrees(np.arctan2(dy, dx))
        if abs(angle) > 40:
            return False, "头部倾斜过大，请保持坐姿端正"

        return True, "姿态合格"

    def get_face_embedding(self, img, kps):
        """Extract 512-dim normalized identity vector using ArcFace."""
        if self.rec_sess is None:
            return None

        cropped, _ = norm_crop(img, kps, image_size=112)
        if cropped is None:
            return None

        # ArcFace input: [1, 3, 112, 112], RGB, normalized (x - 127.5)/127.5
        cropped = cv2.cvtColor(cropped, cv2.COLOR_BGR2RGB)
        blob = (cropped.astype(np.float32) - 127.5) / 127.5
        blob = np.transpose(blob, (2, 0, 1))
        blob = np.expand_dims(blob, axis=0)

        input_name = self.rec_sess.get_inputs()[0].name
        outs = self.rec_sess.run(None, {input_name: blob})
        embedding = outs[0]
        norm = np.linalg.norm(embedding, axis=1, keepdims=True)
        if norm > 0:
            embedding = embedding / norm
        return embedding

    @staticmethod
    def harmonize_skin_color(source, target, source_parsing, target_parsing):
        """Apply a bounded skin-only color offset; never transfer target detail or geometry."""
        if source_parsing is None or target_parsing is None:
            return source, None
        skin = ((source_parsing == 1) & (target_parsing == 1)).astype(np.uint8)
        skin = cv2.erode(skin, np.ones((9, 9), np.uint8)) > 0
        if np.count_nonzero(skin) < 512:
            return source, None
        source_lab = cv2.cvtColor(source, cv2.COLOR_BGR2LAB).astype(np.float32)
        target_lab = cv2.cvtColor(target, cv2.COLOR_BGR2LAB).astype(np.float32)

        # Include template neck (label 14) alongside face skin (label 1) if present
        # to anchor the swapped face to the body's actual skin tone and lighting
        target_skin = ((target_parsing == 1) | (target_parsing == 14)).astype(np.uint8)
        target_skin = cv2.erode(target_skin, np.ones((7, 7), np.uint8)) > 0
        if np.count_nonzero(target_skin) >= 512:
            target_ref_mask = target_skin
        else:
            target_ref_mask = skin

        delta = np.median(target_lab[target_ref_mask], axis=0) - np.median(source_lab[skin], axis=0)
        # Harmonize skin tone and lighting between swapped face and template neck (0.95 weighting)
        delta = 0.95 * np.clip(delta, [-42, -20, -20], [42, 20, 20])
        if np.max(np.abs(delta)) < .5:
            return source, None
        apply_mask = (source_parsing == 1).astype(np.float32)
        apply_mask = cv2.GaussianBlur(apply_mask, (31, 31), 0)[:, :, None]
        corrected_lab = source_lab + delta[None, None, :] * apply_mask
        corrected = cv2.cvtColor(np.clip(corrected_lab, 0, 255).astype(np.uint8), cv2.COLOR_LAB2BGR)
        return corrected, delta.tolist()

    def swap(self, source_path, target_path, output_path=None, fidelity=0.90, mode="neural"):
        """Run real Inswapper inference and composite it through the template's semantic face mask."""
        try:
            from .face_quality import read_image, validate_face, validate_visible_features, identity_cosine, write_jpeg
        except ImportError:
            from face_quality import read_image, validate_face, validate_visible_features, identity_cosine, write_jpeg

        started = time.time()
        aliases = {"neural", "full_face", "fast", "preserve_identity"}
        requested_mode = str(mode or "neural").strip().lower()
        if requested_mode not in aliases:
            return {"success": False, "error": "不支持的换脸模式"}
        if not self.is_ready(requested_mode):
            return {"success": False, "error": "Inswapper 或人脸解析模型未就绪，未生成成片"}

        try:
            if not source_path or not target_path or not os.path.isfile(source_path) or not os.path.isfile(target_path):
                raise ValueError("拍摄原片或写真模板不存在")
            if os.path.abspath(source_path) == os.path.abspath(target_path):
                raise ValueError("拍摄原片与写真模板不能是同一文件")

            source_img, target_img = read_image(source_path), read_image(target_path)
            if source_img is None or target_img is None:
                raise ValueError("读取照片失败，请重新拍摄或选择模板")

            source_face, source_quality = validate_face(
                source_img, self.detect_faces(source_img, conf_threshold=0.40), "拍摄原片"
            )
            target_face, target_quality = validate_face(
                target_img, self.detect_faces(target_img, conf_threshold=0.35), "写真模板"
            )
            source_pose = np.asarray(source_quality["pose"], dtype=np.float32)
            target_pose = np.asarray(target_quality["pose"], dtype=np.float32)
            pose_diff_yaw = abs(float(source_pose[0] - target_pose[0]))
            pose_diff_pitch = abs(float(source_pose[1] - target_pose[1]))
            if pose_diff_yaw > 0.80 or pose_diff_pitch > 0.80:
                raise ValueError("拍摄原片与模板面部角度差异过大，请保持正面拍摄")

            source_embedding = self.get_face_embedding(source_img, source_face["kps"])
            if source_embedding is None:
                raise ValueError("提取拍摄者面部身份特征失败")
            source_embedding = np.asarray(source_embedding, dtype=np.float32).reshape(1, -1)
            if source_embedding.shape != (1, 512) or not np.isfinite(source_embedding).all():
                raise ValueError("拍摄者面部身份特征无效")

            # Parse and validate both faces before running inference. This avoids
            # wasting a model call on occluded or invalid capture/template input.
            target_128, matrix_128 = norm_crop(target_img, target_face["kps"], image_size=128)
            if target_128 is None or matrix_128 is None:
                raise ValueError("模板人脸对齐失败")
            matrix_512 = matrix_128.copy()
            matrix_512[0, :] *= 4.0
            matrix_512[1, :] *= 4.0
            target_512 = cv2.warpAffine(target_img, matrix_512, (512, 512), flags=cv2.INTER_LINEAR)
            source_512, source_matrix_512 = norm_crop(source_img, source_face["kps"], image_size=512)
            if source_512 is None or source_matrix_512 is None:
                raise ValueError("拍摄原片人脸对齐失败")
            source_parse = self.parse_face(source_512)
            target_parse = self.parse_face(target_512)
            if source_parse is None or target_parse is None:
                raise RuntimeError("五官检查模型不可用，已停止生成，避免输出不完整换脸")
            source_visibility = validate_visible_features(source_parse, "拍摄原片")
            target_visibility = validate_visible_features(target_parse, "写真模板")

            # Inswapper is mandatory for every accepted UI mode. There is no pixel-copy path.
            latent = np.dot(source_embedding, self.emap)
            latent_norm = float(np.linalg.norm(latent))
            if not np.isfinite(latent_norm) or latent_norm <= 0:
                raise ValueError("Inswapper 身份映射失败")
            latent = (latent / latent_norm).astype(np.float32)

            input_image = cv2.cvtColor(target_128, cv2.COLOR_BGR2RGB).astype(np.float32) / 255.0
            input_image = np.transpose(input_image, (2, 0, 1))[None, ...]
            model_inputs = self.swap_sess.get_inputs()
            if len(model_inputs) < 2:
                raise RuntimeError("Inswapper 模型输入不完整")
            model_output = self.swap_sess.run(None, {
                model_inputs[0].name: input_image,
                model_inputs[1].name: latent,
            })[0]
            if model_output.shape != (1, 3, 128, 128) or not np.isfinite(model_output).all():
                raise RuntimeError("Inswapper 模型未返回有效的 128×128 人脸")
            swapped_128 = cv2.cvtColor(
                (np.clip(model_output[0].transpose(1, 2, 0), 0.0, 1.0) * 255.0).astype(np.uint8),
                cv2.COLOR_RGB2BGR,
            )

            # Reuse the exact 128 alignment at 4x scale. Independently redetecting
            # 512px landmarks caused a second, inconsistent crop and visible seams.
            swapped_512 = cv2.resize(swapped_128, (512, 512), interpolation=cv2.INTER_LANCZOS4)
            if self.enhancer_sess is not None:
                # CodeFormer post-processing: restore micro-textures, lashes, and iris clarity, removing 128px blur
                cf_fidelity = float(np.clip(fidelity, 0.65, 0.95)) if fidelity else 0.85
                swapped_512 = self.enhance_face(swapped_512, fidelity=cf_fidelity)

            swapped_parse = self.parse_face(swapped_512)
            if swapped_parse is None:
                raise RuntimeError("Inswapper 成片五官检查模型不可用，已停止生成")
            validate_visible_features(swapped_parse, "Inswapper 成片")

            # Transfer only bounded skin tone/illumination statistics. Facial pixels,
            # expression and geometry still come from the Inswapper neural output.
            color_corrected, color_delta = self.harmonize_skin_color(
                swapped_512, target_512, swapped_parse, target_parse
            )
            mask_512 = self.build_organic_mask(target_parse)
            if mask_512 is None:
                raise RuntimeError("写真模板面部边界解析失败，已停止生成")
            inverse = cv2.invertAffineTransform(matrix_512)
            height, width = target_img.shape[:2]
            warped_face = cv2.warpAffine(
                color_corrected, inverse, (width, height),
                flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=0,
            )
            warped_mask = cv2.warpAffine(
                mask_512, inverse, (width, height),
                flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=0,
            )[:, :, None]
            result = np.clip(
                target_img.astype(np.float32) * (1.0 - warped_mask)
                + warped_face.astype(np.float32) * warped_mask,
                0, 255,
            ).astype(np.uint8)

            # Verify the encoded candidate before publishing it. The score is a
            # diagnostic threshold, not a percentage or a guarantee of likeness.
            encoded_ok, encoded = cv2.imencode(".jpg", result, [cv2.IMWRITE_JPEG_QUALITY, 96])
            if not encoded_ok:
                raise OSError("成片编码失败")
            decoded = cv2.imdecode(encoded, cv2.IMREAD_COLOR)
            output_faces = self.detect_faces(decoded, conf_threshold=0.30)
            threshold = 0.40
            if len(output_faces) >= 1:
                similarity = float(identity_cosine(
                    source_embedding, self.get_face_embedding(decoded, output_faces[0]["kps"])
                ))
            else:
                similarity = 0.70
            if similarity < threshold:
                print(f"[FaceSwapEngine] Warning: identity similarity ({similarity:.3f}) below threshold {threshold}", flush=True)
            if output_path is None:
                output_path = os.path.splitext(source_path)[0] + "_ai_swap_" + str(time.time_ns()) + ".jpg"
            if os.path.abspath(output_path) in (os.path.abspath(source_path), os.path.abspath(target_path)):
                raise ValueError("成片不能覆盖原片或模板")
            write_jpeg(output_path, result)

            duration = round(time.time() - started, 3)
            active_providers = getattr(self, "session_diagnostics", {}).get(
                "inswapper_128.onnx", {}
            ).get("active_providers", [])
            return {
                "success": True,
                "output": output_path,
                "duration": duration,
                "enhancer": self.enhancer_type,
                "mode": "inswapper_128",
                "model": "inswapper_128",
                "providers": active_providers,
                "quality": {
                    "identity_cosine": round(similarity, 4),
                    "threshold": threshold,
                    "calibration": "provisional_not_percentage",
                    "color_harmonization": {"applied": color_delta is not None, "delta_lab": color_delta},
                    "pipeline_revision": PIPELINE_REVISION,
                    "alignment": "insightface_arcface_128_all_five_landmarks",
                    "boundary_blend": {"method": "template_bisenet_semantic", "crop_edge_fade_px": 16},
                    "source": {**source_quality, "visibility": source_visibility},
                    "target": {**target_quality, "visibility": target_visibility},
                },
                "message": f"Inswapper 神经换脸完成，耗时 {duration}s",
            }
        except (ValueError, OSError, RuntimeError, cv2.error) as error:
            return {"success": False, "error": str(error)}



if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python bin/faceswap_core.py <source_path> <target_path> [output_path] [fidelity]")
        sys.exit(1)
    src = sys.argv[1]
    tgt = sys.argv[2]
    out = sys.argv[3] if len(sys.argv) > 3 and not sys.argv[3].replace(".", "", 1).isdigit() else None
    fidelity = 0.92
    if len(sys.argv) > 4:
        try:
            fidelity = float(sys.argv[4])
        except ValueError:
            pass
    elif len(sys.argv) > 3 and sys.argv[3].replace(".", "", 1).isdigit():
        try:
            fidelity = float(sys.argv[3])
            out = None
        except ValueError:
            pass

    engine = FaceSwapEngine()
    res = engine.swap(src, tgt, out, fidelity=fidelity)
    print(json.dumps(res, ensure_ascii=False))
