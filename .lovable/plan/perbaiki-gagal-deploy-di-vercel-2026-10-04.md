# Perbaiki gagal deploy di Vercel

Vercel menolak build karena versi paket TanStack Start (1.168.32) punya celah keamanan yang sudah diketahui.

## Langkah
1. Perbarui `@tanstack/react-start`, `@tanstack/react-router`, dan `@tanstack/router-plugin` ke versi terbaru yang sudah ditambal (react-start 1.168.60 atau lebih baru), agar versinya tetap saling cocok.
2. Pastikan aplikasi tetap bisa dibangun tanpa error.
3. Setelah perubahan tersinkron ke GitHub, klik **Redeploy** di Vercel.

Tidak disarankan memakai variabel `DANGEROUSLY_DEPLOY_VULNERABLE_TANSTACK_START_XSS=1`, karena itu hanya melewati peringatan tanpa menutup celahnya.
