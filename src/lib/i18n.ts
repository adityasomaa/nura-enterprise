import { CLIENT } from "@/config/client";
import type { Locale } from "@/data/site-content";

export const LOCALES = ["id", "en"] as const;
export const DEFAULT_LOCALE: Locale = "id";
export const LOCALE_COOKIE = "pref-locale";

export function isLocale(value: string | undefined): value is Locale {
  return value === "id" || value === "en";
}

/** Nama bahasa untuk pemilih bahasa, selalu ditulis dalam bahasanya sendiri. */
export const LOCALE_NAMES: Record<Locale, string> = {
  id: "Indonesia",
  en: "English",
};

export const HTML_LANG: Record<Locale, string> = {
  id: "id-ID",
  en: "en",
};

const id = {
  common: {
    skipToContent: "Lompat ke konten",
    openMenu: "Buka menu",
    closeMenu: "Tutup menu",
    close: "Tutup",
    previous: "Sebelumnya",
    next: "Berikutnya",
    language: "Bahasa",
    loading: "Memuat",
    required: "wajib diisi",
    optional: "opsional",
    consultAboutAlbum: "Konsultasi soal album ini",
    backToGallery: "Kembali ke galeri",
    photoCounter: "Foto {current} dari {total}",
    illustrationNote:
      "Semua gambar di situs ini adalah ilustrasi geometris, bukan dokumentasi acara.",
  },

  nav: {
    home: "Home",
    gallery: "Galeri",
    packets: "Paket",
    rias: "Rias",
    contact: "Kontak",
  },

  home: {
    meta: {
      title: "Dekorasi Pernikahan Denpasar, Bali",
      description:
        "Jasa dekorasi pernikahan di Denpasar, Bali untuk akad, resepsi, engagement, dan siraman. Lihat album dekorasi per jenis acara, tempat, dan gaya, lalu ajukan konsultasi.",
    },
    hero: {
      eyebrow: "Dekorasi pernikahan, Denpasar, Bali",
      headline: "Dekorasi pernikahan di Denpasar",
      description:
        "Penataan dekorasi untuk akad, resepsi, engagement, dan siraman. Mulai dari melihat albumnya.",
      cta: "Lihat galeri",
      secondary: "Mulai konsultasi",
      scroll: "Gulir ke galeri",
    },
    gallery: {
      sectionTitle: "Galeri",
      headline: "Album dekorasi terbaru",
      description:
        "Satu album berisi beberapa area dari satu acara, dari pelaminan sampai area foto.",
      cta: "Lihat semua album",
    },
    packets: {
      sectionTitle: "Paket",
      headline: "Tiga tingkatan paket dekorasi",
      description:
        "Tiap paket dijelaskan lewat area yang ditata, supaya cakupannya mudah dibayangkan.",
      cta: "Lihat paket",
    },
    consult: {
      sectionTitle: "Konsultasi",
      headline: "Ceritakan rencana acara Anda",
      description:
        "Isi keterangan acara, lalu lanjutkan percakapan lewat WhatsApp dengan keterangan yang sudah terisi.",
      cta: "Mulai konsultasi",
    },
  },

  gallery: {
    meta: {
      title: "Galeri Dekorasi Pernikahan",
      description:
        "Album dekorasi pernikahan di Denpasar, Bali. Saring berdasarkan jenis acara, tempat indoor atau outdoor, dan gaya dekorasi.",
    },
    header: {
      sectionTitle: "Galeri",
      headline: "Album dekorasi",
      description: "Saring berdasarkan jenis acara, tempat, dan gaya.",
      cta: "Mulai konsultasi",
    },
    filters: {
      open: "Filter",
      title: "Filter album",
      eventType: "Jenis acara",
      placement: "Tempat",
      style: "Gaya",
      all: "Semua",
      reset: "Atur ulang",
      apply: "Terapkan",
      resultCount: "{count} album",
      activeCount: "{count} filter aktif",
    },
    empty: {
      title: "Tidak ada album untuk kombinasi filter ini",
      body: "Atur ulang filter, atau tanyakan langsung gaya yang Anda cari.",
      cta: "Tanya lewat WhatsApp",
    },
    loadMore: "Muat album lain",
    albumMeta: {
      event: "Jenis acara",
      placement: "Tempat",
      style: "Gaya",
      venue: "Kategori venue",
      code: "Kode album",
      photos: "{count} foto",
    },
  },

  album: {
    header: {
      sectionTitle: "Album",
      description: "Beberapa area dari satu acara.",
      cta: "Konsultasi soal album ini",
    },
    openLightbox: "Buka gambar",
  },

  packets: {
    meta: {
      title: "Paket Dekorasi Pernikahan",
      description:
        "Paket dekorasi akad, dekorasi resepsi, dan paket lengkap di Denpasar, Bali. Tiap paket menjelaskan area yang ditata, dengan cakupan akhir dibahas saat konsultasi.",
    },
    header: {
      sectionTitle: "Paket",
      headline: "Paket dekorasi",
      description:
        "Tiga tingkatan, dijelaskan lewat area yang ditata, bukan daftar barang.",
      cta: "Mulai konsultasi",
    },
    areasLabel: "Area yang ditata",
    notesLabel: "Yang menentukan cakupan",
    priceNote: {
      sectionTitle: "Cara menghitung",
      headline: "Cakupan dibahas dulu, baru penawaran",
      description:
        "Cakupan dan biaya dekorasi bergantung pada ukuran venue, perkiraan jumlah tamu, dan jenis bunga yang dipakai. Karena itu penawaran disusun setelah keterangan acara masuk.",
      cta: "Ajukan konsultasi",
    },
  },

  rias: {
    meta: {
      title: "Rias Pengantin",
      description:
        "Layanan rias pengantin di Denpasar, Bali yang dapat digabung dengan paket dekorasi dalam satu penanganan.",
    },
    header: {
      sectionTitle: "Rias pengantin",
      headline: "Rias pengantin",
      description: "Penataan rias dan busana untuk rangkaian acara.",
      cta: "Tanyakan rias pengantin",
    },
    combine: {
      sectionTitle: "Digabung",
      headline: "Bisa digabung dengan paket dekorasi",
      description:
        "Rias pengantin dapat diambil bersama paket dekorasi supaya arah desain dan jadwal persiapan ditangani sekaligus.",
      cta: "Bahas penggabungan",
    },
  },

  contact: {
    meta: {
      title: "Konsultasi Dekorasi",
      description:
        "Ajukan konsultasi dekorasi pernikahan di Denpasar, Bali. Isi keterangan acara, lalu lanjutkan percakapan lewat WhatsApp.",
    },
    header: {
      sectionTitle: "Konsultasi",
      headline: "Ajukan konsultasi",
      description:
        "Isi keterangan acara di bawah. Isian akan terangkum otomatis di pesan WhatsApp.",
      cta: "Kirim lewat WhatsApp",
    },
    fromAlbum: "Pertanyaan ini merujuk album {code}.",
    form: {
      name: "Nama",
      namePlaceholder: "Nama yang bisa kami panggil",
      whatsapp: "Nomor WhatsApp",
      whatsappPlaceholder: "08xxxxxxxxxx",
      eventDate: "Tanggal acara",
      eventDatePlaceholder: "Pilih tanggal",
      eventDateUndecided: "Tanggal belum ditentukan",
      eventType: "Jenis acara",
      venue: "Jenis venue",
      venueDetail: "Lokasi atau nama area",
      venueDetailPlaceholder: "Contoh: daerah Denpasar Selatan",
      guests: "Perkiraan jumlah tamu",
      guestsPlaceholder: "Contoh: 300",
      style: "Gaya dekorasi yang diminati",
      styleUndecided: "Belum tahu",
      notes: "Catatan",
      notesPlaceholder: "Hal lain yang perlu kami tahu",
      submit: "Kirim lewat WhatsApp",
      submitting: "Menyiapkan pesan",
      selectPlaceholder: "Pilih salah satu",
      openCalendar: "Buka kalender",
      calendarPrevMonth: "Bulan sebelumnya",
      calendarNextMonth: "Bulan berikutnya",
      calendarClear: "Hapus pilihan",
      successTitle: "Pesan siap dikirim",
      successBody:
        "WhatsApp akan terbuka dengan pesan yang sudah terisi. Kalau tidak terbuka otomatis, pakai tautan di bawah.",
      successLink: "Buka WhatsApp",
      noWhatsappTitle: "Nomor WhatsApp belum tersedia",
      noWhatsappBody:
        "Nomor WhatsApp usaha ini belum dipasang di situs. Rangkuman isian Anda ditampilkan di bawah supaya bisa disalin.",
      copySummary: "Salin rangkuman",
      copied: "Tersalin",
    },
    errors: {
      name: "Isi nama Anda.",
      whatsapp: "Isi nomor WhatsApp yang bisa dihubungi.",
      whatsappFormat: "Nomor WhatsApp hanya boleh berisi angka, 8 sampai 15 digit.",
      eventDate: "Pilih tanggal acara, atau centang tanggal belum ditentukan.",
      eventDatePast: "Tanggal acara tidak boleh tanggal yang sudah lewat.",
      eventDateInvalid: "Tanggal acara tidak terbaca.",
      eventType: "Pilih jenis acara.",
      venue: "Pilih jenis venue.",
      guests: "Isi perkiraan jumlah tamu.",
      guestsRange: "Perkiraan jumlah tamu harus antara 1 dan 5000.",
      style: "Pilih gaya dekorasi, atau pilih belum tahu.",
      generic: "Ada isian yang belum benar. Periksa keterangan di bawah tiap kolom.",
    },
    whatsapp: {
      intro: "Halo, saya ingin konsultasi dekorasi.",
      name: "Nama",
      number: "Nomor WhatsApp",
      date: "Tanggal acara",
      dateUndecided: "Belum ditentukan",
      eventType: "Jenis acara",
      venue: "Jenis venue",
      venueDetail: "Lokasi",
      guests: "Perkiraan tamu",
      style: "Gaya dekorasi",
      album: "Kode album",
      notes: "Catatan",
      source: "Halaman asal",
      button: "Tombol",
    },
  },

  footer: {
    sectionTitle: "Langkah berikutnya",
    headline: "Mulai dari melihat album",
    headlineAlt: "Ceritakan rencana acara Anda",
    description:
      "Album galeri memperlihatkan arah desain yang tersedia. Setelah menemukan yang mendekati, lanjutkan ke konsultasi.",
    descriptionAlt:
      "Isi keterangan acara, lalu lanjutkan percakapan lewat WhatsApp dengan keterangan yang sudah terisi.",
    ctaGallery: "Lihat galeri",
    ctaContact: "Mulai konsultasi",
    address: "Alamat",
    hours: "Jam operasional",
    contact: "Kontak",
    navTitle: "Halaman",
    legalTitle: "Ketentuan",
    privacy: "Kebijakan Privasi",
    terms: "Syarat dan Ketentuan",
    cookieSettings: "Pengaturan cookie",
    unfilled: "Belum tersedia",
    rights: "Seluruh hak cipta dilindungi.",
    whatsappLabel: "WhatsApp",
    mapsLabel: "Google Maps",
  },

  cookie: {
    title: "Cookie preferensi",
    body:
      "Situs ini dapat menyimpan pilihan bahasa dan filter galeri Anda di perangkat ini. Tanpa persetujuan, pilihan tersebut hanya berlaku selama tab ini terbuka.",
    accept: "Izinkan",
    reject: "Tolak",
    manage: "Pengaturan cookie",
    savedAccepted: "Preferensi disimpan di perangkat ini.",
    savedRejected: "Preferensi tidak disimpan di perangkat ini.",
    change: "Ubah",
  },

  privacy: {
    meta: {
      title: "Kebijakan Privasi",
      description:
        `Kebijakan privasi situs ${CLIENT.name}: data apa yang diterima lewat form konsultasi dan bagaimana data itu diperlakukan.`,
    },
    header: {
      sectionTitle: "Ketentuan",
      headline: "Kebijakan Privasi",
      description: "Ringkasan data yang diterima situs ini dan cara memperlakukannya.",
      cta: "Hubungi kami",
    },
    sections: [
      {
        title: "Data yang diterima",
        body: "Situs ini menerima data yang Anda isi sendiri pada form konsultasi, yaitu nama, nomor WhatsApp, tanggal acara, jenis acara, jenis venue, perkiraan jumlah tamu, gaya dekorasi yang diminati, dan catatan tambahan.",
      },
      {
        title: "Cara data dipakai",
        body: "Data tersebut dipakai untuk membalas pertanyaan Anda dan menyusun keterangan kebutuhan dekorasi. Isian form tidak disimpan di server situs, melainkan disusun menjadi pesan WhatsApp yang Anda kirim sendiri dari perangkat Anda.",
      },
      {
        title: "Penyimpanan di perangkat",
        body: "Dengan persetujuan Anda, situs menyimpan pilihan bahasa dan filter galeri di perangkat Anda supaya tidak perlu diatur ulang. Tanpa persetujuan, pilihan itu hanya bertahan selama tab dibuka. Persetujuan dapat diubah kapan saja lewat tautan pengaturan cookie di footer.",
      },
      {
        title: "Pihak ketiga",
        body: "Percakapan lanjutan berjalan di WhatsApp, yang tunduk pada kebijakan privasi penyedia layanan tersebut. Situs ini tidak menjual data Anda kepada pihak lain.",
      },
      {
        title: "Hak Anda",
        body: "Anda dapat meminta agar percakapan dan data yang sudah dikirim tidak dipakai lagi, dengan menghubungi kontak yang tercantum di halaman kontak.",
      },
      {
        title: "Perubahan kebijakan",
        body: "Kebijakan ini dapat diperbarui bila layanan atau cara kerja situs berubah. Versi yang berlaku adalah yang tampil di halaman ini.",
      },
    ],
  },

  terms: {
    meta: {
      title: "Syarat dan Ketentuan",
      description:
        `Syarat dan ketentuan penggunaan situs ${CLIENT.name}, termasuk sifat informasi yang ditampilkan dan batasan tanggung jawab.`,
    },
    header: {
      sectionTitle: "Ketentuan",
      headline: "Syarat dan Ketentuan",
      description: "Ketentuan penggunaan situs ini.",
      cta: "Hubungi kami",
    },
    sections: [
      {
        title: "Sifat informasi",
        body: "Isi situs ini bersifat informasi umum mengenai layanan dekorasi. Cakupan pekerjaan, ketersediaan tanggal, dan biaya tidak ditetapkan oleh situs, melainkan disepakati langsung antara Anda dan pihak usaha.",
      },
      {
        title: "Gambar pada situs",
        body: "Seluruh gambar pada situs ini adalah ilustrasi geometris yang dibuat khusus untuk situs, bukan dokumentasi acara. Ilustrasi tersebut menggambarkan arah desain, bukan hasil akhir yang dijanjikan.",
      },
      {
        title: "Pengajuan konsultasi",
        body: "Mengirim form konsultasi tidak mengikat kedua pihak dan tidak menahan tanggal acara. Kesepakatan baru berlaku setelah dibahas dan disetujui langsung.",
      },
      {
        title: "Hak atas konten",
        body: "Teks, ilustrasi, dan tata letak pada situs ini dimiliki oleh pemilik situs. Menyalin atau memakai ulang tanpa izin tidak diperkenankan.",
      },
      {
        title: "Batasan tanggung jawab",
        body: "Situs diupayakan dapat diakses dan akurat, namun tidak menjamin bebas gangguan. Pemilik situs tidak bertanggung jawab atas kerugian yang timbul dari penggunaan situs di luar kendali yang wajar.",
      },
      {
        title: "Perubahan ketentuan",
        body: "Ketentuan ini dapat diperbarui sewaktu-waktu. Versi yang berlaku adalah yang tampil di halaman ini.",
      },
    ],
  },

  notFound: {
    sectionTitle: "Halaman",
    headline: "Halaman tidak ditemukan",
    description: "Alamat yang Anda buka tidak tersedia. Kembali ke galeri untuk melihat album.",
    cta: "Lihat galeri",
  },
};

const en: typeof id = {
  common: {
    skipToContent: "Skip to content",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    close: "Close",
    previous: "Previous",
    next: "Next",
    language: "Language",
    loading: "Loading",
    required: "required",
    optional: "optional",
    consultAboutAlbum: "Ask about this album",
    backToGallery: "Back to gallery",
    photoCounter: "Image {current} of {total}",
    illustrationNote:
      "Every image on this site is a geometric illustration, not event documentation.",
  },

  nav: {
    home: "Home",
    gallery: "Gallery",
    packets: "Packages",
    rias: "Makeup",
    contact: "Contact",
  },

  home: {
    meta: {
      title: "Wedding Decoration in Denpasar, Bali",
      description:
        "Wedding decoration service in Denpasar, Bali for akad, reception, engagement, and siraman. Browse albums by event type, setting, and style, then request a consultation.",
    },
    hero: {
      eyebrow: "Wedding decoration, Denpasar, Bali",
      headline: "Wedding decoration in Denpasar",
      description:
        "Decor set for akad, reception, engagement, and siraman. Start by looking at the albums.",
      cta: "View gallery",
      secondary: "Start a consultation",
      scroll: "Scroll to gallery",
    },
    gallery: {
      sectionTitle: "Gallery",
      headline: "Recent decoration albums",
      description:
        "One album holds several areas from a single event, from the main stage to the photo area.",
      cta: "View all albums",
    },
    packets: {
      sectionTitle: "Packages",
      headline: "Three decoration package tiers",
      description:
        "Each package is described by the areas it covers, so the scope is easy to picture.",
      cta: "View packages",
    },
    consult: {
      sectionTitle: "Consultation",
      headline: "Tell us about your event",
      description:
        "Fill in the event details, then continue on WhatsApp with the summary already written out.",
      cta: "Start a consultation",
    },
  },

  gallery: {
    meta: {
      title: "Wedding Decoration Gallery",
      description:
        "Wedding decoration albums in Denpasar, Bali. Filter by event type, indoor or outdoor setting, and decoration style.",
    },
    header: {
      sectionTitle: "Gallery",
      headline: "Decoration albums",
      description: "Filter by event type, setting, and style.",
      cta: "Start a consultation",
    },
    filters: {
      open: "Filter",
      title: "Filter albums",
      eventType: "Event type",
      placement: "Setting",
      style: "Style",
      all: "All",
      reset: "Reset",
      apply: "Apply",
      resultCount: "{count} albums",
      activeCount: "{count} filters active",
    },
    empty: {
      title: "No albums match this filter combination",
      body: "Reset the filters, or ask directly about the style you have in mind.",
      cta: "Ask on WhatsApp",
    },
    loadMore: "Load more albums",
    albumMeta: {
      event: "Event type",
      placement: "Setting",
      style: "Style",
      venue: "Venue category",
      code: "Album code",
      photos: "{count} images",
    },
  },

  album: {
    header: {
      sectionTitle: "Album",
      description: "Several areas from a single event.",
      cta: "Ask about this album",
    },
    openLightbox: "Open image",
  },

  packets: {
    meta: {
      title: "Wedding Decoration Packages",
      description:
        "Akad decoration, reception decoration, and full package options in Denpasar, Bali. Each package lists the areas covered, with final scope agreed during consultation.",
    },
    header: {
      sectionTitle: "Packages",
      headline: "Decoration packages",
      description: "Three tiers, described by the areas covered rather than an item list.",
      cta: "Start a consultation",
    },
    areasLabel: "Areas covered",
    notesLabel: "What shapes the scope",
    priceNote: {
      sectionTitle: "How it is worked out",
      headline: "Scope first, quote after",
      description:
        "Decoration scope and cost depend on venue size, the estimated guest count, and the flowers used. A quote is put together once the event details come in.",
      cta: "Request a consultation",
    },
  },

  rias: {
    meta: {
      title: "Bridal Makeup",
      description:
        "Bridal makeup service in Denpasar, Bali that can be combined with a decoration package under one arrangement.",
    },
    header: {
      sectionTitle: "Bridal makeup",
      headline: "Bridal makeup",
      description: "Makeup and wardrobe styling across the event sequence.",
      cta: "Ask about bridal makeup",
    },
    combine: {
      sectionTitle: "Combined",
      headline: "Can be combined with a decoration package",
      description:
        "Bridal makeup can be taken together with a decoration package so the design direction and preparation schedule are handled in one go.",
      cta: "Discuss combining both",
    },
  },

  contact: {
    meta: {
      title: "Decoration Consultation",
      description:
        "Request a wedding decoration consultation in Denpasar, Bali. Fill in your event details, then continue the conversation on WhatsApp.",
    },
    header: {
      sectionTitle: "Consultation",
      headline: "Request a consultation",
      description:
        "Fill in the event details below. Your answers are summarised into the WhatsApp message automatically.",
      cta: "Send via WhatsApp",
    },
    fromAlbum: "This enquiry refers to album {code}.",
    form: {
      name: "Name",
      namePlaceholder: "What we should call you",
      whatsapp: "WhatsApp number",
      whatsappPlaceholder: "08xxxxxxxxxx",
      eventDate: "Event date",
      eventDatePlaceholder: "Pick a date",
      eventDateUndecided: "Date not decided yet",
      eventType: "Event type",
      venue: "Venue type",
      venueDetail: "Location or area name",
      venueDetailPlaceholder: "For example: South Denpasar area",
      guests: "Estimated guest count",
      guestsPlaceholder: "For example: 300",
      style: "Decoration style you have in mind",
      styleUndecided: "Not sure yet",
      notes: "Notes",
      notesPlaceholder: "Anything else we should know",
      submit: "Send via WhatsApp",
      submitting: "Preparing the message",
      selectPlaceholder: "Choose one",
      openCalendar: "Open calendar",
      calendarPrevMonth: "Previous month",
      calendarNextMonth: "Next month",
      calendarClear: "Clear selection",
      successTitle: "Message ready to send",
      successBody:
        "WhatsApp will open with the message already filled in. If it does not open on its own, use the link below.",
      successLink: "Open WhatsApp",
      noWhatsappTitle: "WhatsApp number not available yet",
      noWhatsappBody:
        "This business has no WhatsApp number on the site yet. Your answers are summarised below so you can copy them.",
      copySummary: "Copy summary",
      copied: "Copied",
    },
    errors: {
      name: "Enter your name.",
      whatsapp: "Enter a WhatsApp number we can reach.",
      whatsappFormat: "The WhatsApp number should be 8 to 15 digits, numbers only.",
      eventDate: "Pick an event date, or tick that the date is not decided yet.",
      eventDatePast: "The event date cannot be in the past.",
      eventDateInvalid: "The event date could not be read.",
      eventType: "Choose an event type.",
      venue: "Choose a venue type.",
      guests: "Enter an estimated guest count.",
      guestsRange: "The estimated guest count should be between 1 and 5000.",
      style: "Choose a decoration style, or choose not sure yet.",
      generic: "Some answers need a look. Check the note under each field.",
    },
    whatsapp: {
      intro: "Hello, I would like a decoration consultation.",
      name: "Name",
      number: "WhatsApp number",
      date: "Event date",
      dateUndecided: "Not decided yet",
      eventType: "Event type",
      venue: "Venue type",
      venueDetail: "Location",
      guests: "Estimated guests",
      style: "Decoration style",
      album: "Album code",
      notes: "Notes",
      source: "Page",
      button: "Button",
    },
  },

  footer: {
    sectionTitle: "Next step",
    headline: "Start with the albums",
    headlineAlt: "Tell us about your event",
    description:
      "The gallery albums show the design directions available. Once one comes close, move on to a consultation.",
    descriptionAlt:
      "Fill in the event details, then continue on WhatsApp with the summary already written out.",
    ctaGallery: "View gallery",
    ctaContact: "Start a consultation",
    address: "Address",
    hours: "Opening hours",
    contact: "Contact",
    navTitle: "Pages",
    legalTitle: "Legal",
    privacy: "Privacy Policy",
    terms: "Terms of Service",
    cookieSettings: "Cookie settings",
    unfilled: "Not available yet",
    rights: "All rights reserved.",
    whatsappLabel: "WhatsApp",
    mapsLabel: "Google Maps",
  },

  cookie: {
    title: "Preference cookies",
    body:
      "This site can remember your language choice and gallery filters on this device. Without consent, those choices last only while this tab is open.",
    accept: "Allow",
    reject: "Decline",
    manage: "Cookie settings",
    savedAccepted: "Preferences are saved on this device.",
    savedRejected: "Preferences are not saved on this device.",
    change: "Change",
  },

  privacy: {
    meta: {
      title: "Privacy Policy",
      description:
        `Privacy policy for the ${CLIENT.name} site: what the consultation form receives and how that information is treated.`,
    },
    header: {
      sectionTitle: "Legal",
      headline: "Privacy Policy",
      description: "A summary of what this site receives and how it is treated.",
      cta: "Contact us",
    },
    sections: [
      {
        title: "What is received",
        body: "This site receives only what you type into the consultation form: your name, WhatsApp number, event date, event type, venue type, estimated guest count, the decoration style you have in mind, and any notes.",
      },
      {
        title: "How it is used",
        body: "That information is used to answer your question and to work out what the decoration needs to cover. Form answers are not stored on the site server; they are assembled into a WhatsApp message that you send yourself from your own device.",
      },
      {
        title: "Stored on your device",
        body: "With your consent, the site keeps your language choice and gallery filters on your device so they do not need resetting. Without consent, those choices last only while the tab is open. Consent can be changed at any time through the cookie settings link in the footer.",
      },
      {
        title: "Third parties",
        body: "The follow-up conversation happens on WhatsApp, which is governed by that provider's own privacy policy. This site does not sell your information to anyone.",
      },
      {
        title: "Your choices",
        body: "You may ask for a conversation and the details already sent to no longer be used, by reaching the contact listed on the contact page.",
      },
      {
        title: "Changes to this policy",
        body: "This policy may be updated if the service or the way the site works changes. The version in force is the one shown on this page.",
      },
    ],
  },

  terms: {
    meta: {
      title: "Terms of Service",
      description:
        `Terms of service for the ${CLIENT.name} site, covering the nature of the information shown and the limits of liability.`,
    },
    header: {
      sectionTitle: "Legal",
      headline: "Terms of Service",
      description: "The terms that apply to using this site.",
      cta: "Contact us",
    },
    sections: [
      {
        title: "Nature of the information",
        body: "The content of this site is general information about a decoration service. Scope of work, date availability, and cost are not set by the site; they are agreed directly between you and the business.",
      },
      {
        title: "Images on this site",
        body: "Every image here is a geometric illustration made for this site, not event documentation. The illustrations describe a design direction, not a promised result.",
      },
      {
        title: "Submitting an enquiry",
        body: "Sending the consultation form binds neither side and does not hold a date. An agreement applies only after it has been discussed and confirmed directly.",
      },
      {
        title: "Rights to the content",
        body: "The text, illustrations, and layout on this site belong to the site owner. Copying or reusing them without permission is not allowed.",
      },
      {
        title: "Limits of liability",
        body: "The site aims to stay reachable and accurate but does not guarantee uninterrupted service. The site owner is not liable for loss arising from use of the site beyond reasonable control.",
      },
      {
        title: "Changes to these terms",
        body: "These terms may be updated from time to time. The version in force is the one shown on this page.",
      },
    ],
  },

  notFound: {
    sectionTitle: "Page",
    headline: "Page not found",
    description: "The address you opened is not available. Head back to the gallery to browse albums.",
    cta: "View gallery",
  },
};

export type Dictionary = typeof id;

const DICTIONARIES: Record<Locale, Dictionary> = { id, en };

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale] ?? DICTIONARIES[DEFAULT_LOCALE];
}

/** Ganti pola {name} pada string terjemahan. */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    key in values ? String(values[key]) : match,
  );
}
