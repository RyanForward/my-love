"""Gera public/favicon.ico (PNG embutido em ICO). Rodar: python scripts/make_favicon_ico.py"""
import struct
import zlib
from pathlib import Path


def png_chunk(tag: bytes, data: bytes) -> bytes:
    crc = zlib.crc32(tag + data) & 0xFFFFFFFF
    return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", crc)


def main() -> None:
    w = h = 1
    raw = b"\x00" + bytes([255, 80, 100, 255])
    ihdr = struct.pack(">IIBBBBB", w, h, 8, 6, 0, 0, 0)
    png = (
        b"\x89PNG\r\n\x1a\n"
        + png_chunk(b"IHDR", ihdr)
        + png_chunk(b"IDAT", zlib.compress(raw, 9))
        + png_chunk(b"IEND", b"")
    )
    image_offset = 22
    ico = struct.pack("<HHH", 0, 1, 1) + struct.pack(
        "<BBBBHHII",
        w,
        h,
        0,
        0,
        1,
        32,
        len(png),
        image_offset,
    )
    ico += png
    root = Path(__file__).resolve().parents[1]
    out = root / "public" / "favicon.ico"
    out.write_bytes(ico)


if __name__ == "__main__":
    main()
