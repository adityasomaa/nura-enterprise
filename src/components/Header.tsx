"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { TransitionLink } from "@/components/TransitionLink";
import { useScrollLock, useUi, PREF_LOCALE_COOKIE } from "@/components/providers/UiProvider";
import { CLIENT } from "@/config/client";
import type { Locale } from "@/data/site-content";
import { LOCALE_NAMES, LOCALES } from "@/lib/i18n";
import { route, swapLocale, type RouteKey } from "@/lib/routes";

type NavItem = { key: RouteKey; label: string; href: string };

type Props = {
  locale: Locale;
  items: NavItem[];
  labels: {
    skipToContent: string;
    openMenu: string;
    closeMenu: string;
    language: string;
    contactCta: string;
  };
  contactHref: string;
};

export function Header({ locale, items, labels, contactHref }: Props) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const { consent, writePref } = useUi();

  useScrollLock(menuOpen);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    const first = panelRef.current?.querySelector<HTMLElement>("a, button");
    first?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  function rememberLocale(next: Locale) {
    writePref("locale", next);
    if (consent === "accepted") {
      const expires = new Date(Date.now() + 180 * 864e5).toUTCString();
      document.cookie = `${PREF_LOCALE_COOKIE}=${next}; expires=${expires}; path=/; SameSite=Lax`;
    }
  }

  return (
    <>
      <a
        href="#konten"
        className="sr-only z-skip focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:bg-ink focus:px-4 focus:py-3 focus:text-[0.9rem] focus:text-paper"
      >
        {labels.skipToContent}
      </a>

      <div ref={sentinelRef} aria-hidden="true" className="absolute left-0 top-0 h-px w-px" />

      <header
        data-scrolled={scrolled ? "true" : "false"}
        className="fixed inset-x-0 top-0 z-header transition-colors duration-300 data-[scrolled=true]:border-b data-[scrolled=true]:border-line data-[scrolled=true]:bg-paper/95 data-[scrolled=true]:backdrop-blur-none"
      >
        <div className="mx-auto flex h-(--header-h) w-full max-w-[1440px] items-center justify-between gap-6 px-5 sm:px-8 lg:px-12">
          <TransitionLink
            href={route(locale, "home")}
            className="flex items-baseline gap-2.5 text-ink"
          >
            <span className="text-[1.02rem] font-medium tracking-[0.02em]">{CLIENT.shortName}</span>
            <span className="hidden text-[0.7rem] uppercase tracking-[0.18em] text-ink-3 sm:inline">
              {CLIENT.address.locality}
            </span>
          </TransitionLink>

          <nav aria-label="Utama" className="hidden items-center gap-8 lg:flex">
            {items.map((item) => {
              const active = pathname === item.href;
              return (
                <TransitionLink
                  key={item.key}
                  href={item.href}
                  className={`link-underline text-[0.94rem] ${active ? "text-ink" : "text-ink-2 hover:text-ink"}`}
                >
                  {item.label}
                </TransitionLink>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <div
              role="group"
              aria-label={labels.language}
              className="hidden items-center rounded-full border border-line sm:flex"
            >
              {LOCALES.map((code) => {
                const active = code === locale;
                return (
                  <TransitionLink
                    key={code}
                    href={swapLocale(pathname, code)}
                    hrefLang={code}
                    lang={code}
                    aria-current={active ? "true" : undefined}
                    onNavigate={() => rememberLocale(code)}
                    className={`rounded-full px-3 py-1.5 text-[0.76rem] uppercase tracking-[0.12em] ${
                      active ? "bg-ink text-paper" : "text-ink-2 hover:text-ink"
                    }`}
                  >
                    <span className="sr-only">{LOCALE_NAMES[code]}</span>
                    <span aria-hidden="true">{code}</span>
                  </TransitionLink>
                );
              })}
            </div>

            <TransitionLink
              href={contactHref}
              className="hidden bg-accent px-5 py-2.5 text-[0.86rem] text-on-accent transition-colors duration-200 hover:bg-accent-strong lg:inline-block"
            >
              {labels.contactCta}
            </TransitionLink>

            <button
              ref={toggleRef}
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="menu-mobile"
              className="-mr-2 grid h-11 w-11 shrink-0 place-items-center lg:hidden"
            >
              <span className="sr-only">{menuOpen ? labels.closeMenu : labels.openMenu}</span>
              <span aria-hidden="true" className="relative block h-3.5 w-6">
                <span
                  className="absolute left-0 block h-px w-full bg-ink transition-transform duration-300"
                  style={{
                    transform: menuOpen ? "translateY(6px) rotate(45deg)" : "translateY(0)",
                  }}
                />
                <span
                  className="absolute left-0 top-3 block h-px w-full bg-ink transition-transform duration-300"
                  style={{
                    transform: menuOpen ? "translateY(-6px) rotate(-45deg)" : "translateY(0)",
                  }}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      <div
        id="menu-mobile"
        ref={panelRef}
        hidden={!menuOpen}
        className="fixed inset-0 z-menu flex flex-col bg-paper lg:hidden"
      >
        <div className="flex h-(--header-h) items-center justify-between px-5 sm:px-8">
          <span className="text-[1.02rem] font-medium">{CLIENT.shortName}</span>
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              toggleRef.current?.focus();
            }}
            className="-mr-2 grid h-11 w-11 place-items-center"
          >
            <span className="sr-only">{labels.closeMenu}</span>
            <span aria-hidden="true" className="relative block h-5 w-5">
              <span className="absolute left-0 top-1/2 block h-px w-full rotate-45 bg-ink" />
              <span className="absolute left-0 top-1/2 block h-px w-full -rotate-45 bg-ink" />
            </span>
          </button>
        </div>

        <nav aria-label="Utama" className="flex flex-col gap-1 px-5 pt-6 sm:px-8">
          {items.map((item) => (
            <TransitionLink
              key={item.key}
              href={item.href}
              onNavigate={() => setMenuOpen(false)}
              className="border-b border-line py-4 text-[1.6rem] tracking-[-0.01em] text-ink"
            >
              {item.label}
            </TransitionLink>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-5 px-5 pb-10 pt-8 sm:px-8">
          <div role="group" aria-label={labels.language} className="flex items-center gap-2">
            {LOCALES.map((code) => {
              const active = code === locale;
              return (
                <TransitionLink
                  key={code}
                  href={swapLocale(pathname, code)}
                  hrefLang={code}
                  lang={code}
                  aria-current={active ? "true" : undefined}
                  onNavigate={() => {
                    rememberLocale(code);
                    setMenuOpen(false);
                  }}
                  className={`border px-4 py-2.5 text-[0.84rem] ${
                    active ? "border-ink bg-ink text-paper" : "border-line text-ink-2"
                  }`}
                >
                  {LOCALE_NAMES[code]}
                </TransitionLink>
              );
            })}
          </div>
          <TransitionLink
            href={contactHref}
            onNavigate={() => setMenuOpen(false)}
            className="bg-accent px-5 py-3.5 text-center text-[0.94rem] text-on-accent"
          >
            {labels.contactCta}
          </TransitionLink>
        </div>
      </div>
    </>
  );
}
