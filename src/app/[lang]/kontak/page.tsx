import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { SectionHeader } from "@/components/SectionHeader";
import { WhatsAppLink } from "@/components/WhatsAppLink";
import { ConsultationFormPanel } from "@/components/form/ConsultationFormPanel";
import { CLIENT, addressLine, isFilled } from "@/config/client";
import type { Locale } from "@/data/site-content";
import { LOCALES, getDictionary, isLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { route } from "@/lib/routes";
import { MAPS_URL } from "@/lib/whatsapp";

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
    routeKey: "contact",
    title: dict.contact.meta.title,
    description: dict.contact.meta.description,
  });
}

export default async function ContactPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale: Locale = lang;
  const dict = getDictionary(locale);

  const whatsappDisplay = isFilled(CLIENT.contact.whatsappDisplay)
    ? CLIENT.contact.whatsappDisplay
    : null;

  return (
    <div className="mx-auto w-full max-w-[1440px] px-5 pt-(--header-h) sm:px-8 lg:px-12">
      <section aria-labelledby="kontak-judul" className="pt-14 sm:pt-20 lg:pt-24">
        <SectionHeader
          id="kontak-judul"
          as="h1"
          size="xl"
          sectionTitle={dict.contact.header.sectionTitle}
          headline={dict.contact.header.headline}
          description={dict.contact.header.description}
          cta={
            <WhatsAppLink
              locale={locale}
              fallbackHref={route(locale, "gallery")}
              message={dict.contact.whatsapp.intro}
              trackingLabel={dict.contact.header.cta}
              className="min-h-12 border border-line-strong px-6 py-3.5 text-[0.94rem] text-ink transition-colors duration-200 hover:border-ink"
            >
              {dict.contact.header.cta}
            </WhatsAppLink>
          }
        />

        <div className="mt-14 grid gap-12 lg:mt-20 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <Suspense fallback={<p className="text-[0.94rem] text-ink-3">{dict.common.loading}</p>}>
              <ConsultationFormPanel locale={locale} dict={dict} />
            </Suspense>
          </div>

          <aside className="flex flex-col gap-8 lg:col-span-4 lg:col-start-9">
            <div className="flex flex-col gap-2">
              <h2 className="eyebrow">{dict.footer.contact}</h2>
              <p className="text-[0.98rem] text-ink">{CLIENT.name}</p>
              <p className="text-[0.94rem] text-ink-2">
                {dict.footer.whatsappLabel}: {whatsappDisplay ?? dict.footer.unfilled}
              </p>
              {isFilled(CLIENT.contact.email) ? (
                <p className="text-[0.94rem] text-ink-2">{CLIENT.contact.email}</p>
              ) : null}
              {MAPS_URL ? (
                <a
                  href={MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline w-fit text-[0.94rem] text-ink-2"
                >
                  {dict.footer.mapsLabel}
                </a>
              ) : null}
            </div>

            <div className="flex flex-col gap-2 border-t border-line pt-8">
              <h2 className="eyebrow">{dict.footer.address}</h2>
              <p className="text-[0.94rem] text-ink-2">{addressLine()}</p>
              {!isFilled(CLIENT.address.street) ? (
                <p className="text-[0.88rem] text-ink-3">{dict.footer.unfilled}</p>
              ) : null}
            </div>

            <div className="flex flex-col gap-2 border-t border-line pt-8">
              <h2 className="eyebrow">{dict.footer.hours}</h2>
              {isFilled(CLIENT.openingHours) ? (
                <ul className="flex flex-col gap-1 text-[0.94rem] text-ink-2">
                  {CLIENT.openingHours.map((entry) => (
                    <li key={entry}>{entry}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-[0.94rem] text-ink-3">{dict.footer.unfilled}</p>
              )}
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
