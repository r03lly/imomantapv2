"""Integration checks against the configured Lovable Cloud database."""
import json
import subprocess
import unittest


def query(sql):
    result = subprocess.run(
        ["lovable", "supabase", "query", "--json", sql],
        check=True, capture_output=True, text=True,
    )
    return json.loads(result.stdout)["rows"]


class PatientRegistrationTest(unittest.TestCase):
    def test_new_fendy_registration_is_visible_and_pending(self):
        rows = query("SELECT p.full_name, p.phone_number, p.is_verified, r.role FROM public.profiles p JOIN public.user_roles r ON r.user_id=p.user_id WHERE p.user_id='9f85438c-b72b-4ebe-8cb6-73c8a4a680b0'")
        self.assertEqual(rows, [{"full_name": "Fendy", "phone_number": "62895635178811", "is_verified": False, "role": "pasien"}])

    def test_signup_provisions_patient_records(self):
        rows = query("SELECT pg_get_triggerdef(oid) AS definition, tgenabled FROM pg_trigger WHERE tgrelid='auth.users'::regclass AND tgname='on_auth_user_created' AND NOT tgisinternal")
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]["tgenabled"], "O")
        self.assertIn("AFTER INSERT", rows[0]["definition"])
        self.assertIn("handle_new_user()", rows[0]["definition"])
        function = query("SELECT pg_get_functiondef(oid) AS definition FROM pg_proc WHERE pronamespace='public'::regnamespace AND proname='handle_new_user'")[0]["definition"]
        self.assertIn("INSERT INTO public.profiles", function)
        self.assertIn("INSERT INTO public.user_roles", function)
        self.assertIn("VALUES (NEW.id, 'pasien')", function)

    def test_existing_registration_has_patient_role(self):
        rows = query("SELECT p.is_verified, r.role FROM public.profiles p JOIN public.user_roles r ON r.user_id=p.user_id WHERE p.user_id='4b7ca741-a419-4784-916b-964e0eba0984'")
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]["role"], "pasien")

    def test_medical_staff_approval_is_saved(self):
        rows = query("SELECT is_verified, verified_by IS NOT NULL AS has_verifier FROM public.profiles WHERE user_id='4b7ca741-a419-4784-916b-964e0eba0984'")
        self.assertEqual(rows, [{"is_verified": True, "has_verifier": True}])

    def test_approved_phone_account_can_authenticate_without_email_link(self):
        rows = query("SELECT email_confirmed_at IS NOT NULL AS activated FROM auth.users WHERE id='4b7ca741-a419-4784-916b-964e0eba0984'")
        self.assertEqual(rows, [{"activated": True}])


if __name__ == "__main__":
    unittest.main()