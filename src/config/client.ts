/* =============================================================================
 * SATU-SATUNYA FILE YANG PERLU DIUBAH UNTUK GANTI KLIEN
 * =============================================================================
 *
 * Semua yang membedakan satu klien dengan klien lain ada di file ini:
 * nama, slug, subdomain, warna aksen, alamat, nomor WhatsApp, dan flag layanan.
 * Tidak ada file lain yang perlu disentuh untuk menduplikasi project ini.
 *
 * Baca README.md bagian "Menduplikasi untuk klien berikutnya" untuk langkahnya.
 *
 * Nilai yang belum dikonfirmasi klien WAJIB ditulis sebagai BELUM_DIISI.
 * Jangan pernah mengarang alamat, jam operasional, harga, atau nomor telepon.
 * Bagian situs yang bergantung pada nilai BELUM_DIISI akan otomatis disembunyikan.
 * -------------------------------------------------------------------------- */

/** Penanda eksplisit untuk data yang belum diberikan klien. */
export const BELUM_DIISI = "__BELUM_DIISI__" as const;

export type Unfilled = typeof BELUM_DIISI;
export type Maybe<T> = T | Unfilled;

/** true kalau nilainya benar-benar sudah diisi (bukan placeholder, bukan string kosong). */
export function isFilled<T>(value: Maybe<T>): value is T {
  return value !== BELUM_DIISI && value !== "" && value !== undefined && value !== null;
}

export type ClientConfig = {
  /** Nama usaha seperti yang dipakai klien. Muncul di judul halaman dan footer. */
  name: string;
  /** Nama pendek untuk wordmark / logo teks. */
  shortName: string;
  /** Slug teknis. Dipakai untuk nama repo GitHub, project Vercel, dan subdomain. */
  slug: string;
  /** Domain akhir tempat situs ini live. Dipakai untuk canonical, sitemap, robots, OG. */
  domain: string;

  /** Warna aksen klien dalam OKLCH. Cek ulang kontras tiap kali diganti:
   *  `npm run audit:contrast` harus lolos semua pasangan (WCAG AA 4.5:1). */
  accent: {
    /** Warna aksen utama. Dipakai untuk tautan, chip aktif, dan garis bawah. */
    base: string;
    /** Versi lebih gelap untuk teks aksen di atas kertas. */
    strong: string;
    /** Warna teks di atas bidang aksen. */
    on: string;
  };

  /** Kontak. Nomor WhatsApp wajib format internasional tanpa tanda plus, contoh 6281234567890. */
  contact: {
    whatsapp: Maybe<string>;
    /** Bentuk yang enak dibaca manusia, contoh "+62 812-3456-7890". */
    whatsappDisplay: Maybe<string>;
    email: Maybe<string>;
    /** Tautan listing Google Maps klien, kalau ada. */
    mapsUrl: Maybe<string>;
  };

  /** Alamat. Kota dan provinsi sudah pasti; sisanya menunggu konfirmasi klien. */
  address: {
    street: Maybe<string>;
    locality: string;
    region: string;
    postalCode: Maybe<string>;
    country: string;
  };

  /** Jam operasional. Biarkan BELUM_DIISI sampai klien mengonfirmasi.
   *  Format bila diisi: ["Mo-Sa 09:00-17:00"] mengikuti schema.org. */
  openingHours: Maybe<string[]>;

  /** Flag layanan. Matikan bagian yang tidak dilayani klien ini. */
  features: {
    /** Halaman rias pengantin, galeri riasnya, dan menu navnya.
     *  false = seluruh jejak halaman rias hilang dari nav, rute, dan sitemap. */
    riasPengantin: boolean;
  };
};

/* -------------------------------------------------------------------------- */
/*  KLIEN AKTIF                                                               */
/* -------------------------------------------------------------------------- */

export const CLIENT: ClientConfig = {
  name: "Workshop Nura Enterprise",
  shortName: "Nura",
  slug: "nura-enterprise",
  domain: "nura-enterprise.onyxcreative.asia",

  accent: {
    base: "oklch(0.478 0.113 40)",
    strong: "oklch(0.408 0.104 40)",
    on: "oklch(0.985 0.004 78)",
  },

  contact: {
    whatsapp: BELUM_DIISI,
    whatsappDisplay: BELUM_DIISI,
    email: BELUM_DIISI,
    mapsUrl: BELUM_DIISI,
  },

  address: {
    street: BELUM_DIISI,
    locality: "Denpasar",
    region: "Bali",
    postalCode: BELUM_DIISI,
    country: "ID",
  },

  openingHours: BELUM_DIISI,

  features: {
    // Listing klien ini tidak menyebut layanan rias, jadi bagian rias dimatikan.
    // Ubah ke true bila klien mengonfirmasi mereka juga melayani rias pengantin.
    riasPengantin: false,
  },
};

/* -------------------------------------------------------------------------- */
/*  Turunan. Tidak perlu diubah saat ganti klien.                              */
/* -------------------------------------------------------------------------- */

export const SITE_URL = `https://${CLIENT.domain}`;

/** Nomor WhatsApp siap pakai, atau null bila belum diisi. */
export const WHATSAPP_NUMBER = isFilled(CLIENT.contact.whatsapp)
  ? CLIENT.contact.whatsapp.replace(/[^0-9]/g, "")
  : null;

/** Alamat satu baris untuk ditampilkan, hanya bagian yang sudah diisi. */
export function addressLine(): string {
  const parts = [
    isFilled(CLIENT.address.street) ? CLIENT.address.street : null,
    CLIENT.address.locality,
    CLIENT.address.region,
    isFilled(CLIENT.address.postalCode) ? CLIENT.address.postalCode : null,
  ].filter(Boolean);
  return parts.join(", ");
}
