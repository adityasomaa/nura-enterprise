import { CLIENT } from "@/config/client";
import type { Locale } from "@/data/site-content";

/**
 * Peta rute situs. Segmen jalurnya sama untuk kedua bahasa, yang berbeda
 * hanya awalan bahasanya, jadi tidak ada halaman kembar dan hreflang rapi.
 */
export const PATHS = {
  home: "",
  gallery: "galeri",
  packets: "paket",
  rias: "rias",
  contact: "kontak",
  privacy: "privacy",
  terms: "terms",
} as const;

export type RouteKey = keyof typeof PATHS;

export function route(locale: Locale, key: RouteKey, ...rest: string[]): string {
  const parts = [locale, PATHS[key], ...rest].filter((part) => part !== "");
  return "/" + parts.join("/");
}

export function albumRoute(locale: Locale, slug: string): string {
  return route(locale, "gallery", slug);
}

/** Menu navigasi utama. Menu rias hanya muncul kalau flagnya menyala. */
export function navKeys(): RouteKey[] {
  const keys: RouteKey[] = ["home", "gallery", "packets"];
  if (CLIENT.features.riasPengantin) keys.push("rias");
  keys.push("contact");
  return keys;
}

/** Semua kunci rute statis yang dirender, dipakai sitemap dan pemeriksaan rute. */
export function staticRouteKeys(): RouteKey[] {
  const keys: RouteKey[] = ["home", "gallery", "packets"];
  if (CLIENT.features.riasPengantin) keys.push("rias");
  keys.push("contact", "privacy", "terms");
  return keys;
}

/** Ganti awalan bahasa pada sebuah path tanpa mengubah sisanya. */
export function swapLocale(pathname: string, next: Locale): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return `/${next}`;
  segments[0] = next;
  return "/" + segments.join("/");
}

export function localeFromPath(pathname: string): Locale {
  const first = pathname.split("/").filter(Boolean)[0];
  return first === "en" ? "en" : "id";
}
