/* =============================================================================
 * DATA ISI SITUS: ALBUM GALERI, PAKET, DAN LABEL GAYA
 * =============================================================================
 *
 * File ini sengaja dibuat supaya bisa diedit tanpa perlu paham React.
 * Semua teks punya dua versi: id (Indonesia) dan en (Inggris).
 *
 * CARA MENAMBAH SATU ALBUM BARU
 * -----------------------------
 * 1. Salin satu blok album yang sudah ada di dalam ALBUMS.
 * 2. Ganti "code" dengan kode baru yang belum dipakai, contoh "NRA-11".
 *    Kode ini yang ikut terkirim ke WhatsApp saat calon klien bertanya
 *    sambil menunjuk album, jadi jangan sampai kembar.
 * 3. Ganti "slug" dengan alamat halaman album, huruf kecil dan tanpa spasi.
 * 4. Isi "eventType", "placement", dan "style" dengan salah satu nilai yang
 *    terdaftar di bagian LABEL di bawah. Ketiganya dipakai oleh filter galeri.
 * 5. Isi daftar "photos". Satu album berisi beberapa foto yang saling terkait
 *    dari satu acara yang sama, misalnya pelaminan, gate masuk, meja penerima
 *    tamu, dan area foto.
 * 6. Jalankan "npm run graphics" supaya gambar album baru ikut dibuat.
 *
 * CATATAN PENTING
 * ---------------
 * - Jangan menulis harga di file ini. Harga dekorasi selalu tergantung ukuran
 *   venue, jumlah tamu, dan jenis bunga, jadi situs mengarahkan ke konsultasi.
 * - Jangan menulis nama venue, nama vendor, nama pengantin, atau nama tim.
 *   Untuk lokasi cukup pakai kategori: gedung, villa, pantai, rumah, atau pura.
 * -------------------------------------------------------------------------- */

export type Locale = "id" | "en";
export type Bilingual = { id: string; en: string };

/* -------------------------------------------------------------------------- */
/*  LABEL: JENIS ACARA                                                        */
/* -------------------------------------------------------------------------- */

export const EVENT_TYPES = [
  { id: "akad", label: { id: "Akad", en: "Akad" } },
  { id: "resepsi", label: { id: "Resepsi", en: "Reception" } },
  { id: "engagement", label: { id: "Engagement", en: "Engagement" } },
  { id: "siraman", label: { id: "Siraman", en: "Siraman" } },
] as const satisfies readonly { id: string; label: Bilingual }[];

export type EventTypeId = (typeof EVENT_TYPES)[number]["id"];

/* -------------------------------------------------------------------------- */
/*  LABEL: TEMPAT                                                             */
/* -------------------------------------------------------------------------- */

export const PLACEMENTS = [
  { id: "indoor", label: { id: "Indoor", en: "Indoor" } },
  { id: "outdoor", label: { id: "Outdoor", en: "Outdoor" } },
] as const satisfies readonly { id: string; label: Bilingual }[];

export type PlacementId = (typeof PLACEMENTS)[number]["id"];

/* -------------------------------------------------------------------------- */
/*  LABEL: GAYA DEKORASI                                                      */
/* -------------------------------------------------------------------------- */
/*  Nilai "id" juga dipakai sebagai kunci gambar generatif, jadi kalau diubah, */
/*  jalankan ulang "npm run graphics".                                        */

export const STYLES = [
  {
    id: "rustic",
    label: { id: "Rustic", en: "Rustic" },
    note: {
      id: "Material kayu, anyaman, dan bunga kering dengan warna hangat.",
      en: "Wood, weave, and dried florals in warm tones.",
    },
  },
  {
    id: "modern-minimalis",
    label: { id: "Modern Minimalis", en: "Modern Minimalist" },
    note: {
      id: "Bentuk bersih, garis tegas, dan palet yang ditahan.",
      en: "Clean shapes, firm lines, and a restrained palette.",
    },
  },
  {
    id: "tradisional-bali",
    label: { id: "Tradisional Bali", en: "Balinese Traditional" },
    note: {
      id: "Ornamen dan susunan yang mengikuti pakem dekorasi Bali.",
      en: "Ornament and arrangement following Balinese decor conventions.",
    },
  },
  {
    id: "garden",
    label: { id: "Garden", en: "Garden" },
    note: {
      id: "Dominan dedaunan dan bunga segar untuk area terbuka.",
      en: "Foliage and fresh florals for open-air settings.",
    },
  },
  {
    id: "all-white",
    label: { id: "All White", en: "All White" },
    note: {
      id: "Satu keluarga warna putih dengan permainan tekstur kain.",
      en: "A single white family, with fabric texture doing the work.",
    },
  },
] as const satisfies readonly { id: string; label: Bilingual; note: Bilingual }[];

export type StyleId = (typeof STYLES)[number]["id"];

/* -------------------------------------------------------------------------- */
/*  LABEL: KATEGORI VENUE                                                     */
/* -------------------------------------------------------------------------- */
/*  Hanya kategori, bukan nama tempat.                                        */

export const VENUE_CATEGORIES = [
  { id: "gedung", label: { id: "Gedung", en: "Hall" } },
  { id: "villa", label: { id: "Villa", en: "Villa" } },
  { id: "pantai", label: { id: "Pantai", en: "Beach" } },
  { id: "rumah", label: { id: "Rumah", en: "Home" } },
  { id: "pura", label: { id: "Pura", en: "Temple" } },
  { id: "belum-tahu", label: { id: "Belum ditentukan", en: "Not decided yet" } },
] as const satisfies readonly { id: string; label: Bilingual }[];

export type VenueCategoryId = (typeof VENUE_CATEGORIES)[number]["id"];

/* -------------------------------------------------------------------------- */
/*  LABEL: ADEGAN DALAM SATU ALBUM                                            */
/* -------------------------------------------------------------------------- */
/*  Nilai "id" dipakai sebagai kunci gambar generatif.                        */

export const SCENES = [
  { id: "pelaminan", label: { id: "Pelaminan", en: "Main stage" } },
  { id: "gate", label: { id: "Gate masuk", en: "Entrance gate" } },
  { id: "meja-penerima-tamu", label: { id: "Meja penerima tamu", en: "Guest reception table" } },
  { id: "area-foto", label: { id: "Area foto", en: "Photo area" } },
  { id: "jalur-masuk", label: { id: "Jalur masuk tamu", en: "Guest walkway" } },
  { id: "area-akad", label: { id: "Area akad", en: "Ceremony area" } },
] as const satisfies readonly { id: string; label: Bilingual }[];

export type SceneId = (typeof SCENES)[number]["id"];

/* -------------------------------------------------------------------------- */
/*  ALBUM GALERI                                                              */
/* -------------------------------------------------------------------------- */

export type Album = {
  code: string;
  slug: string;
  title: Bilingual;
  summary: Bilingual;
  eventType: EventTypeId;
  placement: PlacementId;
  style: StyleId;
  venue: Exclude<VenueCategoryId, "belum-tahu">;
  photos: { scene: SceneId }[];
};

export const ALBUMS: Album[] = [
  {
    code: "NRA-01",
    slug: "resepsi-rustic-gedung",
    title: { id: "Resepsi rustic di gedung", en: "Rustic reception in a hall" },
    summary: {
      id: "Susunan pelaminan kayu dengan bunga kering dan penataan area penerima tamu.",
      en: "A timber stage arrangement with dried florals and a set guest reception area.",
    },
    eventType: "resepsi",
    placement: "indoor",
    style: "rustic",
    venue: "gedung",
    photos: [
      { scene: "pelaminan" },
      { scene: "gate" },
      { scene: "meja-penerima-tamu" },
      { scene: "area-foto" },
    ],
  },
  {
    code: "NRA-02",
    slug: "akad-all-white-rumah",
    title: { id: "Akad all white di rumah", en: "All white akad at home" },
    summary: {
      id: "Area akad dengan satu keluarga warna putih dan permainan lipatan kain.",
      en: "A ceremony area in one white family, with folded fabric carrying the texture.",
    },
    eventType: "akad",
    placement: "indoor",
    style: "all-white",
    venue: "rumah",
    photos: [
      { scene: "area-akad" },
      { scene: "jalur-masuk" },
      { scene: "meja-penerima-tamu" },
    ],
  },
  {
    code: "NRA-03",
    slug: "resepsi-garden-villa",
    title: { id: "Resepsi garden di villa", en: "Garden reception at a villa" },
    summary: {
      id: "Pelaminan terbuka dengan dedaunan dan bunga segar, ditata untuk area luar.",
      en: "An open stage with foliage and fresh florals, arranged for an outdoor area.",
    },
    eventType: "resepsi",
    placement: "outdoor",
    style: "garden",
    venue: "villa",
    photos: [
      { scene: "pelaminan" },
      { scene: "jalur-masuk" },
      { scene: "area-foto" },
      { scene: "meja-penerima-tamu" },
    ],
  },
  {
    code: "NRA-04",
    slug: "resepsi-tradisional-bali-pura",
    title: { id: "Resepsi tradisional Bali", en: "Balinese traditional reception" },
    summary: {
      id: "Penataan mengikuti pakem dekorasi Bali, dari gate masuk sampai area utama.",
      en: "Arrangement following Balinese decor conventions, from the gate to the main area.",
    },
    eventType: "resepsi",
    placement: "outdoor",
    style: "tradisional-bali",
    venue: "pura",
    photos: [
      { scene: "gate" },
      { scene: "pelaminan" },
      { scene: "jalur-masuk" },
    ],
  },
  {
    code: "NRA-05",
    slug: "engagement-modern-minimalis-gedung",
    title: { id: "Engagement modern minimalis", en: "Modern minimalist engagement" },
    summary: {
      id: "Backdrop bergaris bersih untuk acara kecil dengan area foto tersendiri.",
      en: "A clean-lined backdrop for a small event with its own photo area.",
    },
    eventType: "engagement",
    placement: "indoor",
    style: "modern-minimalis",
    venue: "gedung",
    photos: [
      { scene: "pelaminan" },
      { scene: "area-foto" },
      { scene: "meja-penerima-tamu" },
    ],
  },
  {
    code: "NRA-06",
    slug: "resepsi-all-white-pantai",
    title: { id: "Resepsi all white di pantai", en: "All white beach reception" },
    summary: {
      id: "Struktur ringan untuk area terbuka dengan jalur masuk tamu yang ditata.",
      en: "A light structure for an open area with a set guest walkway.",
    },
    eventType: "resepsi",
    placement: "outdoor",
    style: "all-white",
    venue: "pantai",
    photos: [
      { scene: "pelaminan" },
      { scene: "jalur-masuk" },
      { scene: "gate" },
      { scene: "area-foto" },
    ],
  },
  {
    code: "NRA-07",
    slug: "siraman-tradisional-bali-rumah",
    title: { id: "Siraman tradisional di rumah", en: "Traditional siraman at home" },
    summary: {
      id: "Penataan area siraman di halaman rumah dengan ornamen tradisional.",
      en: "A siraman area set in a home yard with traditional ornament.",
    },
    eventType: "siraman",
    placement: "outdoor",
    style: "tradisional-bali",
    venue: "rumah",
    photos: [
      { scene: "area-akad" },
      { scene: "gate" },
      { scene: "meja-penerima-tamu" },
    ],
  },
  {
    code: "NRA-08",
    slug: "akad-modern-minimalis-gedung",
    title: { id: "Akad modern minimalis", en: "Modern minimalist akad" },
    summary: {
      id: "Area akad dengan bidang polos, satu lengkung, dan aksen bunga terbatas.",
      en: "A ceremony area of plain planes, one arch, and limited floral accent.",
    },
    eventType: "akad",
    placement: "indoor",
    style: "modern-minimalis",
    venue: "gedung",
    photos: [
      { scene: "area-akad" },
      { scene: "meja-penerima-tamu" },
      { scene: "area-foto" },
    ],
  },
  {
    code: "NRA-09",
    slug: "resepsi-rustic-villa",
    title: { id: "Resepsi rustic di villa", en: "Rustic reception at a villa" },
    summary: {
      id: "Gate anyaman dan pelaminan kayu untuk acara di area terbuka villa.",
      en: "A woven gate and timber stage for an event in an open villa area.",
    },
    eventType: "resepsi",
    placement: "outdoor",
    style: "rustic",
    venue: "villa",
    photos: [
      { scene: "gate" },
      { scene: "pelaminan" },
      { scene: "area-foto" },
      { scene: "jalur-masuk" },
    ],
  },
  {
    code: "NRA-10",
    slug: "engagement-garden-rumah",
    title: { id: "Engagement garden di rumah", en: "Garden engagement at home" },
    summary: {
      id: "Penataan skala kecil dengan dedaunan segar dan meja penerima tamu.",
      en: "A small-scale arrangement with fresh foliage and a guest reception table.",
    },
    eventType: "engagement",
    placement: "outdoor",
    style: "garden",
    venue: "rumah",
    photos: [
      { scene: "pelaminan" },
      { scene: "meja-penerima-tamu" },
      { scene: "jalur-masuk" },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/*  ALBUM RIAS PENGANTIN                                                      */
/* -------------------------------------------------------------------------- */
/*  Hanya dipakai kalau features.riasPengantin di src/config/client.ts         */
/*  bernilai true. Kalau false, bagian ini tidak dirender di mana pun.         */

export type RiasAlbum = {
  code: string;
  title: Bilingual;
  summary: Bilingual;
  style: StyleId;
  photos: { scene: SceneId }[];
};

export const RIAS_ALBUMS: RiasAlbum[] = [
  {
    code: "NRA-R1",
    title: { id: "Rias untuk akad", en: "Makeup for the akad" },
    summary: {
      id: "Penataan rias dan busana untuk rangkaian akad.",
      en: "Makeup and wardrobe styling for the akad sequence.",
    },
    style: "all-white",
    photos: [{ scene: "area-akad" }, { scene: "area-foto" }],
  },
  {
    code: "NRA-R2",
    title: { id: "Rias untuk resepsi", en: "Makeup for the reception" },
    summary: {
      id: "Penataan rias dan busana untuk rangkaian resepsi.",
      en: "Makeup and wardrobe styling for the reception sequence.",
    },
    style: "modern-minimalis",
    photos: [{ scene: "pelaminan" }, { scene: "area-foto" }],
  },
  {
    code: "NRA-R3",
    title: { id: "Rias tradisional", en: "Traditional makeup" },
    summary: {
      id: "Penataan rias dan busana mengikuti pakem tradisional.",
      en: "Makeup and wardrobe styling following traditional conventions.",
    },
    style: "tradisional-bali",
    photos: [{ scene: "area-akad" }, { scene: "gate" }],
  },
];

/* -------------------------------------------------------------------------- */
/*  PAKET DEKORASI                                                            */
/* -------------------------------------------------------------------------- */
/*  Paket dijelaskan lewat AREA yang didekorasi, bukan daftar barang, karena   */
/*  calon klien lebih mudah membayangkan area daripada item.                   */
/*  TIDAK ADA ANGKA HARGA DI SINI. Semua paket mengarah ke konsultasi.         */

export type Packet = {
  id: string;
  name: Bilingual;
  /** Satu kalimat: paket ini untuk siapa. */
  fitFor: Bilingual;
  /** Daftar area yang ditata. Tulis sebagai area, bukan nama barang. */
  areas: Bilingual[];
  /** Hal yang menentukan cakupan akhir paket ini. */
  notes: Bilingual;
};

export const PACKETS: Packet[] = [
  {
    id: "akad",
    name: { id: "Dekorasi Akad", en: "Akad Decoration" },
    fitFor: {
      id: "Untuk acara yang hanya menggelar rangkaian akad atau pemberkatan.",
      en: "For events that hold the akad or blessing sequence only.",
    },
    areas: [
      { id: "Area akad dan latar prosesi", en: "Ceremony area and processional backdrop" },
      { id: "Jalur masuk tamu", en: "Guest walkway" },
      { id: "Meja penerima tamu", en: "Guest reception table" },
      { id: "Area duduk keluarga inti", en: "Immediate family seating area" },
    ],
    notes: {
      id: "Cakupan menyesuaikan ukuran ruang dan posisi area akad di dalamnya.",
      en: "Coverage adapts to the room size and where the ceremony area sits within it.",
    },
  },
  {
    id: "resepsi",
    name: { id: "Dekorasi Resepsi", en: "Reception Decoration" },
    fitFor: {
      id: "Untuk acara resepsi yang berdiri sendiri, di dalam maupun di luar ruangan.",
      en: "For a standalone reception, indoors or outdoors.",
    },
    areas: [
      { id: "Pelaminan dan latar utama", en: "Main stage and primary backdrop" },
      { id: "Gate masuk", en: "Entrance gate" },
      { id: "Meja penerima tamu", en: "Guest reception table" },
      { id: "Area foto", en: "Photo area" },
      { id: "Jalur masuk tamu", en: "Guest walkway" },
    ],
    notes: {
      id: "Cakupan menyesuaikan ukuran venue dan perkiraan jumlah tamu.",
      en: "Coverage adapts to the venue size and the estimated guest count.",
    },
  },
  {
    id: "lengkap",
    name: { id: "Paket Lengkap", en: "Full Package" },
    fitFor: {
      id: "Untuk rangkaian akad dan resepsi yang ditata dalam satu arah desain.",
      en: "For an akad and reception sequence set in one design direction.",
    },
    areas: [
      { id: "Area akad dan latar prosesi", en: "Ceremony area and processional backdrop" },
      { id: "Pelaminan dan latar utama", en: "Main stage and primary backdrop" },
      { id: "Gate masuk", en: "Entrance gate" },
      { id: "Meja penerima tamu", en: "Guest reception table" },
      { id: "Area foto", en: "Photo area" },
      { id: "Jalur masuk tamu dan area meja tamu", en: "Guest walkway and guest table area" },
    ],
    notes: {
      id: "Cakupan menyesuaikan jumlah rangkaian acara, venue, dan jadwal pemasangan.",
      en: "Coverage adapts to the number of sequences, the venue, and the install schedule.",
    },
  },
];

/* -------------------------------------------------------------------------- */
/*  PEMBANTU                                                                  */
/* -------------------------------------------------------------------------- */

export function albumImagePath(code: string, scene: SceneId): string {
  return `/graphics/albums/${code}-${scene}.svg`;
}

export function findAlbum(slug: string): Album | undefined {
  return ALBUMS.find((album) => album.slug === slug);
}

export function labelOf(
  list: readonly { id: string; label: Bilingual }[],
  id: string,
  locale: Locale,
): string {
  return list.find((item) => item.id === id)?.label[locale] ?? id;
}
