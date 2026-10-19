try:
    from ai_runtime import use_project_runtime
except ImportError:
    from bin.ai_runtime import use_project_runtime
if __name__ == '__main__':
    use_project_runtime()

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
    from matting_core import MattingEngineManager, process_with_manager, DEFAULT_ENGINE, get_persisted_threads, get_persisted_gpu_mode, validate_device_mode
except ImportError:
    from bin.matting_core import MattingEngineManager, process_with_manager, DEFAULT_ENGINE, get_persisted_threads, get_persisted_gpu_mode, validate_device_mode

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
    prefer_cpu=None,
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
        if self.path == "/ready":
            # Liveness must not wait for inference locks or initialize any model.
            self._json({
                "status": "ok",
                "service": "photobooth-ai",
                "project_root": os.path.dirname(os.path.dirname(os.path.realpath(__file__))),
                "python_executable": sys.executable,
                "device_mode": MANAGER.device_mode,
            })
        elif self.path == "/health":
            with MANAGER_LOCK:
                diagnostics = MANAGER.diagnostics()
            with FACESWAP_LOCK:
                face_status = FACESWAP_ENGINE.get_device_status() if FACESWAP_ENGINE else None
            self._json({
                "status": "ok",
                "python_executable": sys.executable,
                "faceswap": face_status,
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
                # Match the swap path's lock order; device changes wait for any
                # running swap before replacing its sessions.
                with FACESWAP_LOCK, MANAGER_LOCK:
                    if "device" in data or "prefer_cpu" in data or "gpu_mode" in data:
                        dev = str(data.get("device") or data.get("gpu_mode") or "").lower().strip()
                        if dev == "gpu": dev = "auto"
                        mode = dev if dev in ("auto", "cpu", "cuda", "directml") else ("cpu" if data.get("prefer_cpu") else "auto")
                        validate_device_mode(mode)
                        MANAGER.set_device(prefer_cpu=(mode == "cpu"), device_mode=mode)
                        # Recreate face swap sessions after a device change so
                        # they cannot continue using the previous provider.
                        FACESWAP_ENGINE = None
                    if "threads" in data:
                        threads = int(data.get("threads", 4))
                        threads = max(1, min(32, threads))
                        MANAGER.set_threads(threads)
                    status = MANAGER.get_device_status()
                if not status.get("session_initialized"):
                    msg = f"AI 抠图已配置为 {status.get('device_mode')}，模型将在首次使用时加载"
                elif status.get("is_gpu_active"):
                    msg = "AI 抠图设备设置已应用"
                else:
                    msg = f"AI 抠图当前使用 CPU {status.get('threads')} 核心计算"
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
                            device_status = MANAGER.get_device_status()
                            device_mode = device_status.get("device_mode") or device_status.get("device") or "auto"
                            prefer_cpu = (device_mode == "cpu")
                        FACESWAP_ENGINE = FaceSwapEngine(prefer_cpu=prefer_cpu, device_mode=device_mode)
                    
                    if FACESWAP_ENGINE is None:
                        result = {"success": False, "error": "AI 换脸引擎组件未就绪"}
                    else:
                        fidelity = float(data.get("fidelity", 0.92))
                        mode = str(data.get("mode", "neural"))
                        result = FACESWAP_ENGINE.swap(
                            source_path=data.get("source") or data.get("input"),
                            target_path=data.get("target") or data.get("template"),
                            output_path=data.get("output"),
                            fidelity=fidelity,
                            mode=mode
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

                # Keep the live browser preview payload small while exposing the
                # same MediaPipe landmarks used by the high-resolution beauty pass.
                contour_indices = [
                    10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288,
                    397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136,
                    172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109,
                ]

                def build_face_payload(face_points):
                    def point(index):
                        value = face_points[index]
                        return [round(float(value[0]), 5), round(float(value[1]), 5)]

                    # These polygons are excluded from live skin retouching in
                    # the browser. Keeping the landmark indices here makes the
                    # realtime mask match the same face model used for tracking.
                    protected_indices = [
                        [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246],
                        [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398],
                        [70, 63, 105, 66, 107, 55, 65, 52, 53, 46],
                        [336, 296, 334, 293, 300, 276, 283, 282, 295, 285],
                        [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95],
                    ]

                    def eye_box(outer_a, outer_b, upper, lower, iris):
                        a = face_points[outer_a]
                        b = face_points[outer_b]
                        u = face_points[upper]
                        l = face_points[lower]
                        return {
                            "center": [round(float(face_points[iris][0]), 5), round(float(face_points[iris][1]), 5)],
                            "width": round(float(abs(b[0] - a[0])), 5),
                            "height": round(float(max(abs(l[1] - u[1]), 0.012)), 5),
                        }

                    face_x_min = float(face_points[:, 0].min())
                    face_x_max = float(face_points[:, 0].max())
                    face_y_min = float(face_points[:, 1].min())
                    face_y_max = float(face_points[:, 1].max())
                    return {
                        "contour": [point(index) for index in contour_indices],
                        "protect": [[point(index) for index in polygon] for polygon in protected_indices],
                        "bounds": {
                            "center": [round(float((face_x_min + face_x_max) / 2.0), 5), round(float((face_y_min + face_y_max) / 2.0), 5)],
                            "size": [round(float(face_x_max - face_x_min), 5), round(float(face_y_max - face_y_min), 5)],
                        },
                        "eyes": {
                            "left": eye_box(33, 133, 159, 145, 468),
                            "right": eye_box(263, 362, 386, 374, 473),
                        },
                        "jaw": {
                            "left": point(172),
                            "right": point(397),
                            "chin": point(152),
                        },
                    }

                face_payloads = [build_face_payload(face_points) for face_points in landmarks_list]

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
                    "size": [round(float(face_w), 3), round(float(face_h), 3)],
                    "faces": face_payloads,
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
