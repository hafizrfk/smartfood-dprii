# 🍱 SmartFood ERP - Monitoring Konsumsi Makanan & Klasemen Peserta DPR II

SmartFood ERP adalah sistem ERP terpadu untuk mencatat, merekap, dan memonitor jumlah makanan serta snack yang dikonsumsi oleh setiap peserta. Dilengkapi dengan **Klasemen (Leaderboard)** pemakan terbanyak, rekap kuantitas per jenis makanan, serta dropdown rincian menu apa saja yang dimakan oleh masing-masing peserta.

---

## 🏆 Fitur Utama yang Telah Dibuat Sesuai Kebutuhan

### 1. 👥 Data Peserta DPR II & Menu Tambah Peserta
Telah dikonfigurasi secara bawaan dengan ID dan nama peserta:
- `dprii-001` = **Hafiz**
- `dprii-002` = **Viko**
- `dprii-003` = **Tiyan**
- `dprii-004` = **Sarah**
- `dprii-005` = **Rizka**
- `dprii-006` = **Zahra**

> ➕ **Menu Tambah Peserta**: Terdapat tombol **"+ Tambah Peserta"** di Dashboard dan Master Data untuk menambahkan peserta baru kapan saja (misal: `dprii-007` = Arif).

### 2. 🍪 Input & Daftar Makanan / Snack
Daftar makanan yang sudah terdaftar secara bawaan:
- **Good Time** (🍪 Biskuit Cokelat)
- **Momogi** (🌽 Snack Jagung Bakar)
- **Makaroni** (🍝 Snack Makaroni Gurih)
- **Malkist Kelapa** (🍘 Biskuit Malkist Manis)
- **Beng-Beng** (🍫 Cokelat Wafer Karamel)
- **Chiki Balls** (🧀 Snack Bola Keju)

> ➕ **Menu Tambah Jenis Makanan**: Terdapat tombol modal **"+ Tambah Makanan"** untuk memasukkan jenis snack baru lengkap dengan kategori, satuan, dan icon emoji.

> 🍽️ **Form Catat Makanan Dimakan (Quick POS)**: Di dashboard utama, cukup pilih nama peserta, pilih makanan yang diambil, masukkan jumlah (pcs/bungkus), lalu klik **"Catat"** -> klasemen langsung ter-update secara otomatis!

### 3. 🥇 Dashboard Rekap & Klasemen (Leaderboard)
- **Podium Juara 1, 2, 3**: Menampilkan Top 3 pemakan terbanyak dengan medali (🥇 Juara 1, 🥈 Juara 2, 🥉 Juara 3) dan kartu visual menarik.
- **Tabel Peringkat Lengkap**: Menampilkan seluruh peserta diurutkan dari yang makan paling banyak ke paling sedikit.
- **Rekap Jumlah Makanan Dimakan**:
  - Berapa banyak **Good Time** yang sudah dimakan (misal: 9 bungkus).
  - Berapa banyak **Momogi** yang sudah dimakan (misal: 9 pcs).
  - Berapa banyak **Makaroni** yang sudah dimakan (misal: 5 bungkus).
  - Berapa banyak **Malkist Kelapa** yang sudah dimakan (misal: 5 bungkus).
  - Dilengkapi Donut Chart proporsi konsumsi antar snack.

### 4. 🔍 Dropdown Detail per Peserta (Rincian Konsumsi)
- Terdapat **Dropdown Pemilihan Peserta** (Hafiz, Viko, Tiyan, Sarah, Rizka, Zahra).
- Saat salah satu peserta dipilih, sistem akan menampilkan:
  - **Total Makanan yang Dimakan** (misal: Hafiz: 8 Makanan).
  - **Daftar Apa Saja yang Dimakan**:
    - 🍪 Good Time: 3 bungkus
    - 🍝 Makaroni: 2 bungkus
    - 🌽 Momogi: 2 pcs
    - 🍘 Malkist Kelapa: 1 bungkus
  - **Riwayat Waktu Transaksi**: Kapan saja peserta mengambil makanan tersebut beserta catatannya.

### 5. ⚡ Terminal Scan (POS Barcode / QR Code)
- Scan ID peserta menggunakan Barcode Scanner atau Kamera Laptop/HP.
- Peringatan audio chime/buzzer dan pencegahan klaim ganda (*Double Claim*).

---

## 🚀 Panduan Upload ke GitHub & Hosting di Vercel

Repository Git lokal sudah diinisialisasi dan di-commit pada branch `main`.

### Langkah 1: Buat Repository di GitHub
1. Buka [github.com/new](https://github.com/new) di browser Anda.
2. Beri nama repository, misalnya: `smartfood-dpr-ii` atau `meal-monitoring-erp`.
3. Biarkan opsi *"Initialize with README"* **tidak dicentang** (karena kita sudah punya berkas lokal).
4. Klik **Create repository**.

### Langkah 2: Push dari Terminal Anda
Buka PowerShell di folder project:
```powershell
cd "C:\Users\HYPE AMD\.gemini\antigravity\scratch\meal-monitoring-erp"

# Hubungkan ke repo GitHub Anda (ganti URL di bawah dengan URL repo Anda)
git remote add origin https://github.com/hafizrfk/smartfood-dpr-ii.git

# Push ke GitHub
git push -u origin main
```

---

### Langkah 3: Deploy ke Vercel (1 Menit)
Project ini sudah dilengkapi dengan berkas **`vercel.json`**, **`api/index.js`**, dan **`store.js`** (LocalStorage Dual-Persistence) sehingga 100% siap dihosting di Vercel tanpa perlu setup rumit:

1. Buka [vercel.com](https://vercel.com) dan login dengan akun GitHub Anda.
2. Klik tombol **"Add New..."** -> **"Project"**.
3. Pilih repository GitHub yang baru saja Anda push (`smartfood-dpr-ii`).
4. Pada bagian *Framework Preset*, biarkan **Other**.
5. Klik **"Deploy"**.
6. Selesai! Web aplikasi Anda langsung online di URL seperti `https://smartfood-dpr-ii.vercel.app`.

> [!NOTE]
> Sistem dilengkapi **Dual-Sync Storage**: Data peserta dan konsumsi tersimpan di browser via `localStorage` sekaligus server API, sehingga saat dihosting di Vercel (serverless), data Anda tetap tersimpan dan tidak akan hilang saat reload halaman.

---

## 🏃 Cara Menjalankan Lokal

```powershell
cd "C:\Users\HYPE AMD\.gemini\antigravity\scratch\meal-monitoring-erp"
npm start
```
Buka browser pada: **`http://localhost:5050`**
