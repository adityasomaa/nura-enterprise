import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SectionHeader } from "@/components/SectionHeader";
import { TransitionLink } from "@/components/TransitionLink";
import { WhatsAppLink } from "@/components/WhatsAppLink";
import { AlbumGallery } from "@/components/gallery/AlbumGallery";
import { albumAlt } from "@/lib/album-alt";
import {
  ALBUMS,
  EVENT_TYPES,
  PLACEMENTS,
  SCENES,
  STYLES,
  VENUE_CATEGORIES,
  albumImagePath,
  findAlbum,
  labelOf,
  type Locale,
} from "@/data/site-content";
import { LOCALES, fill, getDictionary, isLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { route } from "@/lib/routes";

export function generateStaticParams() {
  return LOCALES.flatMap((lang) => ALBUMS.map((album) => ({ lang, album: album.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; album: string }>;
}): Promise<Metadata> {
  const { lang, album: slug } = await params;
  const locale: Locale = isLocale(lang) ? lang : "id";
  const album = findAlbum(slug);
  if (!album) return {};
  const dict = getDictionary(locale);
  return pageMetadata({
    locale,
    routeKey: "gallery",
    rest: [album.slug],
    title: `${album.title[locale]} — ${dict.gallery.meta.title}`,
    description: album.summary[locale],
  });
}

export default async function AlbumPage({
  params,
}: {
  params: Promise<{ lang: string; album: string }>;
}) {
  const { lang, album: slug } = await params;
  if (!isLocale(lang)) notFound();
  const locale: Locale = lang;
  const album = findAlbum(slug);
  if (!album) notFound();
  const dict = getDictionary(locale);

  const photos = album.photos.map((photo) => ({
    src: albumImagePath(album.code, photo.scene),
    alt: albumAlt(album, photo.scene, locale),
    caption: labelOf(SCENES, photo.scene, locale),
  }));

  const consultHref = `${route(locale, "contact")}?album=${album.code}&style=${album.style}`;
  const styleLabel = labelOf(STYLES, album.style, locale);
  const waMessage = [
    dict.contact.whatsapp.intro,
    "",
    `${dict.contact.whatsapp.album}: ${album.code}`,
    `${dict.contact.whatsapp.style}: ${styleLabel}`,
    `${dict.contact.whatsapp.eventType}: ${labelOf(EVENT_TYPES, album.eventType, locale)}`,
  ].join("\n");

  const meta = [
    { label: dict.gallery.albumMeta.event, value: labelOf(EVENT_TYPES, album.eventType, locale) },
    { label: dict.gallery.albumMeta.placement, value: labelOf(PLACEMENTS, album.placement, locale) },
    { label: dict.gallery.albumMeta.style, value: styleLabel },
    { label: dict.gallery.albumMeta.venue, value: labelOf(VENUE_CATEGORIES, album.venue, locale) },
    { label: dict.gallery.albumMeta.code, value: album.code },
  ];

  return (
    <article className="mx-auto w-full max-w-[1440px] px-5 pt-(--header-h) sm:px-8 lg:px-12">
      <div className="pt-10 sm:pt-14">
        <TransitionLink
          href={route(locale, "gallery")}
          className="link-underline inline-flex w-fit items-center gap-2 text-[0.86rem] text-ink-2 hover:text-ink"
        >
          <span aria-hidden="true">&larr;</span>
          {dict.common.backToGallery}
        </TransitionLink>
      </div>

      <div className="pt-8 sm:pt-10">
        <SectionHeader
          as="h1"
          size="lg"
          sectionTitle={dict.album.header.sectionTitle}
          headline={album.title[locale]}
          description={album.summary[locale]}
          cta={
            <>
              <TransitionLink
                href={consultHref}
                className="min-h-12 bg-accent px-6 py-3.5 text-[0.94rem] text-on-accent transition-colors duration-200 hover:bg-accent-strong"
              >
                {dict.album.header.cta}
              </TransitionLink>
              <WhatsAppLink
                locale={locale}
                message={waMessage}
                fallbackHref={consultHref}
                trackingLabel={`Album ${album.code}`}
                className="min-h-12 border border-line-strong px-6 py-3.5 text-[0.94rem] text-ink transition-colors duration-200 hover:border-ink"
              >
                WhatsApp
              </WhatsAppLink>
            </>
          }
        />
      </div>

      <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-5 border-y border-line py-6 sm:grid-cols-3 lg:grid-cols-5">
        {meta.map((item) => (
          <div key={item.label} className="flex flex-col gap-1">
            <dt className="text-[0.7rem] uppercase tracking-[0.14em] text-ink-3">{item.label}</dt>
            <dd className="text-[0.94rem] text-ink">{item.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-12 lg:mt-16">
        <p className="sr-only">{fill(dict.gallery.albumMeta.photos, { count: photos.length })}</p>
        <AlbumGallery photos={photos} dict={dict} openLabel={dict.album.openLightbox} />
      </div>
    </article>
  );
}
