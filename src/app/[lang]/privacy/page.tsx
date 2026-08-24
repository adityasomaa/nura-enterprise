import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LegalPage } from "@/components/LegalPage";
import type { Locale } from "@/data/site-content";
import { LOCALES, getDictionary, isLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { route } from "@/lib/routes";

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "id";
  const dict = getDictionary(locale);
  return pageMetadata({
    locale,
    routeKey: "privacy",
    title: dict.privacy.meta.title,
    description: dict.privacy.meta.description,
  });
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale: Locale = lang;
  const dict = getDictionary(locale);

  return (
    <LegalPage
      sectionTitle={dict.privacy.header.sectionTitle}
      headline={dict.privacy.header.headline}
      description={dict.privacy.header.description}
      ctaLabel={dict.privacy.header.cta}
      ctaHref={route(locale, "contact")}
      sections={dict.privacy.sections}
    />
  );
}
