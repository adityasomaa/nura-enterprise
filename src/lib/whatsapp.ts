import { CLIENT, SITE_URL, WHATSAPP_NUMBER, isFilled } from "@/config/client";
import type { Locale } from "@/data/site-content";
import { getDictionary } from "@/lib/i18n";

export const WHATSAPP_AVAILABLE = WHATSAPP_NUMBER !== null;

/**
 * Bangun tautan wa.me dengan pesan yang sudah terisi.
 * Kalau nomor klien belum diisi di config, kembalikan null supaya pemanggilnya
 * bisa menampilkan jalur cadangan, bukan tautan yang rusak.
 */
export function whatsappUrl(message: string): string | null {
  if (!WHATSAPP_NUMBER) return null;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/**
 * Sisipkan jejak asal ke setiap pesan: halaman tempat tombol ditekan dan
 * label tombolnya. Dipakai supaya tiap pertanyaan yang masuk bisa dilacak
 * datang dari halaman dan tombol mana.
 */
export function withSource(
  body: string,
  locale: Locale,
  options: { pageUrl: string; buttonLabel: string },
): string {
  const t = getDictionary(locale).contact.whatsapp;
  return [
    body.trim(),
    "",
    `${t.source}: ${options.pageUrl}`,
    `${t.button}: ${options.buttonLabel}`,
  ].join("\n");
}

/** URL absolut untuk sebuah path relatif. Dipakai saat merakit jejak asal. */
export function absoluteUrl(pathname: string): string {
  if (typeof window !== "undefined") return window.location.href;
  return `${SITE_URL}${pathname}`;
}

export const MAPS_URL = isFilled(CLIENT.contact.mapsUrl) ? CLIENT.contact.mapsUrl : null;
