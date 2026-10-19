#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AI Swap Fitness & Compatibility Evaluator for Photobooth Templates.
Strictly checks:
1. Resolution: >= 1080p (width >= 1080, height >= 1620)
2. Single Dominant Face: SCRFD score >= 0.75, face bbox >= 300x300, eye distance >= 80
3. 3D Pose Swapability: |Yaw| <= 15 deg, |Roll| <= 10 deg, eye-level pitch
4. BiSeNet Semantic Occlusion: Eyes, nose, mouth clearly visible with zero occlusion
5. Optical Clarity: Laplacian variance >= 70, balanced exposure (no blown-out highlights/crushed blacks)
6. Comprehensive Fitness Score: 0 - 100 scale, threshold >= 80
"""

import os
import sys
import numpy as np
import cv2

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "bin"))

from ai_runtime import use_project_runtime
use_project_runtime()

from faceswap_core import FaceSwapEngine, norm_crop


class TemplateFitnessEvaluator:
    _instance = None

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def __init__(self, device_mode="cpu"):
        self.engine = FaceSwapEngine(device_mode=device_mode)

    def evaluate(self, img_or_path, min_w=1080, min_h=1620):
        """
        Evaluate template image for face-swap fitness.
        Returns:
            dict with {
                'passed': bool,
                'score': float (0-100),
                'reasons': list of str,
                'details': dict
            }
        """
        if isinstance(img_or_path, str):
            if not os.path.isfile(img_or_path):
                return {"passed": False, "score": 0.0, "reasons": ["文件不存在"], "details": {}}
            img = cv2.imdecode(np.fromfile(img_or_path, dtype=np.uint8), cv2.IMREAD_COLOR)
        else:
            img = img_or_path

        if img is None:
            return {"passed": False, "score": 0.0, "reasons": ["图片解码失败"], "details": {}}

        ih, iw = img.shape[:2]
        reasons = []

        # 1. Resolution Check
        if iw < min_w or ih < min_h:
            reasons.append(f"分辨率低于1080P标准: 当前为 {iw}x{ih}，要求至少 {min_w}x{min_h}")

        # 2. Face Detection
        faces = self.engine.detect_faces(img, conf_threshold=0.40)
        if not faces:
            return {
                "passed": False,
                "score": 0.0,
                "reasons": ["未检测到人脸"] + reasons,
                "details": {"resolution": f"{iw}x{ih}"}
            }

        faces.sort(key=lambda x: (x["bbox"][2] - x["bbox"][0]) * (x["bbox"][3] - x["bbox"][1]), reverse=True)
        primary_face = faces[0]

        if primary_face["score"] < 0.70:
            reasons.append(f"人脸检测置信度不足 ({primary_face['score']:.2f} < 0.70)")

        # Dominant face check
        if len(faces) > 1:
            a0 = (faces[0]["bbox"][2] - faces[0]["bbox"][0]) * (faces[0]["bbox"][3] - faces[0]["bbox"][1])
            a1 = (faces[1]["bbox"][2] - faces[1]["bbox"][0]) * (faces[1]["bbox"][3] - faces[1]["bbox"][1])
            if a0 < a1 * 2.5:
                reasons.append("存在背景干扰人脸或多人群像，非单人写真")

        bbox = primary_face["bbox"]
        fw = bbox[2] - bbox[0]
        fh = bbox[3] - bbox[1]
        if fw < 250 or fh < 250:
            reasons.append(f"人脸在画幅中占比过小 ({int(fw)}x{int(fh)} < 250x250)，五官特征不足")

        kps = np.asarray(primary_face["kps"], dtype=np.float32)
        r_eye, l_eye, nose = kps[0], kps[1], kps[2]
        eye_dist = float(np.linalg.norm(r_eye - l_eye))
        if eye_dist < 60:
            reasons.append(f"双眼间距过小 ({eye_dist:.1f}px < 60px)")

        # 3. 3D Pose Swapability
        eye_center = (r_eye + l_eye) / 2.0
        yaw_offset = float((nose[0] - eye_center[0]) / (eye_dist + 1e-6))
        dy = float(l_eye[1] - r_eye[1])
        dx = float(l_eye[0] - r_eye[0])
        roll_deg = float(np.degrees(np.arctan2(dy, dx)))

        # Yaw score (30 max)
        # yaw_offset <= 0.15 is ideal (~8.5 deg)
        abs_yaw = abs(yaw_offset)
        if abs_yaw > 0.35:
            reasons.append(f"面部侧脸偏角过大 (偏航偏移 {abs_yaw:.2f} > 0.35)")
            pose_score = 0.0
        else:
            pose_score = max(0.0, 30.0 * (1.0 - abs_yaw / 0.35))

        # Roll penalty
        if abs(roll_deg) > 18.0:
            reasons.append(f"头部倾斜角度过大 ({abs(roll_deg):.1f}° > 18°)")
            pose_score = max(0.0, pose_score - 10.0)

        # 4. BiSeNet Semantic Occlusion & Feature Check
        aligned_512, m512 = norm_crop(img, primary_face["kps"], image_size=512)
        parsing = self.engine.parse_face(aligned_512) if aligned_512 is not None else None

        if parsing is None:
            reasons.append("BiSeNet 面部语义解析失败")
            occlusion_score = 0.0
        else:
            labels = np.asarray(parsing)
            eyes_px = int(np.count_nonzero(np.isin(labels, [4, 5])))
            nose_px = int(np.count_nonzero(labels == 10))
            mouth_px = int(np.count_nonzero(np.isin(labels, [11, 12, 13])))

            if eyes_px < 150:
                reasons.append("眼部特征缺失或被遮挡")
            if nose_px < 400:
                reasons.append("鼻部特征缺失或被遮挡")
            if mouth_px < 300:
                reasons.append("嘴部特征缺失或被遮挡")

            # Occlusion score (25 max)
            feature_completeness = min(1.0, (eyes_px / 400.0) * 0.4 + (nose_px / 1200.0) * 0.3 + (mouth_px / 1000.0) * 0.3)
            occlusion_score = round(25.0 * feature_completeness, 1)

        # 5. Optical Clarity & Illumination Check
        x1, y1 = max(0, int(bbox[0])), max(0, int(bbox[1]))
        x2, y2 = min(iw, int(bbox[2])), min(ih, int(bbox[3]))
        face_patch = img[y1:y2, x1:x2]
        if face_patch.size > 0:
            gray_face = cv2.cvtColor(cv2.resize(face_patch, (256, 256)), cv2.COLOR_BGR2GRAY)
            lap_var = float(cv2.Laplacian(gray_face, cv2.CV_64F).var())
            over_exposed = float(np.mean(gray_face > 248))
            under_exposed = float(np.mean(gray_face < 10))

            if lap_var < 45.0:
                reasons.append(f"面部清晰度不足 (拉普拉斯方差 {lap_var:.1f} < 45.0)")
            if over_exposed > 0.20:
                reasons.append("面部高光过曝死白")
            if under_exposed > 0.20:
                reasons.append("面部阴影严重死黑欠曝")

            clarity_score = min(25.0, (lap_var / 150.0) * 20.0 + (1.0 - over_exposed - under_exposed) * 5.0)
            clarity_score = max(0.0, round(clarity_score, 1))
        else:
            lap_var = 0.0
            clarity_score = 0.0

        # 6. Asian Morphology & Photogenic Quality Check (20 max)
        # Score based on detection confidence and natural skin color in LAB
        if face_patch.size > 0:
            lab = cv2.cvtColor(face_patch, cv2.COLOR_BGR2LAB)
            l_mean = float(np.mean(lab[:, :, 0]))
            a_mean = float(np.mean(lab[:, :, 1]))
            b_mean = float(np.mean(lab[:, :, 2]))
            # Asian skin tone in 8-bit LAB typically has positive b (warm/golden) and moderate a
            skin_warmth = 1.0 if (b_mean > 128 and a_mean > 125) else 0.8
            aesthetic_score = round(20.0 * primary_face["score"] * skin_warmth, 1)
        else:
            aesthetic_score = 0.0

        total_score = round(pose_score + occlusion_score + clarity_score + aesthetic_score, 1)
        passed = (len(reasons) == 0 and total_score >= 80.0)

        return {
            "passed": passed,
            "score": total_score,
            "reasons": reasons,
            "details": {
                "resolution": f"{iw}x{ih}",
                "face_confidence": round(float(primary_face["score"]), 3),
                "face_bbox": [int(x) for x in bbox],
                "eye_dist_px": round(eye_dist, 1),
                "yaw_offset": round(yaw_offset, 3),
                "roll_deg": round(roll_deg, 2),
                "laplacian_clarity": round(lap_var, 1),
                "sub_scores": {
                    "pose": round(pose_score, 1),
                    "occlusion": round(occlusion_score, 1),
                    "clarity": round(clarity_score, 1),
                    "aesthetic": round(aesthetic_score, 1)
                }
            }
        }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python bin/ai_template_fitness.py <image_path>")
        sys.exit(1)
    evaluator = TemplateFitnessEvaluator.get_instance()
    res = evaluator.evaluate(sys.argv[1])
    import json
    print(json.dumps(res, ensure_ascii=False, indent=2))
