<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

## Patient registration
- Provision patient profiles and patient roles atomically through the auth signup trigger calling `public.handle_new_user`; never trust signup metadata for privileged roles, so registrations remain visible for staff approval without granting staff access.
- Staff approval and patient password resets use authenticated server functions with staff and patient-only target checks; approval confirms only synthetic phone-email accounts because they cannot receive confirmation emails.
- The patient list route renders an Outlet for nested patient detail URLs so the detail page is not hidden by its parent list.

## Push notifications
 - Home-screen icons must be real PNG files whose dimensions match their manifest entries; keep installability manifest-only and preserve the separate push worker.
- Keep recurring HTTP jobs in Lovable Cloud managed schedules, not `vercel.json`, so Vercel Hobby deployments do not reject sub-daily cron expressions; callbacks require an available Lovable deployment.
- Load the VAPID public key from the authenticated configuration function and validate its base64url P-256 point before subscribing; never embed a fallback key or credential in browser code.
- Server push code resolves VAPID keys through `getVapidKeys` in `src/lib/vapid-keys.server.ts`: valid env secrets win, otherwise a pair is generated once and kept in the service-role-only `push_vapid_keys` table, so reminders keep working when copied secrets are placeholders.
- The reminder cron matches schedule times against each push subscription's stored IANA `time_zone` (sent by the device), never a hardcoded offset, because patients live in WIB/WITA/WIT.
- In-app reminders show system notifications through the service worker registration (`showNotification`); Android Chrome rejects `new Notification()`.
