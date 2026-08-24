/**
 * Uji aturan validasi server tanpa menjalankan server.
 *
 *   npm run verify:server
 *
 * Menguji langsung modul yang dipakai server action, jadi yang lolos di sini
 * benar-benar aturan yang berlaku saat form dikirim.
 */

import { validateConsultation, type ConsultationValues } from "../src/lib/consultation";

const NOW = new Date("2026-08-24T03:00:00.000Z");

const VALID: ConsultationValues = {
  locale: "id",
  name: "Uji Server",
  whatsapp: "081234567890",
  eventDate: "2026-12-20",
  eventType: "resepsi",
  venue: "gedung",
  guests: "300",
  style: "rustic",
  album: "NRA-04",
  pageUrl: "https://contoh.test/id/kontak",
  buttonLabel: "Kirim lewat WhatsApp",
};

let failures = 0;

function check(label: string, ok: boolean, detail = "") {
  if (ok) console.log(`  OK    ${label}`);
  else {
    failures += 1;
    console.log(`  GAGAL ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

function errorsOf(patch: Partial<ConsultationValues>): Record<string, string> {
  const result = validateConsultation({ ...VALID, ...patch }, NOW);
  return result.ok ? {} : result.errors;
}

console.log("\n=== Validasi server ===");

const good = validateConsultation(VALID, NOW);
check("isian lengkap diterima", good.ok);
if (good.ok) {
  check("rangkuman memuat kode album", good.summary.includes("NRA-04"));
  check("rangkuman memuat gaya dekorasi", good.summary.includes("Rustic"));
  check("rangkuman memuat URL halaman asal", good.summary.includes("https://contoh.test/id/kontak"));
  check("rangkuman memuat label tombol", good.summary.includes("Kirim lewat WhatsApp"));
}

check("tanggal lampau ditolak", "eventDate" in errorsOf({ eventDate: "2020-01-05" }));
check("tanggal kemarin ditolak", "eventDate" in errorsOf({ eventDate: "2026-08-23" }));
check("tanggal hari ini diterima", !("eventDate" in errorsOf({ eventDate: "2026-08-24" })));
check("tanggal tidak masuk akal ditolak", "eventDate" in errorsOf({ eventDate: "2026-02-31" }));
check("format tanggal ngawur ditolak", "eventDate" in errorsOf({ eventDate: "besok" }));
check("tanggal kosong ditolak", "eventDate" in errorsOf({ eventDate: "" }));
check(
  "tanggal boleh kosong kalau ditandai belum ditentukan",
  !("eventDate" in errorsOf({ eventDate: "", dateUndecided: "on" })),
);
check(
  "tanggal lampau diabaikan kalau ditandai belum ditentukan",
  !("eventDate" in errorsOf({ eventDate: "2020-01-05", dateUndecided: "on" })),
);

check("nama kosong ditolak", "name" in errorsOf({ name: "" }));
check("nama satu huruf ditolak", "name" in errorsOf({ name: "A" }));
check("nama terlalu panjang ditolak", "name" in errorsOf({ name: "x".repeat(200) }));

check("nomor WhatsApp kosong ditolak", "whatsapp" in errorsOf({ whatsapp: "" }));
check("nomor WhatsApp terlalu pendek ditolak", "whatsapp" in errorsOf({ whatsapp: "0812" }));
check("nomor WhatsApp terlalu panjang ditolak", "whatsapp" in errorsOf({ whatsapp: "0".repeat(20) }));
check("nomor dengan spasi dan strip tetap diterima", !("whatsapp" in errorsOf({ whatsapp: "0812-3456 7890" })));

check("jumlah tamu kosong ditolak", "guests" in errorsOf({ guests: "" }));
check("jumlah tamu nol ditolak", "guests" in errorsOf({ guests: "0" }));
check("jumlah tamu di atas batas ditolak", "guests" in errorsOf({ guests: "99999" }));
check("jumlah tamu bukan angka ditolak", "guests" in errorsOf({ guests: "banyak" }));
check("jumlah tamu negatif ditolak", "guests" in errorsOf({ guests: "-5" }));

check("jenis acara palsu ditolak", "eventType" in errorsOf({ eventType: "tidak-ada" }));
check("jenis venue palsu ditolak", "venue" in errorsOf({ venue: "tidak-ada" }));
check("gaya dekorasi palsu ditolak", "style" in errorsOf({ style: "tidak-ada" }));
check("gaya belum tahu diterima", !("style" in errorsOf({ style: "belum-tahu" })));

check("perangkap bot menghentikan pengiriman", "form" in errorsOf({ company: "bot" }));

const enResult = validateConsultation({ ...VALID, locale: "en", eventDate: "2020-01-05" }, NOW);
check(
  "pesan galat mengikuti bahasa yang dipilih",
  !enResult.ok && enResult.errors.eventDate === "The event date cannot be in the past.",
  !enResult.ok ? enResult.errors.eventDate : "",
);

const albumBersih = validateConsultation({ ...VALID, album: "<script>" }, NOW);
check("kode album yang tidak wajar dibuang", albumBersih.ok && !albumBersih.summary.includes("script"));

console.log(
  failures === 0 ? "\nSemua aturan validasi server lolos.\n" : `\n${failures} aturan gagal.\n`,
);
process.exit(failures === 0 ? 0 : 1);
