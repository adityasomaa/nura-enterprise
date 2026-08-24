"use client";

import { useRef, useState } from "react";

import { Lightbox, type LightboxPhoto } from "@/components/gallery/Lightbox";
import type { Dictionary } from "@/lib/i18n";

type Props = {
  photos: LightboxPhoto[];
  dict: Dictionary;
  openLabel: string;
};

/** Grid foto satu album. Klik mana pun membuka lightbox pada foto itu. */
export function AlbumGallery({ photos, dict, openLabel }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const triggers = useRef<(HTMLButtonElement | null)[]>([]);

  return (
    <>
      <ul className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:gap-x-8 lg:gap-y-14">
        {photos.map((photo, index) => (
          <li key={photo.src} className="flex flex-col gap-3">
            <button
              ref={(node) => {
                triggers.current[index] = node;
              }}
              type="button"
              onClick={() => setOpenIndex(index)}
              className="group block w-full overflow-hidden bg-paper-2 text-left"
            >
              <span className="sr-only">
                {openLabel}: {photo.caption}
              </span>
              <img
                src={photo.src}
                alt={photo.alt}
                width={1600}
                height={1200}
                loading={index < 2 ? "eager" : "lazy"}
                decoding="async"
                className="aspect-4/3 w-full object-cover transition-transform duration-700 ease-[var(--ease-out-quint)] group-hover:scale-[1.02]"
              />
            </button>
            <p className="text-[0.82rem] uppercase tracking-[0.14em] text-ink-3">
              {photo.caption}
            </p>
          </li>
        ))}
      </ul>

      {openIndex !== null ? (
        <Lightbox
          photos={photos}
          index={openIndex}
          onIndexChange={setOpenIndex}
          onClose={() => setOpenIndex(null)}
          returnFocusTo={triggers.current[openIndex] ?? null}
          labels={{
            close: dict.common.close,
            previous: dict.common.previous,
            next: dict.common.next,
            counter: dict.common.photoCounter,
          }}
        />
      ) : null}
    </>
  );
}
