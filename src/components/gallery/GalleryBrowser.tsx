"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { AlbumCard } from "@/components/gallery/AlbumCard";
import { WhatsAppLink } from "@/components/WhatsAppLink";
import { useScrollLock, useUi } from "@/components/providers/UiProvider";
import {
  EVENT_TYPES,
  PLACEMENTS,
  STYLES,
  type Album,
  type Locale,
} from "@/data/site-content";
import { fill, type Dictionary } from "@/lib/i18n";
import { route } from "@/lib/routes";

type Facet = "eventType" | "placement" | "style";
type Filters = Record<Facet, string | null>;

const EMPTY: Filters = { eventType: null, placement: null, style: null };
const PAGE_SIZE = 6;

const FACETS: { key: Facet; options: readonly { id: string; label: { id: string; en: string } }[] }[] =
  [
    { key: "eventType", options: EVENT_TYPES },
    { key: "placement", options: PLACEMENTS },
    { key: "style", options: STYLES },
  ];

export function GalleryBrowser({
  albums,
  locale,
  dict,
}: {
  albums: Album[];
  locale: Locale;
  dict: Dictionary;
}) {
  const { readPref, writePref } = useUi();
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [panelOpen, setPanelOpen] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const panelToggleRef = useRef<HTMLButtonElement | null>(null);
  const restored = useRef(false);

  useScrollLock(panelOpen);

  /* Filter terakhir dipulihkan hanya kalau pengunjung mengizinkan penyimpanan
     preferensi lewat banner cookie. */
  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    const stored = readPref<Filters | null>("galleryFilters", null);
    if (stored) setFilters({ ...EMPTY, ...stored });
  }, [readPref]);

  const filtered = useMemo(
    () =>
      albums.filter(
        (album) =>
          (!filters.eventType || album.eventType === filters.eventType) &&
          (!filters.placement || album.placement === filters.placement) &&
          (!filters.style || album.style === filters.style),
      ),
    [albums, filters],
  );

  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [filters]);

  /* Galeri dimuat bertahap, bukan seluruh album sekaligus, supaya halaman
     tetap ringan di jaringan HP. */
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible((count) => Math.min(count + PAGE_SIZE, filtered.length));
        }
      },
      { rootMargin: "320px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [filtered.length]);

  useEffect(() => {
    if (!panelOpen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setPanelOpen(false);
        panelToggleRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [panelOpen]);

  function update(facet: Facet, value: string | null) {
    setFilters((current) => {
      const next = { ...current, [facet]: current[facet] === value ? null : value };
      writePref("galleryFilters", next);
      return next;
    });
  }

  function reset() {
    setFilters(EMPTY);
    writePref("galleryFilters", EMPTY);
  }

  const activeCount = Object.values(filters).filter(Boolean).length;
  const shown = filtered.slice(0, visible);

  const chipRows = (
    <div className="flex flex-col gap-6">
      {FACETS.map((facet) => (
        <fieldset key={facet.key} className="flex flex-col gap-3">
          <legend className="eyebrow mb-1">{dict.gallery.filters[facet.key]}</legend>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => update(facet.key, null)}
              aria-pressed={filters[facet.key] === null}
              className={chipClass(filters[facet.key] === null)}
            >
              {dict.gallery.filters.all}
            </button>
            {facet.options.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => update(facet.key, option.id)}
                aria-pressed={filters[facet.key] === option.id}
                className={chipClass(filters[facet.key] === option.id)}
              >
                {option.label[locale]}
              </button>
            ))}
          </div>
        </fieldset>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-wrap items-center justify-between gap-4 border-y border-line py-4">
        <p className="text-[0.86rem] text-ink-2" aria-live="polite">
          {fill(dict.gallery.filters.resultCount, { count: filtered.length })}
        </p>
        <div className="flex items-center gap-3">
          {activeCount > 0 ? (
            <button
              type="button"
              onClick={reset}
              className="link-underline text-[0.86rem] text-ink-2 hover:text-ink"
            >
              {dict.gallery.filters.reset}
            </button>
          ) : null}
          <button
            ref={panelToggleRef}
            type="button"
            onClick={() => setPanelOpen(true)}
            aria-expanded={panelOpen}
            aria-controls="panel-filter"
            className="min-h-11 border border-line-strong px-4 py-2 text-[0.86rem] text-ink lg:hidden"
          >
            {dict.gallery.filters.open}
            {activeCount > 0 ? ` (${activeCount})` : ""}
          </button>
        </div>
      </div>

      <div className="hidden lg:block">{chipRows}</div>

      {/* Panel filter untuk layar kecil. */}
      <div
        id="panel-filter"
        hidden={!panelOpen}
        role="dialog"
        aria-modal="true"
        aria-label={dict.gallery.filters.title}
        className="fixed inset-0 z-filter flex flex-col bg-paper lg:hidden"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-[1.02rem] font-medium">{dict.gallery.filters.title}</h2>
          <button
            type="button"
            onClick={() => {
              setPanelOpen(false);
              panelToggleRef.current?.focus();
            }}
            className="grid h-11 w-11 place-items-center"
          >
            <span className="sr-only">{dict.common.close}</span>
            <span aria-hidden="true" className="relative block h-5 w-5">
              <span className="absolute left-0 top-1/2 block h-px w-full rotate-45 bg-ink" />
              <span className="absolute left-0 top-1/2 block h-px w-full -rotate-45 bg-ink" />
            </span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-6">{chipRows}</div>
        <div className="flex items-center gap-3 border-t border-line px-5 py-4">
          <button
            type="button"
            onClick={reset}
            className="min-h-11 flex-1 border border-line-strong px-4 py-3 text-[0.9rem] text-ink"
          >
            {dict.gallery.filters.reset}
          </button>
          <button
            type="button"
            onClick={() => {
              setPanelOpen(false);
              panelToggleRef.current?.focus();
            }}
            className="min-h-11 flex-1 bg-accent px-4 py-3 text-[0.9rem] text-on-accent"
          >
            {fill(dict.gallery.filters.resultCount, { count: filtered.length })}
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-start gap-4 border border-line px-6 py-12 sm:px-10">
          <h3 className="headline-md">{dict.gallery.empty.title}</h3>
          <p className="prose-measure text-[0.96rem] text-ink-2">{dict.gallery.empty.body}</p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={reset}
              className="min-h-11 border border-line-strong px-5 py-3 text-[0.9rem] text-ink"
            >
              {dict.gallery.filters.reset}
            </button>
            <WhatsAppLink
              locale={locale}
              fallbackHref={route(locale, "contact")}
              message={`${dict.contact.whatsapp.intro}`}
              className="min-h-11 bg-accent px-5 py-3 text-[0.9rem] text-on-accent"
            >
              {dict.gallery.empty.cta}
            </WhatsAppLink>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-10 lg:gap-y-20">
            {shown.map((album, index) => (
              <AlbumCard
                key={album.code}
                album={album}
                locale={locale}
                dict={dict}
                priority={index < 3}
              />
            ))}
          </div>

          <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />

          {visible < filtered.length ? (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setVisible((count) => Math.min(count + PAGE_SIZE, filtered.length))}
                className="min-h-11 border border-line-strong px-6 py-3 text-[0.9rem] text-ink transition-colors duration-200 hover:border-ink"
              >
                {dict.gallery.loadMore}
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

function chipClass(active: boolean) {
  return [
    "min-h-11 border px-4 py-2 text-[0.86rem] transition-colors duration-200",
    active
      ? "border-accent bg-accent text-on-accent"
      : "border-line text-ink-2 hover:border-line-strong hover:text-ink",
  ].join(" ");
}
