"""Keep offline face tools on the same requested device as the local service."""
import re
from pathlib import Path

DEVICES = ('auto', 'cpu', 'cuda', 'directml')


def configured_device():
    path = Path(__file__).resolve().parents[1] / 'config/my.config.inc.php'
    try:
        match = re.search(r"['\"]gpu_mode['\"]\s*=>\s*['\"]([^'\"]+)['\"]", path.read_text(encoding='utf-8'))
        if match:
            value = match[1].lower().strip()
            return value if value in DEVICES else 'auto'
    except OSError:
        pass
    return 'auto'


def add_device_argument(parser):
    parser.add_argument('--device', choices=DEVICES, default=configured_device(),
                        help='Inference device (default: local gpu_mode setting, otherwise auto)')
