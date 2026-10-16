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
                    strength_trans = slim_k * 0.20

                    control_indices = [93, 132, 58, 172, 323, 361, 288, 397]
                    for idx in control_indices:
                        p = coords[idx]
                        r = float(np.linalg.norm(mid_target - p) * 0.70)
                        if r <= 2.0:
                            continue
                        px, py = float(p[0]), float(p[1])
                        tx, ty = float(mid_target[0]), float(mid_target[1])
                        dx = (tx - px) * strength_trans
                        dy = (ty - py) * strength_trans

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

                # 1.2 自然大眼 (Radial Eye Enlargement)
                if eye_k > 0.001:
                    left_iris = coords[468]
                    right_iris = coords[473]
                    dist_l = np.linalg.norm(coords[33] - coords[133])
                    dist_r = np.linalg.norm(coords[263] - coords[362])
                    radius_l = max(10.0, dist_l * 0.85)
                    radius_r = max(10.0, dist_r * 0.85)
                    alpha_eye = min(0.35, eye_k * 0.30)

                    for iris, r in [(left_iris, radius_l), (right_iris, radius_r)]:
                        cx, cy = float(iris[0]), float(iris[1])
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

                        factor = alpha_eye * ((1.0 - dist[e_mask] / r) ** 2)
                        disp_x[by1:by2, bx1:bx2][e_mask] += (gx[e_mask] - cx) * factor
                        disp_y[by1:by2, bx1:bx2][e_mask] += (gy[e_mask] - cy) * factor

            # Single unified remap pass
            grid_all_x, grid_all_y = np.meshgrid(
                np.arange(w, dtype=np.float32), np.arange(h, dtype=np.float32)
            )
            map_x = grid_all_x - disp_x
            map_y = grid_all_y - disp_y
            warped = cv2.remap(
                img_bgr,
                map_x,
                map_y,
                interpolation=cv2.INTER_LINEAR,
                borderMode=cv2.BORDER_REFLECT,
            )

        if smooth_k <= 0.001 and white_k <= 0.001 and rosy_k <= 0.001 and clarity_k <= 0.001:
            return warped

        # Step 2: Whitening, Rosy Radiance & Clarity
        whitened = warped
        if white_k > 0.001 or rosy_k > 0.001:
            lab = cv2.cvtColor(warped, cv2.COLOR_BGR2Lab).astype(np.float32)
            if white_k > 0.001:
                l_chan = lab[:, :, 0]
                l_norm = l_chan / 255.0
                l_delta = (white_k * 22.0) * np.sin(np.pi * l_norm)
                lab[:, :, 0] = np.clip(l_chan + l_delta, 0, 255)
                lab[:, :, 1] = np.clip(lab[:, :, 1] + white_k * 2.2, 0, 255)
            if rosy_k > 0.001:
                lab[:, :, 1] = np.clip(lab[:, :, 1] + rosy_k * 8.5, 0, 255)
                lab[:, :, 2] = np.clip(lab[:, :, 2] + rosy_k * 1.5, 0, 255)
            whitened = cv2.cvtColor(lab.astype(np.uint8), cv2.COLOR_Lab2BGR)

        if clarity_k > 0.001:
            blur_clarity = cv2.GaussianBlur(whitened, (0, 0), 2.0)
            whitened = cv2.addWeighted(whitened, 1.0 + clarity_k * 0.25, blur_clarity, -clarity_k * 0.25, 0)

        # Step 3: Bilateral Smoothing with High-Frequency Texture Conservation
        if smooth_k > 0.001:
            sigma_c = 15.0 + smooth_k * 25.0
            sigma_s = 10.0 + smooth_k * 10.0
            smooth_base = cv2.bilateralFilter(
                whitened, d=7, sigmaColor=sigma_c, sigmaSpace=sigma_s
            )
            blur_hf = cv2.GaussianBlur(whitened, (0, 0), 1.0)
            hf_detail = whitened.astype(np.float32) - blur_hf.astype(np.float32)
            smoothed_textured = np.clip(
                smooth_base.astype(np.float32) + hf_detail * 0.82, 0, 255
            ).astype(np.uint8)
        else:
            smoothed_textured = whitened

        # Step 4: Aligned Skin Mask & Additive Delta Blending
        skin_mask = None
        if self.bisenet_sess is not None and has_faces:
            try:
                # BiSeNet ResNet-34 19-class semantic face segmentation
                b_in = cv2.resize(warped, (512, 512))
                b_rgb = cv2.cvtColor(b_in, cv2.COLOR_BGR2RGB).astype(np.float32) / 255.0
                mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
                std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
                b_blob = np.transpose((b_rgb - mean) / std, (2, 0, 1))[None, ...]
                res = self.bisenet_sess.run(None, {'input': b_blob})[0]
                parsed = np.argmax(res[0], axis=0).astype(np.uint8)
                # Class 1: face skin, Class 14: neck skin. Exclude hair (17), eyes (4, 5), lips (11, 12, 13)
                skin_mask_512 = ((parsed == 1) | (parsed == 14)).astype(np.float32)
                skin_mask_full = cv2.resize(skin_mask_512, (w, h))
                k_blur = max(9, int(min(h, w) * 0.02) | 1)
                skin_mask = cv2.GaussianBlur(skin_mask_full, (k_blur, k_blur), 0)
            except Exception:
                skin_mask = None

        if skin_mask is None:
            # 4.1 Fallback: Skin color detection in YCrCb
            ycrcb = cv2.cvtColor(warped, cv2.COLOR_BGR2YCrCb)
            cr = ycrcb[:, :, 1]
            cb = ycrcb[:, :, 2]
            is_skin_color = (cr >= 130) & (cr <= 175) & (cb >= 75) & (cb <= 130)

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
                for norm_pts in faces_landmarks:
                    coords = norm_pts * np.array([w, h], dtype=np.float32)
                    valid_pts = []
                    for pt in coords:
                        xp = int(np.clip(pt[0], 0, w - 1))
                        yp = int(np.clip(pt[1], 0, h - 1))
                        shift_x = disp_x[yp, xp] if disp_x is not None else 0.0
                        shift_y = disp_y[yp, xp] if disp_y is not None else 0.0
                        valid_pts.append([pt[0] + shift_x, pt[1] + shift_y])
                    valid_pts = np.array(valid_pts, dtype=np.int32)

                    cv2.fillPoly(face_poly_mask, [valid_pts[contour_idxs]], 255)
                    for feat in [left_eye_idxs, right_eye_idxs, lips_idxs, left_brow_idxs, right_brow_idxs]:
                        cv2.fillPoly(face_poly_mask, [valid_pts[feat]], 0)

                skin_candidate = (face_poly_mask > 0) & is_skin_color
                skin_uint8 = (skin_candidate * 255).astype(np.uint8)
                k_blur = max(7, int(min(h, w) * 0.02) | 1)
                skin_mask = cv2.GaussianBlur(skin_uint8, (k_blur, k_blur), 0).astype(np.float32) / 255.0
            else:
                skin_uint8 = (is_skin_color * 255).astype(np.uint8)
                skin_mask = cv2.GaussianBlur(skin_uint8, (15, 15), 0).astype(np.float32) / 255.0

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
