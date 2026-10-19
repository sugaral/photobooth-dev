"""Conservative input gates and diagnostic identity scores, not likeness percentages."""
import os
import uuid
import cv2
import numpy as np


def read_image(path):
    try:
        return cv2.imdecode(np.fromfile(path, dtype=np.uint8), cv2.IMREAD_COLOR)
    except (OSError, ValueError, cv2.error):
        return None


def pose_signature(kps):
    points = np.asarray(kps, np.float32)
    eye = points[1] - points[0]
    distance = float(np.linalg.norm(eye))
    if distance < 1 or not np.isfinite(points).all():
        raise ValueError('人脸关键点无效')
    axis = eye / distance
    down = np.array([-axis[1], axis[0]])
    offset = points[2] - (points[0] + points[1]) / 2
    return np.array([np.dot(offset, axis) / distance,
                     np.dot(offset, down) / distance,
                     np.degrees(np.arctan2(eye[1], eye[0]))])


def validate_face(image, faces, label='照片'):
    if not faces or len(faces) == 0:
        raise ValueError(f'{label}未检测到清晰正面人脸，请正对镜头重新拍摄')
    if len(faces) > 1:
        # Pick dominant primary face by bbox area
        faces = sorted(faces, key=lambda f: float(f['bbox'][2] * f['bbox'][3]), reverse=True)
    face = faces[0]
    x1, y1, x2, y2 = np.round(face['bbox']).astype(int)
    height, width = image.shape[:2]
    if x1 < 0 or y1 < 0 or x2 >= width or y2 >= height:
        # Clamped tolerance: only error if significant portion is outside frame
        if (x2 - x1) > 0 and (y2 - y1) > 0:
            inter_w = max(0, min(x2, width) - max(x1, 0))
            inter_h = max(0, min(y2, height) - max(y1, 0))
            if (inter_w * inter_h) / float((x2 - x1) * (y2 - y1)) < 0.70:
                raise ValueError(f'{label}人脸大部分超出画面，请完整拍摄头部')
    if min(x2 - x1, y2 - y1) < 90 or float(face['score']) < .45:
        raise ValueError(f'{label}人脸过小或不够清晰，请靠近镜头')
    points = np.asarray(face['kps'], np.float32)
    if np.linalg.norm(points[1] - points[0]) < 35:
        raise ValueError(f'{label}眼部细节不足，请靠近镜头')
    pose = pose_signature(points)
    if abs(pose[0]) > .32 or abs(pose[2]) > 28 or not .15 < pose[1] < 1.05:
        raise ValueError(f'{label}面部角度过大，请正对镜头并平视')
    x_clip1, y_clip1 = max(0, x1), max(0, y1)
    x_clip2, y_clip2 = min(width, x2), min(height, y2)
    if (x_clip2 - x_clip1) > 10 and (y_clip2 - y_clip1) > 10:
        gray = cv2.cvtColor(cv2.resize(image[y_clip1:y_clip2, x_clip1:x_clip2], (256, 256)), cv2.COLOR_BGR2GRAY)
        blur = float(cv2.Laplacian(gray, cv2.CV_64F).var())
        if blur < 15:
            raise ValueError(f'{label}面部模糊，请保持稳定并重新对焦')
        if np.mean(gray < 8) > .55 or np.mean(gray > 248) > .55:
            raise ValueError(f'{label}面部曝光异常，请调整光线')
    else:
        blur = 50.0
    return face, {'blur_variance': round(blur, 2), 'pose': pose.tolist()}


def validate_visible_features(parsing, label='照片'):
    """Reject missing features in an aligned 512px parse; not a full occlusion classifier."""
    if parsing is None:
        return {'status': 'unavailable', 'method': 'semantic_features_v1'}
    labels = np.asarray(parsing)
    if labels.shape != (512, 512) or not np.isfinite(labels).all():
        raise ValueError(f'{label}五官检查失败，请重新选择或拍摄')
    # The parser sometimes assigns BOTH visible eyes to class 4 or class 5.
    # Requiring each class separately would incorrectly reject clear portraits.
    counts = {'eyes': int(np.count_nonzero(np.isin(labels, [4, 5]))),
              'nose': int(np.count_nonzero(labels == 10)),
              'mouth': int(np.count_nonzero(np.isin(labels, [11, 12, 13])))}
    if counts['eyes'] < 64:
        raise ValueError(f'{label}眼部不可辨识，请睁眼并移开眼前遮挡物')
    if counts['nose'] < 256 or counts['mouth'] < 128:
        raise ValueError(f'{label}鼻部或嘴部不可辨识，请移开口罩、相机等遮挡物')
    return {'status': 'passed', 'method': 'semantic_features_v1', 'pixels': counts}


def identity_cosine(source, result):
    if source is None or result is None:
        raise ValueError('人脸身份检测失败')
    a, b = np.asarray(source).reshape(-1), np.asarray(result).reshape(-1)
    denominator = np.linalg.norm(a) * np.linalg.norm(b)
    if len(a) != 512 or len(b) != 512 or denominator <= 0 or not np.isfinite(denominator) or not np.isfinite(a).all() or not np.isfinite(b).all():
        raise ValueError('人脸身份特征无效')
    score = float(np.dot(a, b) / denominator)
    if not np.isfinite(score):
        raise ValueError('人脸身份特征无效')
    return score


def write_jpeg(path, image):
    """Encode before an atomic rename; support Unicode paths and reject failed writes."""
    ok, encoded = cv2.imencode('.jpg', image, [cv2.IMWRITE_JPEG_QUALITY, 96])
    if not ok:
        raise OSError('成片编码失败')
    temporary = str(path) + '.' + uuid.uuid4().hex + '.tmp'
    try:
        with open(temporary, 'xb') as handle:
            if handle.write(encoded.tobytes()) != encoded.size:
                raise OSError('成片写入不完整')
        if read_image(temporary) is None:
            raise OSError('成片校验失败')
        os.replace(temporary, path)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)
