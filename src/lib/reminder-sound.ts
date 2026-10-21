/** Preferensi suara pengingat obat (disimpan di perangkat). */
export type ReminderSound = "device" | "alarm" | "bell" | "silent";

export const SOUND_OPTIONS: { value: ReminderSound; label: string }[] = [
  { value: "device", label: "Nada notifikasi perangkat" },
  { value: "alarm", label: "Alarm (berbunyi berulang)" },
  { value: "bell", label: "Lonceng" },
  { value: "silent", label: "Senyap (tanpa suara)" },
];

const KEY = "imo-reminder-sound";

export function getReminderSound(): ReminderSound {
  if (typeof window === "undefined") return "device";
  const v = localStorage.getItem(KEY) as ReminderSound | null;
  return v && SOUND_OPTIONS.some((o) => o.value === v) ? v : "device";
}

export async function setReminderSound(v: ReminderSound) {
  localStorage.setItem(KEY, v);
  // Simpan juga untuk service worker (notifikasi saat aplikasi tertutup).
  try {
    const cache = await caches.open("imo-settings");
    await cache.put("/__settings/sound", new Response(JSON.stringify({ sound: v })));
  } catch {
    /* ignore */
  }
}

let ctx: AudioContext | null = null;
function tone(freq: number, start: number, dur: number, type: OscillatorType = "sine") {
  if (!ctx) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, ctx.currentTime + start);
  g.gain.exponentialRampToValueAtTime(0.5, ctx.currentTime + start + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + dur);
  o.connect(g).connect(ctx.destination);
  o.start(ctx.currentTime + start);
  o.stop(ctx.currentTime + start + dur + 0.05);
}

/** Putar suara pengingat di dalam aplikasi (saat aplikasi terbuka). */
export function playReminderSound(v: ReminderSound = getReminderSound()) {
  if (typeof window === "undefined" || v === "silent") return;
  try {
    ctx = ctx ?? new AudioContext();
    void ctx.resume();
    if (v === "alarm") {
      for (let r = 0; r < 6; r++) {
        tone(880, r * 0.6, 0.2, "square");
        tone(660, r * 0.6 + 0.25, 0.2, "square");
      }
    } else {
      tone(1046, 0, 1.2);
      tone(1318, 0.3, 1.2);
      tone(1568, 0.6, 1.5);
    }
  } catch {
    /* ignore */
  }
  if ("vibrate" in navigator) navigator.vibrate?.([300, 150, 300, 150, 300]);
}
