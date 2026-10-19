"""Machine-readable upload validator. Model diagnostics go to stderr."""
try:
    from ai_runtime import use_project_runtime
except ImportError:
    from bin.ai_runtime import use_project_runtime
if __name__ == '__main__':
    use_project_runtime()

import contextlib
import argparse
import json
import sys
import os
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from face_quality import read_image, validate_face, validate_visible_features
from faceswap_core import FaceSwapEngine, norm_crop
from face_device import add_device_argument


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('image')
    add_device_argument(parser)
    args = parser.parse_args()
    try:
        with contextlib.redirect_stdout(sys.stderr):
            engine = FaceSwapEngine(device_mode=args.device)
            if not engine.is_ready():
                raise ValueError('人脸检测与身份模型未就绪，模板尚未导入')
            image = read_image(args.image)
            if image is None:
                raise ValueError('图片无法解码')
            face, quality = validate_face(image, engine.detect_faces(image), '模板')
            aligned, _ = norm_crop(image, face['kps'], image_size=512)
            quality['visibility'] = validate_visible_features(engine.parse_face(aligned), '模板')
            if quality['visibility']['status'] != 'passed':
                raise ValueError('五官检查模型未就绪，模板尚未导入')
        print(json.dumps({'success': True, 'quality': quality}, ensure_ascii=False))
        return 0
    except Exception as error:
        print(json.dumps({'success': False, 'error': str(error)}, ensure_ascii=False))
        return 1


if __name__ == '__main__':
    sys.exit(main())
