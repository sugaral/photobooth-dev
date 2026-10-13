#!/usr/bin/env python3
"""Photobooth CLI matting runner for BiRefNet and RMBG-2.0."""
import sys
import argparse
import json

try:
    from matting_core import MattingEngineManager, process_with_manager, DEFAULT_ENGINE
except ImportError:
    from bin.matting_core import MattingEngineManager, process_with_manager, DEFAULT_ENGINE


def process_matting(input_path, output_path, template_path=None, engine=DEFAULT_ENGINE, auto_fallback=True, template_scale=1.0, offset_x=0.0, offset_y=0.0, person_scale=1.0, person_offset_x=0.0, person_offset_y=0.0, threads=None):
    manager = MattingEngineManager(default_engine=engine, prefer_cpu=True, threads=threads)
    return process_with_manager(
        manager, input_path, output_path, template_path, engine, auto_fallback,
        template_scale=template_scale, offset_x=offset_x, offset_y=offset_y,
        person_scale=person_scale, person_offset_x=person_offset_x, person_offset_y=person_offset_y
    )


def main():
    parser = argparse.ArgumentParser(description="Photobooth SOTA AI matting runner")
    parser.add_argument("--input", required=True, help="Input image file")
    parser.add_argument("--output", required=True, help="Output image file")
    parser.add_argument("--template", default=None, help="Background template image")
    parser.add_argument("--engine", choices=("birefnet", "rmbg2", "rembg", "feynobg"), default=DEFAULT_ENGINE, help="Requested matting engine (birefnet or rmbg2)")
    parser.add_argument("--threads", type=int, default=None, help="CPU threads count for inference")
    parser.add_argument("--scale", type=float, default=1.0, help="Template scale factor")
    parser.add_argument("--offset-x", type=float, default=0.0, help="Template offset X ratio")
    parser.add_argument("--offset-y", type=float, default=0.0, help="Template offset Y ratio")
    parser.add_argument("--person-scale", type=float, default=1.0, help="Person scale factor")
    parser.add_argument("--person-offset-x", type=float, default=0.0, help="Person offset X ratio")
    parser.add_argument("--person-offset-y", type=float, default=0.0, help="Person offset Y ratio")
    parser.add_argument("--no-fallback", action="store_true", help="Do not fall back to alternate engine")
    args = parser.parse_args()

    result = process_matting(
        args.input, args.output, args.template, args.engine, not args.no_fallback,
        args.scale, args.offset_x, args.offset_y, args.person_scale, args.person_offset_x, args.person_offset_y,
        threads=args.threads
    )
    print(json.dumps(result, ensure_ascii=False))
    if not result.get("success"):
        sys.exit(1)


if __name__ == "__main__":
    main()
