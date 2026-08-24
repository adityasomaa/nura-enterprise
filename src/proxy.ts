import { NextResponse, type NextRequest } from "next/server";

const LOCALES = ["id", "en"] as const;
const DEFAULT_LOCALE = "id";
const LOCALE_COOKIE = "pref-locale";
const CONSENT_COOKIE = "cookie-consent";

/**
 * Alamat tanpa awalan bahasa diarahkan ke salah satu bahasa.
 *
 * Urutan penentuannya: pilihan bahasa yang tersimpan di perangkat, lalu bahasa
 * browser, lalu bahasa Indonesia sebagai bawaan. Cookie pilihan bahasa hanya
 * dipakai kalau pengunjung sudah mengizinkan penyimpanan preferensi lewat
 * banner cookie, jadi penolakan di banner itu benar-benar berpengaruh.
 */
function pickLocale(request: NextRequest): string {
  const consent = request.cookies.get(CONSENT_COOKIE)?.value;
  if (consent === "accepted") {
    const saved = request.cookies.get(LOCALE_COOKIE)?.value;
    if (saved && (LOCALES as readonly string[]).includes(saved)) return saved;
  }

  const header = request.headers.get("accept-language") ?? "";
  const preferred = header
    .split(",")
    .map((entry) => {
      const [tag, q] = entry.trim().split(";q=");
      return { tag: tag.toLowerCase(), q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);

  for (const { tag } of preferred) {
    if (tag.startsWith("id")) return "id";
    if (tag.startsWith("en")) return "en";
  }
  return DEFAULT_LOCALE;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = LOCALES.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (hasLocale) return;

  const url = request.nextUrl.clone();
  url.pathname = `/${pickLocale(request)}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next|graphics|fonts|icon.svg|sitemap.xml|robots.txt|.*\\..*).*)"],
};
