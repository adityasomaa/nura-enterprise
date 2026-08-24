import { CLIENT } from "@/config/client";
import {
  EVENT_TYPES,
  STYLES,
  VENUE_CATEGORIES,
  labelOf,
  type Locale,
} from "@/data/site-content";
import { getDictionary } from "@/lib/i18n";
import { whatsappUrl, withSource } from "@/lib/whatsapp";

/**
 * Aturan validasi form konsultasi.
 *
 * Modul ini sengaja murni, tanpa FormData dan tanpa React, supaya bisa diuji
 * langsung oleh scripts/verify-server-validation.ts. Server action hanya
 * mengubah FormData menjadi objek biasa lalu memanggil fungsi di sini, jadi
 * aturan yang diuji benar-benar aturan yang dipakai di server.
 */

export type ConsultationValues = {
  locale?: string;
  name?: string;
  whatsapp?: string;
  dateUndecided?: string;
  eventDate?: string;
  eventType?: string;
  venue?: string;
  venueDetail?: string;
  guests?: string;
  style?: string;
  notes?: string;
  album?: string;
  pageUrl?: string;
  buttonLabel?: string;
  /** Perangkap bot. Harus selalu kosong. */
  company?: string;
};

export type ConsultationResult =
  | { ok: true; waUrl: string | null; summary: string }
  | { ok: false; errors: Record<string, string> };

const MAX_GUESTS = 5000;

/** Tanggal hari ini menurut waktu Bali, bukan waktu server. */
export function todayInBali(now: Date = new Date()): Date {
  const bali = new Date(now.getTime() + 8 * 3600000);
  return new Date(Date.UTC(bali.getUTCFullYear(), bali.getUTCMonth(), bali.getUTCDate()));
}

export function parseDateKey(key: string): Date | null {
  const match = key.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const [, y, m, d] = match;
  const date = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
  if (
    date.getUTCFullYear() !== Number(y) ||
    date.getUTCMonth() !== Number(m) - 1 ||
    date.getUTCDate() !== Number(d)
  ) {
    return null;
  }
  return date;
}

export function resolveLocale(value: string | undefined): Locale {
  return value === "en" ? "en" : "id";
}

export function validateConsultation(
  values: ConsultationValues,
  now: Date = new Date(),
): ConsultationResult {
  const locale = resolveLocale(values.locale);
  const dict = getDictionary(locale);
  const t = dict.contact.errors;
  const w = dict.contact.whatsapp;
  const errors: Record<string, string> = {};

  // Perangkap bot diperiksa lebih dulu dan hanya di sisi server.
  if ((values.company ?? "").trim() !== "") {
    return { ok: false, errors: { form: t.generic } };
  }

  const name = (values.name ?? "").trim();
  if (name.length < 2 || name.length > 80) errors.name = t.name;

  const whatsappRaw = (values.whatsapp ?? "").trim();
  const whatsappDigits = whatsappRaw.replace(/[^0-9]/g, "");
  if (whatsappRaw.length === 0) errors.whatsapp = t.whatsapp;
  else if (whatsappDigits.length < 8 || whatsappDigits.length > 15) {
    errors.whatsapp = t.whatsappFormat;
  }

  const undecided = values.dateUndecided === "on" || values.dateUndecided === "true";
  const dateKey = (values.eventDate ?? "").trim();
  let eventDate: Date | null = null;
  if (!undecided) {
    if (dateKey === "") {
      errors.eventDate = t.eventDate;
    } else {
      eventDate = parseDateKey(dateKey);
      if (!eventDate) errors.eventDate = t.eventDateInvalid;
      else if (eventDate.getTime() < todayInBali(now).getTime()) errors.eventDate = t.eventDatePast;
    }
  }

  const eventType = values.eventType ?? "";
  if (!EVENT_TYPES.some((item) => item.id === eventType)) errors.eventType = t.eventType;

  const venue = values.venue ?? "";
  if (!VENUE_CATEGORIES.some((item) => item.id === venue)) errors.venue = t.venue;

  const guestsRaw = (values.guests ?? "").trim();
  let guests = 0;
  if (guestsRaw === "") {
    errors.guests = t.guests;
  } else if (!/^\d{1,5}$/.test(guestsRaw)) {
    errors.guests = t.guestsRange;
  } else {
    guests = Number(guestsRaw);
    if (guests < 1 || guests > MAX_GUESTS) errors.guests = t.guestsRange;
  }

  const style = values.style ?? "";
  if (style !== "belum-tahu" && !STYLES.some((item) => item.id === style)) errors.style = t.style;

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const venueDetail = (values.venueDetail ?? "").trim().slice(0, 160);
  const notes = (values.notes ?? "").trim().slice(0, 1000);
  const albumRaw = (values.album ?? "").trim();
  const album = /^[A-Za-z0-9-]{1,12}$/.test(albumRaw) ? albumRaw.toUpperCase() : "";
  const pageUrl = (values.pageUrl ?? "").slice(0, 300);
  const buttonLabel = (values.buttonLabel ?? dict.contact.form.submit).slice(0, 80);

  const dateText = undecided
    ? w.dateUndecided
    : new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }).format(eventDate as Date);

  const styleText =
    style === "belum-tahu" ? dict.contact.form.styleUndecided : labelOf(STYLES, style, locale);

  const lines = [
    w.intro,
    "",
    `${w.name}: ${name}`,
    `${w.number}: ${whatsappRaw}`,
    `${w.date}: ${dateText}`,
    `${w.eventType}: ${labelOf(EVENT_TYPES, eventType, locale)}`,
    `${w.venue}: ${labelOf(VENUE_CATEGORIES, venue, locale)}`,
    venueDetail ? `${w.venueDetail}: ${venueDetail}` : null,
    `${w.guests}: ${guests}`,
    `${w.style}: ${styleText}`,
    album ? `${w.album}: ${album}` : null,
    notes ? `${w.notes}: ${notes}` : null,
  ].filter(Boolean) as string[];

  const summary = withSource(lines.join("\n"), locale, {
    pageUrl: pageUrl || `https://${CLIENT.domain}`,
    buttonLabel,
  });

  return { ok: true, waUrl: whatsappUrl(summary), summary };
}
