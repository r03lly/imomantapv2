import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { loadPatientsAdherence, type PatientAdherenceRow } from "@/lib/adherence.functions";
import { supabase } from "@/integrations/supabase/client";
import {
  loadPatientFullDetail,
  type PatientFullDetail,
} from "@/lib/patient-detail.functions";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  ChevronRight,
  AlertTriangle,
  ShieldCheck,
  Pill,
  User,
  Phone,
  MapPin,
  CalendarDays,
  Activity,
  ClipboardList,
  MessageSquare,
  BookOpen,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/apoteker/kepatuhan")({
  head: () => ({ meta: [
    { title: "Kepatuhan Pasien — Tenaga Medis | IMO MANTAP" },
    { name: "description", content: "Pantau kepatuhan minum obat dan detail kesehatan pasien di IMO MANTAP." },
    { property: "og:title", content: "Kepatuhan Pasien — IMO MANTAP" },
    { property: "og:description", content: "Ringkasan kepatuhan dan detail kesehatan pasien untuk tenaga medis." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: KepatuhanPage,
});

function pctColor(p: number, has: boolean) {
  if (!has) return "text-muted-foreground";
  if (p >= 80) return "text-emerald-600";
  if (p >= 50) return "text-amber-600";
  return "text-red-600";
}
function pctBg(p: number, has: boolean) {
  if (!has) return "bg-secondary";
  if (p >= 80) return "bg-emerald-500";
  if (p >= 50) return "bg-amber-500";
  return "bg-red-500";
}

const DISEASE_LABEL: Record<string, string> = {
  hipertensi: "Hipertensi",
  kolesterol: "Kolesterol",
  gula_darah: "Gula Darah",
};

function fmtDate(s: string | null | undefined) {
  if (!s) return "—";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}
function fmtDateTime(s: string | null | undefined) {
  if (!s) return "—";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function KepatuhanPage() {
  const fetchRows = useCallback(() => loadPatientsAdherence(supabase), []);
  const fetchDetail = useCallback(
    ({ data }: { data: { userId: string } }) => loadPatientFullDetail(supabase, data.userId),
    [],
  );
  const [rows, setRows] = useState<PatientAdherenceRow[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [detailFor, setDetailFor] = useState<{ id: string; name: string } | null>(null);
  const [detail, setDetail] = useState<PatientFullDetail | null>(null);
  const [detailErr, setDetailErr] = useState<string | null>(null);

  useEffect(() => {
    fetchRows()
      .then((r) => setRows(r))
      .catch((e: Error) => setErr(e.message));
  }, [fetchRows]);

  function openDetail(r: PatientAdherenceRow) {
    setDetail(null);
    setDetailErr(null);
    setDetailFor({ id: r.user_id, name: r.full_name || "Tanpa nama" });
    fetchDetail({ data: { userId: r.user_id } })
      .then((d) => setDetail(d))
      .catch((e: Error) => setDetailErr(e.message));
  }

  if (err) return <div className="rounded-xl border bg-card p-6 text-sm text-red-600">{err}</div>;
  if (rows === null) return <div className="py-8 text-center text-muted-foreground">Memuat...</div>;

  const summary = rows.reduce(
    (acc, r) => {
      acc.total += 1;
      if (r.pct7 >= 80) acc.good += 1;
      else if (r.pct7 >= 50) acc.mid += 1;
      else if (r.active_meds > 0) acc.low += 1;
      acc.missed += r.missed7;
      return acc;
    },
    { total: 0, good: 0, mid: 0, low: 0, missed: 0 },
  );

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold">Kepatuhan Pasien</h1>
        <p className="text-sm text-muted-foreground">
          Ringkasan kepatuhan minum obat 7 & 30 hari terakhir. Klik nama pasien untuk melihat
          detail lengkap.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Total Pasien" value={summary.total} icon={Pill} />
        <Stat label="Patuh (≥80%)" value={summary.good} icon={ShieldCheck} tone="emerald" />
        <Stat label="Perlu Perhatian" value={summary.low} icon={AlertTriangle} tone="red" />
        <Stat
          label="Dosis Terlewat 7 hari"
          value={summary.missed}
          icon={AlertTriangle}
          tone="amber"
        />
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="grid grid-cols-12 gap-2 px-4 py-2 border-b text-xs font-semibold text-muted-foreground bg-secondary/50">
          <div className="col-span-4">Nama</div>
          <div className="col-span-2 text-center">Obat Aktif</div>
          <div className="col-span-2 text-center">7 hari</div>
          <div className="col-span-2 text-center">30 hari</div>
          <div className="col-span-1 text-center">Missed</div>
          <div className="col-span-1" />
        </div>
        {rows.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted-foreground">Belum ada pasien.</p>
        ) : (
          rows.map((r) => {
            const has = r.active_meds > 0;
            return (
              <button
                key={r.user_id}
                type="button"
                onClick={() => openDetail(r)}
                className="grid w-full grid-cols-12 gap-2 px-4 py-3 border-b last:border-0 hover:bg-secondary/50 items-center text-left"
              >
                <div className="col-span-4 font-medium truncate text-primary underline-offset-2 hover:underline">
                  {r.full_name || "Tanpa nama"}
                </div>
                <div className="col-span-2 text-center text-sm">{r.active_meds}</div>
                <div className="col-span-2 text-center">
                  <div className={`text-sm font-semibold ${pctColor(r.pct7, has)}`}>
                    {has ? `${r.pct7}%` : "—"}
                  </div>
                  {has && (
                    <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className={`h-full ${pctBg(r.pct7, has)}`}
                        style={{ width: `${r.pct7}%` }}
                      />
                    </div>
                  )}
                </div>
                <div
                  className={`col-span-2 text-center text-sm font-semibold ${pctColor(r.pct30, has)}`}
                >
                  {has ? `${r.pct30}%` : "—"}
                </div>
                <div className="col-span-1 text-center text-sm">
                  {r.missed7 > 0 ? (
                    <span className="text-red-600 font-semibold">{r.missed7}</span>
                  ) : (
                    "—"
                  )}
                </div>
                <div className="col-span-1 flex justify-end">
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </button>
            );
          })
        )}
      </div>

      <Sheet open={detailFor !== null} onOpenChange={(o) => !o && setDetailFor(null)}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{detailFor?.name ?? "Detail Pasien"}</SheetTitle>
            <SheetDescription>Detail lengkap pasien</SheetDescription>
          </SheetHeader>

          {detailErr && <p className="mt-4 text-sm text-red-600">{detailErr}</p>}
          {!detail && !detailErr && (
            <p className="mt-6 text-center text-sm text-muted-foreground">Memuat detail...</p>
          )}

          {detail && detailFor && (
            <div className="mt-4 space-y-6 pb-8">
              <Link
                to="/apoteker/pasien/$id"
                params={{ id: detailFor.id }}
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                Buka halaman pasien <ChevronRight className="h-4 w-4" />
              </Link>

              {/* Profil */}
              <Section icon={User} title="Profil">
                {detail.profile ? (
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <Item label="Nama" value={detail.profile.full_name} />
                    <Item label="Jenis Kelamin" value={detail.profile.gender} />
                    <Item label="Usia" value={detail.profile.age != null ? `${detail.profile.age} th` : null} />
                    <Item label="Terverifikasi" value={detail.profile.is_verified ? "Ya" : "Belum"} />
                    <Item
                      label="Tinggi / Berat"
                      value={
                        detail.profile.height || detail.profile.weight
                          ? `${detail.profile.height ?? "—"} cm / ${detail.profile.weight ?? "—"} kg`
                          : null
                      }
                    />
                    <Item
                      label="Kontak Darurat"
                      value={detail.profile.emergency_contact}
                    />
                    <div className="col-span-2 flex items-start gap-1.5">
                      <Phone className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm">{detail.profile.phone_number ?? "—"}</span>
                    </div>
                    <div className="col-span-2 flex items-start gap-1.5">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm">{detail.profile.address ?? "—"}</span>
                    </div>
                  </dl>
                ) : (
                  <p className="text-sm text-muted-foreground">Profil belum diisi.</p>
                )}
              </Section>

              {/* Target kesehatan */}
              {detail.profile && (
                <Section icon={Activity} title="Target Kesehatan">
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <Item label="Sistolik" value={detail.profile.target_sistolik?.toString()} />
                    <Item label="Diastolik" value={detail.profile.target_diastolik?.toString()} />
                    <Item label="Kolesterol" value={detail.profile.target_kolesterol?.toString()} />
                    <Item label="Gula Puasa" value={detail.profile.target_gula_puasa?.toString()} />
                    <Item label="Gula PP" value={detail.profile.target_gula_pp?.toString()} />
                  </dl>
                </Section>
              )}

              {/* Kepatuhan */}
              <Section icon={ShieldCheck} title="Kepatuhan">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "7 hari", s: detail.summary7 },
                    { label: "30 hari", s: detail.summary30 },
                  ].map(({ label, s }) => (
                    <div key={label} className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className={`text-xl font-bold ${pctColor(s.pct, s.total > 0)}`}>
                        {s.total > 0 ? `${s.pct}%` : "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {s.taken}/{s.total} diminum · {s.late} telat · {s.missed} terlewat
                      </p>
                    </div>
                  ))}
                </div>
              </Section>

              {/* Obat */}
              <Section icon={Pill} title={`Obat (${detail.medications.length})`}>
                {detail.medications.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Belum ada obat.</p>
                ) : (
                  <ul className="space-y-2">
                    {detail.medications.map((m) => (
                      <li key={m.id} className="rounded-lg border p-3 text-sm">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium">{m.name}</span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] ${
                              m.is_active
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-secondary text-muted-foreground"
                            }`}
                          >
                            {m.is_active ? "Aktif" : "Nonaktif"}
                          </span>
                        </div>
                        <p className="text-muted-foreground">
                          {DISEASE_LABEL[m.disease_type] ?? m.disease_type}
                          {m.dosage ? ` · ${m.dosage}${m.unit ? ` ${m.unit}` : ""}` : ""}
                        </p>
                        {m.schedule_time.length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            Jadwal: {m.schedule_time.join(", ")}
                          </p>
                        )}
                        {m.instructions && (
                          <p className="text-xs text-muted-foreground">{m.instructions}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </Section>

              {/* Pengukuran terakhir */}
              <Section icon={Activity} title={`Pengukuran Terakhir (${detail.measurements.length})`}>
                {detail.measurements.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Belum ada pengukuran.</p>
                ) : (
                  <ul className="space-y-2">
                    {detail.measurements.map((m) => (
                      <li key={m.id} className="rounded-lg border p-3 text-sm">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium">
                            {DISEASE_LABEL[m.disease_type] ?? m.disease_type}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {fmtDateTime(m.measurement_time)}
                          </span>
                        </div>
                        <p className="text-muted-foreground">
                          {m.sistolik != null && `TD ${m.sistolik}/${m.diastolik ?? "—"} · `}
                          {m.kolesterol != null && `Kol ${m.kolesterol} · `}
                          {m.gula_puasa != null && `GDS ${m.gula_puasa} · `}
                          {m.gula_pp != null && `GPP ${m.gula_pp}`}
                          {m.is_abnormal && (
                            <span className="ml-1 font-semibold text-red-600">(Abnormal)</span>
                          )}
                        </p>
                        {m.notes && <p className="text-xs text-muted-foreground">{m.notes}</p>}
                      </li>
                    ))}
                  </ul>
                )}
              </Section>

              {/* Jadwal kontrol */}
              <Section icon={CalendarDays} title={`Jadwal Kontrol (${detail.appointments.length})`}>
                {detail.appointments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Belum ada jadwal.</p>
                ) : (
                  <ul className="space-y-2">
                    {detail.appointments.map((a) => (
                      <li key={a.id} className="rounded-lg border p-3 text-sm">
                        <span className="font-medium">
                          {fmtDate(a.appointment_date)}
                          {a.appointment_time ? ` ${a.appointment_time}` : ""}
                        </span>
                        <p className="text-muted-foreground">
                          {[a.doctor_name, a.hospital_name].filter(Boolean).join(" · ") || "—"}
                        </p>
                        {a.notes && <p className="text-xs text-muted-foreground">{a.notes}</p>}
                      </li>
                    ))}
                  </ul>
                )}
              </Section>

              {/* Riwayat minum obat */}
              <Section icon={ClipboardList} title={`Riwayat 7 Hari (${detail.recentLogs.length})`}>
                {detail.recentLogs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Belum ada catatan.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {detail.recentLogs.map((l) => (
                      <li
                        key={l.id}
                        className="flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
                      >
                        <span className="truncate">
                          {l.medications?.name ?? "Obat"}
                          <span className="ml-1 text-xs text-muted-foreground">
                            {fmtDate(l.scheduled_date)}
                            {l.scheduled_time ? ` ${l.scheduled_time}` : ""}
                          </span>
                        </span>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                            l.status === "missed"
                              ? "bg-red-100 text-red-700"
                              : l.status === "late"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {l.status === "missed" ? "Terlewat" : l.status === "late" ? "Telat" : "Diminum"}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </Section>

              {/* Logbook */}
              <Section icon={BookOpen} title={`Logbook (${detail.logbook.length})`}>
                {detail.logbook.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Belum ada logbook.</p>
                ) : (
                  <ul className="space-y-2">
                    {detail.logbook.map((b) => (
                      <li key={b.id} className="rounded-lg border p-3 text-sm">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium">{b.title}</span>
                          <span className="text-xs text-muted-foreground">{fmtDate(b.entry_date)}</span>
                        </div>
                        {b.content && <p className="text-muted-foreground">{b.content}</p>}
                        {b.recommendation && (
                          <p className="text-xs text-muted-foreground">
                            Rekomendasi: {b.recommendation}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </Section>

              {/* Konsultasi */}
              <Section icon={MessageSquare} title={`Konsultasi (${detail.consultations.length})`}>
                {detail.consultations.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Belum ada konsultasi.</p>
                ) : (
                  <ul className="space-y-2">
                    {detail.consultations.map((c) => (
                      <li key={c.id} className="rounded-lg border p-3 text-sm">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium">{c.title ?? "Konsultasi"}</span>
                          <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px]">
                            {c.status ?? "—"}
                          </span>
                        </div>
                        {c.description && <p className="text-muted-foreground">{c.description}</p>}
                        <p className="text-xs text-muted-foreground">{fmtDateTime(c.created_at)}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </Section>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Pill;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
        <Icon className="h-4 w-4 text-primary" /> {title}
      </h3>
      {children}
    </section>
  );
}

function Item({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value ?? "—"}</dd>
    </div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
  tone = "primary",
}: {
  label: string;
  value: number;
  icon: typeof Pill;
  tone?: "primary" | "emerald" | "red" | "amber";
}) {
  const toneCls = {
    primary: "bg-primary/10 text-primary",
    emerald: "bg-emerald-100 text-emerald-700",
    red: "bg-red-100 text-red-700",
    amber: "bg-amber-100 text-amber-700",
  }[tone];
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className={`mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg ${toneCls}`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
