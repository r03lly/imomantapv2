import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  DEFAULT_BRANDING,
  applyBrandColor,
  publishBranding,
  useBranding,
  type Branding,
} from "@/hooks/use-branding";

export const Route = createFileRoute("/_authenticated/admin/pengaturan")({
  head: () => ({ meta: [{ title: "Pengaturan Aplikasi — Admin" }] }),
  component: Pengaturan,
});

type Page = "umum" | "medis" | "pasien" | "admin" | "warna";
const PAGES: { id: Page; label: string; desc: string }[] = [
  { id: "umum", label: "Halaman Depan & Umum", desc: "Nama aplikasi, tulisan halaman depan, tulisan bawah, peringatan" },
  { id: "medis", label: "Halaman Tenaga Medis", desc: "Judul, pengumuman, dan nama menu tenaga medis" },
  { id: "pasien", label: "Halaman Pasien", desc: "Judul, pengumuman, dan nama menu pasien" },
  { id: "admin", label: "Halaman Admin", desc: "Judul, pengumuman, dan nama menu admin" },
  { id: "warna", label: "Warna Aplikasi", desc: "Warna utama untuk semua halaman" },
];
const FIELDS: { page: Page; key: keyof Branding; label: string; long?: boolean; section?: string }[] = [
  { page: "umum", key: "appName", section: "Umum & Halaman Depan", label: "Nama aplikasi (tampil di atas setiap halaman)" },
  { page: "umum", key: "heroTitle", label: "Judul halaman depan" },
  { page: "umum", key: "heroHighlight", label: "Judul halaman depan (bagian berwarna)" },
  { page: "umum", key: "heroDescription", label: "Deskripsi halaman depan", long: true },
  { page: "umum", key: "ctaLabel", label: "Tulisan tombol halaman depan" },
  { page: "umum", key: "footerLine1", label: "Tulisan bawah baris 1" },
  { page: "umum", key: "footerLine2", label: "Tulisan bawah baris 2" },
  { page: "umum", key: "disclaimer", label: "Teks peringatan (disclaimer)", long: true },
  { page: "medis", key: "staffTitle", label: "Judul di atas halaman", section: "Halaman Tenaga Medis" },
  { page: "medis", key: "staffAnnouncement", label: "Pengumuman untuk tenaga medis (kosongkan jika tidak ada)", long: true },
  { page: "medis", key: "staffMenuDashboard", label: "Nama menu Dashboard" },
  { page: "medis", key: "staffMenuPasien", label: "Nama menu Pasien" },
  { page: "medis", key: "staffMenuObat", label: "Nama menu Obat" },
  { page: "medis", key: "staffMenuKepatuhan", label: "Nama menu Kepatuhan" },
  { page: "medis", key: "staffMenuKonsultasi", label: "Nama menu Konsultasi" },
  { page: "medis", key: "staffMenuEdukasi", label: "Nama menu Edukasi" },
  { page: "pasien", key: "patientTitle", label: "Judul di atas halaman (setelah nama aplikasi)", section: "Halaman Pasien" },
  { page: "pasien", key: "patientAnnouncement", label: "Pengumuman untuk pasien (kosongkan jika tidak ada)", long: true },
  { page: "pasien", key: "patientMenuDashboard", label: "Nama menu Dashboard" },
  { page: "pasien", key: "patientMenuCatat", label: "Nama menu Catat" },
  { page: "pasien", key: "patientMenuRiwayat", label: "Nama menu Riwayat" },
  { page: "pasien", key: "patientMenuObat", label: "Nama menu Obat" },
  { page: "pasien", key: "patientMenuProfil", label: "Nama menu Profil" },
  { page: "admin", key: "adminTitle", label: "Judul di atas halaman (setelah nama aplikasi)" },
  { page: "admin", key: "adminAnnouncement", label: "Pengumuman untuk admin (kosongkan jika tidak ada)", long: true },
  { page: "admin", key: "adminMenuDashboard", label: "Nama menu Dashboard" },
  { page: "admin", key: "adminMenuUsers", label: "Nama menu Users" },
  { page: "admin", key: "adminMenuAudit", label: "Nama menu Audit" },
  { page: "admin", key: "adminMenuBackup", label: "Nama menu Backup" },
  { page: "admin", key: "adminMenuPengaturan", label: "Nama menu Pengaturan" },
];

function Pengaturan() {
  const current = useBranding();
  const [form, setForm] = useState<Branding>(current);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState<Page>("umum");
  useEffect(() => setForm(current), [current]);

  const set = (k: keyof Branding, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    setSaving(true);
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("app_settings").upsert({
      key: "branding",
      value: form as never,
      updated_at: new Date().toISOString(),
      updated_by: u.user?.id,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    publishBranding(form);
    toast.success("Pengaturan disimpan");
  }

  return (
    <>
      <h1 className="text-2xl font-bold">Pengaturan Aplikasi</h1>
      <p className="text-sm text-muted-foreground">
        Ubah nama, tulisan, dan warna aplikasi. Perubahan berlaku untuk semua pengguna.
      </p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {PAGES.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPage(p.id)}
            className={`rounded-xl border p-3 text-left transition ${page === p.id ? "border-primary bg-primary/10 ring-2 ring-primary" : "bg-card hover:bg-secondary"}`}
          >
            <div className="font-semibold">{p.label}</div>
            <div className="text-xs text-muted-foreground">{p.desc}</div>
          </button>
        ))}
      </div>
      <div className="space-y-4 rounded-xl border bg-card p-4">
        <h2 className="border-b pb-1 text-lg font-semibold text-primary">
          {PAGES.find((p) => p.id === page)?.label}
        </h2>
        {FIELDS.filter((f) => f.page === page).map((f) => (
          <div key={f.key}>
          <label className="block space-y-1">
            <span className="text-sm font-medium">{f.label}</span>
            {f.long ? (
              <Textarea value={form[f.key]} onChange={(e) => set(f.key, e.target.value)} rows={3} />
            ) : (
              <Input value={form[f.key]} onChange={(e) => set(f.key, e.target.value)} />
            )}
          </label>
          </div>
        ))}
        {page === "warna" && (
        <label className="block space-y-1">
          <span className="text-sm font-medium">Warna utama</span>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={form.primaryColor || "#0f766e"}
              onChange={(e) => {
                set("primaryColor", e.target.value);
                applyBrandColor(e.target.value);
              }}
              className="h-10 w-16 cursor-pointer rounded border"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                set("primaryColor", "");
                applyBrandColor("");
              }}
            >
              Pakai warna bawaan
            </Button>
          </div>
        </label>
        )}
        <div className="flex gap-2">
          <Button onClick={save} disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan"}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const keys = page === "warna" ? (["primaryColor"] as (keyof Branding)[]) : FIELDS.filter((f) => f.page === page).map((f) => f.key);
              setForm((cur) => {
                const next = { ...cur };
                keys.forEach((k) => (next[k] = DEFAULT_BRANDING[k]));
                return next;
              });
              if (page === "warna") applyBrandColor("");
            }}
          >
            Kembalikan halaman ini ke bawaan
          </Button>
          <Button variant="outline" onClick={() => { setForm(DEFAULT_BRANDING); applyBrandColor(""); }}>
            Kembalikan semua ke bawaan
          </Button>
        </div>
      </div>
    </>
  );
}
