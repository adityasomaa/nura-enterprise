import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Reveal } from "@/components/Reveal";
import { SectionHeader } from "@/components/SectionHeader";
import { TransitionLink } from "@/components/TransitionLink";
import { PACKETS, type Locale } from "@/data/site-content";
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
    routeKey: "packets",
    title: dict.packets.meta.title,
    description: dict.packets.meta.description,
  });
}

export default async function PacketsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale: Locale = lang;
  const dict = getDictionary(locale);
  const contactHref = route(locale, "contact");

  return (
    <div className="mx-auto w-full max-w-[1440px] px-5 pt-(--header-h) sm:px-8 lg:px-12">
      <section aria-labelledby="paket-judul" className="pt-14 sm:pt-20 lg:pt-24">
        <SectionHeader
          id="paket-judul"
          as="h1"
          size="xl"
          sectionTitle={dict.packets.header.sectionTitle}
          headline={dict.packets.header.headline}
          description={dict.packets.header.description}
          cta={
            <TransitionLink
              href={contactHref}
              className="min-h-12 bg-accent px-6 py-3.5 text-[0.94rem] text-on-accent transition-colors duration-200 hover:bg-accent-strong"
            >
              {dict.packets.header.cta}
            </TransitionLink>
          }
        />

        <div className="mt-14 border-t border-line lg:mt-20">
          {PACKETS.map((packet, index) => (
            <Reveal
              key={packet.id}
              as="section"
              delay={index * 90}
              className="grid gap-6 border-b border-line py-12 md:grid-cols-12 md:items-start md:gap-10 lg:py-16"
            >
              <div className="flex flex-col gap-3 md:col-span-5">
                <p className="text-[0.78rem] uppercase tracking-[0.18em] text-ink-3">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h2 className="headline-md">{packet.name[locale]}</h2>
                <p className="prose-measure text-[0.98rem] text-ink-2">{packet.fitFor[locale]}</p>
              </div>

              <div className="md:col-span-4">
                <h3 className="eyebrow mb-4">{dict.packets.areasLabel}</h3>
                <ul className="flex flex-col gap-2.5">
                  {packet.areas.map((area) => (
                    <li key={area.id} className="flex items-baseline gap-3 text-[0.96rem] text-ink">
                      <span aria-hidden="true" className="h-px w-4 shrink-0 translate-y-[-0.3em] bg-line-strong" />
                      {area[locale]}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-4 md:col-span-3">
                <h3 className="eyebrow">{dict.packets.notesLabel}</h3>
                <p className="text-[0.94rem] text-ink-2">{packet.notes[locale]}</p>
                <TransitionLink
                  href={`${contactHref}?paket=${packet.id}`}
                  className="link-underline w-fit text-[0.94rem] text-accent-strong"
                >
                  {dict.packets.header.cta}
                </TransitionLink>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section aria-labelledby="paket-harga-judul" className="pt-20 sm:pt-24 lg:pt-32">
        <SectionHeader
          id="paket-harga-judul"
          sectionTitle={dict.packets.priceNote.sectionTitle}
          headline={dict.packets.priceNote.headline}
          description={dict.packets.priceNote.description}
          cta={
            <TransitionLink
              href={contactHref}
              className="min-h-12 border border-line-strong px-6 py-3.5 text-[0.94rem] text-ink transition-colors duration-200 hover:border-ink"
            >
              {dict.packets.priceNote.cta}
            </TransitionLink>
          }
        />
      </section>
    </div>
  );
}
