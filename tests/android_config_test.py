import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class AndroidConfigTest(unittest.TestCase):
    def test_android_loads_requested_vercel_site_over_https(self):
        config = json.loads((ROOT / 'android/app/src/main/assets/capacitor.config.json').read_text())
        self.assertEqual(config['server']['url'], 'https://imomantap.vercel.app')
        self.assertFalse(config['server']['cleartext'])

    def test_android_studio_resolves_modules_without_node(self):
        settings = (ROOT / 'android/capacitor.settings.gradle').read_text()
        self.assertNotIn('node_modules', settings)
        self.assertIn("apply from: 'native-dependencies.gradle'", settings)
        self.assertTrue((ROOT / 'android/native-dependencies.gradle').is_file())


if __name__ == '__main__':
    unittest.main()