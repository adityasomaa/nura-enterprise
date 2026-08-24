"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type Consent = "unknown" | "accepted" | "rejected";

export const CONSENT_COOKIE = "cookie-consent";
export const PREF_LOCALE_COOKIE = "pref-locale";
const PREF_STORAGE_KEY = "nura.prefs";

type UiContextValue = {
  /** Berapa lapisan overlay yang sedang terbuka. Lenis berhenti kalau lebih dari nol. */
  overlayCount: number;
  lockScroll: () => void;
  unlockScroll: () => void;
  consent: Consent;
  setConsent: (value: Exclude<Consent, "unknown">) => void;
  reopenConsent: () => void;
  consentPromptOpen: boolean;
  /** Baca preferensi. Kalau cookie ditolak, nilainya hanya bertahan di memori tab ini. */
  readPref: <T>(key: string, fallback: T) => T;
  writePref: (key: string, value: unknown) => void;
};

const UiContext = createContext<UiContextValue | null>(null);

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function clearCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
}

export function UiProvider({ children }: { children: ReactNode }) {
  const [overlayCount, setOverlayCount] = useState(0);
  const [consent, setConsentState] = useState<Consent>("unknown");
  const [consentPromptOpen, setConsentPromptOpen] = useState(false);
  const savedScroll = useRef(0);
  /** Cadangan preferensi saat cookie ditolak: hidup hanya selama tab terbuka. */
  const memoryPrefs = useRef<Record<string, unknown>>({});

  useEffect(() => {
    const stored = readCookie(CONSENT_COOKIE);
    if (stored === "accepted" || stored === "rejected") {
      setConsentState(stored);
    } else {
      setConsentPromptOpen(true);
    }
  }, []);

  const setConsent = useCallback((value: Exclude<Consent, "unknown">) => {
    setConsentState(value);
    setConsentPromptOpen(false);
    writeCookie(CONSENT_COOKIE, value, 180);
    if (value === "rejected") {
      // Menolak bukan cuma menyembunyikan banner: yang sudah tersimpan ikut dibuang.
      try {
        window.localStorage.removeItem(PREF_STORAGE_KEY);
      } catch {
        /* localStorage bisa diblokir; abaikan dengan aman */
      }
      clearCookie(PREF_LOCALE_COOKIE);
    }
  }, []);

  const reopenConsent = useCallback(() => setConsentPromptOpen(true), []);

  const readPref = useCallback(
    <T,>(key: string, fallback: T): T => {
      if (consent === "accepted") {
        try {
          const raw = window.localStorage.getItem(PREF_STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw) as Record<string, unknown>;
            if (key in parsed) return parsed[key] as T;
          }
        } catch {
          /* format rusak atau storage diblokir */
        }
      }
      if (key in memoryPrefs.current) return memoryPrefs.current[key] as T;
      return fallback;
    },
    [consent],
  );

  const writePref = useCallback(
    (key: string, value: unknown) => {
      memoryPrefs.current[key] = value;
      if (consent !== "accepted") return;
      try {
        const raw = window.localStorage.getItem(PREF_STORAGE_KEY);
        const parsed = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
        parsed[key] = value;
        window.localStorage.setItem(PREF_STORAGE_KEY, JSON.stringify(parsed));
      } catch {
        /* storage penuh atau diblokir */
      }
    },
    [consent],
  );

  const lockScroll = useCallback(() => {
    setOverlayCount((count) => {
      if (count === 0) {
        savedScroll.current = window.scrollY;
        const gap = window.innerWidth - document.documentElement.clientWidth;
        if (gap > 0) document.body.style.paddingRight = `${gap}px`;
        document.body.dataset.scrollLocked = "true";
      }
      return count + 1;
    });
  }, []);

  const unlockScroll = useCallback(() => {
    setOverlayCount((count) => {
      const next = Math.max(0, count - 1);
      if (next === 0) {
        delete document.body.dataset.scrollLocked;
        document.body.style.paddingRight = "";
        window.scrollTo(0, savedScroll.current);
      }
      return next;
    });
  }, []);

  const value = useMemo<UiContextValue>(
    () => ({
      overlayCount,
      lockScroll,
      unlockScroll,
      consent,
      setConsent,
      reopenConsent,
      consentPromptOpen,
      readPref,
      writePref,
    }),
    [
      overlayCount,
      lockScroll,
      unlockScroll,
      consent,
      setConsent,
      reopenConsent,
      consentPromptOpen,
      readPref,
      writePref,
    ],
  );

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

export function useUi(): UiContextValue {
  const context = useContext(UiContext);
  if (!context) throw new Error("useUi harus dipakai di dalam UiProvider");
  return context;
}

/** Kunci scroll selama komponen pemanggil menyatakan dirinya terbuka. */
export function useScrollLock(active: boolean) {
  const { lockScroll, unlockScroll } = useUi();
  useEffect(() => {
    if (!active) return;
    lockScroll();
    return () => unlockScroll();
  }, [active, lockScroll, unlockScroll]);
}
