# Membuat APK IMO MANTAP di Android Studio

## Paket siap dibuka (tanpa Node.js)

1. Unduh ZIP Android Studio yang disediakan, lalu pilih **Extract All / Ekstrak Semua**.
2. Di Android Studio pilih **Open**, lalu pilih folder **android** hasil ekstraksi (bukan file ZIP).
3. Izinkan unduhan Gradle, Android SDK 36 dan komponen yang diminta. Koneksi internet diperlukan; pembukaan pertama bisa lama.
4. Gunakan Gradle JDK bawaan Android Studio (Java 21 atau lebih baru).
5. Tunggu sinkronisasi selesai, lalu pilih **Build → Generate App Bundles or APKs → Generate APKs** (nama menu dapat berbeda menurut versi).
6. APK uji ada di **android/app/build/outputs/apk/debug/app-debug.apk**; gunakan **Locate** jika tersedia.

Alamat aplikasi sudah dipasang: **https://imomantap.vercel.app**. Aplikasi memerlukan internet dan membuka situs tersebut tanpa bilah alamat browser. Ini aplikasi Android berbasis Capacitor, bukan penulisan ulang seluruh tampilan dengan Kotlin.

Pengingat ketika aplikasi ditutup belum terhubung ke notifikasi Android asli; pemasangan plugin saja tidak mengaktifkannya.

## Untuk pengembangan dari repositori

Di komputer yang memiliki Node.js, jalankan `npm install`, lalu `npx cap sync android` dan `npx cap open android`. Folder Android sudah tersedia; tidak perlu menjalankan `cap add android` lagi.

Perubahan situs di Vercel ikut tampil tanpa membuat APK ulang. Perubahan konfigurasi atau fitur Android memerlukan sinkronisasi dan APK baru. Jika `cap sync` mengganti pengaturan unduhan native otomatis, jalankan kembali script penyiapan paket sebelum menyiapkan ZIP tanpa Node.js.
