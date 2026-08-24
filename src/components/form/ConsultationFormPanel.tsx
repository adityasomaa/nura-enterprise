"use client";

import { useSearchParams } from "next/navigation";

import { ConsultationForm } from "@/components/form/ConsultationForm";
import { STYLES, type Locale } from "@/data/site-content";
import type { Dictionary } from "@/lib/i18n";

/**
 * Membaca kode album dan gaya dekorasi dari query di sisi klien, supaya
 * halaman kontak tetap bisa dirender statis dan tidak memicu permintaan
 * server tambahan setiap kali tautan konsultasi dari album di-prefetch.
 */
export function ConsultationFormPanel({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const params = useSearchParams();

  const albumRaw = params.get("album");
  const album = albumRaw && /^[A-Za-z0-9-]{1,12}$/.test(albumRaw) ? albumRaw.toUpperCase() : null;

  const styleRaw = params.get("style");
  const presetStyle = styleRaw && STYLES.some((item) => item.id === styleRaw) ? styleRaw : null;

  return <ConsultationForm locale={locale} dict={dict} album={album} presetStyle={presetStyle} />;
}
