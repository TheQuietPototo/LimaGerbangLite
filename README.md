# Lima Gerbang — situs + server Node.js

Halaman web (folder `public/`) dan server Node.js yang menyimpan hasil "Cek ide Anda" ke database SQLite.

## Menjalankan

Butuh Node.js 22 atau lebih baru.

```bash
npm install
npm start
```

Buka http://localhost:3000. Jika folder `node_modules` sudah ada dari unduhan ini, hapus dulu sebelum `npm install`.

Pengaturan opsional ada di `.env.example` (salin menjadi `.env`).

## Struktur

| Berkas | Fungsi |
| --- | --- |
| `server.js` | Server Express: melayani `public/`, menerima `POST /api/submissions`, menyimpan ke SQLite |
| `gates.js` | Aturan lima gerbang yang dipakai server untuk memeriksa dan menilai kiriman |
| `export-csv.js` | Mengekspor semua data ke CSV |
| `public/` | Halaman web (`index.html`, `style.css`, `script.js`) |
| `data/gate.sqlite` | Database (dibuat otomatis saat server pertama kali jalan) |

## Data yang tersimpan

- Tabel `submissions`: waktu, nama, email, bahasa, peran, jenis ide, ide, hasil (`all_pass` / `fail` / `unsure`), gerbang tempat berhenti, dan status tiap gerbang.
- Tabel `answers`: jawaban Ya / Belum / Belum tahu untuk setiap pertanyaan.
- Server memeriksa ulang semua isian dan menghitung hasil sendiri, tidak mempercayai hasil dari peramban.

## Melihat dan mengekspor data

```bash
npm run export            # menulis data/submissions.csv (bisa dibuka di Excel)
```

File `data/gate.sqlite` juga bisa dibuka dengan DB Browser for SQLite.

## Jika diletakkan di internet

- Pakai HTTPS (misalnya lewat Nginx atau layanan hosting) dan isi `TRUST_PROXY=1` jika ada proxy di depan server.
- Cadangkan folder `data/` secara berkala. Folder itu berisi nama dan email pengunjung, jadi jangan dibagikan atau dimasukkan ke Git (sudah ada di `.gitignore`).
- Jika halaman web dilayani dari alamat lain, isi `CORS_ORIGIN` dan ubah `submitUrl` di `public/script.js` menjadi alamat lengkap server.
- Kunci Groq masih diketik pengguna di peramban. Untuk situs publik, sebaiknya panggilan ke Groq juga lewat server (`proxyUrl` di `public/script.js`).

## Mengubah pertanyaan

Jika Anda menambah atau mengurangi pertanyaan di `GATES` (`public/script.js`), samakan daftar id pertanyaan di `QUESTIONS` (`gates.js`). Jika tidak sama, server akan menolak kiriman.

## Mematikan penyimpanan

Isi `submitUrl: ""` di `public/script.js`. Halaman tetap berfungsi tanpa server, dan catatan privasi di form otomatis menyesuaikan.
