import { urlBase64ToUint8Array } from "@/lib/push-config";

export type VapidKeys = { publicKey: string; privateKey: string; subject: string };

const DEFAULT_SUBJECT = "mailto:admin@imomantap.com";

function toB64url(b: Uint8Array): string {
  let s = "";
  for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]!);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(s: string): Uint8Array {
  const pad = "=".repeat((4 - (s.length % 4)) % 4);
  const raw = atob((s + pad).replace(/-/g, "+").replace(/_/g, "/"));
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

/** True when the public/private pair is a usable P-256 VAPID key pair. */
export async function isValidVapidPair(publicKey: string, privateKey: string): Promise<boolean> {
  try {
    const pub = urlBase64ToUint8Array(publicKey);
    const d = privateKey.trim().replace(/=+$/, "");
    if (!/^[A-Za-z0-9_-]{43}$/.test(d)) return false;
    const key = await crypto.subtle.importKey(
      "jwk",
      { kty: "EC", crv: "P-256", d, x: toB64url(pub.slice(1, 33)), y: toB64url(pub.slice(33, 65)) },
      { name: "ECDSA", namedCurve: "P-256" },
      false,
      ["sign"],
    );
    return !!key;
  } catch {
    return false;
  }
}

export async function generateVapidPair(): Promise<{ publicKey: string; privateKey: string }> {
  const pair = (await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, [
    "sign",
    "verify",
  ])) as CryptoKeyPair;
  const jwk = (await crypto.subtle.exportKey("jwk", pair.privateKey)) as JsonWebKey;
  const pub = new Uint8Array(65);
  pub[0] = 4;
  pub.set(fromB64url(jwk.x!), 1);
  pub.set(fromB64url(jwk.y!), 33);
  return { publicKey: toB64url(pub), privateKey: jwk.d! };
}

function resolveSubject(): string {
  const s = (process.env["VAPID_SUBJECT"] || "").trim();
  return /^(mailto:|https:\/\/)/.test(s) ? s : DEFAULT_SUBJECT;
}

let cached: VapidKeys | null = null;

/**
 * Uses the configured VAPID secrets when they form a valid pair; otherwise
 * falls back to a key pair generated once and stored in a service-role-only table.
 */
export async function getVapidKeys(): Promise<VapidKeys> {
  if (cached) return cached;
  const subject = resolveSubject();
  const envPub = (process.env["VAPID_PUBLIC_KEY"] || "").trim();
  const envPriv = (process.env["VAPID_PRIVATE_KEY"] || "").trim();
  if (envPub && envPriv && (await isValidVapidPair(envPub, envPriv))) {
    cached = { publicKey: envPub, privateKey: envPriv.replace(/=+$/, ""), subject };
    return cached;
  }

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const read = async () => {
    const { data, error } = await supabaseAdmin
      .from("push_vapid_keys")
      .select("public_key, private_key")
      .eq("id", 1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  };

  let row = await read();
  if (!row) {
    const generated = await generateVapidPair();
    const { error } = await supabaseAdmin
      .from("push_vapid_keys")
      .upsert(
        { id: 1, public_key: generated.publicKey, private_key: generated.privateKey },
        { onConflict: "id", ignoreDuplicates: true },
      );
    if (error) throw new Error(error.message);
    row = await read();
  }
  if (!row) throw new Error("Kunci notifikasi belum dikonfigurasi");
  cached = { publicKey: row.public_key, privateKey: row.private_key, subject };
  return cached;
}
