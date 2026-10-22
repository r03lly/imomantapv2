"""Prevent Vercel Hobby cron deployment regressions."""
import json
import unittest
from pathlib import Path


class VercelConfigTest(unittest.TestCase):
    def test_deployment_uses_cloud_scheduling_instead_of_vercel_crons(self):
        config = json.loads((Path(__file__).resolve().parents[1] / "vercel.json").read_text())
        self.assertFalse(config.get("crons"), "Recurring jobs must not block Vercel Hobby deployments")
        self.assertEqual(config["buildCommand"], "vite build")
        self.assertEqual(config["installCommand"], "bun install")


if __name__ == "__main__":
    unittest.main()