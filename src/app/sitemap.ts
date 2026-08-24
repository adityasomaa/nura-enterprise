import type { MetadataRoute } from "next";

import { SITE_URL } from "@/config/client";
import { ALBUMS } from "@/data/site-content";
import { LOCALES } from "@/lib/i18n";
import { route, staticRouteKeys, type RouteKey } from "@/lib/routes";

/**
 * Sitemap mencakup kedua bahasa dan seluruh halaman album, lengkap dengan
 * pasangan hreflang. Halaman rias hanya ikut kalau flagnya menyala di config.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  function push(key: RouteKey, rest: string[], priority: number, changeFrequency: "monthly" | "yearly" | "weekly") {
    for (const locale of LOCALES) {
      entries.push({
        url: `${SITE_URL}${route(locale, key, ...rest)}`,
        changeFrequency,
        priority,
        alternates: {
          languages: Object.fromEntries(
            LOCALES.map((code) => [
              code === "id" ? "id-ID" : "en",
              `${SITE_URL}${route(code, key, ...rest)}`,
            ]),
          ),
        },
      });
    }
  }

  for (const key of staticRouteKeys()) {
    const priority = key === "home" ? 1 : key === "gallery" ? 0.9 : key === "privacy" || key === "terms" ? 0.2 : 0.8;
    const frequency = key === "privacy" || key === "terms" ? "yearly" : "monthly";
    push(key, [], priority, frequency);
  }

  for (const album of ALBUMS) {
    push("gallery", [album.slug], 0.7, "monthly");
  }

  return entries;
}
