/* SehatPantau service worker — Web Push only (no app-shell caching). */
/* eslint-disable no-restricted-globals */

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { title: "Pengingat", body: event.data ? event.data.text() : "" };
  }
  const title = payload.title || "Waktunya minum obat";
  event.waitUntil(
    caches
      .open("imo-settings")
      .then((c) => c.match("/__settings/sound"))
      .then((r) => (r ? r.json() : {}))
      .catch(() => ({}))
      .then((cfg) => show(title, payload, cfg.sound || "device")),
  );
});

function show(title, payload, sound) {
  const silent = sound === "silent";
  const options = {
    body: payload.body || "",
    icon: "/icon-512.png",
    badge: "/icon-512.png",
    tag: payload.tag || "med-reminder",
    renotify: true,
    requireInteraction: true,
    silent,
    vibrate: silent ? [] : sound === "alarm" ? [500, 200, 500, 200, 500, 200, 500] : [200, 100, 200],
    data: { url: payload.url || "/pasien/obat", ...payload },
    actions: [
      { action: "open", title: "Buka aplikasi" },
      { action: "dismiss", title: "Tutup" },
    ],
  };
  return self.registration.showNotification(title, options);
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action === "dismiss") return;
  const url = (event.notification.data && event.notification.data.url) || "/pasien/obat";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((all) => {
      for (const c of all) {
        if ("focus" in c) {
          c.navigate(url).catch(() => {});
          return c.focus();
        }
      }
      return self.clients.openWindow(url);
    }),
  );
});
