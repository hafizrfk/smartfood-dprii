# 🍱 SmartFood ERP - Sistem Monitoring Konsumsi Makanan Peserta

SmartFood ERP adalah sistem ERP terpadu untuk memonitor, mengaudit, dan mengendalikan jumlah konsumsi makanan per peserta dalam acara berskala besar, pusat pelatihan (training center/bootcamp), asrama, kantor korporat, konferensi, maupun kegiatan seminar.

Aplikasi ini mengatasi 3 masalah utama manajemen katering acara:
1. **Pencegahan Double Claim (Joki Makan)**: Memastikan setiap peserta hanya dapat mengambil makanan 1 porsi per sesi, mencegah peserta kehabisan akibat klaim ganda.
2. **Peringatan Alergen & Diet Khusus**: Sistem scanner otomatis mendeteksi dan memberi peringatan mencolok jika peserta memiliki alergi tertentu (udang/seafood, kacang, gluten, diabetik, vegetarian/vegan).
3. **Analisis Food Waste & Efisiensi Anggaran**: Membandingkan porsi yang dipesan ke vendor katering dengan porsi aktual yang dikonsumsi, menghitung nilai rupiah pemborosan (food waste), dan menyediakan matriks kehadiran makan antar divisi.

---

## 🚀 Fitur Unggulan

### 1. 📊 Dashboard Eksekutif & Live Feed
- **KPI Real-Time**: Peserta Terdaftar, Total Porsi Terambil, Realisasi Biaya Makan (Rp), dan Jumlah Percobaan Double Claim yang berhasil digagalkan.
- **Monitoring Ketersediaan Prasmanan**: Progres porsi terambil vs sisa porsi di buffet/dapur per sesi (Sarapan, Makan Siang, Coffee Break, Makan Malam).
- **Grafik Interaktif (Chart.js)**: Donut Chart distribusi porsi per sesi dan Bar Chart rasio kehadiran per departemen.
- **Live Scan Ticker**: Stream aktivitas real-time peserta yang baru saja melakukan check-in makan.

### 2. ⚡ Terminal Scan Cepat (Barcode, QR Code & Kamera)
- **High-Speed Gate POS**: Didesain untuk antrean cepat katering (kurang dari 2 detik per peserta).
- **Auto-Detect Keystroke Scanner**: Kompatibel dengan semua jenis Barcode/QR Scanner USB atau Bluetooth, cukup scan dan otomatis terverifikasi.
- **Kamera QR Scanner**: Dukungan pemindaian langsung dari kamera ponsel atau webcam laptop (`html5-qrcode`).
- **Efek Suara Sintetis (Web Audio API)**:
  - 🔔 *Success Chime* saat porsi berhasil diambil.
  - 🚨 *Dual Buzz Alert* saat terjadi percobaan klaim ganda (*Double Claim*).
- **Peringatan Alergi Menyala**: Menampilkan banner oranye/kuning jika peserta memiliki pantangan makanan medis.
- **Otorisasi Override Panitia**: Fitur porsi tambahan khusus dengan catatan audit alasan untuk tamu VIP atau panitia lembur.

### 3. 👥 Master Data Peserta & Cetak Kartu ID Lanyard
- CRUD data peserta (Kode ID/Badge, Nama, Departemen, Kategori [Peserta/Panitia/VIP], No WhatsApp, Email, Preferensi Diet, Alergi).
- **Generator Kartu Peserta Siap Cetak**: Fitur satu-klik untuk mencetak kartu lanyard ber-QR Code tajam (menggunakan `@media print` layout 2 kolom).
- **Ekspor & Impor Massal**: Dukungan download data ke file Excel (`.xlsx`) dan impor massal dari file CSV peserta.

### 4. 🍱 Manajemen Sesi & Menu Katering
- Pengaturan 4 sesi makan harian:
  - Sarapan Pagi (06:30 - 09:00 WIB)
  - Makan Siang (11:30 - 14:00 WIB)
  - Coffee Break & Snack Sore (15:30 - 16:45 WIB)
  - Makan Malam (18:30 - 21:00 WIB)
- Switch kontrol buka/tutup sesi prasmanan.
- Pencatatan vendor katering, harga per porsi, target porsi dipesan, dan deskripsi menu.

### 5. 📋 Log Riwayat Transaksi & Audit Trail
- Tabel pencatatan detail tiap porsi yang diambil hingga ke detik transaksi.
- Filter berdasarkan Tanggal, Sesi Makan, Status (Sukses, Override, Ditolak), dan Pencarian Nama.
- Ekspor log transaksional ke Excel (`.xlsx`).

### 6. 📈 Laporan Efisiensi Finansial & Food Waste
- **Food Waste Calculator**: Menghitung berapa porsi makanan sisa dan nilai rupiah yang terbuang jika peserta tidak hadir makan.
- **Matriks Kehadiran Divisi**: Memetakan departemen mana yang memiliki persentase makan tertinggi vs paling sering absen.
- **Diagram Kebutuhan Diet Khusus**: Menampilkan persentase peserta Halal, Vegetarian, Vegan, Bebas Gluten, dan Rendah Gula untuk panduan order ke catering besok.

---

## 🛠️ Arsitektur & Teknologi

- **Backend**: Node.js & Express.js 5
- **Database**: SQLite (via `better-sqlite3` dengan WAL Mode & ACID Transactions)
- **Frontend**: Single Page Application (SPA) responsive dengan Tailwind CSS CDN
- **Visualisasi Data**: Chart.js
- **Scanner Kamera**: HTML5-QRCode
- **Generator QR Code**: QRCode.js
- **Audio Synthesizer**: Web Audio API (100% offline tanpa dependensi file eksternal)
- **Spreadsheet Engine**: SheetJS (`xlsx`)

---

## 📁 Struktur Direktori

```
meal-monitoring-erp/
├── data/
│   └── meal_erp.db          # Database SQLite (auto-seed pada inisialisasi)
├── public/
│   ├── css/
│   │   └── style.css        # Animasi pulse/shake & template cetak ID card
│   ├── js/
│   │   ├── api.js           # Client wrapper REST API
│   │   ├── audio.js         # Synthesizer audio chime & buzzer
│   │   ├── dashboard.js     # Logika chart & KPI eksekutif
│   │   ├── scanner.js       # Logika scanner barcode/QR & deteksi dobel
│   │   ├── participants.js  # CRUD peserta, impor CSV, & generator kartu QR
│   │   ├── sessions.js      # Pengaturan jadwal & menu katering
│   │   ├── logs.js          # Riwayat transaksi & audit log
│   │   ├── reports.js       # Analisis Food Waste & matriks departemen
│   │   └── app.js           # Router tab, toast notification & keyboard shortcuts
│   └── index.html           # Tampilan antarmuka ERP
├── database.js              # Schema SQLite, queries, & seed data awal
├── server.js                # Express REST API Server
├── package.json             # Dependensi & script start
└── README.md
```

---

## 🏃 Cara Menjalankan Project

1. Buka terminal di folder project:
   ```powershell
   cd "C:\Users\HYPE AMD\.gemini\antigravity\scratch\meal-monitoring-erp"
   ```

2. Jalankan aplikasi:
   ```powershell
   npm start
   ```

3. Buka browser dan akses:
   ```
   http://localhost:5050
   ```

---

## 💡 Panduan Pengujian Singkat

1. **Uji Coba Scan Normal**:
   - Klik tab **Terminal Scan (F2)**.
   - Klik tombol demo **PST-1002 (Dewi - Vegetarian)**.
   - Layar akan menampilkan konfirmasi porsi sukses, status diet vegetarian, serta suara chime!
2. **Uji Coba Deteksi Double Claim (Joki Makan)**:
   - Klik lagi tombol demo yang sama (**PST-1002**).
   - Layar akan bergetar merah dan menampilkan: *"DOUBLE CLAIM DETECTED: Dewi Lestari sudah mengambil makanan pada sesi ini!"* disertai suara buzzer.
3. **Uji Coba Peringatan Alergi**:
   - Klik tombol demo **PST-1003 (Budi Santoso)**.
   - Layar akan menampilkan kotak peringatan oranye menyala: *"⚠️ Alergi: Alergi Udang & Seafood"*.
4. **Uji Coba Cetak Kartu ID**:
   - Buka tab **Master Peserta & QR** -> Klik **Cetak Kartu ID & QR**.
   - Preview kartu lanyard siap potong lengkap dengan QR code individual akan tampil.
5. **Uji Coba Laporan Food Waste**:
   - Buka tab **Laporan & Food Waste** untuk melihat perhitungan rupiah makanan sisa dan efisiensi katering.
