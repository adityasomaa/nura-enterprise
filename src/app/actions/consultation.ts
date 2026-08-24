"use server";

import {
  validateConsultation,
  type ConsultationResult,
  type ConsultationValues,
} from "@/lib/consultation";

export type { ConsultationResult };

const FIELDS = [
  "locale",
  "name",
  "whatsapp",
  "dateUndecided",
  "eventDate",
  "eventType",
  "venue",
  "venueDetail",
  "guests",
  "style",
  "notes",
  "album",
  "pageUrl",
  "buttonLabel",
  "company",
] as const;

/**
 * Validasi seluruh isian di server, bukan hanya di browser, termasuk tanggal
 * acara dan perkiraan jumlah tamu. Aturannya ada di src/lib/consultation.ts
 * supaya bisa diuji langsung tanpa menjalankan server.
 *
 * Isian tidak disimpan di server; hasilnya dirakit menjadi pesan WhatsApp
 * yang dikirim sendiri oleh pengunjung dari perangkatnya.
 */
export async function submitConsultation(
  _previous: ConsultationResult | null,
  formData: FormData,
): Promise<ConsultationResult> {
  const values: ConsultationValues = {};
  for (const field of FIELDS) {
    const raw = formData.get(field);
    if (typeof raw === "string") values[field] = raw;
  }
  return validateConsultation(values);
}
