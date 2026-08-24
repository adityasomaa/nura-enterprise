"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { useScrollLock } from "@/components/providers/UiProvider";

export type LightboxPhoto = {
  src: string;
  alt: string;
  caption: string;
};

type Props = {
  photos: LightboxPhoto[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  labels: {
    close: string;
    previous: string;
    next: string;
    counter: string;
  };
  /** Elemen yang membuka lightbox. Fokus dikembalikan ke sini saat ditutup. */
  returnFocusTo?: HTMLElement | null;
};

/**
 * Lightbox galeri.
 *
 * Dirender lewat portal langsung ke <body> supaya tidak pernah terpotong oleh
 * induk yang memotong overflow, dan supaya selalu berada di atas seluruh
 * konten tanpa perlu menaikkan z-index elemen lain.
 */
export function Lightbox({
  photos,
  index,
  onIndexChange,
  onClose,
  labels,
  returnFocusTo,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  useScrollLock(true);

  useEffect(() => setMounted(true), []);

  const goPrev = useCallback(() => {
    onIndexChange((index - 1 + photos.length) % photos.length);
  }, [index, photos.length, onIndexChange]);

  const goNext = useCallback(() => {
    onIndexChange((index + 1) % photos.length);
  }, [index, photos.length, onIndexChange]);

  /* Fokus dipindah ke dalam lightbox saat terbuka, lalu dikembalikan ke
     thumbnail asal saat ditutup. */
  useEffect(() => {
    const previous = returnFocusTo ?? (document.activeElement as HTMLElement | null);
    closeRef.current?.focus();
    return () => {
      previous?.focus?.();
    };
  }, [returnFocusTo]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrev();
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        goNext();
        return;
      }
      if (event.key === "Tab") {
        const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
          "button:not([disabled]), a[href]",
        );
        if (!focusables || focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [goNext, goPrev, onClose]);

  if (!mounted) return null;

  const photo = photos[index];
  const counter = labels.counter
    .replace("{current}", String(index + 1))
    .replace("{total}", String(photos.length));

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={photo.caption}
      className="fixed inset-0 z-overlay flex flex-col bg-ink/97"
    >
      <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <p className="text-[0.8rem] uppercase tracking-[0.16em] text-paper/70">{counter}</p>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="grid h-11 w-11 place-items-center text-paper"
        >
          <span className="sr-only">{labels.close}</span>
          <span aria-hidden="true" className="relative block h-5 w-5">
            <span className="absolute left-0 top-1/2 block h-px w-full rotate-45 bg-paper" />
            <span className="absolute left-0 top-1/2 block h-px w-full -rotate-45 bg-paper" />
          </span>
        </button>
      </div>

      <div className="flex min-h-0 flex-1 items-center gap-2 px-2 sm:gap-4 sm:px-6">
        <button
          type="button"
          onClick={goPrev}
          disabled={photos.length < 2}
          className="grid h-12 w-12 shrink-0 place-items-center border border-paper/25 text-paper transition-colors duration-200 hover:border-paper/70 disabled:opacity-30"
        >
          <span className="sr-only">{labels.previous}</span>
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none">
            <path d="M15 4 7 12l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <figure className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4">
          <img
            key={photo.src}
            src={photo.src}
            alt={photo.alt}
            width={1600}
            height={1200}
            className="max-h-[68svh] w-auto max-w-full object-contain"
          />
          <figcaption className="px-2 text-center text-[0.86rem] text-paper/75">
            {photo.caption}
          </figcaption>
        </figure>

        <button
          type="button"
          onClick={goNext}
          disabled={photos.length < 2}
          className="grid h-12 w-12 shrink-0 place-items-center border border-paper/25 text-paper transition-colors duration-200 hover:border-paper/70 disabled:opacity-30"
        >
          <span className="sr-only">{labels.next}</span>
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none">
            <path d="m9 4 8 8-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div className="flex items-center justify-center gap-2 px-4 py-5">
        {photos.map((item, itemIndex) => (
          <button
            key={item.src}
            type="button"
            onClick={() => onIndexChange(itemIndex)}
            aria-current={itemIndex === index ? "true" : undefined}
            className="h-11 w-11 shrink-0"
          >
            <span className="sr-only">{item.caption}</span>
            <span
              aria-hidden="true"
              className={`mx-auto block h-1 w-8 transition-colors duration-200 ${
                itemIndex === index ? "bg-paper" : "bg-paper/30"
              }`}
            />
          </button>
        ))}
      </div>
    </div>,
    document.body,
  );
}
