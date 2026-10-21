import { useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { savePushSubscription } from "@/lib/push.functions";

/**
 * Re-sends the device's push subscription with its current IANA time zone
 * on every patient app open, so server reminders fire at the phone's local time.
 */
export function usePushTimeZoneSync(userId: string | null) {
  const save = useServerFn(savePushSubscription);
  useEffect(() => {
    if (!userId || typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    navigator.serviceWorker
      .getRegistration()
      .then((reg) => reg?.pushManager.getSubscription())
      .then((sub) => {
        const j = sub?.toJSON();
        if (!j?.endpoint || !j.keys?.p256dh || !j.keys?.auth) return;
        return save({
          data: {
            endpoint: j.endpoint,
            p256dh: j.keys.p256dh,
            auth: j.keys.auth,
            userAgent: navigator.userAgent,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
        });
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);
}
