import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, Activity, AlertTriangle, Pill, BookOpen, Download } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminDashboard,
});

type Pending = { id: string; user_id: string; full_name: string | null; created_at: string };

function AdminDashboard() {
  const [s, setS] = useState({ users: 0, measurements: 0, abnormal: 0, meds: 0 });
  const [pending, setPending] = useState<Pending[]>([]);

  async function load() {
    const [a, b, c, d, p] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("measurements").select("*", { count: "exact", head: true }),
      supabase
        .from("measurements")
        .select("*", { count: "exact", head: true })
        .eq("is_abnormal", true),
      supabase
        .from("medications")
        .select("*", { count: "exact", head: true })
        .eq("is_approved", false),
      supabase
        .from("profiles")
        .select("id, user_id, full_name, created_at")
        .eq("is_verified", false)
        .order("created_at", { ascending: false })
        .limit(10),
    ]);
    setS({
      users: a.count ?? 0,
      measurements: b.count ?? 0,
      abnormal: c.count ?? 0,
      meds: d.count ?? 0,
    });
    setPending((p.data ?? []) as Pending[]);
  }
  useEffect(() => {
    load();
  }, []);

  const cards = [
    { label: "Total User", value: s.users, icon: Users, to: "/admin/users" },
    { label: "Total Pengukuran", value: s.measurements, icon: Activity, to: "/admin/users" },
    { label: "Pengukuran Abnormal", value: s.abnormal, icon: AlertTriangle, to: "/admin/users" },
    { label: "Obat Belum Disetujui", value: s.meds, icon: Pill, to: "/admin/users" },
  ];

  return (
    <>
      <h1 className="text-2xl font-bold">Dashboard Admin</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            to={c.to as never}
            className="rounded-xl border bg-card p-4 shadow-sm hover:shadow-md transition"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{c.label}</p>
              <c.icon className="h-5 w-5 text-primary" />
            </div>
            <p className="mt-2 text-3xl font-bold">{c.value}</p>
          </Link>
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-primary" />
          <div>
            <p className="font-semibold">Buku Panduan Penggunaan (Mobile)</p>
            <p className="text-sm text-muted-foreground">
              PDF bergambar untuk pasien, tenaga medis, dan admin.
            </p>
          </div>
        </div>
        <a
          href="/panduan/panduan-imo-mantap.pdf"
          download="Buku-Panduan-IMO-MANTAP.pdf"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Download className="h-4 w-4" /> Unduh PDF
        </a>
      </div>

      <section>
        <div className="rounded-xl border bg-card">
          <div className="border-b p-4 font-semibold">
            Pasien Menunggu Verifikasi (oleh Tenaga Medis)
          </div>
          {pending.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">Tidak ada akun menunggu.</p>
          ) : (
            <div className="divide-y">
              {pending.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{p.full_name || "(tanpa nama)"}</p>
                    <p className="text-xs text-muted-foreground">
                      Daftar: {new Date(p.created_at).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">Menunggu tenaga medis</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
