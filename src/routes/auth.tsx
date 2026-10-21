import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Activity } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { fetchUserRole } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Disclaimer } from "@/components/Disclaimer";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [
    { title: "Masuk / Daftar — IMO MANTAP" },
    { name: "description", content: "Masuk atau daftar akun pasien IMO MANTAP." },
    { property: "og:title", content: "Masuk / Daftar — IMO MANTAP" },
    { property: "og:description", content: "Akses akun pasien dan tenaga medis IMO MANTAP." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: AuthPage,
});

function AuthPage() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  // Hindari beda tampilan antara render server dan browser.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Cek sesi lama SEBELUM form ditampilkan, supaya tidak terjadi
  // redirect mendadak saat pengguna sedang mengetik.
  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      if (data.session) {
        const role = await fetchUserRole(data.session.user.id);
        if (!active) return;
        nav({ to: roleHome(role), replace: true });
        return;
      }
      setCheckingSession(false);
    });
    return () => {
      active = false;
    };
  }, [nav]);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPw, setLoginPw] = useState("");

  const [regMethod, setRegMethod] = useState<"email" | "phone">("email");
  const [regEmail, setRegEmail] = useState("");
  const [regPw, setRegPw] = useState("");
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const identifier = loginEmail.trim();
    // Email asli, No. HP, atau kode responden (mis. "R1").
    const email = identifier.includes("@")
      ? identifier.toLowerCase()
      : isPhoneLike(identifier)
        ? phoneEmail(identifier)
        : `${identifier.toLowerCase()}@pasien.imomantap.com`;
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: loginPw,
    });
    setLoading(false);
    if (error) return toast.error(translateAuthError(error.message));
    const role = await fetchUserRole(data.user.id);
    if (role === "pasien") {
      const { data: prof } = await supabase
        .from("profiles")
        .select("is_verified")
        .eq("user_id", data.user.id)
        .maybeSingle();
      if (!prof?.is_verified) {
        await supabase.auth.signOut();
        return toast.error("Akun Anda belum disetujui tenaga medis. Silakan tunggu persetujuan.");
      }
    }
    toast.success("Selamat datang!");
    nav({ to: roleHome(role), replace: true });
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (regPw.length < 6) return toast.error("Password minimal 6 karakter.");
    if (regMethod === "phone" && !isPhoneLike(regPhone)) {
      return toast.error("Nomor HP tidak valid. Contoh: 081234567890");
    }
    setLoading(true);
    const phone = regMethod === "phone" ? normalizePhone(regPhone) : "";
    // Pendaftaran lewat No. HP tidak memakai SMS: nomor dipakai sebagai identitas masuk.
    const email = regMethod === "email" ? regEmail.trim().toLowerCase() : phoneEmail(regPhone);
    const { data, error } = await supabase.auth.signUp({
      email,
      password: regPw,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          full_name: regName.trim(),
          phone_number: phone,
          role: "pasien",
        },
      },
    });
    setLoading(false);
    if (error) return toast.error(translateAuthError(error.message));
    if (data.session) await supabase.auth.signOut();
    toast.success(
      "Pendaftaran berhasil. Akun Anda menunggu persetujuan tenaga medis sebelum bisa masuk.",
      { duration: 8000 },
    );
  }


  if (checkingSession) {
    return mounted ? (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Memuat...
      </div>
    ) : null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/40 to-background px-4 py-8">
      <div className="mx-auto max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2">
          <Activity className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">IMO MANTAP</span>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Masuk</TabsTrigger>
              <TabsTrigger value="register">Daftar</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="le">Email, No. HP, atau Kode Pasien</Label>
                  <Input
                    id="le"
                    type="text"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="lp">Password</Label>
                  <Input
                    id="lp"
                    type="password"
                    required
                    value={loginPw}
                    onChange={(e) => setLoginPw(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Memproses..." : "Masuk"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="rn">Nama Lengkap</Label>
                  <Input
                    id="rn"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Daftar menggunakan</Label>
                  <div className="mt-1 grid grid-cols-2 gap-2 rounded-md bg-muted p-1">
                    <button
                      type="button"
                      onClick={() => setRegMethod("email")}
                      className={`rounded px-3 py-1.5 text-sm font-medium transition ${
                        regMethod === "email" ? "bg-background shadow-sm" : "text-muted-foreground"
                      }`}
                    >
                      Email
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegMethod("phone")}
                      className={`rounded px-3 py-1.5 text-sm font-medium transition ${
                        regMethod === "phone" ? "bg-background shadow-sm" : "text-muted-foreground"
                      }`}
                    >
                      No. HP
                    </button>
                  </div>
                </div>
                {regMethod === "email" ? (
                  <div>
                    <Label htmlFor="re">Email</Label>
                    <Input
                      id="re"
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                    />
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="rphone">No. HP (WhatsApp)</Label>
                    <Input
                      id="rphone"
                      type="tel"
                      inputMode="tel"
                      placeholder="081234567890"
                      required
                      pattern="[0-9+\-\s]{8,20}"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Nomor ini juga dipakai untuk masuk. Contoh: 081234567890
                    </p>

                  </div>
                )}
                <div>
                  <Label htmlFor="rp">Password (min. 6 karakter)</Label>
                  <Input
                    id="rp"
                    type="password"
                    minLength={6}
                    required
                    value={regPw}
                    onChange={(e) => setRegPw(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Memproses..." : "Daftar"}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Akun baru perlu diverifikasi oleh tenaga medis sebelum dapat digunakan sepenuhnya.
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        <Disclaimer />
      </div>
    </div>
  );
}

function roleHome(role: string | null): "/pasien" | "/apoteker" | "/admin" {
  if (role === "apoteker") return "/apoteker";
  if (role === "admin") return "/admin";
  return "/pasien";
}

/** Ubah 08xx / +628xx / 628xx menjadi satu bentuk baku: 628xx. */
function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  if (digits.startsWith("8")) return `62${digits}`;
  return digits;
}

function isPhoneLike(raw: string): boolean {
  const digits = raw.replace(/\D/g, "");
  return /^[0-9+\-\s()]+$/.test(raw.trim()) && digits.length >= 8 && digits.length <= 15;
}

/** Identitas masuk internal untuk pendaftaran memakai No. HP (tanpa SMS). */
function phoneEmail(raw: string): string {
  return `${normalizePhone(raw)}@hp.imomantap.com`;
}

function translateAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("already registered") || m.includes("already been registered"))
    return "Akun dengan email/No. HP ini sudah terdaftar. Silakan masuk.";
  if (m.includes("invalid login credentials"))
    return "Email/No. HP atau password salah.";
  if (m.includes("email not confirmed"))
    return "Akun belum diaktifkan. Jika mendaftar dengan No. HP, minta tenaga medis menyetujui pendaftaran; jika menggunakan email, buka tautan konfirmasi email.";
  if (m.includes("password should be at least")) return "Password minimal 6 karakter.";
  if (m.includes("pwned") || m.includes("compromised") || m.includes("easy to guess"))
    return "Password terlalu mudah ditebak. Gunakan kombinasi yang lebih unik.";
  if (m.includes("email address") && m.includes("invalid")) return "Format email tidak valid.";
  if (m.includes("signups are disabled")) return "Pendaftaran sedang dinonaktifkan.";
  return message;
}

