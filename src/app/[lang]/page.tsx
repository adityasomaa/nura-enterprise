import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Hero } from "@/components/Hero";
import { Reveal } from "@/components/Reveal";
import { SectionHeader } from "@/components/SectionHeader";
import { TransitionLink } from "@/components/TransitionLink";
import { AlbumCard } from "@/components/gallery/AlbumCard";
import { ALBUMS, PACKETS, type Locale } from "@/data/site-content";
import { getDictionary, isLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { route } from "@/lib/routes";

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
    routeKey: "home",
    title: dict.home.meta.title,
    description: dict.home.meta.description,
  });
}

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale: Locale = lang;
  const dict = getDictionary(locale);

  const galleryHref = route(locale, "gallery");
  const packetsHref = route(locale, "packets");
  const contactHref = route(locale, "contact");
  const preview = ALBUMS.slice(0, 3);

  return (
    <>
      <Hero
        dict={dict}
        galleryHref={galleryHref}
        contactHref={contactHref}
        scrollTargetId="galeri-home"
      />

      <section
        id="galeri-home"
        aria-labelledby="galeri-home-judul"
        className="mx-auto w-full max-w-[1440px] scroll-mt-(--header-h) px-5 pt-20 sm:px-8 sm:pt-28 lg:px-12 lg:pt-36"
      >
        <SectionHeader
          id="galeri-home-judul"
          sectionTitle={dict.home.gallery.sectionTitle}
          headline={dict.home.gallery.headline}
          description={dict.home.gallery.description}
          cta={
            <TransitionLink
              href={galleryHref}
              className="min-h-12 border border-line-strong px-6 py-3.5 text-[0.94rem] text-ink transition-colors duration-200 hover:border-ink"
            >
              {dict.home.gallery.cta}
            </TransitionLink>
          }
        />

        <div className="mt-14 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:mt-20 lg:grid-cols-3 lg:gap-x-10">
          {preview.map((album, index) => (
            <Reveal key={album.code} delay={index * 90}>
              <AlbumCard album={album} locale={locale} dict={dict} priority={index === 0} />
            </Reveal>
          ))}
        </div>
      </section>

      <section
        aria-labelledby="paket-home-judul"
        className="mx-auto w-full max-w-[1440px] px-5 pt-24 sm:px-8 sm:pt-32 lg:px-12 lg:pt-40"
      >
        <SectionHeader
          id="paket-home-judul"
          sectionTitle={dict.home.packets.sectionTitle}
          headline={dict.home.packets.headline}
          description={dict.home.packets.description}
          cta={
            <TransitionLink
              href={packetsHref}
              className="min-h-12 border border-line-strong px-6 py-3.5 text-[0.94rem] text-ink transition-colors duration-200 hover:border-ink"
            >
              {dict.home.packets.cta}
            </TransitionLink>
          }
        />

        <ul className="mt-12 border-t border-line lg:mt-16">
          {PACKETS.map((packet, index) => (
            <li key={packet.id}>
              <Reveal
                as="div"
                delay={index * 80}
                className="grid gap-4 border-b border-line py-8 md:grid-cols-12 md:items-baseline md:gap-8 lg:py-10"
              >
                <p className="text-[0.78rem] uppercase tracking-[0.18em] text-ink-3 md:col-span-1">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="text-[1.3rem] font-medium text-ink md:col-span-4 lg:text-[1.5rem]">
                  {packet.name[locale]}
                </h3>
                <p className="text-[0.96rem] text-ink-2 md:col-span-5">{packet.fitFor[locale]}</p>
                <p className="text-[0.86rem] text-ink-3 md:col-span-2 md:text-right">
                  {packet.areas.length} {dict.packets.areasLabel.toLowerCase()}
                </p>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="konsultasi-home-judul"
        className="mx-auto w-full max-w-[1440px] px-5 pt-24 sm:px-8 sm:pt-32 lg:px-12 lg:pt-40"
      >
        <SectionHeader
          id="konsultasi-home-judul"
          sectionTitle={dict.home.consult.sectionTitle}
          headline={dict.home.consult.headline}
          description={dict.home.consult.description}
          cta={
            <TransitionLink
              href={contactHref}
              className="min-h-12 bg-accent px-6 py-3.5 text-[0.94rem] text-on-accent transition-colors duration-200 hover:bg-accent-strong"
            >
              {dict.home.consult.cta}
            </TransitionLink>
          }
        />

        <Reveal className="mt-12 grid gap-x-10 gap-y-6 border-t border-line pt-10 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
          {[
            dict.contact.form.eventDate,
            dict.contact.form.eventType,
            dict.contact.form.venue,
            dict.contact.form.guests,
            dict.contact.form.style,
            dict.contact.form.notes,
          ].map((label) => (
            <p key={label} className="text-[0.96rem] text-ink-2">
              {label}
            </p>
          ))}
        </Reveal>
      </section>
    </>
  );
}
