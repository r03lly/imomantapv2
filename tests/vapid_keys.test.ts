import { describe, expect, it } from "vitest";
import { generateVapidPair, isValidVapidPair } from "@/lib/vapid-keys.server";
import { urlBase64ToUint8Array } from "@/lib/push-config";

describe("VAPID key fallback", () => {
  it("generates a pair the browser accepts and that signs", async () => {
    const k = await generateVapidPair();
    expect(urlBase64ToUint8Array(k.publicKey).length).toBe(65);
    expect(await isValidVapidPair(k.publicKey, k.privateKey)).toBe(true);
  });
  it("rejects short placeholder values", async () => {
    expect(await isValidVapidPair("abcdefghijk", "abc")).toBe(false);
  });
});
