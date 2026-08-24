import type { Metadata } from "next";

import { SITE_URL } from "@/config/client";
import type { Locale } from "@/data/site-content";
import { LOCALES } from "@/lib/i18n";
import { route, type RouteKey } from "@/lib/routes";

/**
 * Bangun metadata satu halaman lengkap dengan canonical dan hreflang untuk
 * kedua bahasa. Semua halaman memakai jalur yang sama dan hanya berbeda
 * awalan bahasanya, jadi pasangan hreflang selalu ada.
 */
export function pageMetadata(options: {
  locale: Locale;
  routeKey: RouteKey;
  title: string;
  description: string;
  rest?: string[];
}): Metadata {
  const { locale, routeKey, title, description, rest = [] } = options;
  const path = route(locale, routeKey, ...rest);

  const languages: Record<string, string> = {};
  for (const code of LOCALES) {
    languages[code === "id" ? "id-ID" : "en"] = `${SITE_URL}${route(code, routeKey, ...rest)}`;
  }
  languages["x-default"] = `${SITE_URL}${route("id", routeKey, ...rest)}`;

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}${path}`,
      languages,
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${path}`,
      locale: locale === "id" ? "id_ID" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
