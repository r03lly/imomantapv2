export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const value = base64String.trim();
  const invalidKey = () => new Error("Kunci notifikasi tidak valid. Hubungi admin untuk memperbarui konfigurasi pengingat.");
  // Web Push requires an uncompressed P-256 point, encoded as base64url.
  if (!/^[A-Za-z0-9_-]{87}=?$/.test(value)) throw invalidKey();
  const unpadded = value.replace(/=+$/, "");
  const padding = "=".repeat((4 - (unpadded.length % 4)) % 4);
  const base64 = (unpadded + padding).replace(/-/g, "+").replace(/_/g, "/");
  let raw: string;
  try {
    raw = atob(base64);
  } catch {
    throw invalidKey();
  }
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  if (out.length !== 65 || out[0] !== 4) throw invalidKey();
  return out;
}
