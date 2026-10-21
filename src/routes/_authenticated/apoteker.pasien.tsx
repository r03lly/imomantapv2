import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { approvePatient } from "@/lib/patient-account.functions";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Search, ChevronRight, CheckCircle2, Clock, UserCheck } from "lucide-react";

export const Route = createFileRoute("/_authenticated/apoteker/pasien")({
  head: () => ({ meta: [
    { title: "Persetujuan Pasien — IMO MANTAP" },
    { name: "description", content: "Daftar pasien dan persetujuan pendaftaran oleh tenaga medis IMO MANTAP." },
    { property: "og:title", content: "Persetujuan Pasien — IMO MANTAP" },
    { property: "og:description", content: "Kelola persetujuan pendaftaran pasien IMO MANTAP." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: PasienList,
});

type Row = {
  user_id: string;
  full_name: string | null;
  phone_number: string | null;
  is_verified: boolean | null;
  age: number | null;
};

function PasienList() {
  const approve = useServerFn(approvePatient);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState("");
  const [approving, setApproving] = useState<string | null>(null);

  async function load() {
    const ids =
      (await supabase.from("user_roles").select("user_id").eq("role", "pasien")).data?.map(
        (r) => r.user_id,
      ) ?? [];
    if (!ids.length) return setRows([]);
    const { data } = await supabase
      .from("profiles")
      .select("user_id, full_name, phone_number, is_verified, age")
      .in("user_id", ids);
    setRows((data ?? []) as Row[]);
  }

  useEffect(() => {
    load();
  }, []);

  async function confirmPatient(r: Row) {
    if (approving) return;
    setApproving(r.user_id);
    try {
      const data = await approve({ data: { userId: r.user_id } });
      if (!data.is_verified) throw new Error("Persetujuan belum tersimpan. Silakan coba lagi.");
      setRows((current) => current.map((row) => row.user_id === data.user_id ? { ...row, is_verified: true } : row));
      toast.success(`Pendaftaran ${r.full_name || "pasien"} disetujui`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Persetujuan gagal. Silakan coba lagi.");
    } finally {
      setApproving(null);
    }
  }


  const filtered = rows.filter(
    (r) => !q || (r.full_name ?? "").toLowerCase().includes(q.toLowerCase()),
  );

  const pending = filtered.filter((r) => !r.is_verified);
  const verified = filtered.filter((r) => r.is_verified);

  if (path.replace(/\/$/, "") !== "/apoteker/pasien") return <Outlet />;

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Daftar Pasien</h1>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Cari nama..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      {pending.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-600" />
            Menunggu Konfirmasi Pendaftaran ({pending.length})
          </h2>
          <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 divide-y divide-amber-200">
            {pending.map((r) => (
              <div key={r.user_id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium">{r.full_name || "Tanpa nama"}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.phone_number || "—"} {r.age ? `· ${r.age} thn` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" disabled={approving !== null} onClick={() => confirmPatient(r)}>
                    <UserCheck className="h-4 w-4 mr-1" />
                    {approving === r.user_id ? "Menyetujui..." : "Setujui Pendaftaran"}
                  </Button>
                  <Link
                    to="/apoteker/pasien/$id"
                    params={{ id: r.user_id }}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Detail
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
      <div className="rounded-xl border bg-card divide-y">
        {verified.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted-foreground">
            {pending.length > 0 ? "Belum ada pasien terkonfirmasi." : "Belum ada pasien."}
          </p>
        ) : (
          verified.map((r) => (
            <Link
              key={r.user_id}
              to="/apoteker/pasien/$id"
              params={{ id: r.user_id }}
              className="flex items-center justify-between p-4 hover:bg-secondary/50"
            >
              <div>
                <p className="font-medium">{r.full_name || "Tanpa nama"}</p>
                <p className="text-xs text-muted-foreground">
                  {r.phone_number || "—"} {r.age ? `· ${r.age} thn` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {r.is_verified ? (
                  <span className="flex items-center gap-1 text-xs text-emerald-600">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-amber-600">
                    <Clock className="h-3 w-3" />
                    Pending
                  </span>
                )}
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
          ))
        )}
      </div>
    </>
  );
}
