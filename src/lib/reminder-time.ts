export const DEFAULT_TIME_ZONE = "Asia/Jakarta";

/** Returns a valid IANA time zone, falling back to WIB. */
export function safeTimeZone(tz: string | null | undefined): string {
  const v = (tz || "").trim();
  if (!v || v.length > 64) return DEFAULT_TIME_ZONE;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: v });
    return v;
  } catch {
    return DEFAULT_TIME_ZONE;
  }
}

/** Wall-clock "HH:MM" of `date` in the given time zone. */
export function localHHMM(date: Date, tz: string): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: safeTimeZone(tz),
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const h = parts.find((p) => p.type === "hour")?.value ?? "00";
  const m = parts.find((p) => p.type === "minute")?.value ?? "00";
  return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
}

/** True when a stored schedule time ("HH:MM" or "HH:MM:SS") equals hhmm. */
export function scheduleMatches(scheduleTime: string, hhmm: string): boolean {
  return scheduleTime.trim().slice(0, 5) === hhmm;
}
