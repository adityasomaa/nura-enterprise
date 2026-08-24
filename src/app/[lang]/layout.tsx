import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import "../globals.css";

import { CookieBanner } from "@/components/CookieBanner";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { LenisProvider } from "@/components/providers/LenisProvider";
import { TransitionProvider } from "@/components/providers/TransitionProvider";
import { UiProvider } from "@/components/providers/UiProvider";
import { CLIENT, SITE_URL, isFilled } from "@/config/client";
import type { Locale } from "@/data/site-content";
import { HTML_LANG, LOCALES, getDictionary, isLocale } from "@/lib/i18n";
import { navKeys, route } from "@/lib/routes";
import { MAPS_URL } from "@/lib/whatsapp";

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: CLIENT.name,
    template: `%s — ${CLIENT.name}`,
  },
  applicationName: CLIENT.name,
  robots: { index: true, follow: true },
  openGraph: { siteName: CLIENT.name },
};

export const viewport: Viewport = {
  themeColor: "#f7f3ee",
  width: "device-width",
  initialScale: 1,
};

/** Data terstruktur LocalBusiness. Hanya memuat data yang benar-benar diketahui. */
function localBusinessJsonLd(locale: Locale) {
  const address: Record<string, string> = {
    "@type": "PostalAddress",
    addressLocality: CLIENT.address.locality,
    addressRegion: CLIENT.address.region,
    addressCountry: CLIENT.address.country,
  };
  if (isFilled(CLIENT.address.street)) address.streetAddress = CLIENT.address.street;
  if (isFilled(CLIENT.address.postalCode)) address.postalCode = CLIENT.address.postalCode;

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: CLIENT.name,
    url: `${SITE_URL}${route(locale, "home")}`,
    address,
    areaServed: {
      "@type": "City",
      name: CLIENT.address.locality,
    },
    knowsLanguage: ["id", "en"],
  };

  if (isFilled(CLIENT.contact.whatsapp)) data.telephone = `+${CLIENT.contact.whatsapp}`;
  if (isFilled(CLIENT.contact.email)) data.email = CLIENT.contact.email;
  if (isFilled(CLIENT.openingHours)) data.openingHours = CLIENT.openingHours;
  if (MAPS_URL) data.hasMap = MAPS_URL;

  return data;
}

export default async function RootLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale: Locale = lang;
  const dict = getDictionary(locale);

  const navItems = navKeys().map((key) => ({
    key,
    label:
      key === "home"
        ? dict.nav.home
        : key === "gallery"
          ? dict.nav.gallery
          : key === "packets"
            ? dict.nav.packets
            : key === "rias"
              ? dict.nav.rias
              : dict.nav.contact,
    href: route(locale, key),
  }));

  return (
    <html
      lang={HTML_LANG[locale]}
      style={
        {
          "--client-accent": CLIENT.accent.base,
          "--client-accent-strong": CLIENT.accent.strong,
          "--client-on-accent": CLIENT.accent.on,
        } as React.CSSProperties
      }
    >
      <body>
        <script
          type="application/ld+json"
          // Data terstruktur ini disusun dari config, bukan dari input pengguna.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd(locale)) }}
        />
        <UiProvider>
          <TransitionProvider>
            <LenisProvider />
            <Header
              locale={locale}
              items={navItems}
              contactHref={route(locale, "contact")}
              labels={{
                skipToContent: dict.common.skipToContent,
                openMenu: dict.common.openMenu,
                closeMenu: dict.common.closeMenu,
                language: dict.common.language,
                contactCta: dict.nav.contact,
              }}
            />
            <main id="konten" className="relative z-content">
              {children}
            </main>
            <Footer locale={locale} dict={dict} navItems={navItems} />
            <CookieBanner dict={dict} />
          </TransitionProvider>
        </UiProvider>
      </body>
    </html>
  );
}
