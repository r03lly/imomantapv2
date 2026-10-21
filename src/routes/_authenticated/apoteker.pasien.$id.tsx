import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { approvePatient, resetPatientPassword } from "@/lib/patient-account.functions";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Plus, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/apoteker/pasien/$id")({
  head: () => ({ meta: [
    { title: "Detail Pasien — IMO MANTAP" },
    { name: "description", content: "Profil, persetujuan, dan catatan perawatan pasien IMO MANTAP." },
    { property: "og:title", content: "Detail Pasien — IMO MANTAP" },
    { property: "og:description", content: "Kelola persetujuan dan perawatan pasien IMO MANTAP." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Detail,
});

function Detail() {
  const approve = useServerFn(approvePatient);
  const resetPassword = useServerFn(resetPatientPassword);
  const { id } = Route.useParams();
  const [profile, setProfile] = useState<any>(null);
  const [verifying, setVerifying] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [resetting, setResetting] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [meds, setMeds] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [editingLog, setEditingLog] = useState<string | null>(null);
  const [logForm, setLogForm] = useState({
    entry_date: new Date().toISOString().slice(0, 10),
    title: "",
    content: "",
    recommendation: "",
    status: "final",
  });

  const [form, setForm] = useState({
    name: "",
    disease_type: "hipertensi",
    dosage: "",
    schedule_time: "08:00",
    instructions: "",
    quantity: "30",
    unit: "tablet",
  });

  async function load() {
    const [p, m, x, l] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", id).maybeSingle(),
      supabase
        .from("measurements")
        .select("*")
        .eq("user_id", id)
        .order("measurement_time", { ascending: false })
        .limit(10),
      supabase
        .from("medications")
        .select("*")
        .eq("user_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("patient_logbook")
        .select("*")
        .eq("user_id", id)
        .order("entry_date", { ascending: false }),
    ]);
    setLoadError(p.error ? p.error.message : !p.data ? "Data pasien tidak ditemukan." : "");
    setProfile(p.data);
    setMeasurements(m.data ?? []);
    setMeds(x.data ?? []);
    setLogs(l.data ?? []);
  }
  useEffect(() => {
    load();
  }, [id]);

  function resetLogForm() {
    setEditingLog(null);
    setLogForm({
      entry_date: new Date().toISOString().slice(0, 10),
      title: "",
      content: "",
      recommendation: "",
      status: "final",
    });
  }

  async function saveLog(e: React.FormEvent) {
    e.preventDefault();
    const { data: u } = await supabase.auth.getUser();
    const payload = {
      user_id: id,
      entry_date: logForm.entry_date,
      title: logForm.title,
      content: logForm.content || null,
      recommendation: logForm.recommendation || null,
      status: logForm.status,
      updated_by: u.user?.id ?? null,
    };
    const { error } = editingLog
      ? await supabase.from("patient_logbook").update(payload).eq("id", editingLog)
      : await supabase
          .from("patient_logbook")
          .insert({ ...payload, created_by: u.user?.id ?? null });
    if (error) toast.error(error.message);
    else {
      toast.success(editingLog ? "Logbook diperbarui" : "Logbook ditambahkan");
      resetLogForm();
      load();
    }
  }

  async function deleteLog(logId: string) {
    const { error } = await supabase.from("patient_logbook").delete().eq("id", logId);
    if (error) toast.error(error.message);
    else {
      toast.success("Catatan dihapus");
      load();
    }
  }


  async function verify(v: boolean) {
    if (verifying) return;
    setVerifying(true);
    try {
      if (v) {
        setProfile(await approve({ data: { userId: id } }));
        toast.success("Pendaftaran pasien disetujui");
        return;
      }
      const { data: u, error: authError } = await supabase.auth.getUser();
      if (authError || !u.user) throw new Error("Sesi berakhir. Silakan masuk kembali.");
      const { data, error } = await supabase.from("profiles")
        .update({ is_verified: v, verified_by: v ? u.user.id : null })
        .eq("user_id", id).select("*").single();
      if (error) throw error;
      setProfile(data);
      toast.success(v ? "Pendaftaran pasien disetujui" : "Verifikasi dicabut");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Perubahan persetujuan gagal disimpan.");
    } finally {
      setVerifying(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (resetting) return;
    setResetting(true);
    try {
      await resetPassword({ data: { userId: id, newPassword } });
      setNewPassword("");
      setShowPassword(false);
      toast.success("Password pasien berhasil diubah. Sampaikan password baru kepada pasien.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Reset password gagal.");
    } finally {
      setResetting(false);
    }
  }

  async function addMed(e: React.FormEvent) {
    e.preventDefault();
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("medications").insert({
      user_id: id,
      prescribed_by: u.user?.id,
      name: form.name,
      disease_type: form.disease_type as any,
      dosage: form.dosage,
      schedule_time: form.schedule_time.split(",").map((s) => s.trim()),
      instructions: form.instructions,
      quantity: Number(form.quantity),
      unit: form.unit,
      is_active: true,
      is_approved: true,
      approved_by: u.user?.id,
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Resep ditambahkan");
      setShowForm(false);
      load();
    }
  }

  async function approveMed(mid: string, ok: boolean) {
    const { data: u } = await supabase.auth.getUser();
    await supabase
      .from("medications")
      .update({ is_approved: ok, approved_by: u.user?.id })
      .eq("id", mid);
    toast.success(ok ? "Disetujui" : "Ditolak");
    load();
  }

  return (
    <>
      <Link
        to="/apoteker/pasien"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali
      </Link>
      {loadError && <p role="alert" className="text-destructive">{loadError}</p>}
      {profile && (
        <div className="rounded-xl border bg-card p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold">{profile.full_name || "Tanpa nama"}</h1>
              <p className="text-sm text-muted-foreground">
                {profile.phone_number || "—"} · {profile.gender || "—"} · {profile.age || "—"} thn
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Target: TD {profile.target_sistolik}/{profile.target_diastolik}, GD ≤{" "}
                {profile.target_gula}, Kol ≤ {profile.target_kolesterol}
              </p>
            </div>
            <Button
              disabled={verifying}
              variant={profile.is_verified ? "outline" : "default"}
              onClick={() => verify(!profile.is_verified)}
            >
              {profile.is_verified ? (
                <>
                  <XCircle className="h-4 w-4 mr-1" />
                  Cabut Verifikasi
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Setujui Pendaftaran
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {profile && (
        <section className="space-y-3">
          <Button variant="outline" onClick={() => { setNewPassword(""); setShowPassword((v) => !v); }}>
            Reset Password Pasien
          </Button>
          {showPassword && (
            <form onSubmit={handleResetPassword} className="max-w-sm space-y-3">
              <Label htmlFor="patient-new-password">Password Baru</Label>
              <Input id="patient-new-password" type="password" autoComplete="new-password" required minLength={8} maxLength={72} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              <div className="flex gap-2">
                <Button type="submit" disabled={resetting}>{resetting ? "Menyimpan..." : "Simpan Password"}</Button>
                <Button type="button" variant="ghost" disabled={resetting} onClick={() => { setNewPassword(""); setShowPassword(false); }}>Batal</Button>
              </div>
            </form>
          )}
        </section>
      )}

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Pengukuran Terakhir (10)</h2>
        <div className="rounded-xl border bg-card divide-y">
          {measurements.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">Belum ada data.</p>
          ) : (
            measurements.map((m) => (
              <div key={m.id} className="p-3 text-sm flex items-center justify-between">
                <div>
                  <p className="font-medium capitalize">{m.disease_type}</p>
                  <p className="text-muted-foreground text-xs">
                    {new Date(m.measurement_time).toLocaleString("id-ID")}
                  </p>
                </div>
                <div className="text-right">
                  {m.disease_type === "hipertensi" && (
                    <p>
                      {m.sistolik}/{m.diastolik} mmHg
                    </p>
                  )}
                  {m.disease_type === "gula_darah" && (
                    <p>
                      GDP {m.gula_puasa ?? "-"} · GDPP {m.gula_pp ?? "-"}
                    </p>
                  )}
                  {m.disease_type === "kolesterol" && <p>{m.kolesterol} mg/dL</p>}
                  {m.is_abnormal && <span className="text-xs text-destructive">Abnormal</span>}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Resep Obat</h2>
          <Button size="sm" onClick={() => setShowForm((v) => !v)}>
            <Plus className="h-4 w-4 mr-1" />
            Resep Baru
          </Button>
        </div>
        {showForm && (
          <form onSubmit={addMed} className="rounded-xl border bg-card p-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Nama Obat</Label>
                <Input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Jenis Penyakit</Label>
                <Select
                  value={form.disease_type}
                  onValueChange={(v) => setForm({ ...form, disease_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hipertensi">Hipertensi</SelectItem>
                    <SelectItem value="gula_darah">Gula Darah</SelectItem>
                    <SelectItem value="kolesterol">Kolesterol</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Dosis</Label>
                <Input
                  required
                  placeholder="1 tablet"
                  value={form.dosage}
                  onChange={(e) => setForm({ ...form, dosage: e.target.value })}
                />
              </div>
              <div>
                <Label>Jadwal (pisah koma)</Label>
                <Input
                  required
                  placeholder="08:00, 20:00"
                  value={form.schedule_time}
                  onChange={(e) => setForm({ ...form, schedule_time: e.target.value })}
                />
              </div>
              <div>
                <Label>Kuantitas</Label>
                <Input
                  type="number"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                />
              </div>
              <div>
                <Label>Unit</Label>
                <Input
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Instruksi</Label>
              <Textarea
                value={form.instructions}
                onChange={(e) => setForm({ ...form, instructions: e.target.value })}
              />
            </div>
            <Button type="submit">Simpan Resep</Button>
          </form>
        )}
        <div className="rounded-xl border bg-card divide-y">
          {meds.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">Belum ada obat.</p>
          ) : (
            meds.map((m) => (
              <div key={m.id} className="p-3 flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {m.name} · <span className="text-xs text-muted-foreground">{m.dosage}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(m.schedule_time || []).join(", ")} · {m.disease_type}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {m.is_approved ? (
                    <span className="text-xs text-emerald-600">Disetujui</span>
                  ) : (
                    <>
                      <Button size="sm" variant="outline" onClick={() => approveMed(m.id, true)}>
                        Setujui
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Logbook Pasien</h2>
        <p className="text-xs text-muted-foreground">
          Catatan ini tampil di halaman pasien dan hanya bisa diubah apoteker.
        </p>
        <form onSubmit={saveLog} className="rounded-xl border bg-card p-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Tanggal</Label>
              <Input
                type="date"
                required
                value={logForm.entry_date}
                onChange={(e) => setLogForm({ ...logForm, entry_date: e.target.value })}
              />
            </div>
            <div>
              <Label>Judul</Label>
              <Input
                required
                placeholder="Kunjungan / monitoring"
                value={logForm.title}
                onChange={(e) => setLogForm({ ...logForm, title: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label>Catatan</Label>
            <Textarea
              value={logForm.content}
              onChange={(e) => setLogForm({ ...logForm, content: e.target.value })}
            />
          </div>
          <div>
            <Label>Rekomendasi</Label>
            <Textarea
              value={logForm.recommendation}
              onChange={(e) => setLogForm({ ...logForm, recommendation: e.target.value })}
            />
          </div>
          <div className="sm:max-w-[200px]">
            <Label>Status</Label>
            <Select
              value={logForm.status}
              onValueChange={(v) => setLogForm({ ...logForm, status: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="final">Final</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button type="submit">{editingLog ? "Simpan Perubahan" : "Tambah Catatan"}</Button>
            {editingLog && (
              <Button type="button" variant="outline" onClick={resetLogForm}>
                Batal
              </Button>
            )}
          </div>
        </form>

        <div className="rounded-xl border bg-card divide-y">
          {logs.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">Belum ada catatan logbook.</p>
          ) : (
            logs.map((l) => (
              <div key={l.id} className="p-3 space-y-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{l.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(l.entry_date).toLocaleDateString("id-ID")} · {l.status}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingLog(l.id);
                        setLogForm({
                          entry_date: l.entry_date,
                          title: l.title,
                          content: l.content ?? "",
                          recommendation: l.recommendation ?? "",
                          status: l.status,
                        });
                      }}
                    >
                      Ubah
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteLog(l.id)}>
                      Hapus
                    </Button>
                  </div>
                </div>
                {l.content && <p className="text-sm whitespace-pre-wrap">{l.content}</p>}
                {l.recommendation && (
                  <p className="text-sm text-primary whitespace-pre-wrap">{l.recommendation}</p>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </>
  );
}

