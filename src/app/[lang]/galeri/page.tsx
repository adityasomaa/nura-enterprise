import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SectionHeader } from "@/components/SectionHeader";
import { TransitionLink } from "@/components/TransitionLink";
import { GalleryBrowser } from "@/components/gallery/GalleryBrowser";
import { ALBUMS, type Locale } from "@/data/site-content";
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
    routeKey: "gallery",
    title: dict.gallery.meta.title,
    description: dict.gallery.meta.description,
  });
}

export default async function GalleryPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale: Locale = lang;
  const dict = getDictionary(locale);

  return (
    <section className="mx-auto w-full max-w-[1440px] px-5 pb-4 pt-(--header-h) sm:px-8 lg:px-12">
      <div className="pt-14 sm:pt-20 lg:pt-24">
        <SectionHeader
          as="h1"
          size="xl"
          sectionTitle={dict.gallery.header.sectionTitle}
          headline={dict.gallery.header.headline}
          description={dict.gallery.header.description}
          cta={
            <TransitionLink
              href={route(locale, "contact")}
              className="min-h-12 border border-line-strong px-6 py-3.5 text-[0.94rem] text-ink transition-colors duration-200 hover:border-ink"
            >
              {dict.gallery.header.cta}
            </TransitionLink>
          }
        />
      </div>

      <div className="mt-12 lg:mt-16">
        <GalleryBrowser albums={ALBUMS} locale={locale} dict={dict} />
      </div>
    </section>
  );
}
