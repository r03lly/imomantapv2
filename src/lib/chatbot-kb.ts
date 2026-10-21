/**
 * Basis pengetahuan chatbot IMO MANTAP (tanpa AI / tanpa API eksternal).
 * Semua jawaban dihitung di perangkat pengguna sehingga tetap berjalan
 * di hosting mana pun (Vercel, Lovable, dll) tanpa kunci API.
 *
 * Ruang lingkup: fitur aplikasi IMO MANTAP + penyakit degeneratif
 * (hipertensi, gula darah/diabetes, kolesterol) dan kepatuhan minum obat.
 */

export type KbEntry = {
  id: string;
  keywords: string[];
  answer: string;
};

export const GREETING =
  "Halo! Saya Asisten IMO MANTAP. Saya bisa bantu seputar hipertensi, gula darah, kolesterol, obat, dan cara memakai aplikasi ini. Silakan pilih topik di bawah atau ketik pertanyaan Anda.\n\nSaya bukan pengganti dokter — untuk keluhan serius segera ke fasilitas kesehatan.";

export const QUICK_PROMPTS = [
  "Berapa tekanan darah yang normal?",
  "Berapa gula darah yang normal?",
  "Berapa kadar kolesterol normal?",
  "Makanan pantangan kolesterol",
  "Cara mencatat tekanan darah",
  "Cara mengatur pengingat obat",
  "Saya lupa minum obat, bagaimana?",
  "Kapan harus ke IGD?",
];

export const EMERGENCY_REPLY =
  "⚠️ Gejala yang Anda sebutkan bisa termasuk kondisi gawat darurat.\n\nSegera ke IGD rumah sakit terdekat atau hubungi 118/119 sekarang juga. Jangan menunggu dan jangan menyetir sendiri.\n\nTanda bahaya yang perlu pertolongan segera:\n• Nyeri dada, sesak napas berat\n• Pingsan, kejang, bicara pelo, lemah sebelah badan\n• Tekanan darah di atas 180/120 mmHg\n• Gula darah di bawah 70 mg/dL (keringat dingin, gemetar, bingung) atau di atas 400 mg/dL\n• Sendi bengkak merah disertai demam tinggi";

const EMERGENCY_KEYWORDS = [
  "nyeri dada",
  "sakit dada",
  "dada sesak",
  "sesak napas",
  "sesak nafas",
  "pingsan",
  "kejang",
  "stroke",
  "pelo",
  "lumpuh",
  "tidak sadar",
  "gawat darurat",
  "darurat",
  "igd",
  "muntah darah",
];

export const OUT_OF_SCOPE =
  "Maaf, pertanyaan itu di luar ranah aplikasi IMO MANTAP.\n\nSaya hanya membantu seputar:\n• Hipertensi (tekanan darah)\n• Gula darah / diabetes\n• Kolesterol\n• Obat dan kepatuhan minum obat\n• Cara memakai fitur aplikasi ini\n\nUntuk pertanyaan kesehatan yang lebih spesifik, silakan buat permintaan di tab Konsultasi Tenaga Medis agar dijawab langsung oleh tenaga medis.";

export const KB: KbEntry[] = [
  // ————— Hipertensi —————
  {
    id: "hipertensi-normal",
    keywords: [
      "tekanan darah normal",
      "tensi normal",
      "hipertensi normal",
      "batas tensi",
      "sistolik",
      "diastolik",
      "berapa tensi",
      "tensi berapa",
      "mmhg",
    ],
    answer:
      "Acuan tekanan darah yang dipakai aplikasi ini:\n• Normal: di bawah 130/80 mmHg\n• Waspada: 130–139 / 80–89 mmHg\n• Bahaya (hipertensi): 140/90 mmHg ke atas\n\nTips: ukur saat duduk tenang minimal 5 menit, lengan sejajar jantung, jangan sehabis kopi, rokok, atau olahraga. Catat hasilnya di menu Catat agar tenaga medis bisa memantau.",
  },
  {
    id: "hipertensi-tips",
    keywords: [
      "menurunkan tekanan darah",
      "tensi tinggi",
      "darah tinggi",
      "hipertensi",
      "tensi naik",
      "cara turunkan tensi",
      "garam",
    ],
    answer:
      "Cara menjaga tekanan darah tetap terkendali:\n• Batasi garam maksimal 1 sendok teh (5 gram) per hari — hindari ikan asin, telur asin, makanan kaleng, mi instan, dan penyedap berlebih\n• Perbanyak sayur dan buah, pilih makanan direbus/dikukus\n• Jalan kaki atau aktivitas ringan 30 menit, 5 hari seminggu\n• Berhenti merokok dan batasi kopi\n• Kelola stres dan tidur cukup 7–8 jam\n• Minum obat tekanan darah rutin walaupun sudah merasa sehat\n\nUkur tensi secara rutin dan catat di menu Catat.",
  },

  // ————— Gula darah —————
  {
    id: "gula-normal",
    keywords: [
      "gula darah normal",
      "gula normal",
      "kadar gula",
      "gula puasa",
      "gula darah puasa",
      "gula pp",
      "2 jam setelah makan",
      "berapa gula darah",
      "hba1c",
    ],
    answer:
      "Acuan gula darah yang dipakai aplikasi ini:\n\nGula darah puasa (belum makan 8 jam):\n• Normal: di bawah 100 mg/dL\n• Waspada (prediabetes): 100–125 mg/dL\n• Bahaya (diabetes): 126 mg/dL ke atas\n\nGula darah 2 jam setelah makan:\n• Normal: di bawah 140 mg/dL\n• Waspada: 140–199 mg/dL\n• Bahaya: 200 mg/dL ke atas\n\nCatat hasil pemeriksaan Anda di menu Catat.",
  },
  {
    id: "gula-tips",
    keywords: [
      "diabetes",
      "kencing manis",
      "gula darah tinggi",
      "gula naik",
      "menurunkan gula",
      "makanan diabetes",
      "pantangan gula",
      "manis",
    ],
    answer:
      "Cara menjaga gula darah tetap terkendali:\n• Kurangi gula tambahan: teh manis, sirup, kue, minuman kemasan\n• Ganti nasi putih sebagian dengan nasi merah, jagung, atau ubi; porsi nasi cukup 1 centong tiap makan\n• Isi setengah piring dengan sayur, seperempat lauk berprotein, seperempat karbohidrat\n• Makan teratur 3 kali sehari, jangan melewatkan makan bila memakai obat gula\n• Jalan kaki 30 menit sehari\n• Periksa kaki setiap hari — luka pada penderita diabetes sulit sembuh\n\nGejala gula terlalu rendah (keringat dingin, gemetar, lemas, bingung): segera minum air gula manis, lalu makan, dan hubungi tenaga kesehatan.",
  },

  // ————— Kolesterol (pantangan) —————
  {
    id: "kolesterol-pantangan",
    keywords: [
      "pantangan kolesterol",
      "makanan kolesterol",
      "menurunkan kolesterol",
      "kolesterol tinggi",
      "lemak jenuh",
      "gorengan",
      "santan",
    ],
    answer:
      "Kolesterol naik bila makanan tinggi lemak jenuh dan lemak trans dikonsumsi berlebihan.\n\nSebaiknya dihindari/dibatasi:\n• Gorengan dan makanan bersantan kental\n• Jeroan, otak, kulit ayam, lemak daging\n• Daging merah berlemak, sosis, kornet\n• Kuning telur berlebihan, mentega, margarin\n• Kue, biskuit, dan makanan cepat saji\n\nDianjurkan:\n• Perbanyak sayur, buah, dan serat (oat, kacang-kacangan)\n• Pilih ikan, ayam tanpa kulit, tahu, tempe\n• Masak dengan cara direbus, dikukus, atau dipanggang\n• Olahraga rutin 30 menit sehari dan jaga berat badan ideal\n\nMinum obat penurun kolesterol sesuai anjuran dokter/tenaga medis.",
  },


  // ————— Kolesterol —————
  {
    id: "kolesterol",
    keywords: ["kolesterol", "lemak darah", "trigliserida"],
    answer:
      "Kolesterol total sebaiknya di bawah 200 mg/dL.\n\nCara menjaganya:\n• Kurangi gorengan, santan kental, jeroan, dan kulit ayam\n• Pilih makanan direbus, dikukus, atau dipanggang\n• Perbanyak serat: sayur, buah, oat\n• Aktivitas fisik rutin 30 menit sehari\n\nHasil skrining kolesterol Anda tersimpan di data skrining dan bisa ditanyakan ke tenaga medis lewat tab Konsultasi Tenaga Medis.",
  },

  // ————— Obat & kepatuhan —————
  {
    id: "lupa-obat",
    keywords: [
      "lupa minum obat",
      "lupa obat",
      "telat minum obat",
      "terlewat",
      "ketinggalan obat",
    ],
    answer:
      "Kalau lupa minum obat:\n• Bila baru teringat dan jarak ke jadwal berikutnya masih lama, minum segera saat ingat\n• Bila sudah mendekati jadwal berikutnya, lewati yang terlupa dan lanjutkan jadwal seperti biasa\n• JANGAN menggandakan dosis untuk mengganti yang terlewat\n\nAgar tidak terulang: aktifkan pengingat di menu Obat, letakkan obat di tempat yang terlihat, dan kaitkan waktu minum dengan kebiasaan harian (misalnya setelah sarapan). Catatan kepatuhan Anda bisa dilihat di menu Logbook.",
  },
  {
    id: "berhenti-obat",
    keywords: [
      "berhenti minum obat",
      "stop obat",
      "sudah sehat",
      "boleh berhenti",
      "putus obat",
      "tidak minum obat",
    ],
    answer:
      "Obat hipertensi, gula darah, dan kolesterol umumnya diminum jangka panjang. Merasa sehat justru tanda obatnya bekerja, bukan tanda boleh berhenti.\n\nMenghentikan obat sendiri bisa membuat tekanan darah atau gula darah melonjak kembali dan meningkatkan risiko stroke, serangan jantung, serta kerusakan ginjal.\n\nJangan mengubah atau menghentikan obat tanpa persetujuan dokter/tenaga medis. Silakan ajukan pertanyaan lewat tab Konsultasi Tenaga Medis.",
  },
  {
    id: "efek-samping",
    keywords: ["efek samping", "obat bikin", "pusing setelah minum obat", "mual obat", "alergi obat"],
    answer:
      "Efek samping ringan yang umum:\n• Obat tekanan darah: pusing ringan saat berdiri cepat, batuk kering, sering buang air kecil\n• Obat gula darah: mual, perut tidak nyaman, gula darah turun terlalu rendah\n• Obat kolesterol: nyeri otot ringan, gangguan lambung\n\nSegera hentikan dan cari pertolongan bila muncul: sesak napas, bengkak pada wajah/bibir, ruam luas, atau pingsan.\n\nUntuk keluhan efek samping yang mengganggu, laporkan lewat tab Konsultasi Tenaga Medis.",
  },
  {
    id: "waktu-minum-obat",
    keywords: [
      "waktu minum obat",
      "sebelum makan",
      "sesudah makan",
      "jam minum obat",
      "aturan minum obat",
    ],
    answer:
      "Aturan umum minum obat:\n• Sebelum makan berarti 30–60 menit sebelum makan\n• Sesudah makan berarti dalam 30 menit setelah makan, untuk mengurangi rasa perih di lambung\n• Minum dengan air putih, bukan teh, kopi, atau susu\n• Usahakan jam yang sama setiap hari\n\nJadwal obat pribadi Anda beserta aturannya tercantum di menu Obat. Kalau aturan pada kemasan berbeda, ikuti petunjuk tenaga medis Anda.",
  },

  // ————— Gaya hidup umum —————
  {
    id: "olahraga",
    keywords: ["olahraga", "aktivitas fisik", "jalan kaki", "senam"],
    answer:
      "Anjuran aktivitas fisik untuk penyakit degeneratif:\n• 30 menit sehari, minimal 5 hari seminggu\n• Pilih yang ringan dan aman: jalan kaki, senam lansia, bersepeda santai, berenang\n• Mulai bertahap 10 menit lalu tingkatkan\n• Hentikan bila muncul nyeri dada, sesak berat, atau pusing hebat\n\nHindari olahraga berat saat sendi sedang nyeri atau saat tekanan darah sedang sangat tinggi.",
  },
  {
    id: "air-putih",
    keywords: ["air putih", "minum air", "hidrasi", "berapa gelas"],
    answer:
      "Minum air putih sekitar 8 gelas (2 liter) per hari. Ini membantu menjaga kerja ginjal dan metabolisme tubuh.\n\nBila Anda memiliki penyakit ginjal atau gagal jantung, jumlah cairan mungkin perlu dibatasi — tanyakan dulu ke dokter atau tenaga medis.\n\nAnda bisa mencatat jumlah air minum harian di menu Catat.",
  },
  {
    id: "berat-badan",
    keywords: ["berat badan", "gemuk", "obesitas", "diet", "kurus"],
    answer:
      "Menurunkan berat badan 5–10% saja sudah menurunkan tekanan darah, gula darah, dan kolesterol secara bermakna.\n\nCaranya:\n• Kurangi porsi karbohidrat dan gorengan, bukan mengurangi makan sampai kelaparan\n• Perbanyak sayur agar cepat kenyang\n• Hindari makan larut malam dan camilan manis\n• Aktivitas fisik rutin\n\nTinggi dan berat badan Anda bisa diperbarui di menu Profil.",
  },
  {
    id: "rokok",
    keywords: ["rokok", "merokok", "alkohol"],
    answer:
      "Rokok merusak pembuluh darah dan mempercepat komplikasi hipertensi maupun diabetes. Alkohol menaikkan tekanan darah dan kadar trigliserida.\n\nBerhenti merokok adalah langkah tunggal paling besar manfaatnya. Mulailah dengan menetapkan tanggal berhenti, singkirkan rokok dari rumah, dan minta dukungan keluarga. Tenaga medis di aplikasi ini bisa membantu lewat tab Konsultasi Tenaga Medis.",
  },

  // ————— Fitur aplikasi —————
  {
    id: "app-catat",
    keywords: [
      "cara mencatat",
      "cara catat",
      "input tensi",
      "menu catat",
      "mencatat hasil",
      "isi data",
      "mencatat tekanan",
      "mencatat gula",
    ],
    answer:
      "Cara mencatat hasil pemeriksaan:\n1. Buka menu Catat di bagian bawah layar\n2. Pilih jenis pemeriksaan: tekanan darah, gula darah, atau kolesterol\n3. Isi angkanya (misalnya sistolik 130 dan diastolik 85)\n4. Tambahkan catatan bila perlu, lalu simpan\n\nHasilnya langsung diberi keterangan Normal, Waspada, atau Bahaya, dan tersimpan di menu Riwayat sehingga tenaga medis bisa memantau perkembangan Anda.",
  },
  {
    id: "app-obat",
    keywords: [
      "pengingat obat",
      "atur pengingat",
      "notifikasi obat",
      "menu obat",
      "jadwal obat",
      "alarm obat",
      "tambah obat",
    ],
    answer:
      "Mengatur pengingat minum obat:\n1. Buka menu Obat\n2. Tambahkan obat: nama, dosis, dan aturan pakai\n3. Isi jam minum, bisa lebih dari satu (misalnya 07:00 dan 19:00)\n4. Simpan\n\nAplikasi akan mengirim notifikasi pada jam tersebut. Pastikan izin notifikasi di perangkat Anda sudah diizinkan. Setelah minum obat, tandai sudah diminum agar tercatat pada kepatuhan Anda.",
  },
  {
    id: "app-riwayat",
    keywords: ["riwayat", "grafik", "perkembangan", "tren", "histori"],
    answer:
      "Menu Riwayat menampilkan seluruh hasil pencatatan Anda beserta grafik perkembangannya, sehingga terlihat apakah tekanan darah, gula darah, atau kolesterol membaik dari waktu ke waktu.\n\nAnda bisa menyaring berdasarkan jenis pemeriksaan dan rentang tanggal. Grafik ini juga dilihat oleh tenaga medis saat memberi saran.",
  },
  {
    id: "app-logbook",
    keywords: ["logbook", "kepatuhan", "persentase minum obat", "adherence"],
    answer:
      "Menu Logbook menampilkan tingkat kepatuhan minum obat Anda dalam persen:\n• 90% ke atas: Sangat Baik\n• 70–89%: Cukup\n• Di bawah 70%: Kurang\n\nAngka ini dihitung dari jadwal obat yang Anda tandai sudah diminum. Di halaman ini juga tercantum catatan dan rekomendasi dari tenaga medis.",
  },
  {
    id: "app-konsultasi",
    keywords: [
      "konsultasi tenaga medis",
      "tanya tenaga medis",
      "hubungi tenaga medis",
      "chat tenaga medis",
      "bicara dengan tenaga medis",
    ],
    answer:
      "Untuk bertanya langsung ke tenaga medis:\n1. Pilih tab Konsultasi Tenaga Medis di halaman ini\n2. Tekan tombol tambah untuk membuat permintaan baru\n3. Isi judul, penjelasan keluhan, dan tingkat kepentingan\n4. Kirim\n\nTenaga medis akan membalas melalui aplikasi dan Anda bisa melanjutkan percakapan di permintaan yang sama.",
  },
  {
    id: "app-edukasi",
    keywords: ["edukasi", "artikel", "materi", "bacaan"],
    answer:
      "Menu Edukasi berisi artikel tentang hipertensi, gula darah, dan kolesterol yang ditulis oleh tenaga medis. Tekan judul artikel untuk membacanya lengkap, termasuk perkiraan lama baca.",
  },
  {
    id: "app-profil",
    keywords: ["profil", "ubah data", "ganti nama", "target", "kata sandi", "password"],
    answer:
      "Di menu Profil Anda bisa memperbarui nama, nomor telepon, usia, tinggi dan berat badan, alamat, kontak darurat, serta target nilai kesehatan pribadi.\n\nUntuk mengganti kata sandi atau bila lupa kata sandi, hubungi admin lewat tenaga medis Anda agar dibuatkan kata sandi baru.",
  },
  {
    id: "app-umum",
    keywords: [
      "aplikasi ini",
      "imo mantap",
      "fitur apa saja",
      "bisa apa",
      "kegunaan aplikasi",
      "fungsi aplikasi",
      "menu apa saja",
    ],
    answer:
      "IMO MANTAP adalah aplikasi pendamping pasien dengan hipertensi, gula darah, dan kolesterol.\n\nFitur utamanya:\n• Catat — mencatat tekanan darah, gula darah, kolesterol\n• Obat — daftar obat dan pengingat jam minum\n• Riwayat — grafik perkembangan kondisi Anda\n• Logbook — tingkat kepatuhan minum obat dan catatan tenaga medis\n• Edukasi — artikel kesehatan\n• Konsultasi — tanya jawab langsung dengan tenaga medis\n• Profil — data diri dan target kesehatan\n\nAplikasi ini alat bantu pencatatan dan pengingat, bukan alat diagnosis.",
  },

  // ————— Sapaan —————
  {
    id: "sapaan",
    keywords: [
      "halo",
      "hai",
      "hi",
      "assalamualaikum",
      "selamat pagi",
      "selamat siang",
      "selamat sore",
      "selamat malam",
      "permisi",
    ],
    answer:
      "Halo! Ada yang bisa saya bantu seputar tekanan darah, gula darah, kolesterol, obat, atau cara memakai aplikasi IMO MANTAP?",
  },
  {
    id: "terima-kasih",
    keywords: ["terima kasih", "makasih", "thanks", "trims", "sip", "oke"],
    answer:
      "Sama-sama! Jaga terus pola makan, aktivitas fisik, dan kepatuhan minum obat Anda. Kalau ada pertanyaan lain, saya siap membantu.",
  },
  {
    id: "siapa-kamu",
    keywords: ["siapa kamu", "kamu siapa", "kamu ai", "robot", "chatbot", "bot apa"],
    answer:
      "Saya Asisten IMO MANTAP, pemandu otomatis di dalam aplikasi ini. Saya menjawab dari panduan kesehatan yang sudah disiapkan tenaga medis, khusus seputar hipertensi, gula darah, kolesterol, obat, dan fitur aplikasi.\n\nUntuk pertanyaan yang lebih pribadi atau mendetail, silakan gunakan tab Konsultasi Tenaga Medis.",
  },
];

const DISCLAIMER_SUFFIX =
  "\n\n—\nInformasi ini bersifat edukasi umum, bukan pengganti pemeriksaan dokter.";

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function scoreEntry(query: string, entry: KbEntry): number {
  let score = 0;
  for (const kw of entry.keywords) {
    const k = normalize(kw);
    if (!k) continue;
    if (query.includes(k)) {
      // frasa panjang bernilai lebih tinggi daripada satu kata
      score += k.split(" ").length * 10 + k.length;
    } else {
      const words = k.split(" ");
      if (words.length > 1) {
        const hit = words.filter((w) => w.length > 3 && query.includes(w)).length;
        if (hit === words.length) score += 8;
      }
    }
  }
  return score;
}

/** Cari jawaban untuk pertanyaan pengguna. Selalu mengembalikan teks jawaban. */
export function answerQuestion(raw: string): string {
  const q = normalize(raw);
  if (!q) return "Silakan tuliskan pertanyaan Anda.";

  for (const kw of EMERGENCY_KEYWORDS) {
    if (q.includes(normalize(kw))) return EMERGENCY_REPLY;
  }

  let best: KbEntry | null = null;
  let bestScore = 0;
  for (const entry of KB) {
    const s = scoreEntry(q, entry);
    if (s > bestScore) {
      bestScore = s;
      best = entry;
    }
  }

  if (!best || bestScore < 8) return OUT_OF_SCOPE;

  const chatty = best.id === "sapaan" || best.id === "terima-kasih" || best.id === "siapa-kamu";
  return chatty ? best.answer : best.answer + DISCLAIMER_SUFFIX;
}
