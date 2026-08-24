import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SectionHeader } from "@/components/SectionHeader";
import { TransitionLink } from "@/components/TransitionLink";
import { WhatsAppLink } from "@/components/WhatsAppLink";
import { AlbumGallery } from "@/components/gallery/AlbumGallery";
import { CLIENT } from "@/config/client";
import {
  RIAS_ALBUMS,
  SCENES,
  STYLES,
  albumImagePath,
  labelOf,
  type Locale,
} from "@/data/site-content";
import { LOCALES, getDictionary, isLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { route } from "@/lib/routes";

/* Kalau flag rias mati, tidak ada satu pun rute yang dibuat untuk halaman ini,
   dan permintaan langsung ke alamatnya dijawab 404. */
export function generateStaticParams() {
  if (!CLIENT.features.riasPengantin) return [];
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  if (!CLIENT.features.riasPengantin) return {};
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "id";
  const dict = getDictionary(locale);
  return pageMetadata({
    locale,
    routeKey: "rias",
    title: dict.rias.meta.title,
    description: dict.rias.meta.description,
  });
}

export default async function RiasPage({ params }: { params: Promise<{ lang: string }> }) {
  if (!CLIENT.features.riasPengantin) notFound();
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale: Locale = lang;
  const dict = getDictionary(locale);
  const contactHref = route(locale, "contact");

  const photos = RIAS_ALBUMS.flatMap((album) =>
    album.photos.map((photo) => ({
      src: albumImagePath(album.code, photo.scene),
      alt:
        locale === "id"
          ? `Ilustrasi geometris ${photo.scene.replace(/-/g, " ")} bergaya ${labelOf(STYLES, album.style, locale)}, album ${album.code}`
          : `Geometric illustration of the ${photo.scene.replace(/-/g, " ")} area in ${labelOf(STYLES, album.style, locale)} style, album ${album.code}`,
      caption: `${album.title[locale]} — ${labelOf(SCENES, photo.scene, locale)}`,
    })),
  );

  return (
    <div className="mx-auto w-full max-w-[1440px] px-5 pt-(--header-h) sm:px-8 lg:px-12">
      <section aria-labelledby="rias-judul" className="pt-14 sm:pt-20 lg:pt-24">
        <SectionHeader
          id="rias-judul"
          as="h1"
          size="xl"
          sectionTitle={dict.rias.header.sectionTitle}
          headline={dict.rias.header.headline}
          description={dict.rias.header.description}
          cta={
            <WhatsAppLink
              locale={locale}
              fallbackHref={contactHref}
              message={`${dict.contact.whatsapp.intro}\n\n${dict.rias.header.headline}`}
              trackingLabel={dict.rias.header.cta}
              className="min-h-12 bg-accent px-6 py-3.5 text-[0.94rem] text-on-accent transition-colors duration-200 hover:bg-accent-strong"
            >
              {dict.rias.header.cta}
            </WhatsAppLink>
          }
        />

        <div className="mt-14 lg:mt-20">
          <AlbumGallery photos={photos} dict={dict} openLabel={dict.album.openLightbox} />
        </div>
      </section>

      <section aria-labelledby="rias-gabung-judul" className="pt-20 sm:pt-24 lg:pt-32">
        <SectionHeader
          id="rias-gabung-judul"
          sectionTitle={dict.rias.combine.sectionTitle}
          headline={dict.rias.combine.headline}
          description={dict.rias.combine.description}
          cta={
            <TransitionLink
              href={contactHref}
              className="min-h-12 border border-line-strong px-6 py-3.5 text-[0.94rem] text-ink transition-colors duration-200 hover:border-ink"
            >
              {dict.rias.combine.cta}
            </TransitionLink>
          }
        />
      </section>
    </div>
  );
}
