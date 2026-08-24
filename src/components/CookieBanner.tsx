"use client";

import { useEffect, useRef } from "react";

import { useUi } from "@/components/providers/UiProvider";
import type { Dictionary } from "@/lib/i18n";

/**
 * Banner cookie yang benar-benar menggerakkan sesuatu.
 *
 * Izin di sini menentukan apakah pilihan bahasa dan filter galeri disimpan di
 * perangkat pengunjung. Kalau ditolak, penyimpanan dibuang dan pilihan hanya
 * bertahan selama tab terbuka, termasuk cookie yang menentukan bahasa mana yang
 * dibuka saat mengetik alamat situs tanpa awalan bahasa.
 *
 * Banner tidak pernah tampil di atas menu mobile, lightbox, panel filter, atau
 * kalender. Selama salah satunya terbuka, banner disembunyikan sepenuhnya
 * supaya tidak menutupi dan tidak menelan klik.
 */
export function CookieBanner({ dict }: { dict: Dictionary }) {
  const { consent, consentPromptOpen, setConsent, overlayCount } = useUi();
  const ref = useRef<HTMLDivElement | null>(null);
  const visible = consentPromptOpen && overlayCount === 0;

  /* Tinggi banner dibagikan sebagai custom property supaya konten yang
     menempel di dasar layar, seperti tombol di hero, tidak pernah tertutup. */
  useEffect(() => {
    const root = document.documentElement;
    if (!visible) {
      root.style.setProperty("--consent-h", "0px");
      return;
    }
    const node = ref.current;
    if (!node) return;
    const sync = () => root.style.setProperty("--consent-h", `${node.offsetHeight}px`);
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(node);
    return () => {
      observer.disconnect();
      root.style.setProperty("--consent-h", "0px");
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-title"
      className="fixed inset-x-0 bottom-0 z-cookie border-t border-line bg-paper"
    >
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-3 px-5 py-4 sm:px-8 sm:py-5 lg:flex-row lg:items-center lg:justify-between lg:gap-10 lg:px-12">
        <div className="flex flex-col gap-1.5">
          <h2 id="cookie-title" className="text-[0.98rem] font-medium text-ink">
            {dict.cookie.title}
          </h2>
          <p className="prose-measure text-[0.82rem] text-ink-2 sm:text-[0.88rem]">{dict.cookie.body}</p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setConsent("rejected")}
            className="min-h-11 border border-line-strong px-5 py-2.5 text-[0.88rem] text-ink transition-colors duration-200 hover:border-ink"
          >
            {dict.cookie.reject}
          </button>
          <button
            type="button"
            onClick={() => setConsent("accepted")}
            className="min-h-11 bg-accent px-5 py-2.5 text-[0.88rem] text-on-accent transition-colors duration-200 hover:bg-accent-strong"
          >
            {dict.cookie.accept}
          </button>
        </div>
      </div>
      <p className="sr-only">
        {consent === "accepted" ? dict.cookie.savedAccepted : dict.cookie.savedRejected}
      </p>
    </div>
  );
}
