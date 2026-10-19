#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Photobooth AI Beauty Core Engine
Features:
1. Multi-face synchronous detection (up to 10 faces) via MediaPipe FaceLandmarker.
2. Local radial eye enlargement (preserves iris clarity).
3. V-line chin/jaw slimming via interactive local translation warping.
4. Bilateral skin smoothing + High-pass texture retention (preserves natural pore texture).
5. S-curve Lab luminance whitening with rosy peach tone balance.
6. Landmark caching and dual-mode execution (ultra-fast preview vs high-res bake).
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
import argparse
import numpy as np
import cv2

# Mediapipe Tasks Vision API
try:
    import mediapipe as mp
    from mediapipe.tasks import python
    from mediapipe.tasks.python import vision
except ImportError:
    mp = None
    python = None
    vision = None


def find_model_path():
    candidates = [
        os.path.expanduser("~/.rembg/models/face_landmarker/face_landmarker.task"),
        os.path.join(os.path.dirname(__file__), "..", "models", "face_landmarker.task"),
        r"C:\Users\WS\.rembg\models\face_landmarker\face_landmarker.task",
    ]
    for c in candidates:
        if os.path.isfile(c) and os.path.getsize(c) > 1000000:
            return os.path.abspath(c)
    return None


def cv_read_image(path):
    """
    Robust image loader on Windows supporting non-ASCII / Unicode paths.
    Bypasses OpenCV C++ imread ANSI path limitations.
    """
    if not path or not os.path.isfile(path):
        return None
    try:
        with open(path, "rb") as f:
            data = f.read()
        if not data:
            return None
        return cv2.imdecode(np.frombuffer(data, dtype=np.uint8), cv2.IMREAD_COLOR)
    except Exception as exc:
        print(f"[BeautyEngine] Failed to read image {path}: {exc}")
        return None


def cv_write_image(path, img, quality=95):
    """
    Robust image writer on Windows supporting non-ASCII / Unicode paths.
    Bypasses OpenCV C++ imwrite ANSI path limitations.
    """
    if img is None:
        return False
    try:
        os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
        ext = os.path.splitext(path)[1].lower()
        if ext in (".jpg", ".jpeg"):
            params = [int(cv2.IMWRITE_JPEG_QUALITY), int(quality), int(cv2.IMWRITE_JPEG_OPTIMIZE), 1]
        elif ext == ".png":
            params = [int(cv2.IMWRITE_PNG_COMPRESSION), 3]
        else:
            params = [int(cv2.IMWRITE_JPEG_QUALITY), int(quality)]
        success, enc = cv2.imencode(ext if ext else ".jpg", img, params)
        if not success:
            return False
        with open(path, "wb") as f:
            f.write(enc.tobytes())
        return True
    except Exception as exc:
        print(f"[BeautyEngine] Failed to write image {path}: {exc}")
        return False


class BeautyEngine:
    def __init__(self, model_path=None):
        self.model_path = model_path or find_model_path()
        self.detector = None
        self.bisenet_sess = None
        self._landmarks_cache = {}  # key -> list of normalized landmark arrays
        self._init_detector()
        self._init_bisenet()

    def _init_bisenet(self):
        bisenet_path = os.path.expanduser(r"~/.insightface/models/bisenet_resnet_34.onnx")
        if not os.path.exists(bisenet_path):
            return
        try:
            import onnxruntime as ort
            providers = ["DmlExecutionProvider", "CPUExecutionProvider"] if "DmlExecutionProvider" in ort.get_available_providers() else ["CPUExecutionProvider"]
            opts = ort.SessionOptions()
            opts.graph_optimization_level = ort.GraphOptimizationLevel.ORT_DISABLE_ALL
            self.bisenet_sess = ort.InferenceSession(bisenet_path, sess_options=opts, providers=providers)
            print("[BeautyEngine] BiSeNet ResNet34 19-class semantic face parsing initialized")
        except Exception as exc:
            print(f"[BeautyEngine] BiSeNet init note: {exc}")

    def _init_detector(self):
        if not vision or not self.model_path or not os.path.isfile(self.model_path):
            print(f"[BeautyEngine] Warning: Model not found at {self.model_path}")
            return
        try:
            base_opts = python.BaseOptions(model_asset_path=self.model_path)
            opts = vision.FaceLandmarkerOptions(
                base_options=base_opts,
                output_face_blendshapes=False,
                output_facial_transformation_matrixes=False,
                num_faces=10,
                min_face_detection_confidence=0.35,
                min_face_presence_confidence=0.35,
            )
            self.detector = vision.FaceLandmarker.create_from_options(opts)
            print("[BeautyEngine] MediaPipe FaceLandmarker initialized (num_faces=10)")
        except Exception as exc:
            print(f"[BeautyEngine] Failed to initialize FaceLandmarker: {exc}")
            self.detector = None

    def get_landmarks(self, img_bgr, cache_key=None):
        """
        Detects normalized face landmarks [0..1] for all detected faces.
        Returns list of numpy arrays, each of shape (478, 2).
        """
        if cache_key and cache_key in self._landmarks_cache:
            return self._landmarks_cache[cache_key]

        if self.detector is None:
            self._init_detector()
            if self.detector is None:
                return []

        rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
        mp_img = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
        detection = self.detector.detect(mp_img)
        faces_landmarks = []
        if detection and detection.face_landmarks:
            for face in detection.face_landmarks:
                pts = np.array([(lm.x, lm.y) for lm in face], dtype=np.float32)
                faces_landmarks.append(pts)

        if cache_key:
            if len(self._landmarks_cache) > 50:
                self._landmarks_cache.clear()
            self._landmarks_cache[cache_key] = faces_landmarks

        return faces_landmarks

    def parse_neck_mask(self, img_bgr, face_pts):
        """
        Extracts semantic neck and collar skin region using BiSeNet when available,
        fused with an adaptive anatomical neck extension and skin-chrominance matching.
        Eliminates the 'white face, yellow neck' boundary seam.
        """
        h, w = img_bgr.shape[:2]
        neck_mask = np.zeros((h, w), dtype=np.uint8)
        try:
            x_min, y_min = np.min(face_pts, axis=0)
            x_max, y_max = np.max(face_pts, axis=0)
            fw = float(x_max - x_min)
            fh = float(y_max - y_min)
            if fw < 10 or fh < 10:
                return neck_mask

            chin = face_pts[152]
            left_jaw = face_pts[397]
            right_jaw = face_pts[172]
            jw = float(np.linalg.norm(left_jaw - right_jaw))

            # 1. BiSeNet 19-class semantic neck parsing (Label 14 = Neck)
            if self.bisenet_sess is not None:
                pad_x = fw * 0.45
                pad_y_top = fh * 0.35
                pad_y_bot = fh * 1.15
                crop_x1 = max(0, int(x_min - pad_x))
                crop_y1 = max(0, int(y_min - pad_y_top))
                crop_x2 = min(w, int(x_max + pad_x))
                crop_y2 = min(h, int(y_max + pad_y_bot))

                roi = img_bgr[crop_y1:crop_y2, crop_x1:crop_x2]
                roi_h, roi_w = roi.shape[:2]
                if roi_h > 20 and roi_w > 20:
                    blob = cv2.resize(roi, (512, 512))
                    blob = cv2.cvtColor(blob, cv2.COLOR_BGR2RGB).astype(np.float32) / 255.0
                    blob = (blob - np.array([0.485, 0.456, 0.406], dtype=np.float32)) / np.array([0.229, 0.224, 0.225], dtype=np.float32)
                    blob = np.transpose(blob, (2, 0, 1))[None, ...].astype(np.float32)
                    out = self.bisenet_sess.run(None, {'input': blob})[0]
                    parsed_512 = np.argmax(out[0], axis=0).astype(np.uint8)
                    parsed_roi = cv2.resize(parsed_512, (roi_w, roi_h), interpolation=cv2.INTER_NEAREST)
                    bisenet_neck = (parsed_roi == 14).astype(np.uint8)
                    neck_mask[crop_y1:crop_y2, crop_x1:crop_x2] = np.maximum(
                        neck_mask[crop_y1:crop_y2, crop_x1:crop_x2], bisenet_neck * 255
                    )

            # 2. Anatomical Neck Polygon Corridor:
            # Extends from jawline points downward by up to 0.85 * fh to guarantee
            # complete coverage of throat and upper chest even if BiSeNet has gaps.
            jaw_indices = [58, 172, 136, 150, 149, 176, 148, 152, 377, 400, 378, 379, 365, 397]
            jaw_pts = [face_pts[idx] for idx in jaw_indices if idx < len(face_pts)]
            if len(jaw_pts) >= 4:
                top_head = face_pts[10] if 10 < len(face_pts) else np.array([x_min + fw * 0.5, y_min])
                v_axis = chin - top_head
                norm_axis = np.linalg.norm(v_axis)
                if norm_axis > 1.0:
                    v_down = v_axis / norm_axis
                else:
                    v_down = np.array([0.0, 1.0])
                v_right = np.array([-v_down[1], v_down[0]])

                neck_len = min(float(h - chin[1] - 1), max(25.0, fh * 0.85))
                bot_center = chin + v_down * neck_len
                bot_left = bot_center - v_right * (jw * 0.65)
                bot_right = bot_center + v_right * (jw * 0.65)

                neck_poly = np.array(
                    jaw_pts + [bot_left, bot_right, jaw_pts[0]], dtype=np.int32
                )
                geom_mask = np.zeros((h, w), dtype=np.uint8)
                cv2.fillPoly(geom_mask, [neck_poly], 255)
                neck_mask = np.maximum(neck_mask, geom_mask)
        except Exception as exc:
            print(f"[BeautyEngine] parse_neck_mask note: {exc}")
        return neck_mask

    def apply_retouch(self, img_bgr, faces_landmarks, eye=15, slim=15, smooth=30, white=25, rosy=20, clarity=15):
        """
        Applies parameterized beauty retouching to all faces in img_bgr.
        Uses a unified continuous C2 deformation field and additive skin tone blending.
        Zero boundary seams, zero brightness steps, zero layer misalignments.
        """
        h, w = img_bgr.shape[:2]
        eye_k = max(0.0, min(100.0, float(eye))) / 100.0
        slim_k = max(0.0, min(100.0, float(slim))) / 100.0
        smooth_k = max(0.0, min(100.0, float(smooth))) / 100.0
        white_k = max(0.0, min(100.0, float(white))) / 100.0
        rosy_k = max(0.0, min(100.0, float(rosy))) / 100.0
        clarity_k = max(0.0, min(100.0, float(clarity))) / 100.0

        has_faces = len(faces_landmarks) > 0

        # Step 1: Unified Continuous Deformation Field (大眼 + 瘦脸)
        warped = img_bgr
        disp_x = None
        disp_y = None

        if has_faces and (eye_k > 0.001 or slim_k > 0.001):
            disp_x = np.zeros((h, w), dtype=np.float32)
            disp_y = np.zeros((h, w), dtype=np.float32)

            for norm_pts in faces_landmarks:
                coords = norm_pts * np.array([w, h], dtype=np.float32)

                # 1.1 精致瘦脸 (V-Line Jawline & Cheek Slimming)
                if slim_k > 0.001:
                    nose_center = coords[4]
                    chin = coords[152]
                    mid_target = nose_center * 0.35 + chin * 0.65
                    strength_trans = slim_k * 0.080

                    control_indices = [93, 132, 58, 172, 323, 361, 288, 397]
                    for idx in control_indices:
                        p = coords[idx]
                        r = float(np.linalg.norm(mid_target - p) * 0.70)
                        if r <= 2.0:
                            continue
                        px, py = float(p[0]), float(p[1])
                        tx, ty = float(mid_target[0]), float(mid_target[1])
                        # A displacement kernel that touches the image edge
                        # has no valid source pixels on one side. Fade it out
                        # before remapping instead of reflecting pixels into a
                        # visible stretch.
                        edge_margin = min(px, py, float(w) - px, float(h) - py)
                        edge_factor = float(np.clip(edge_margin / max(r, 1.0), 0.0, 1.0))
                        if edge_factor < 0.18:
                            continue
                        dx = (tx - px) * strength_trans * edge_factor
                        dy = (ty - py) * strength_trans * edge_factor

                        bx1, bx2 = max(0, int(px - r)), min(w, int(px + r + 1))
                        by1, by2 = max(0, int(py - r)), min(h, int(py + r + 1))
                        if bx2 <= bx1 or by2 <= by1:
                            continue

                        gx, gy = np.meshgrid(
                            np.arange(bx1, bx2, dtype=np.float32),
                            np.arange(by1, by2, dtype=np.float32),
                        )
                        dist = np.sqrt((gx - px) ** 2 + (gy - py) ** 2)
                        c_mask = dist < r
                        if not np.any(c_mask):
                            continue

                        # Smooth C2 compact polynomial falloff: (1 - (dist/r)^2)^2
                        d_norm = dist[c_mask] / r
                        w_c2 = (1.0 - d_norm**2) ** 2
                        disp_x[by1:by2, bx1:bx2][c_mask] += w_c2 * dx
                        disp_y[by1:by2, bx1:bx2][c_mask] += w_c2 * dy

                # 1.2 自然大眼 (Radial Eye Enlargement - 商业级醒目自然放大)
                if eye_k > 0.001:
                    left_iris = coords[468]
                    right_iris = coords[473]
                    dist_l = np.linalg.norm(coords[33] - coords[133])
                    dist_r = np.linalg.norm(coords[263] - coords[362])
                    radius_l = max(14.0, dist_l * 0.95)
                    radius_r = max(14.0, dist_r * 0.95)
                    alpha_eye = min(0.48, eye_k * 0.42)

                    for iris, r in [(left_iris, radius_l), (right_iris, radius_r)]:
                        cx, cy = float(iris[0]), float(iris[1])
                        eye_edge_factor = float(np.clip(
                            min(cx, cy, float(w) - cx, float(h) - cy) / max(r, 1.0),
                            0.0,
                            1.0,
                        ))
                        if eye_edge_factor < 0.25:
                            continue
                        bx1, bx2 = max(0, int(cx - r)), min(w, int(cx + r + 1))
                        by1, by2 = max(0, int(cy - r)), min(h, int(cy + r + 1))
                        if bx2 <= bx1 or by2 <= by1:
                            continue

                        gx, gy = np.meshgrid(
                            np.arange(bx1, bx2, dtype=np.float32),
                            np.arange(by1, by2, dtype=np.float32),
                        )
                        dist = np.sqrt((gx - cx) ** 2 + (gy - cy) ** 2)
                        e_mask = (dist < r) & (dist > 0.1)
                        if not np.any(e_mask):
                            continue

                        factor = alpha_eye * eye_edge_factor * ((1.0 - dist[e_mask] / r) ** 1.6)
                        disp_x[by1:by2, bx1:bx2][e_mask] += (gx[e_mask] - cx) * factor
                        disp_y[by1:by2, bx1:bx2][e_mask] += (gy[e_mask] - cy) * factor

            # Single unified remap pass
            grid_all_x, grid_all_y = np.meshgrid(
                np.arange(w, dtype=np.float32), np.arange(h, dtype=np.float32)
            )
            map_x = np.clip(grid_all_x - disp_x, 0.0, float(w - 1))
            map_y = np.clip(grid_all_y - disp_y, 0.0, float(h - 1))
            warped = cv2.remap(
                img_bgr,
                map_x,
                map_y,
                interpolation=cv2.INTER_LINEAR,
                borderMode=cv2.BORDER_REPLICATE,
            )

        if smooth_k <= 0.001 and white_k <= 0.001 and rosy_k <= 0.001 and clarity_k <= 0.001:
            return warped

        # Step 2: Whitening, Rosy Radiance & Clarity (自适应冷白去黄与微光透亮)
        whitened = warped
        if white_k > 0.001 or rosy_k > 0.001:
            lab = cv2.cvtColor(warped, cv2.COLOR_BGR2Lab).astype(np.float32)
            l_chan = lab[:, :, 0]
            l_norm = l_chan / 255.0
            bell = np.sin(np.pi * np.clip(l_norm, 0.0, 1.0))
            if white_k > 0.001:
                # 1. Targeted De-Yellowing (去黄退黄气，黄脸变白皙冷白皮，绝不大面积曝光提亮)
                # Neutral b channel in OpenCV Lab is 128. Asian yellow skin is typically 145~170 (>128).
                yellow_excess = np.maximum(0.0, lab[:, :, 2] - 128.0)
                deyellow_amount = (yellow_excess * 0.90 + 12.0) * white_k
                lab[:, :, 2] = np.clip(lab[:, :, 2] - deyellow_amount * bell, 126, 255)

                # 2. Gentle Translucent Midtone Lift (微调中段明度，零高光过曝)
                l_lift = (white_k * 14.0) * bell
                lab[:, :, 0] = np.clip(l_chan + l_lift, 0, 255)

                # 3. Healthy Rosy Radiance (白里透红，防惨白/防假白)
                rosy_boost = (white_k * 4.5 + rosy_k * 12.0) * bell
                lab[:, :, 1] = np.clip(lab[:, :, 1] + rosy_boost, 0, 255)
            elif rosy_k > 0.001:
                lab[:, :, 1] = np.clip(lab[:, :, 1] + (rosy_k * 12.0) * bell, 0, 255)
            whitened = cv2.cvtColor(lab.astype(np.uint8), cv2.COLOR_Lab2BGR)

        if clarity_k > 0.001:
            blur_clarity = cv2.GaussianBlur(whitened, (0, 0), 2.0)
            whitened = cv2.addWeighted(whitened, 1.0 + clarity_k * 0.20, blur_clarity, -clarity_k * 0.20, 0)

        # Step 3: Commercial Dual-Band Frequency Separation Smoothing (高低频分频质感磨皮 - 杜绝朦胧与塑料感)
        smoothed_textured = whitened.copy()
        if smooth_k > 0.001:
            if has_faces:
                for norm_pts in faces_landmarks:
                    pts = (norm_pts * np.array([w, h], dtype=np.float32)).astype(np.int32)
                    pad = max(20, int(min(h, w) * 0.03))
                    bx1 = max(0, int(np.min(pts[:, 0]) - pad))
                    by1 = max(0, int(np.min(pts[:, 1]) - pad))
                    bx2 = min(w, int(np.max(pts[:, 0]) + pad))
                    by2 = min(h, int(np.max(pts[:, 1]) + pad))

                    face_roi = whitened[by1:by2, bx1:bx2]
                    fh, fw = face_roi.shape[:2]
                    if fh < 10 or fw < 10:
                        continue

                    # 3.1 Recursive edge-preserving domain transform: flattens blemishes/unevenness while keeping structure tack-sharp
                    ss = max(10, int(min(fh, fw) * (0.08 + smooth_k * 0.08)))
                    sr = float(np.clip(0.15 + smooth_k * 0.25, 0.15, 0.40))
                    epf = cv2.edgePreservingFilter(face_roi, flags=cv2.RECURS_FILTER, sigma_s=ss, sigma_r=sr)

                    # 3.2 High frequency pore texture layer: extract genuine skin grain
                    blur_hf = cv2.GaussianBlur(face_roi, (0, 0), sigmaX=max(1.0, min(fh, fw) * 0.003))
                    hf = face_roi.astype(np.float32) - blur_hf.astype(np.float32)

                    # Micro pores (small amplitude [-4, 4]): retain natural skin pore breathing
                    fine_pores = np.clip(hf, -4.0, 4.0)
                    fine_weight = float(np.clip(0.35 - smooth_k * 0.20, 0.12, 0.35))
                    smoothed_roi = np.clip(epf.astype(np.float32) + fine_pores * fine_weight, 0, 255).astype(np.uint8)
                    smoothed_textured[by1:by2, bx1:bx2] = smoothed_roi
            else:
                ss = max(12, int(min(h, w) * 0.05))
                sr = float(np.clip(0.15 + smooth_k * 0.20, 0.15, 0.35))
                epf = cv2.edgePreservingFilter(whitened, flags=cv2.RECURS_FILTER, sigma_s=ss, sigma_r=sr)
                blur_hf = cv2.GaussianBlur(whitened, (0, 0), 1.0)
                hf = whitened.astype(np.float32) - blur_hf.astype(np.float32)
                fine_pores = np.clip(hf, -4.0, 4.0)
                fine_weight = float(np.clip(0.35 - smooth_k * 0.20, 0.12, 0.35))
                smoothed_textured = np.clip(epf.astype(np.float32) + fine_pores * fine_weight, 0, 255).astype(np.uint8)

        # Step 4: Aligned Skin Mask & Additive Delta Blending (严格限定人脸与颈部皮肤变白磨皮，五官及背景零干扰)
        if has_faces:
            contour_idxs = [
                10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397,
                365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58,
                132, 93, 234, 127, 162, 21, 54, 103, 67, 109,
            ]
            left_eye_idxs = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246]
            right_eye_idxs = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398]
            lips_idxs = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95]
            left_brow_idxs = [70, 63, 105, 66, 107, 55, 65, 52, 53, 46]
            right_brow_idxs = [336, 296, 334, 293, 300, 276, 283, 282, 295, 285]

            face_poly_mask = np.zeros((h, w), dtype=np.uint8)
            feature_mask = np.zeros((h, w), dtype=np.uint8)
            neck_poly_mask = np.zeros((h, w), dtype=np.uint8)

            for norm_pts in faces_landmarks:
                coords = norm_pts * np.array([w, h], dtype=np.float32)
                valid_pts = []
                for pt in coords:
                    xp = int(np.clip(pt[0], 0, w - 1))
                    yp = int(np.clip(pt[1], 0, h - 1))
                    shift_x = disp_x[yp, xp] if disp_x is not None else 0.0
                    shift_y = disp_y[yp, xp] if disp_y is not None else 0.0
                    valid_pts.append([pt[0] + shift_x, pt[1] + shift_y])
                valid_pts = np.array(valid_pts, dtype=np.float32)

                cv2.fillPoly(face_poly_mask, [valid_pts[contour_idxs].astype(np.int32)], 255)
                for feat in [left_eye_idxs, right_eye_idxs, lips_idxs, left_brow_idxs, right_brow_idxs]:
                    cv2.fillPoly(feature_mask, [valid_pts[feat].astype(np.int32)], 255)

                single_neck = self.parse_neck_mask(warped, valid_pts)
                neck_poly_mask = np.maximum(neck_poly_mask, single_neck)

            # Dilate facial features slightly (eyelashes, eye contours, lip edges stay 100% sharp)
            feat_kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
            dilated_features = cv2.dilate(feature_mask, feat_kernel, iterations=1)

            # YCrCb skin color chrominance check
            ycrcb = cv2.cvtColor(warped, cv2.COLOR_BGR2YCrCb)
            cr = ycrcb[:, :, 1]
            cb = ycrcb[:, :, 2]
            is_skin_color = (cr >= 120) & (cr <= 185) & (cb >= 65) & (cb <= 140)

            face_interior = (face_poly_mask > 0) & (dilated_features == 0) & is_skin_color
            if np.count_nonzero(face_interior) > 100:
                med_cr = float(np.median(cr[face_interior]))
                med_cb = float(np.median(cb[face_interior]))
                neck_chroma_match = (np.abs(cr.astype(np.float32) - med_cr) <= 26.0) & (np.abs(cb.astype(np.float32) - med_cb) <= 22.0)
                valid_neck = (neck_poly_mask > 0) & is_skin_color & neck_chroma_match & (dilated_features == 0)
            else:
                valid_neck = (neck_poly_mask > 0) & is_skin_color & (dilated_features == 0)

            skin_candidate = face_interior | valid_neck
            skin_uint8 = (skin_candidate * 255).astype(np.uint8)
            k_blur = max(15, int(min(h, w) * 0.024) | 1)
            skin_mask = cv2.GaussianBlur(skin_uint8, (k_blur, k_blur), 0).astype(np.float32) / 255.0
            skin_mask[dilated_features > 0] = 0.0
        else:
            ycrcb = cv2.cvtColor(warped, cv2.COLOR_BGR2YCrCb)
            cr = ycrcb[:, :, 1]
            cb = ycrcb[:, :, 2]
            is_skin_color = (cr >= 120) & (cr <= 185) & (cb >= 65) & (cb <= 140)
            skin_uint8 = (is_skin_color * 255).astype(np.uint8)
            skin_mask = cv2.GaussianBlur(skin_uint8, (17, 17), 0).astype(np.float32) / 255.0

        # 4.2 Additive Delta Blending: output = warped + (smoothed_textured - warped) * skin_mask
        delta = smoothed_textured.astype(np.float32) - warped.astype(np.float32)
        skin_mask_3c = np.repeat(skin_mask[:, :, np.newaxis], 3, axis=2)
        final_float = warped.astype(np.float32) + delta * skin_mask_3c
        return np.clip(final_float, 0, 255).astype(np.uint8)

    def process_image(self, input_path, output_path, eye=15, slim=15, smooth=30, white=25, rosy=20, clarity=15, preview=False, preview_max=960):
        """
        High-level image processing pipeline with dual-mode execution (preview vs bake).
        """
        t0 = time.time()
        if not os.path.isfile(input_path):
            return {"success": False, "error": f"Input image not found: {input_path}"}

        img = cv_read_image(input_path)
        if img is None:
            return {"success": False, "error": f"Failed to load image: {input_path}"}

        h, w = img.shape[:2]

        # Landmark caching key based on original image file status
        stat = os.stat(input_path)
        cache_key = f"{os.path.abspath(input_path)}_{stat.st_mtime}_{stat.st_size}"

        # Detect landmarks
        norm_landmarks = self.get_landmarks(img, cache_key=cache_key)

        # Scale down for ultra-fast slider preview if requested
        if preview and max(h, w) > preview_max:
            scale = float(preview_max) / float(max(h, w))
            new_w = int(round(w * scale))
            new_h = int(round(h * scale))
            proc_img = cv2.resize(img, (new_w, new_h), interpolation=cv2.INTER_AREA)
        else:
            proc_img = img

        # Apply retouching
        retouched = self.apply_retouch(
            proc_img,
            norm_landmarks,
            eye=eye,
            slim=slim,
            smooth=smooth,
            white=white,
            rosy=rosy,
            clarity=clarity
        )

        # Save output image
        quality = 85 if preview else 95
        success = cv_write_image(output_path, retouched, quality=quality)
        elapsed_ms = (time.time() - t0) * 1000.0

        if not success:
            return {"success": False, "error": f"Failed to write output image: {output_path}"}

        return {
            "success": True,
            "output": os.path.abspath(output_path),
            "num_faces": len(norm_landmarks),
            "preview": bool(preview),
            "time_ms": round(elapsed_ms, 1),
            "params": {
                "eye": eye,
                "slim": slim,
                "smooth": smooth,
                "white": white,
                "rosy": rosy,
                "clarity": clarity,
            }
        }


def main():
    parser = argparse.ArgumentParser(description="Photobooth AI Beauty Core CLI")
    parser.add_argument("--input", "-i", required=True, help="Input image path")
    parser.add_argument("--output", "-o", required=True, help="Output image path")
    parser.add_argument("--eye", type=float, default=15, help="Eye enlargement (0-100)")
    parser.add_argument("--slim", type=float, default=15, help="Face slimming (0-100)")
    parser.add_argument("--smooth", type=float, default=30, help="Skin smoothing (0-100)")
    parser.add_argument("--white", type=float, default=25, help="Skin whitening (0-100)")
    parser.add_argument("--rosy", type=float, default=20, help="Rosy blush (0-100)")
    parser.add_argument("--clarity", type=float, default=15, help="Clarity & Contour (0-100)")
    parser.add_argument("--preview", action="store_true", help="Generate fast preview (<=960px)")
    parser.add_argument("--preview-max", type=int, default=960, help="Max preview dimension")
    args = parser.parse_args()

    engine = BeautyEngine()
    res = engine.process_image(
        args.input,
        args.output,
        eye=args.eye,
        slim=args.slim,
        smooth=args.smooth,
        white=args.white,
        rosy=args.rosy,
        clarity=args.clarity,
        preview=args.preview,
        preview_max=args.preview_max,
    )
    import json
    print(json.dumps(res, ensure_ascii=False, indent=2))
    sys.exit(0 if res.get("success") else 1)


if __name__ == "__main__":
    main()
