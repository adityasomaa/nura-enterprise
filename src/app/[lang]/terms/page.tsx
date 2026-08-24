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
    routeKey: "terms",
    title: dict.terms.meta.title,
    description: dict.terms.meta.description,
  });
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale: Locale = lang;
  const dict = getDictionary(locale);

  return (
    <LegalPage
      sectionTitle={dict.terms.header.sectionTitle}
      headline={dict.terms.header.headline}
      description={dict.terms.header.description}
      ctaLabel={dict.terms.header.cta}
      ctaHref={route(locale, "contact")}
      sections={dict.terms.sections}
    />
  );
}
