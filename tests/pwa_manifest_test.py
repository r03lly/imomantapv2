import json
import struct
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class ManifestIconsTest(unittest.TestCase):
    def test_manifest_has_real_png_icons_in_required_sizes(self):
        manifest = json.loads((ROOT / "public/manifest.webmanifest").read_text())
        for size in (192, 512):
            with self.subTest(size=size):
                entry = next(icon for icon in manifest["icons"] if icon["sizes"] == f"{size}x{size}" and icon["purpose"] == "any")
                data = (ROOT / "public" / entry["src"].lstrip("/")).read_bytes()
                self.assertEqual(data[:8], b"\x89PNG\r\n\x1a\n")
                self.assertEqual(struct.unpack(">II", data[16:24]), (size, size))
                self.assertEqual(entry["type"], "image/png")


if __name__ == "__main__":
    unittest.main()