# Deploy ke Vercel

Proyek ini sudah dikonfigurasi agar bisa di-deploy ke Vercel. Semua fitur —
termasuk **Konsultasi AI (Asisten IMO MANTAP)** dan **chat realtime dengan
tenaga medis** — tetap berfungsi penuh karena:

- Konsultasi AI berjalan di browser pasien memakai basis pengetahuan bawaan
  (`src/lib/chatbot-kb.ts`), tanpa API key pihak ketiga.
- Chat tenaga medis memakai database + realtime Lovable Cloud
  (`consultation_requests` / `consultation_messages`).

## Langkah Deploy

1. Push kode ke GitHub (repo `imomantapv2`).
2. Di Vercel: **Add New Project → Import repo** tersebut.
3. Vercel membaca `vercel.json` otomatis (build command `vite build`).
   Saat build di Vercel, `vite.config.ts` otomatis mengganti target server
   ke preset `vercel` (Vercel mengeset env `VERCEL=1`), sedangkan build
   di Lovable tetap memakai target bawaan.
4. Tambahkan **Environment Variables** (Settings → Environment Variables):

### Wajib (database, login, chat realtime)

| Key | Value |
| --- | --- |
| `VITE_SUPABASE_URL` | `https://c--a5b68e9a-52b8-4cc7-b620-99228d040b1f-prod.lovable.cloud` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_8Gh6Cm4IbTXAWnKI15FplA_eutGQwJG` |
| `VITE_SUPABASE_PROJECT_ID` | `ldowpovcljyrzmrajyei` |
| `SUPABASE_URL` | sama seperti `VITE_SUPABASE_URL` |
| `SUPABASE_PUBLISHABLE_KEY` | sama seperti `VITE_SUPABASE_PUBLISHABLE_KEY` |
| `SUPABASE_PROJECT_ID` | `ldowpovcljyrzmrajyei` |

### Opsional (fitur tambahan)

| Key | Fungsi |
| --- | --- |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `VAPID_SUBJECT` | Notifikasi push pengingat obat |
| `CRON_SECRET` | Endpoint cron (pengingat obat, backup otomatis) |
| `GOOGLE_DRIVE_API_KEY` | Backup ke Google Drive |

> Nilai VAPID, CRON_SECRET, dan GOOGLE_DRIVE_API_KEY tersimpan aman di
> Lovable Cloud (Project Settings → Secrets) — salin dari sana bila ingin
> fitur tersebut aktif juga di Vercel.

5. Klik **Deploy**.

## Catatan

- `vercel.json` tidak memakai Cron Vercel agar kompatibel dengan paket Hobby
  (gratis), yang menolak jadwal setiap menit dan setiap 30 menit.
- Pengingat obat setiap menit, pencatatan dosis terlewat setiap 30 menit,
  dan backup Drive harian dijadwalkan melalui Lovable Cloud, bukan Vercel.
  Jadwal tersebut memanggil aplikasi yang dihosting Lovable; deploy ke Vercel
  saja tidak menerbitkan aplikasi di Lovable. Terbitkan juga aplikasi di
  Lovable agar jadwal memiliki tujuan produksi yang tersedia.
  Jangan menambahkan jadwal duplikat di Vercel karena bisa mengirim pengingat dua kali.
- Preview Lovable tetap berjalan seperti biasa; konfigurasi ini hanya
  dipakai saat build di Vercel.
