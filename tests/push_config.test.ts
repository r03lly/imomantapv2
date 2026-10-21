import { describe, expect, test } from "vitest";
import { urlBase64ToUint8Array } from "../src/lib/push-config";

describe("Web Push public key decoding", () => {
  const bytes = new Uint8Array(65);
  bytes[0] = 4;
  const encoded = btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  test("decodes a 65-byte uncompressed point with surrounding whitespace", () => {
    expect(urlBase64ToUint8Array(` ${encoded}\n`)).toEqual(bytes);
  });

  test("rejects malformed input before browser base64 decoding", () => {
    expect(() => urlBase64ToUint8Array("not@a-key")).toThrow("Kunci notifikasi tidak valid");
  });

  test("rejects a key with the wrong point prefix", () => {
    const wrong = new Uint8Array(65);
    const value = btoa(String.fromCharCode(...wrong)).replace(/=+$/, "");
    expect(() => urlBase64ToUint8Array(value)).toThrow("Kunci notifikasi tidak valid");
  });
});