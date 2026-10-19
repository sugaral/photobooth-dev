"""Use the project's explicitly enabled AI environment before native imports."""
import os
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]

try:
    from cuda_init import setup_cuda_dll_paths
    setup_cuda_dll_paths()
except ImportError:
    try:
        from bin.cuda_init import setup_cuda_dll_paths
        setup_cuda_dll_paths()
    except Exception:
        pass


def use_project_runtime():
    """A local ready marker opts in; deployments without it keep their interpreter."""
    try:
        import cv2, onnxruntime
        return
    except Exception:
        pass
    environment = ROOT / '.venv-ai'
    if not (environment / 'photobooth-runtime.ready').is_file():
        return
    if Path(sys.prefix).resolve() == environment.resolve():
        return
    executable = environment / ('Scripts/python.exe' if os.name == 'nt' else 'bin/python')
    if not executable.is_file():
        raise RuntimeError('Project AI runtime is enabled but missing: ' + str(executable))
    # Explicit argv preserves spaces/Unicode and avoids shell quoting or PATH lookup.
    os.execv(str(executable), [str(executable), '-X', 'utf8',
                             str(Path(sys.argv[0]).resolve()), *sys.argv[1:]])
