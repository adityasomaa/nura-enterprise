# Workshop Nura Enterprise

Situs dekorasi pernikahan untuk Workshop Nura Enterprise, Denpasar, Bali.
Dibangun sebagai basis kode yang dipakai ulang untuk beberapa klien dekorasi:
semua yang membedakan satu klien dengan klien lain ada di **satu file config**.

- Stack: Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS 4, TypeScript
- Bahasa: Indonesia dan Inggris, dengan pemilih bahasa yang diingat antar halaman
- Gambar: SVG geometris yang dibuat sendiri oleh script, deterministik dan bisa diregenerate
- Font: Neue Montreal, dikonversi ke WOFF2 dan di-self-host

---

## Jalankan di komputer sendiri

```bash
npm install
npm run dev
```

Perintah lain:

| Perintah | Fungsi |
| --- | --- |
| `npm run build` | Build produksi |
| `npm run graphics` | Buat ulang semua gambar album, hero, dan site icon |
| `npm run audit:contrast` | Cek kontras WCAG semua pasangan warna |
| `npm run audit:overflow` | Cek overflow, gambar rusak, dan jumlah baris heading di 375, 768, 1440 |
| `npm run verify` | Uji filter galeri, lightbox, form, menu mobile, dan pemilih bahasa di browser sungguhan |
| `npm run verify:server` | Uji seluruh aturan validasi server tanpa menjalankan server |

`audit:overflow` dan `verify` butuh Google Chrome terpasang, dan butuh situsnya
sedang berjalan. Arahkan ke alamat mana pun lewat `AUDIT_URL`:

```bash
AUDIT_URL=https://nura-enterprise.onyxcreative.asia npm run audit:overflow
```

---

## Menduplikasi untuk klien berikutnya

Ikuti urutan ini. Hanya langkah 3 yang menyentuh isi situs; sisanya urusan
nama project dan alamat.

1. **Salin project ini** ke folder baru, lalu hapus folder `.git`, `.next`, dan
   `node_modules`. Jalankan `npm install` di folder baru.

2. **Ganti nama project** di `package.json` pada field `name`, memakai slug klien
   baru, contoh `dekorasi-party`.

3. **Buka `src/config/client.ts` dan isi ulang blok `CLIENT`.** Ini satu-satunya
   file yang perlu diubah untuk mengganti klien:
   - `name` dan `shortName`: nama usaha dan nama pendek untuk wordmark
   - `slug`: dipakai untuk nama repo GitHub, nama project Vercel, dan subdomain
   - `domain`: alamat akhir situs, contoh `dekorasi-party.onyxcreative.asia`
   - `accent`: tiga warna aksen dalam OKLCH
   - `contact`, `address`, `openingHours`: isi yang sudah dikonfirmasi klien.
     Yang belum dikonfirmasi **tetap ditulis `BELUM_DIISI`**. Jangan mengarang
     alamat, jam operasional, atau nomor telepon. Bagian situs yang bergantung
     pada nilai `BELUM_DIISI` otomatis menampilkan keterangan belum tersedia
     dan tidak ikut masuk ke data terstruktur.
   - `features.riasPengantin`: `true` kalau klien juga melayani rias pengantin,
     `false` kalau hanya dekorasi. Lihat bagian "Flag rias" di bawah.

4. **Cek kontras warna aksen yang baru.**

   ```bash
   npm run audit:contrast
   ```

   Harus lolos semua. Kalau ada yang gagal, gelapkan atau terangkan warna aksen
   di `src/config/client.ts` sampai lolos, jangan diturunkan ambangnya.

5. **Ganti isi album, paket, dan label** di `src/data/site-content.ts`.
   Ganti awalan kode album agar sesuai klien baru, contoh `NRA-01` menjadi
   `DKP-01`. Cara menambah album ada di komentar di bagian atas file itu.

6. **Buat ulang gambar.**

   ```bash
   npm run graphics
   ```

   Semua gambar album, hero, dan site icon dibuat ulang mengikuti data baru.

7. **Buat repo GitHub baru** dengan nama sama persis dengan `slug`, lalu push.

8. **Buat project Vercel baru** dengan nama sama persis dengan `slug`, sambungkan
   ke repo tadi, lalu deploy. Tiga hal yang mudah terlewat:
   - Matikan Deployment Protection atau SSO di project itu. Defaultnya menyala
     di level team dan membuat URL production meminta login.
   - Klaim alias pendeknya secara eksplisit, karena alias otomatis di team scope
     akan berakhiran `-onyx-creative-asia`.
   - `images.unoptimized` sudah `true` di `next.config.ts`. Biarkan begitu.
     Kuota Image Optimization di akun ini sudah habis, dan kalau optimizer
     menyala semua gambar balas 402 dan halaman production tampil kosong.

9. **Buat subdomain di Hostinger.** Integrasi Hostinger bersifat read-only untuk
   DNS, jadi record CNAME ditambahkan manual lewat hPanel:
   `Domains > onyxcreative.asia > DNS / Nameservers`. Di form itu, pilih dulu
   type `CNAME`, baru isi kolomnya, karena label kolom ketiga berubah dari
   `Value` menjadi `Target` setelah type diganti. Sertifikat SSL butuh sekitar
   empat menit terbit setelah record masuk; error SSL sebelum itu wajar.

10. **Verifikasi sebelum lapor.**

    ```bash
    AUDIT_URL=https://<slug>.onyxcreative.asia npm run audit:overflow
    AUDIT_URL=https://<slug>.onyxcreative.asia npm run verify
    npm run verify:server
    ```

---

## Flag rias

`features.riasPengantin` di `src/config/client.ts` menyalakan atau mematikan
seluruh bagian rias pengantin dalam satu langkah:

| Nilai | Akibatnya |
| --- | --- |
| `true` | Menu `Rias` muncul di navigasi, rute `/id/rias` dan `/en/rias` dibuat, halamannya punya galeri rias sendiri, dan kedua halaman masuk sitemap |
| `false` | Menu rias hilang dari navigasi, rute rias menjawab 404, dan tidak ada satu pun URL rias di sitemap |

Album rias diedit di `RIAS_ALBUMS` pada `src/data/site-content.ts`.

---

## Aturan isi yang dipegang situs ini

Situs ini sengaja tidak mengklaim apa pun yang belum dikonfirmasi klien:

- tidak ada harga, karena biaya dekorasi tergantung ukuran venue, jumlah tamu,
  dan jenis bunga, jadi semua paket mengarah ke konsultasi
- tidak ada rating, jumlah ulasan, jumlah acara, tahun berdiri, atau testimoni
- tidak ada nama venue, nama vendor, nama pengantin, atau nama tim. Untuk lokasi
  hanya dipakai kategori: gedung, villa, pantai, rumah, dan pura
- tidak ada janji soal ketersediaan tanggal
- semua gambar adalah ilustrasi geometris buatan sendiri. Alt text-nya menyebut
  hal itu secara eksplisit dan tidak pernah mengaku sebagai dokumentasi acara

---

## Peta isi project

```
src/
  config/client.ts          satu-satunya file yang diubah saat ganti klien
  data/site-content.ts      album, paket, dan label, dengan komentar cara mengedit
  lib/
    i18n.ts                 seluruh teks dalam dua bahasa
    consultation.ts         aturan validasi form, dipakai server action
    routes.ts               peta rute dan menu navigasi
    metadata.ts             canonical dan hreflang per halaman
    whatsapp.ts             perakitan tautan wa.me dan jejak asal
  components/
    providers/              transisi halaman, Lenis, status overlay, izin cookie
    gallery/                grid album, filter, dan lightbox
    form/                   listbox ARIA, pemilih tanggal, form konsultasi
  app/
    [lang]/                 seluruh halaman, dua bahasa
    actions/consultation.ts server action tipis, aturannya di lib/consultation.ts
scripts/
  generate-graphics.mts     generator SVG deterministik
  build-font-assets.py      konversi Neue Montreal ke WOFF2
  audit-contrast.mjs        cek kontras WCAG
  audit-overflow.mjs        cek overflow dan jumlah baris heading
  verify-interactions.mjs   uji galeri, lightbox, form, menu, bahasa
  verify-server-validation.ts  uji aturan validasi server
```

---

## Skala z-index

Satu skala saja, ditulis sebagai token di `src/app/globals.css`, dan dipakai
lewat utility. Tidak ada angka z-index mentah di komponen mana pun.

konten < header sticky < panel filter < menu mobile < lightbox dan kalender
< cookie banner < tirai transisi < skip link

---

## Font

Font sumber tidak ikut di repo. Untuk membuat ulang file WOFF2:

```bash
pip install fonttools brotli
python scripts/build-font-assets.py
```

Kalau file `.ttf` ada di folder lain, set `NEUE_MONTREAL_DIR` lebih dulu.
