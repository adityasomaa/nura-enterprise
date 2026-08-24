"use client";

import { SplitText } from "@/components/SplitText";
import { TransitionLink } from "@/components/TransitionLink";
import type { Dictionary } from "@/lib/i18n";

type Props = {
  dict: Dictionary;
  galleryHref: string;
  contactHref: string;
  scrollTargetId: string;
};

/**
 * Hero setinggi tepat satu layar.
 *
 * Tingginya memakai svh, bukan vh, supaya tidak ikut berubah ukuran saat bilah
 * browser di HP menyembunyikan diri waktu digulir. Grafiknya diam di tempat,
 * tidak ikut membesar saat halaman digulir.
 */
export function Hero({ dict, galleryHref, contactHref, scrollTargetId }: Props) {
  return (
    <section className="relative flex h-svh min-h-[540px] w-full flex-col justify-end overflow-hidden">
      <img
        src="/graphics/hero.svg"
        alt=""
        aria-hidden="true"
        width={2400}
        height={1500}
        fetchPriority="high"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-[72%] bg-gradient-to-t from-paper via-paper/88 to-transparent"
      />

      <div
        className="relative mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-5 sm:px-8 lg:px-12"
        style={{ paddingBottom: "calc(3.5rem + var(--consent-h, 0px))" }}
      >
        <p className="eyebrow">{dict.home.hero.eyebrow}</p>
        <SplitText as="h1" text={dict.home.hero.headline} className="headline-xl block" delay={140} />
        <p className="prose-measure text-[1rem] text-ink-2 sm:text-[1.1rem]">
          {dict.home.hero.description}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <TransitionLink
            href={galleryHref}
            className="min-h-12 bg-accent px-7 py-3.5 text-[0.96rem] text-on-accent transition-colors duration-200 hover:bg-accent-strong"
          >
            {dict.home.hero.cta}
          </TransitionLink>
          <TransitionLink
            href={contactHref}
            className="min-h-12 border border-line-strong px-7 py-3.5 text-[0.96rem] text-ink transition-colors duration-200 hover:border-ink"
          >
            {dict.home.hero.secondary}
          </TransitionLink>
        </div>

        <a
          href={`#${scrollTargetId}`}
          className="mt-4 flex w-fit items-center gap-2 text-[0.78rem] uppercase tracking-[0.16em] text-ink-2 hover:text-ink"
        >
          {dict.home.hero.scroll}
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-4 w-4">
            <path
              d="M12 4v15m0 0 6-6m-6 6-6-6"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </div>
    </section>
  );
}
