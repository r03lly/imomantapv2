# Membuat APK Android asli (Capacitor)

Kebutuhan di komputer: Node.js, Git, Android Studio.

1. Hubungkan project ke GitHub, lalu `git clone` ke komputer.
2. Buka `capacitor.config.ts`, ganti `GANTI-DENGAN-LINK-VERCEL` dengan link Vercel Anda.
3. Jalankan:
   ```
   npm install
   npx cap add android
   npx cap sync android
   npx cap open android
   ```
4. Di Android Studio: menu **Build → Build Bundle(s)/APK(s) → Build APK(s)**.
   File APK ada di `android/app/build/outputs/apk/debug/`.
5. Ikon: klik kanan `app/res` → **New → Image Asset**, pilih `public/icon-512.png`.

Setiap kali kode berubah di Vercel, aplikasi otomatis ikut terbaru (tidak perlu build ulang),
kecuali mengubah `capacitor.config.ts`.
