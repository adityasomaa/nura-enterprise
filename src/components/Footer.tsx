"use client";

import { usePathname } from "next/navigation";

import { SectionHeader } from "@/components/SectionHeader";
import { TransitionLink } from "@/components/TransitionLink";
import { useUi } from "@/components/providers/UiProvider";
import { CLIENT, addressLine, isFilled } from "@/config/client";
import type { Locale } from "@/data/site-content";
import type { Dictionary } from "@/lib/i18n";
import { PATHS, route, type RouteKey } from "@/lib/routes";
import { MAPS_URL } from "@/lib/whatsapp";

type Props = {
  locale: Locale;
  dict: Dictionary;
  navItems: { key: RouteKey; label: string; href: string }[];
};

export function Footer({ locale, dict, navItems }: Props) {
  const pathname = usePathname();
  const { reopenConsent, consent } = useUi();

  const galleryHref = route(locale, "gallery");
  const contactHref = route(locale, "contact");

  /* CTA footer bertukar target kalau pengunjung sudah berada di halaman tujuan,
     supaya setiap halaman tetap berakhir dengan ajakan yang membawa maju. */
  const onGallery = pathname.startsWith(`/${locale}/${PATHS.gallery}`);
  const onContact = pathname === contactHref;

  // Kalau pengunjung sudah berada di halaman tujuan, CTA utama pindah ke tujuan
  // satunya, dan CTA kedua disembunyikan supaya tidak mengarah ke halaman ini.
  const primaryHref = onGallery ? contactHref : galleryHref;
  const primaryLabel = onGallery ? dict.footer.ctaContact : dict.footer.ctaGallery;
  const secondaryHref = onGallery ? galleryHref : contactHref;
  const secondaryLabel = onGallery ? dict.footer.ctaGallery : dict.footer.ctaContact;
  const showSecondary = !onGallery && !onContact;

  const hours = isFilled(CLIENT.openingHours) ? CLIENT.openingHours : null;
  const whatsappDisplay = isFilled(CLIENT.contact.whatsappDisplay)
    ? CLIENT.contact.whatsappDisplay
    : null;
  const email = isFilled(CLIENT.contact.email) ? CLIENT.contact.email : null;

  return (
    <footer className="mt-24 border-t border-line bg-paper-2 sm:mt-32">
      <div className="mx-auto w-full max-w-[1440px] px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
        <SectionHeader
          sectionTitle={dict.footer.sectionTitle}
          headline={onGallery ? dict.footer.headlineAlt : dict.footer.headline}
          description={onGallery ? dict.footer.descriptionAlt : dict.footer.description}
          cta={
            <>
              <TransitionLink
                href={primaryHref}
                className="bg-accent px-6 py-3.5 text-[0.94rem] text-on-accent transition-colors duration-200 hover:bg-accent-strong"
              >
                {primaryLabel}
              </TransitionLink>
              {showSecondary ? (
                <TransitionLink
                  href={secondaryHref}
                  className="border border-line-strong px-6 py-3.5 text-[0.94rem] text-ink transition-colors duration-200 hover:border-ink"
                >
                  {secondaryLabel}
                </TransitionLink>
              ) : null}
            </>
          }
        />

        <div className="mt-16 grid gap-10 border-t border-line pt-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-3">
            <h3 className="eyebrow">{dict.footer.contact}</h3>
            <p className="text-[0.94rem] text-ink">{CLIENT.name}</p>
            {whatsappDisplay ? (
              <p className="text-[0.94rem] text-ink-2">
                {dict.footer.whatsappLabel}: {whatsappDisplay}
              </p>
            ) : (
              <p className="text-[0.94rem] text-ink-3">
                {dict.footer.whatsappLabel}: {dict.footer.unfilled}
              </p>
            )}
            {email ? <p className="text-[0.94rem] text-ink-2">{email}</p> : null}
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

          <div className="flex flex-col gap-3">
            <h3 className="eyebrow">{dict.footer.address}</h3>
            <p className="text-[0.94rem] text-ink-2">{addressLine()}</p>
            {!isFilled(CLIENT.address.street) ? (
              <p className="text-[0.88rem] text-ink-3">{dict.footer.unfilled}</p>
            ) : null}
            <h3 className="eyebrow mt-3">{dict.footer.hours}</h3>
            {hours ? (
              <ul className="flex flex-col gap-1 text-[0.94rem] text-ink-2">
                {hours.map((entry) => (
                  <li key={entry}>{entry}</li>
                ))}
              </ul>
            ) : (
              <p className="text-[0.94rem] text-ink-3">{dict.footer.unfilled}</p>
            )}
          </div>

          <nav aria-label={dict.footer.navTitle} className="flex flex-col gap-3">
            <h3 className="eyebrow">{dict.footer.navTitle}</h3>
            {navItems.map((item) => (
              <TransitionLink
                key={item.key}
                href={item.href}
                className="link-underline w-fit text-[0.94rem] text-ink-2 hover:text-ink"
              >
                {item.label}
              </TransitionLink>
            ))}
          </nav>

          <div className="flex flex-col gap-3">
            <h3 className="eyebrow">{dict.footer.legalTitle}</h3>
            <TransitionLink
              href={route(locale, "privacy")}
              className="link-underline w-fit text-[0.94rem] text-ink-2 hover:text-ink"
            >
              {dict.footer.privacy}
            </TransitionLink>
            <TransitionLink
              href={route(locale, "terms")}
              className="link-underline w-fit text-[0.94rem] text-ink-2 hover:text-ink"
            >
              {dict.footer.terms}
            </TransitionLink>
            <button
              type="button"
              onClick={reopenConsent}
              className="link-underline w-fit text-left text-[0.94rem] text-ink-2 hover:text-ink"
            >
              {dict.footer.cookieSettings}
            </button>
            <p className="text-[0.82rem] text-ink-3">
              {consent === "accepted"
                ? dict.cookie.savedAccepted
                : consent === "rejected"
                  ? dict.cookie.savedRejected
                  : ""}
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-line pt-6 text-[0.82rem] text-ink-3 sm:flex-row sm:items-center sm:justify-between">
          <p>
            {CLIENT.name}. {dict.footer.rights}
          </p>
          <p>{dict.common.illustrationNote}</p>
        </div>
      </div>
    </footer>
  );
}
