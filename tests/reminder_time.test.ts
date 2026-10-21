import { describe, expect, it } from "vitest";
import { localHHMM, safeTimeZone, scheduleMatches } from "@/lib/reminder-time";

describe("reminder time per device zone", () => {
  const at = new Date("2026-10-21T08:05:00Z");
  it("16:05 schedule fires for a phone on UTC+8 at 08:05 UTC", () => {
    expect(scheduleMatches("16:05", localHHMM(at, "Asia/Makassar"))).toBe(true);
  });
  it("WIB phone sees 15:05 at the same moment", () => {
    expect(localHHMM(at, "Asia/Jakarta")).toBe("15:05");
  });
  it("unknown zones fall back to WIB", () => {
    expect(safeTimeZone("Not/AZone")).toBe("Asia/Jakarta");
  });
});
