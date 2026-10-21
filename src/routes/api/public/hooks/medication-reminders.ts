import { createFileRoute } from "@tanstack/react-router";
import { isAuthorizedCronRequest } from "@/lib/cron-auth.server";

/**
 * Cron endpoint: dipanggil tiap menit oleh pg_cron.
 * Cari semua jadwal obat aktif yang waktunya = jam saat ini (WIB / UTC+7),
 * lalu kirim Web Push ke semua subscription milik pasien terkait.
 *
 * Auth: `/api/public/*` bypasses platform auth on published sites — handler
 * verifies caller via the server-only CRON_SECRET (`x-cron-secret` header).
 */
export const Route = createFileRoute("/api/public/hooks/medication-reminders")({
  server: {
    handlers: {
      // Vercel Cron sends GET with Authorization: Bearer CRON_SECRET — forward to POST.
      GET: async ({ request }) =>
        fetch(new Request(request.url, { method: "POST", headers: request.headers })),
      POST: async ({ request }) => {
        if (!(await isAuthorizedCronRequest(request))) {
          return new Response("Unauthorized", { status: 401 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { localHHMM, scheduleMatches } = await import("@/lib/reminder-time");
        const now = new Date();

        const { data: subs, error: subsErr } = await supabaseAdmin
          .from("push_subscriptions")
          .select("user_id, endpoint, p256dh, auth_key, time_zone");
        if (subsErr) return new Response(subsErr.message, { status: 500 });
        if (!subs || subs.length === 0) return Response.json({ ok: true, matched: 0, sent: 0 });

        const userIds = Array.from(new Set(subs.map((s) => s.user_id)));
        const { data: meds, error: medsErr } = await supabaseAdmin
          .from("medications")
          .select("user_id, name, dosage, schedule_time")
          .eq("is_active", true)
          .eq("is_approved", true)
          .in("user_id", userIds);
        if (medsErr) return new Response(medsErr.message, { status: 500 });

        const medsByUser = new Map<string, typeof meds>();
        for (const m of meds ?? []) {
          const arr = medsByUser.get(m.user_id) ?? [];
          arr.push(m);
          medsByUser.set(m.user_id, arr);
        }

        const { getConfiguredWebPush } = await import("@/lib/web-push.server");
        const webpush = getConfiguredWebPush();

        let matched = 0;
        let sent = 0;
        const failures: number[] = [];
        const expired: string[] = [];
        for (const s of subs) {
          // Jam lokal sesuai zona waktu ponsel pasien (WIB/WITA/WIT).
          const hhmm = localHHMM(now, s.time_zone);
          const ms = (medsByUser.get(s.user_id) ?? []).filter((m) =>
            ((m.schedule_time as string[] | null) ?? []).some((t) => scheduleMatches(t, hhmm)),
          );
          if (ms.length === 0) continue;
          matched += ms.length;
          const title =
            ms.length === 1 ? `💊 ${ms[0].name} · ${hhmm}` : `💊 ${ms.length} obat · ${hhmm}`;
          const body =
            ms.length === 1
              ? ms[0].dosage || "Saatnya minum obat"
              : ms.map((m) => `• ${m.name}${m.dosage ? ` (${m.dosage})` : ""}`).join("\n");

          try {
            await webpush.sendNotification(
              { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth_key } },
              JSON.stringify({ title, body, tag: `med-${hhmm}`, url: "/pasien/obat" }),
            );
            sent++;
          } catch (err: unknown) {
            const e = err as { statusCode?: number };
            failures.push(e?.statusCode ?? 0);
            if (e?.statusCode === 404 || e?.statusCode === 410) expired.push(s.endpoint);
          }
        }

        if (expired.length > 0) {
          await supabaseAdmin.from("push_subscriptions").delete().in("endpoint", expired);
        }
        if (matched > 0) {
          console.log(`[medication-reminders] matched=${matched} sent=${sent} failed=${failures.join(",")}`);
        }

        return Response.json({ ok: true, matched, sent, expiredRemoved: expired.length });
      },
    },
  },
});
