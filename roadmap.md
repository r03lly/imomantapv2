# Roadmap

## Pendaftaran pasien baru
- [x] Pulihkan penghubung pendaftaran otomatis dan data pasien yang terlewat tanpa mengubah password
- [x] Uji pasien baru muncul di daftar admin dan tenaga medis

## Setup remix saat ini
- [x] Perbarui lima secret melalui formulir aman
- [x] Verifikasi migrasi remix kosong tanpa mengubah jurnal yang dikelola otomatis
- [x] Hubungkan Google Drive ke project remix
- [x] Verifikasi akses Google Drive (pemeriksaan kredensial aplikasi HTTP 200)
- [x] Terapkan akun admin dan tenaga medis yang diminta, lalu verifikasi login dan perannya

## Setup remix 21 Oktober 2026
- [x] Perbarui lima secret yang diminta melalui formulir aman
- [x] Verifikasi set migrasi kosong untuk database remix (sudah kosong saat diperiksa; tidak ada migrasi salinan tersisa)
- [x] Hubungkan Google Drive ke remix (akses baca terverifikasi)
- [x] Terapkan akun admin dan tenaga medis yang diminta pengguna, lalu verifikasi login dan perannya melalui halaman masuk

- [x] Import semua data CSV hasil export ke database (profiles, user_roles, medications, medication_catalog, measurements, adherence_logs, health_screenings, system_audit_logs)
- [x] Buat akun admin@imomantap.com & apoteker@imomantap.com (password mantapIMO12345!) + akun pasien untuk data lama
- [x] Tambah fitur restore di halaman Backup (unggah JSON/ZIP, mode gabungkan atau ganti)
- [x] Pemulihan akun dari halaman Backup (kata sandi sementara) + diuji end-to-end
- [x] Isi nilai rahasia CRON_SECRET, ImoMantapV2, PROVISION_SECRET
- [x] Sambungkan Google Drive ke project
- [x] Buat 32 akun pasien dari daftar Skrining (login pakai kode responden, password pasienimo123!)
- [x] Admin bisa reset password user dari menu Manajemen Users
- [x] Backup admin ke Google Drive + restore dengan pilih file dari Drive
- [x] Isi riwayat kepatuhan 11 Sep - sekarang (rata-rata ~84%)

## Backup otomatis (permintaan lanjutan)
- [x] Pilihan mode: harian jam 12 malam (WIB) & setiap ada kegiatan
- [x] Penjadwal tugas terjadwal (harian 00:00 WIB, cek kegiatan tiap jam)
- [x] Google Drive terhubung

## Deploy & pengingat
- [ ] Siapkan konfigurasi deploy ke Vercel (script build + panduan env)
- [x] Ganti Asisten AI dengan chatbot mandiri tanpa AI (basis pengetahuan lokal) agar jalan di Vercel; topik dibatasi pada aplikasi + penyakit degeneratif
- [x] Terapkan akun admin@imomantap.com & apoteker@imomantap.com (password mantapIMO12345!)
- [x] Isi ulang VAPID keys, VAPID_SUBJECT, CRON_SECRET (remix mengosongkan nilainya) + sinkronkan kunci publik di push-config.ts
- [x] Buat ulang tugas terjadwal: pengingat obat tiap menit, backup Drive 00:00 WIB, cek aktivitas tiap jam
- [x] Sambungkan ulang Google Drive (terverifikasi: daftar berkas backup terbaca)
- [x] Pastikan pengingat minum obat berjalan sempurna (jadwal, notifikasi, log)
- [x] Kunci tampilan agar tidak bisa zoom (perangkat layar sentuh)

## Remix baru (setup ulang)
- [x] Update secret CRON_SECRET, VAPID_PRIVATE_KEY, VAPID_PUBLIC_KEY, VAPID_SUBJECT, PROVISION_SECRET
- [x] Sambungkan koneksi Google Drive ke project remix (terverifikasi: daftar backup terbaca)
- [x] Terapkan akun admin@imomantap.com & apoteker@imomantap.com (password mantapIMO12345!)
- [x] Halaman Kepatuhan apoteker: klik nama pasien -> panel detail lengkap pasien + link halaman pasien
- [x] Ganti label/tampilan "Apoteker" menjadi "Tenaga Medis" di seluruh UI (email login & peran internal tetap)
- [x] Isi data kepatuhan acak semua pasien tanggal 17–23 September 2026 dengan agregat 80,1%
- [x] Tambahkan gambar menarik pada artikel edukasi di tampilan Tenaga Medis dan Pasien
- [x] Perbaiki notifikasi pengingat obat di ponsel dan error setVapidDetails
- [x] Sinkronkan VAPID_PUBLIC_KEY dari server saat pasien mengaktifkan notifikasi
# Roadmap

- [x] Ganti seluruh fitur, data, artikel, obat, target, pengukuran, dan label Asam Urat menjadi Kolesterol

## Remix terbaru
- [x] Perbaiki kegagalan halaman Kepatuhan dan koneksi pengingat pada Jadwal Obat pasien
- [x] Perbaiki login HP pasien yang disetujui, navigasi detail pasien, dan reset password oleh tenaga medis
- [x] Pulihkan pasien baru yang belum muncul dan perbaiki pendaftaran otomatis untuk persetujuan tenaga medis
- [x] Terapkan akun admin@imomantap.com & tenagamedist@imomantap.com
- [x] Kunci VAPID baru dibuat & dipasang (CRON memakai token database, PROVISION_SECRET sudah ada)
- [x] Sambungkan Google Drive ke project
- [x] Pengingat obat jalan walau aplikasi tidak dibuka (tugas terjadwal di database)
- [x] Pilihan notifikasi pengingat bersuara (nada dari perangkat)

- [x] Pengingat obat aktif: buat pasangan kunci VAPID valid otomatis (kunci tersimpan berisi nilai tidak valid)
- [x] Pemeriksaan menyeluruh: pulihkan otomatisasi pendaftaran pasien, jadwal pengingat/backup, dan kencangkan akses fungsi database
- [x] Notifikasi pengingat muncul di HP sesuai jam lokal ponsel (WIB/WITA/WIT) + suara di dalam aplikasi
