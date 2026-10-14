import os
# Put worker threads into passive sleep immediately on idle to prevent heat accumulation
os.environ["OMP_WAIT_POLICY"] = "PASSIVE"
os.environ["KMP_BLOCKTIME"] = "0"

import json
import threading
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler

try:
    from matting_core import MattingEngineManager, process_with_manager, DEFAULT_ENGINE, get_persisted_threads
except ImportError:
    from bin.matting_core import MattingEngineManager, process_with_manager, DEFAULT_ENGINE, get_persisted_threads

try:
    from beauty_core import BeautyEngine
except ImportError:
    from bin.beauty_core import BeautyEngine

HOST = "127.0.0.1"
PORT = 8001
MANAGER = MattingEngineManager(default_engine=DEFAULT_ENGINE, prefer_cpu=True, threads=get_persisted_threads())
MANAGER_LOCK = threading.Lock()
BEAUTY_ENGINE = None
BEAUTY_LOCK = threading.Lock()


class RembgHandler(BaseHTTPRequestHandler):
    def _json(self, payload, status=200):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path == "/health":
            with MANAGER_LOCK:
                diagnostics = MANAGER.diagnostics()
            self._json({
                "status": "ok",
                "default_engine": diagnostics.get("default_engine"),
                "threads": diagnostics.get("threads"),
                "max_system_threads": diagnostics.get("max_system_threads"),
                "engines": diagnostics.get("engines"),
            })
        elif self.path in ("/threads", "/cpu"):
            with MANAGER_LOCK:
                self._json({
                    "status": "ok",
                    "threads": MANAGER.threads,
                    "max_threads": os.cpu_count() or 4,
                })
        else:
            self._json({"error": "Not Found"}, 404)

    def do_POST(self):
        if self.path in ("/threads", "/cpu"):
            try:
                length = int(self.headers.get("Content-Length", 0))
                data = json.loads(self.rfile.read(length).decode("utf-8")) if length > 0 else {}
                threads = int(data.get("threads", 4))
                threads = max(1, min(32, threads))
                with MANAGER_LOCK:
                    MANAGER.set_threads(threads)
                self._json({
                    "status": "ok",
                    "success": True,
                    "threads": MANAGER.threads,
                    "message": f"AI抠图已即时切换为 {MANAGER.threads} 核心并行计算",
                })
            except Exception as exc:
                self._json({"success": False, "error": str(exc)}, 500)
            return

        if self.path == "/beauty":
            try:
                length = int(self.headers.get("Content-Length", 0))
                data = json.loads(self.rfile.read(length).decode("utf-8")) if length > 0 else {}
                global BEAUTY_ENGINE
                with BEAUTY_LOCK:
                    if BEAUTY_ENGINE is None:
                        BEAUTY_ENGINE = BeautyEngine()
                    result = BEAUTY_ENGINE.process_image(
                        input_path=data.get("input"),
                        output_path=data.get("output"),
                        eye=float(data.get("eye", 15)),
                        slim=float(data.get("slim", 15)),
                        smooth=float(data.get("smooth", 20)),
                        white=float(data.get("white", 15)),
                        preview=bool(data.get("preview", False)),
                        preview_max=int(data.get("preview_max", 960)),
                    )
                self._json(result, 200 if result.get("success") else 500)
            except Exception as exc:
                self._json({"success": False, "error": str(exc)}, 500)
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
