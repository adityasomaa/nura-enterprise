"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { TransitionLink } from "@/components/TransitionLink";
import type { Locale } from "@/data/site-content";
import { SITE_URL } from "@/config/client";
import { whatsappUrl, withSource } from "@/lib/whatsapp";

type Props = {
  /** Isi pesan sebelum jejak asal ditambahkan. */
  message: string;
  /** Teks tombol. Ikut terkirim sebagai label pelacakan. */
  children: ReactNode;
  locale: Locale;
  className?: string;
  /** Label pelacakan kalau teks tombolnya bukan teks biasa. */
  trackingLabel?: string;
  /** Tujuan cadangan kalau nomor WhatsApp klien belum diisi di config. */
  fallbackHref: string;
};

/**
 * Satu-satunya komponen yang dipakai semua tombol WhatsApp di situs.
 * Setiap tautan otomatis membawa URL halaman tempat tombol ditekan dan label
 * tombolnya, jadi tiap pertanyaan yang masuk bisa dilacak asalnya.
 */
export function WhatsAppLink({
  message,
  children,
  locale,
  className,
  trackingLabel,
  fallbackHref,
}: Props) {
  const pathname = usePathname();
  const label = trackingLabel ?? (typeof children === "string" ? children : "CTA");
  const pageUrl =
    typeof window !== "undefined" ? window.location.href : `${SITE_URL}${pathname}`;
  const href = whatsappUrl(withSource(message, locale, { pageUrl, buttonLabel: label }));

  if (!href) {
    // Nomor belum diisi di src/config/client.ts. Arahkan ke form konsultasi
    // supaya tombol tetap berguna dan tidak ada tautan rusak.
    return (
      <TransitionLink href={fallbackHref} className={className} data-wa-fallback="true">
        {children}
      </TransitionLink>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      data-wa-label={label}
    >
      {children}
    </a>
  );
}
