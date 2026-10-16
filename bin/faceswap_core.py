#!/usr/bin/env python3
"""
Industrial-grade FaceSwap Engine for Commercial Photobooth
Based on ONNX Runtime DirectML (RTX 5060 Laptop GPU acceleration)
Components:
- SCRFD 10G Face Detection & 5-Keypoint Facial Landmarks with Anchor Centers & NMS
- ArcFace (ResNet50 / w600k_r50): 512-dim Identity Embedding
- Inswapper 128: Latent Vector Feature-Level Face Swapping with emap Projection Matrix
- Color Grading & Inverse Affine Warp: High-fidelity seamless blending
"""

import os
import sys
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

# Standard 5 landmarks for ArcFace (112x112)
ARCFACE_DST_112 = np.array([
    [38.2946, 51.6963],
    [73.5318, 51.5014],
    [56.0252, 71.7366],
    [41.5493, 92.3655],
    [70.7299, 92.2041]
], dtype=np.float32)

# Standard 5 landmarks for Inswapper (128x128)
INSWAPPER_DST_128 = ARCFACE_DST_112 * (128.0 / 112.0)
INSWAPPER_DST_128[:, 0] += (128.0 - 112.0 * (128.0 / 112.0)) / 2.0


def estimate_norm_5kps(kps, image_size=112):
    """Compute similarity transform from 5 landmarks to standard ArcFace/Inswapper space."""
    if image_size == 112:
        dst = ARCFACE_DST_112
    elif image_size == 128:
        dst = INSWAPPER_DST_128
    else:
        dst = ARCFACE_DST_112 * (image_size / 112.0)
    
    kps = np.asarray(kps, dtype=np.float32).reshape(5, 2)
    tform, _ = cv2.estimateAffinePartial2D(kps, dst)
    return tform


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

    def __init__(self, prefer_cpu=False):
        self.prefer_cpu = prefer_cpu
        self.det_sess = None
        self.rec_sess = None
        self.swap_sess = None
        self.enhancer_sess = None
        self.emap = None
        self._init_models()

    def _get_providers(self):
        if self.prefer_cpu or ort is None:
            return ["CPUExecutionProvider"]
        available = ort.get_available_providers()
        if "DmlExecutionProvider" in available:
            return ["DmlExecutionProvider", "CPUExecutionProvider"]
        if "CUDAExecutionProvider" in available:
            return ["CUDAExecutionProvider", "CPUExecutionProvider"]
        return ["CPUExecutionProvider"]

    def _create_session(self, model_path):
        if not os.path.exists(model_path):
            return None
        providers = self._get_providers()
        opts = ort.SessionOptions()
        # DirectML stability: disable shader rewrite crashes
        opts.graph_optimization_level = ort.GraphOptimizationLevel.ORT_DISABLE_ALL
        try:
            return ort.InferenceSession(model_path, sess_options=opts, providers=providers)
        except Exception as exc:
            print(f"[FaceSwapEngine] Provider {providers} failed for {model_path}: {exc}. Fallback to CPU.", flush=True)
            return ort.InferenceSession(model_path, sess_options=opts, providers=["CPUExecutionProvider"])

    def _init_models(self):
        if ort is None:
            print("[FaceSwapEngine] Warning: onnxruntime is not installed.", flush=True)
            return

        det_path = os.path.join(BUFFALO_L_DIR, "det_10g.onnx")
        rec_path = os.path.join(BUFFALO_L_DIR, "w600k_r50.onnx")
        swap_path = os.path.join(DEFAULT_FACE_DIR, "inswapper_128.onnx")

        if os.path.exists(det_path):
            try:
                self.det_sess = self._create_session(det_path)
            except Exception as e:
                print(f"[FaceSwapEngine] Failed to load det_10g: {e}", flush=True)

        if os.path.exists(rec_path):
            try:
                self.rec_sess = self._create_session(rec_path)
            except Exception as e:
                print(f"[FaceSwapEngine] Failed to load w600k_r50: {e}", flush=True)

        if os.path.exists(swap_path):
            try:
                self.swap_sess = self._create_session(swap_path)
                # Load emap projection matrix
                if onnx is not None and numpy_helper is not None:
                    onnx_model = onnx.load(swap_path)
                    self.emap = numpy_helper.to_array(onnx_model.graph.initializer[-1])
            except Exception as e:
                print(f"[FaceSwapEngine] Failed to load inswapper_128: {e}", flush=True)

        enhancer_path = os.path.join(DEFAULT_FACE_DIR, "gfpgan_1.4.onnx")
        if os.path.exists(enhancer_path):
            try:
                self.enhancer_sess = self._create_session(enhancer_path)
            except Exception as e:
                print(f"[FaceSwapEngine] Failed to load gfpgan_1.4: {e}", flush=True)

    def is_ready(self):
        return (self.det_sess is not None and self.rec_sess is not None and self.swap_sess is not None)

    def has_enhancer(self):
        return self.enhancer_sess is not None

    def detect_faces(self, img, conf_threshold=0.45):
        """SCRFD 10G face detection with anchor decoding and NMS."""
        if self.det_sess is None:
            return self._detect_faces_cascade(img)

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
            return self._detect_faces_cascade(img)

        indices = cv2.dnn.NMSBoxes(boxes, scores, conf_threshold, 0.4)
        if len(indices) == 0:
            return self._detect_faces_cascade(img)

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

    def _detect_faces_cascade(self, img):
        """Lightweight OpenCV Haar Cascade fallback."""
        cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        if not os.path.exists(cascade_path):
            return []
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        detector = cv2.CascadeClassifier(cascade_path)
        rects = detector.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=4, minSize=(80, 80))
        faces = []
        for (x, y, w, h) in rects:
            kps = [
                [float(x + w * 0.35), float(y + h * 0.40)],
                [float(x + w * 0.65), float(y + h * 0.40)],
                [float(x + w * 0.50), float(y + h * 0.58)],
                [float(x + w * 0.38), float(y + h * 0.75)],
                [float(x + w * 0.62), float(y + h * 0.75)],
            ]
            faces.append({
                "score": 0.85,
                "bbox": [float(x), float(y), float(x + w), float(y + h)],
                "kps": kps
            })
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

    def swap(self, source_path, target_path, output_path=None):
        """Perform high-fidelity face swap."""
        t0 = time.time()
        if not os.path.exists(source_path):
            return {"success": False, "error": f"用户抓拍图片未找到: {source_path}"}
        if not os.path.exists(target_path):
            return {"success": False, "error": f"变身模板图片未找到: {target_path}"}

        source_img = cv2.imread(source_path)
        target_img = cv2.imread(target_path)
        if source_img is None or target_img is None:
            return {"success": False, "error": "读取图片像素数据失败"}

        # 1. 检测抓拍照人脸
        source_faces = self.detect_faces(source_img, conf_threshold=0.45)
        if not source_faces:
            return {
                "success": False,
                "error": "未检测到人脸，请保持端正正面坐姿重新拍摄"
            }
        source_face = source_faces[0]

        # 校验姿态是否合格
        pose_ok, pose_msg = self.check_face_pose(source_face["kps"])
        if not pose_ok:
            return {
                "success": False,
                "error": f"{pose_msg}，请重新端正坐姿拍摄"
            }

        # 2. 提取身份特征
        source_emb = self.get_face_embedding(source_img, source_face["kps"])
        if source_emb is None:
            return {"success": False, "error": "提取面部特征向量失败"}

        # 3. 检测模板人脸
        target_faces = self.detect_faces(target_img, conf_threshold=0.40)
        if not target_faces:
            return {"success": False, "error": "选中的模板未能识别到基准人脸"}
        target_face = target_faces[0]

        # 计算人脸宽高长宽比与轮廓保型系数 (Face Shape Ratio)
        src_bbox = source_face["bbox"]
        tgt_bbox = target_face["bbox"]
        src_w = max(1.0, float(src_bbox[2] - src_bbox[0]))
        src_h = max(1.0, float(src_bbox[3] - src_bbox[1]))
        tgt_w = max(1.0, float(tgt_bbox[2] - tgt_bbox[0]))
        tgt_h = max(1.0, float(tgt_bbox[3] - tgt_bbox[1]))
        rho = float(np.clip((src_w / src_h) / (tgt_w / tgt_h), 0.88, 1.30))

        # 4. 投影特征至 Inswapper 空间
        latent = source_emb
        if self.emap is not None:
            latent = np.dot(source_emb, self.emap)
            latent /= np.linalg.norm(latent)

        # 5. 运行 Inswapper 128
        aligned_target, M = norm_crop(target_img, target_face["kps"], image_size=128)
        if aligned_target is None:
            return {"success": False, "error": "模板人脸对齐失败"}

        if self.swap_sess is not None:
            target_blob = cv2.cvtColor(aligned_target, cv2.COLOR_BGR2RGB).astype(np.float32) / 255.0
            target_blob = np.transpose(target_blob, (2, 0, 1))
            target_blob = np.expand_dims(target_blob, axis=0)

            swap_inputs = {
                self.swap_sess.get_inputs()[0].name: target_blob,
                self.swap_sess.get_inputs()[1].name: latent.astype(np.float32)
            }
            swap_out = self.swap_sess.run(None, swap_inputs)[0]
            swapped_face = (np.clip(swap_out[0].transpose((1, 2, 0)), 0, 1) * 255.0).astype(np.uint8)
            swapped_face = cv2.cvtColor(swapped_face, cv2.COLOR_RGB2BGR)
        else:
            swapped_face = aligned_target

        # 6. 肤色光影均值自适应补偿 (Color & Lighting Match)
        swapped_face_float = swapped_face.astype(np.float32)
        target_face_float = aligned_target.astype(np.float32)
        for c in range(3):
            t_mean = np.mean(target_face_float[:, :, c])
            s_mean = np.mean(swapped_face_float[:, :, c])
            if s_mean > 10:
                ratio = t_mean / s_mean
                ratio = np.clip(ratio, 0.80, 1.25)
                swapped_face_float[:, :, c] = np.clip(swapped_face_float[:, :, c] * (0.5 * ratio + 0.5), 0, 255)
        swapped_face = swapped_face_float.astype(np.uint8)

        # 7. 人脸超清重绘 (FaceFusion GFPGAN 1.4) 与逆仿射回贴 (Inverse Affine Transform)
        h, w = target_img.shape[:2]
        enhancer_applied = False

        if self.enhancer_sess is not None:
            try:
                # 512x512 高保真超分辨率与五官质感重构
                swapped_512 = cv2.resize(swapped_face, (512, 512), interpolation=cv2.INTER_LANCZOS4)
                blob_512 = cv2.cvtColor(swapped_512, cv2.COLOR_BGR2RGB).astype(np.float32) / 127.5 - 1.0
                blob_512 = np.transpose(blob_512, (2, 0, 1))[None, ...]

                input_name = self.enhancer_sess.get_inputs()[0].name
                enh_out = self.enhancer_sess.run(None, {input_name: blob_512})[0]
                enh_face = np.clip((enh_out[0].transpose((1, 2, 0)) + 1.0) * 127.5, 0, 255).astype(np.uint8)
                enh_face = cv2.cvtColor(enh_face, cv2.COLOR_RGB2BGR)

                # 85% 超清面部 + 15% 原始肤色融合，兼顾极致五官立体度与自然真实感
                blend_face = cv2.addWeighted(enh_face, 0.85, swapped_512, 0.15, 0)

                # 脸型保型重塑 (Face Shape Preservation): 当拍照者是圆脸时自适应舒展下颌，绝不压缩成畸形瘦脸
                if rho > 1.03:
                    grid_x, grid_y = np.meshgrid(np.arange(512, dtype=np.float32), np.arange(512, dtype=np.float32))
                    y_weight = np.exp(-((grid_y - 330.0) ** 2) / (2.0 * (95.0 ** 2)))
                    expand_factor = min(0.18, (rho - 1.0) * 0.50)
                    dx = (grid_x - 256.0) * expand_factor * y_weight
                    map_x = grid_x - dx
                    map_y = grid_y
                    blend_face = cv2.remap(blend_face, map_x, map_y, interpolation=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)

                # 512 尺度逆仿射变换回贴
                M_512 = M.copy()
                M_512[0, :] *= 4.0
                M_512[1, :] *= 4.0
                M_inv_512 = cv2.invertAffineTransform(M_512)

                # 动态自适应下颌扩展遮罩 (覆盖模板下巴络腮胡并自适应脸型宽度)
                mask_512 = np.zeros((512, 512), dtype=np.float32)
                rx = int(np.clip(184 * (rho ** 0.65), 180, 225))
                # 上半部分：额头自然羽化收束 (205px)
                cv2.ellipse(mask_512, (256, 256), (rx, 205), 0, 180, 360, 1.0, -1)
                # 下半部分：下颌向下延伸至 245px (触达 y=505)，彻底擦除并覆盖模板残留的络腮胡与胡茬
                rx_jaw = int(rx * 1.05)
                cv2.ellipse(mask_512, (256, 260), (rx_jaw, 245), 0, 0, 180, 1.0, -1)
                mask_512 = cv2.GaussianBlur(mask_512, (37, 37), 0)

                warped_face = cv2.warpAffine(blend_face, M_inv_512, (w, h), borderMode=cv2.BORDER_TRANSPARENT)
                warped_mask = cv2.warpAffine(mask_512, M_inv_512, (w, h), borderMode=cv2.BORDER_CONSTANT, borderValue=0.0)
                warped_mask = np.expand_dims(warped_mask, axis=2)

                result = (target_img * (1.0 - warped_mask) + warped_face * warped_mask).astype(np.uint8)

                # 质感微锐化，提升 300DPI 照片冲印质感
                kernel = np.array([[0, -0.15, 0], [-0.15, 1.6, -0.15], [0, -0.15, 0]], dtype=np.float32)
                sharpened = cv2.filter2D(result, -1, kernel)
                result = np.where(warped_mask > 0.3, sharpened, result)
                enhancer_applied = True
            except Exception as exc:
                print(f"[FaceSwapEngine] GFPGAN enhancer error: {exc}. Fallback to 128 blending.", flush=True)
                result = self._blend_128(target_img, swapped_face, M, w, h, rho=rho)
        else:
            result = self._blend_128(target_img, swapped_face, M, w, h, rho=rho)

        if output_path is None:
            output_path = source_path.replace(".jpg", "_ai_swap.jpg")

        cv2.imwrite(output_path, result, [cv2.IMWRITE_JPEG_QUALITY, 96])
        elapsed = round(time.time() - t0, 3)

        return {
            "success": True,
            "output": output_path,
            "duration": elapsed,
            "enhancer": "GFPGAN 1.4 (FaceFusion)" if enhancer_applied else "None",
            "message": f"AI 变身换脸成功({'FaceFusion超清重塑' if enhancer_applied else '标准融合'})，耗时 {elapsed}s"
        }

    def _blend_128(self, target_img, swapped_face, M, w, h, rho=1.0):
        """Fallback 128x128 blending if enhancer is unavailable."""
        M_inv = cv2.invertAffineTransform(M)
        mask = np.zeros((128, 128), dtype=np.float32)
        rx = int(np.clip(46 * (rho ** 0.65), 45, 58))
        cv2.ellipse(mask, (64, 64), (rx, 52), 0, 180, 360, 1.0, -1)
        cv2.ellipse(mask, (64, 66), (int(rx * 1.05), 60), 0, 0, 180, 1.0, -1)
        mask = cv2.GaussianBlur(mask, (15, 15), 0)

        warped_face = cv2.warpAffine(swapped_face, M_inv, (w, h), borderMode=cv2.BORDER_TRANSPARENT)
        warped_mask = cv2.warpAffine(mask, M_inv, (w, h), borderMode=cv2.BORDER_CONSTANT, borderValue=0.0)
        warped_mask = np.expand_dims(warped_mask, axis=2)

        result = (target_img * (1.0 - warped_mask) + warped_face * warped_mask).astype(np.uint8)

        kernel = np.array([[0, -0.2, 0], [-0.2, 1.8, -0.2], [0, -0.2, 0]], dtype=np.float32)
        sharpened_face = cv2.filter2D(result, -1, kernel)
        result = np.where(warped_mask > 0.4, sharpened_face, result)
        return result


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python bin/faceswap_core.py <source_path> <target_path> [output_path]")
        sys.exit(1)
    src = sys.argv[1]
    tgt = sys.argv[2]
    out = sys.argv[3] if len(sys.argv) > 3 else None
    engine = FaceSwapEngine()
    res = engine.swap(src, tgt, out)
    print(json.dumps(res, ensure_ascii=False))
