import os
# Put worker threads into passive sleep immediately on idle to prevent heat accumulation
os.environ["OMP_WAIT_POLICY"] = "PASSIVE"
os.environ["KMP_BLOCKTIME"] = "0"

import json
import threading
import base64
import numpy as np
import cv2
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler

try:
    from matting_core import MattingEngineManager, process_with_manager, DEFAULT_ENGINE, get_persisted_threads, get_persisted_gpu_mode
except ImportError:
    from bin.matting_core import MattingEngineManager, process_with_manager, DEFAULT_ENGINE, get_persisted_threads, get_persisted_gpu_mode

try:
    from beauty_core import BeautyEngine, cv_read_image
except ImportError:
    from bin.beauty_core import BeautyEngine, cv_read_image

try:
    from faceswap_core import FaceSwapEngine
except ImportError:
    try:
        from bin.faceswap_core import FaceSwapEngine
    except ImportError:
        FaceSwapEngine = None

HOST = "127.0.0.1"
PORT = 8001
MANAGER = MattingEngineManager(
    default_engine=DEFAULT_ENGINE,
    prefer_cpu=(get_persisted_gpu_mode() == "cpu"),
    threads=get_persisted_threads(),
)
MANAGER_LOCK = threading.Lock()
BEAUTY_ENGINE = None
BEAUTY_LOCK = threading.Lock()
FACESWAP_ENGINE = None
FACESWAP_LOCK = threading.Lock()


class RembgHandler(BaseHTTPRequestHandler):
    def _json(self, payload, status=200):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        if self.path == "/health":
            with MANAGER_LOCK:
                diagnostics = MANAGER.diagnostics()
            self._json({
                "status": "ok",
                "default_engine": diagnostics.get("default_engine"),
                "device_status": diagnostics.get("device_status"),
                "threads": diagnostics.get("threads"),
                "max_system_threads": diagnostics.get("max_system_threads"),
                "engines": diagnostics.get("engines"),
            })
        elif self.path in ("/device", "/threads", "/cpu"):
            with MANAGER_LOCK:
                dev_status = MANAGER.get_device_status()
                dev_status["max_threads"] = os.cpu_count() or 4
                self._json({
                    "status": "ok",
                    "success": True,
                    **dev_status,
                })
        else:
            self._json({"error": "Not Found"}, 404)

    def do_POST(self):
        global BEAUTY_ENGINE, FACESWAP_ENGINE
        if self.path in ("/device", "/threads", "/cpu"):
            try:
                length = int(self.headers.get("Content-Length", 0))
                data = json.loads(self.rfile.read(length).decode("utf-8")) if length > 0 else {}
                with MANAGER_LOCK:
                    if "device" in data or "prefer_cpu" in data or "gpu_mode" in data:
                        dev = str(data.get("device") or data.get("gpu_mode") or "").lower().strip()
                        prefer_cpu = (dev == "cpu") if dev else bool(data.get("prefer_cpu", False))
                        MANAGER.set_device(prefer_cpu=prefer_cpu)
                    if "threads" in data:
                        threads = int(data.get("threads", 4))
                        threads = max(1, min(32, threads))
                        MANAGER.set_threads(threads)
                    status = MANAGER.get_device_status()
                is_gpu = (status.get("device") == "gpu")
                msg = "AI抠图已即时切换为 GPU 硬件加速" if is_gpu else f"AI抠图已即时切换为 CPU {status.get('threads')} 核心计算"
                self._json({
                    "status": "ok",
                    "success": True,
                    "message": msg,
                    **status,
                })
            except Exception as exc:
                self._json({"success": False, "error": str(exc)}, 500)
            return

        if self.path == "/beauty":
            try:
                length = int(self.headers.get("Content-Length", 0))
                data = json.loads(self.rfile.read(length).decode("utf-8")) if length > 0 else {}
                with BEAUTY_LOCK:
                    if BEAUTY_ENGINE is None:
                        BEAUTY_ENGINE = BeautyEngine()
                    result = BEAUTY_ENGINE.process_image(
                        input_path=data.get("input"),
                        output_path=data.get("output"),
                        eye=float(data.get("eye", 15)),
                        slim=float(data.get("slim", 15)),
                        smooth=float(data.get("smooth", 30)),
                        white=float(data.get("white", 25)),
                        rosy=float(data.get("rosy", 20)),
                        clarity=float(data.get("clarity", 15)),
                        preview=bool(data.get("preview", False)),
                        preview_max=int(data.get("preview_max", 960)),
                    )
                self._json(result, 200 if result.get("success") else 500)
            except Exception as exc:
                self._json({"success": False, "error": str(exc)}, 500)
            return

        if self.path == "/faceswap":
            try:
                length = int(self.headers.get("Content-Length", 0))
                data = json.loads(self.rfile.read(length).decode("utf-8")) if length > 0 else {}
                with FACESWAP_LOCK:
                    if FACESWAP_ENGINE is None and FaceSwapEngine is not None:
                        with MANAGER_LOCK:
                            prefer_cpu = (MANAGER.get_device_status().get("device") == "cpu")
                        FACESWAP_ENGINE = FaceSwapEngine(prefer_cpu=prefer_cpu)
                    
                    if FACESWAP_ENGINE is None:
                        result = {"success": False, "error": "AI 换脸引擎组件未就绪"}
                    else:
                        result = FACESWAP_ENGINE.swap(
                            source_path=data.get("source") or data.get("input"),
                            target_path=data.get("target") or data.get("template"),
                            output_path=data.get("output")
                        )
                self._json(result, 200 if result.get("success") else 500)
            except Exception as exc:
                self._json({"success": False, "error": str(exc)}, 500)
            return

        if self.path == "/align":
            try:
                length = int(self.headers.get("Content-Length", 0))
                data = json.loads(self.rfile.read(length).decode("utf-8")) if length > 0 else {}
                img_data = data.get("image") or data.get("data")
                if not img_data:
                    self._json({"status": "error", "error": "Missing image data"}, 400)
                    return

                # Decode base64 data URL or raw path
                if isinstance(img_data, str) and (img_data.startswith("data:") or len(img_data) > 500):
                    if "," in img_data:
                        img_data = img_data.split(",", 1)[1]
                    raw_bytes = base64.b64decode(img_data)
                    nparr = np.frombuffer(raw_bytes, np.uint8)
                    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                elif isinstance(img_data, str) and os.path.isfile(img_data):
                    img = cv_read_image(img_data)
                else:
                    img = None

                if img is None:
                    self._json({"status": "error", "error": "Failed to decode image"}, 400)
                    return

                with BEAUTY_LOCK:
                    if BEAUTY_ENGINE is None:
                        BEAUTY_ENGINE = BeautyEngine()
                    landmarks_list = BEAUTY_ENGINE.get_landmarks(img)

                if not landmarks_list:
                    self._json({
                        "status": "ok",
                        "detected": False,
                        "aligned": False,
                        "message": "请走入取景框中",
                        "reason": "no_face"
                    })
                    return

                # Pick primary face by maximum bounding box area
                primary_pts = None
                max_area = 0.0
                for pts in landmarks_list:
                    x_min, x_max = float(pts[:, 0].min()), float(pts[:, 0].max())
                    y_min, y_max = float(pts[:, 1].min()), float(pts[:, 1].max())
                    area = (x_max - x_min) * (y_max - y_min)
                    if area > max_area:
                        max_area = area
                        primary_pts = pts

                pts = primary_pts
                x_min, x_max = float(pts[:, 0].min()), float(pts[:, 0].max())
                y_min, y_max = float(pts[:, 1].min()), float(pts[:, 1].max())
                face_w = x_max - x_min
                face_h = y_max - y_min
                center_x = (x_min + x_max) / 2.0
                center_y = (y_min + y_max) / 2.0

                nose = pts[1]
                left_cheek = pts[234]
                right_cheek = pts[454]
                left_eye = pts[33]
                right_eye = pts[263]

                d_left = abs(nose[0] - left_cheek[0])
                d_right = abs(right_cheek[0] - nose[0])
                yaw_diff = abs(d_left - d_right) / (d_left + d_right + 1e-4)
                tilt = abs(right_eye[1] - left_eye[1]) / (abs(right_eye[0] - left_eye[0]) + 1e-4)

                is_size_ok = bool(face_w >= 0.10 and face_h >= 0.10)
                is_centered = bool((0.25 <= center_x <= 0.75) and (0.15 <= center_y <= 0.85))
                is_yaw_ok = bool(yaw_diff <= 0.18)
                is_tilt_ok = bool(tilt <= 0.15)

                aligned = bool(is_size_ok and is_centered and is_yaw_ok and is_tilt_ok)

                if not is_size_ok:
                    msg = "请靠近镜头一点"
                    reason = "face_too_small"
                elif not is_centered:
                    msg = "请移至画面中心"
                    reason = "off_center"
                elif not is_yaw_ok:
                    msg = "请正对镜头 · 避免侧脸"
                    reason = "yaw_asymmetry"
                elif not is_tilt_ok:
                    msg = "请端正头部 · 避免歪头"
                    reason = "head_tilted"
                else:
                    msg = "正脸已对正 · 可以拍照"
                    reason = "ok"

                self._json({
                    "status": "ok",
                    "detected": True,
                    "aligned": aligned,
                    "message": msg,
                    "reason": reason,
                    "yaw_diff": round(float(yaw_diff), 4),
                    "tilt": round(float(tilt), 4),
                    "center": [round(float(center_x), 3), round(float(center_y), 3)],
                    "size": [round(float(face_w), 3), round(float(face_h), 3)]
                })
            except Exception as exc:
                self._json({"status": "error", "error": str(exc)}, 500)
            return

        if self.path != "/process":
            self._json({"error": "Not Found"}, 404)
            return
        try:
            length = int(self.headers.get("Content-Length", 0))
            data = json.loads(self.rfile.read(length).decode("utf-8"))
            with MANAGER_LOCK:
                result = process_with_manager(
                    MANAGER,
                    data.get("input"),
                    data.get("output"),
                    data.get("template"),
                    data.get("engine", DEFAULT_ENGINE),
                    bool(data.get("auto_fallback", True)),
                    template_scale=float(data.get("template_scale", 1.0)),
                    offset_x=float(data.get("offset_x", 0.0)),
                    offset_y=float(data.get("offset_y", 0.0)),
                    person_scale=float(data.get("person_scale", 1.0)),
                    person_offset_x=float(data.get("person_offset_x", 0.0)),
                    person_offset_y=float(data.get("person_offset_y", 0.0)),
                )
            self._json(result, 200 if result.get("success") else 500)
        except Exception as exc:
            self._json({"success": False, "error": str(exc)}, 500)

    def log_message(self, fmt, *args):
        pass


def run():
    print(f"[MattingService] Running on http://{HOST}:{PORT} with SOTA BiRefNet & RMBG-2.0 engines ...")
    server = ThreadingHTTPServer((HOST, PORT), RembgHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    run()
