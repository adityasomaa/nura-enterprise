import type { ReactNode } from "react";

type Props = {
  /** Bagian 1: judul section. */
  sectionTitle: string;
  /** Bagian 2: headline. */
  headline: string;
  /** Bagian 3: deskripsi singkat. */
  description: string;
  /** Bagian 4: CTA. */
  cta?: ReactNode;
  /** Tingkat heading, supaya urutan heading halaman tetap benar. */
  as?: "h1" | "h2";
  size?: "xl" | "lg";
  align?: "start" | "between";
  className?: string;
  id?: string;
};

/**
 * Kerangka empat bagian yang dipakai semua section:
 * judul section, headline, deskripsi singkat, lalu CTA. Urutannya sama di
 * seluruh situs supaya tiap halaman terbaca dengan ritme yang sama.
 */
export function SectionHeader({
  sectionTitle,
  headline,
  description,
  cta,
  as: Heading = "h2",
  size = "lg",
  align = "between",
  className = "",
  id,
}: Props) {
  return (
    <header
      className={[
        "flex flex-col gap-7",
        align === "between" ? "lg:flex-row lg:items-end lg:justify-between lg:gap-16" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex flex-col gap-4">
        <p className="eyebrow">{sectionTitle}</p>
        <Heading id={id} className={size === "xl" ? "headline-xl" : "headline-lg"}>
          {headline}
        </Heading>
        <p className="prose-measure text-[0.98rem] text-ink-2 sm:text-[1.05rem]">{description}</p>
      </div>
      {cta ? <div className="flex shrink-0 flex-wrap items-center gap-3">{cta}</div> : null}
    </header>
  );
}
