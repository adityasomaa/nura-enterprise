"use client";

import { TransitionLink } from "@/components/TransitionLink";
import { albumAlt } from "@/lib/album-alt";
import {
  EVENT_TYPES,
  PLACEMENTS,
  STYLES,
  albumImagePath,
  labelOf,
  type Album,
  type Locale,
} from "@/data/site-content";
import type { Dictionary } from "@/lib/i18n";
import { albumRoute, route } from "@/lib/routes";

type Props = {
  album: Album;
  locale: Locale;
  dict: Dictionary;
  priority?: boolean;
};

export function AlbumCard({ album, locale, dict, priority = false }: Props) {
  const cover = album.photos[0];
  const consultHref = `${route(locale, "contact")}?album=${album.code}&style=${album.style}`;

  return (
    <article className="group flex flex-col gap-4">
      <TransitionLink
        href={albumRoute(locale, album.slug)}
        className="block overflow-hidden bg-paper-2"
      >
        <img
          src={albumImagePath(album.code, cover.scene)}
          alt={albumAlt(album, cover.scene, locale)}
          width={1600}
          height={1200}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className="aspect-4/3 w-full object-cover transition-transform duration-700 ease-[var(--ease-out-quint)] group-hover:scale-[1.02]"
        />
      </TransitionLink>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.72rem] uppercase tracking-[0.14em] text-ink-3">
          <span>{labelOf(EVENT_TYPES, album.eventType, locale)}</span>
          <span aria-hidden="true">/</span>
          <span>{labelOf(PLACEMENTS, album.placement, locale)}</span>
          <span aria-hidden="true">/</span>
          <span>{labelOf(STYLES, album.style, locale)}</span>
        </div>
        <h3 className="text-[1.08rem] font-medium text-ink">
          <TransitionLink href={albumRoute(locale, album.slug)} className="link-underline">
            {album.title[locale]}
          </TransitionLink>
        </h3>
        <p className="text-[0.9rem] text-ink-2">{album.summary[locale]}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.8rem] text-ink-3">
          <span>
            {dict.gallery.albumMeta.code} {album.code}
          </span>
          <TransitionLink href={consultHref} className="link-underline text-accent-strong">
            {dict.common.consultAboutAlbum}
          </TransitionLink>
        </div>
      </div>
    </article>
  );
}
