# Kytia Habit

Habit tracker harian dengan tampilan **mingguan** dan **bulanan**.
Dibangun dengan **Vue 3 + Vite**, login & database pakai **Firebase** (Auth + Firestore).

---

## Cara menjalankan

```bash
npm install
npm run dev
```

Buka `http://127.0.0.1:5173`.

> Tanpa konfigurasi Firebase, aplikasi otomatis jalan di **Demo Mode**:
> tombol "Lanjutkan dengan Google" akan langsung masuk sebagai pengguna demo dan
> data disimpan di `localStorage` browser. Cocok buat nyoba tampilan dulu.

```bash
npm run build     # build produksi ke dist/
npm run preview   # cek hasil build
```

---

## Setup Firebase (opsional, untuk login & database sungguhan)

Login memakai **Google Sign-In** (tanpa email/password).

1. Buka [Firebase Console](https://console.firebase.google.com/) → **Add project**.
2. **Build → Authentication → Get started** → tab **Sign-in method** → aktifkan
   **Google**.
3. **Build → Firestore Database → Create database** (mode produksi, pilih region terdekat).
4. **Project settings → Your apps → Web (`</>`)** → daftarkan app → copy objek `firebaseConfig`.
5. Copy `.env.example` jadi `.env`, lalu isi:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

6. Restart `npm run dev`. Banner "Mode Demo" akan hilang dan login Google aktif.

> `localhost` sudah otomatis masuk daftar **Authorized domains**, jadi tidak perlu
> diatur saat development. Kalau nanti di-deploy, tambahkan domain produksinya di
> Authentication → Settings → Authorized domains.

### Security Rules Firestore

Supaya tiap user cuma bisa baca/tulis datanya sendiri:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid}/days/{date} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

---

## Deploy ke Cloudflare Pages

### Pengaturan build

| Kolom | Nilai |
|---|---|
| Framework preset | **Vue** |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | *(kosongkan)* |

Preset **Vue** sudah otomatis mengisi build command dan output directory yang benar
(`npm run build` → `dist`). Kalau di dropdown tersedia **Vite**, itu sama persis untuk
proyek ini — pilih mana saja, hasilnya identik.

### Environment variables (wajib)

Vite **menanam** nilai `VITE_*` ke dalam bundle saat build berjalan. Artinya variabel
ini harus sudah ada **sebelum** build, bukan setelahnya. Tambahkan di
**Pages → Settings → Environment variables** (isi untuk Production *dan* Preview):

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

Kalau lupa, situs **tidak error** — dia diam-diam jalan di Demo Mode (data tersimpan
lokal per-browser) dan kamu baru sadar setelah data tidak tersinkron. Jadi pastikan
benar-benar terisi.

> Nilai-nilai ini akan terlihat di bundle publik. Itu normal dan memang begitu desain
> Firebase: API key bukan rahasia, yang menjaga data adalah Security Rules.

### Setelah deploy: daftarkan domain ke Firebase

Firebase menolak login dari domain yang tidak dikenal dengan error
`auth/unauthorized-domain`. Buka **Firebase Console → Authentication → Settings →
Authorized domains**, lalu tambahkan domain `*.pages.dev` kamu (plus custom domain
kalau ada). `localhost` sudah otomatis terdaftar.

### Yang sudah disiapkan di repo

- `public/_redirects` → `/* /index.html 200`. **Wajib** untuk SPA: tanpa ini, refresh
  atau akses langsung ke `/login` akan 404 karena Cloudflare hanya menyajikan file statis.
- `public/_headers` → `/assets/*` di-cache setahun (nama filenya sudah ber-hash),
  `index.html` selalu di-revalidate supaya deploy baru langsung terpakai.

---

## Habit yang dilacak

| Habit | Isi | Skor harian |
|---|---|---|
| **Salat** | 5 salat wajib: Subuh, Dzuhur, Ashar, Maghrib, Isya | Tepat = 100%, Telat = 66%, Sangat Telat = 33%, Tidak = 0% |
| **Lari** | Jarak (km) | target 3 km |
| **Semedi** | Wimhof (round) + Meditasi (menit) | target 3 round & 10 menit |
| **Kerja** | 3 fase, tiap fase min. 3 pomodoro | target 9 pomodoro total |
| **No Toxic** | 3 fase, tiap fase 4 warna (Bersih → Toxic) | Bersih = 100% … Toxic = 0% |
| **Jurnaling** | Jumlah pomodoro | target 1 |
| **Belajar** | Jumlah pomodoro | target 1 |

**Skor hari** = rata-rata rasio semua baris (16 baris). Dipakai untuk mewarnai sel di
tampilan bulanan, angka streak, dan kartu ringkasan.

---

## Layout

Desainnya mengikuti pola habit tracker minimalis yang paling terbukti:

- **Tampilan Mingguan** — 7 kolom (Min–Sab), sel besar, nilainya ditulis langsung
  (mis. `5` km, `3` round). Cocok buat lihat detail dan isi cepat.
- **Tampilan Bulanan** — tanggal jadi kolom, habit jadi baris, sel kecil berwarna
  seperti *heatmap*. Cocok buat lihat pola sebulan sekaligus.

Keduanya memakai **struktur matrix yang sama**: baris dikelompokkan per habit
dengan header grup + bar rata-rata. Klik sel mana pun untuk membuka panel input
harian.

Minggu dimulai **Minggu**, bukan Senin.

### Palet warna

Terinspirasi cat air — jenuh rendah, putih hangat (bukan putih murni), dan bayangan
bernada cokelat. Semua token ada di `:root` pada `src/style.css`.

Empat level status (salat & no toxic) memakai versi pudar dari hijau/kuning/oren/merah
di `PALETTE` (`src/lib/constants.js`):

| Level | Warna |
|---|---|
| Tepat / Bersih | `#7a9a72` |
| Telat / Sedikit | `#c2a559` |
| Sangat Telat / Banyak | `#c2805a` |
| Tidak / Toxic | `#b06e6c` |

Baris bernilai angka (km, round, menit, pomodoro) diwarnai otomatis dari rasio
terhadap targetnya: ≥80% hijau, ≥50% kuning, ≥25% oren, di bawahnya merah.

---

## Struktur proyek

```
src/
├── firebase.js            # config + loader lazy SDK Firebase
├── lib/
│   ├── constants.js       # definisi habit, palet warna, baris matrix
│   ├── date.js            # helper minggu/bulan (minggu mulai Minggu)
│   └── scoring.js         # nilai + warna sel, skor harian, streak
├── stores/
│   ├── auth.js            # login Google + logout (+ demo mode)
│   └── days.js            # CRUD dokumen harian, cache per bulan
├── components/
│   ├── MatrixGrid.vue     # grid mingguan & bulanan
│   ├── DayEditor.vue      # panel input harian
│   ├── StatusPicker.vue   # pemilih 4 warna
│   ├── NumberStepper.vue  # input angka +/−
│   ├── ScoreRing.vue      # ring skor
│   └── StatStrip.vue      # kartu ringkasan
└── views/
    ├── LoginView.vue
    └── DashboardView.vue
```

### Struktur data Firestore

`users/{uid}/days/{YYYY-MM-DD}` — satu dokumen per hari:

```json
{
  "date": "2026-10-13",
  "salat": { "subuh": "tepat", "dzuhur": "telat", "ashar": "tepat", "maghrib": "tepat", "isya": "tidak" },
  "lari": { "km": 5 },
  "semedi": { "wimhof": 3, "meditasi": 10 },
  "kerja": { "fase1": 3, "fase2": 4, "fase3": 3 },
  "notoxic": { "fase1": "bersih", "fase2": "sedikit", "fase3": "toxic" },
  "jurnaling": { "pomodoro": 1 },
  "belajar": { "pomodoro": 4 },
  "notes": ""
}
```

---

## Mengubah definisi habit

Semua definisi ada di **satu file**: `src/lib/constants.js`.
Mau tambah salat sunnah, ganti target km, atau ubah jumlah fase?
Cukup edit di sana — matrix, editor, dan perhitungan skor ikut menyesuaikan
