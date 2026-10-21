/**
 * Shared auth guard for cron/webhook routes under /api/public/*.
 * Accepts either the server-only CRON_SECRET or the private database cron token
 * (used by the scheduled jobs inside the database).
 */
function safeEqual(x: string, y: string) {
  const a = new TextEncoder().encode(x);
  const b = new TextEncoder().encode(y);
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i]! ^ b[i]!;
  return diff === 0;
}

export async function isAuthorizedCronRequest(request: Request): Promise<boolean> {
  // Managed backend schedules send their own bearer credential.
  if (process.env["LOVABLE_CRON_SECRET"]) {
    try {
      const { authenticateCronRequest } = await import("@/integrations/supabase/cron-auth");
      if ((await authenticateCronRequest(request)) === null) return true;
    } catch {
      // fall through to the other checks
    }
  }
  const provided =
    request.headers.get("x-cron-secret") ??
    (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!provided) return false;

  const secret = process.env.CRON_SECRET;
  if (secret && safeEqual(provided, secret)) return true;

  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin.rpc("verify_cron_token" as never, { _token: provided } as never);
    return data === true;
  } catch {
    return false;
  }
}
