"use client";

import { usePathname, useRouter } from "next/navigation";
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

import { CLIENT } from "@/config/client";

type Variant = "intro" | "page";
type Phase = "closed" | "closing" | "opening" | "idle";

type TransitionContextValue = {
  navigate: (href: string) => void;
  busy: boolean;
};

const TransitionContext = createContext<TransitionContextValue | null>(null);

/* Semua penantian memakai setTimeout, bukan requestAnimationFrame, supaya
   urutan tetap jalan sampai selesai walau tab dipindah ke belakang.
   requestAnimationFrame berhenti di tab background dan tirai akan tersangkut
   selamanya kalau kelanjutannya digantungkan ke sana. */
const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Tunggu satu frame, tapi dengan setTimeout sebagai jaring pengaman. */
function nextFrame(): Promise<void> {
  return new Promise<void>((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      resolve();
    };
    requestAnimationFrame(finish);
    setTimeout(finish, 60);
  });
}

const TIMING = {
  intro: { rule: 760, hold: 140, fade: 240, split: 720 },
  page: { close: 560, open: 620 },
} as const;

function normalize(href: string): string {
  const path = href.split("?")[0].split("#")[0];
  return path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
}

function isHomeHref(href: string): boolean {
  const segments = normalize(href).split("/").filter(Boolean);
  return segments.length <= 1;
}

export function TransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [phase, setPhase] = useState<Phase>("closed");
  const [variant, setVariant] = useState<Variant>("intro");
  const [introStep, setIntroStep] = useState<"idle" | "draw" | "fade">("idle");

  const pathRef = useRef(pathname);
  const busyRef = useRef(false);
  const ownNavigation = useRef(false);

  useEffect(() => {
    pathRef.current = pathname;
  }, [pathname]);

  /* Pembukaan pertama: tirai sudah menutup sejak markup pertama, jadi tidak ada
     kedipan konten sebelum loader tampil. */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      busyRef.current = true;
      await nextFrame();
      if (cancelled) return;
      setIntroStep("draw");
      await wait(TIMING.intro.rule + TIMING.intro.hold);
      if (cancelled) return;
      setIntroStep("fade");
      await wait(TIMING.intro.fade);
      if (cancelled) return;
      setPhase("opening");
      await wait(TIMING.intro.split);
      if (cancelled) return;
      setPhase("idle");
      setIntroStep("idle");
      busyRef.current = false;
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo(0, 0);
    // Lenis menyimpan posisi targetnya sendiri, jadi ikut diberi tahu.
    window.dispatchEvent(new Event("nura:scrolltop"));
  }, []);

  const navigate = useCallback(
    (href: string) => {
      if (busyRef.current) return;
      const target = normalize(href);
      const sameRoute = target === normalize(pathRef.current);
      const sameUrl = href === pathRef.current;
      if (sameUrl) return;

      busyRef.current = true;
      ownNavigation.current = true;
      const nextVariant: Variant = isHomeHref(target) ? "intro" : "page";
      setVariant(nextVariant);

      (async () => {
        // 1. Halaman menutup.
        setPhase("closing");
        await wait(nextVariant === "intro" ? TIMING.page.close : TIMING.page.close);
        setPhase("closed");

        // 2. Konten berganti selagi tirai masih menutup.
        router.push(href);
        const deadline = Date.now() + 2400;
        while (normalize(pathRef.current) !== target && Date.now() < deadline) {
          await wait(40);
        }
        // Beri satu tarikan napas supaya konten baru sempat dipasang.
        await wait(sameRoute ? 40 : 120);

        // 3. Balik ke atas selagi masih tertutup.
        scrollToTop();
        await nextFrame();

        // 4. Halaman membuka.
        if (nextVariant === "intro") {
          setIntroStep("draw");
          await wait(TIMING.intro.rule);
          setIntroStep("fade");
          await wait(TIMING.intro.fade);
          setPhase("opening");
          await wait(TIMING.intro.split);
          setIntroStep("idle");
        } else {
          setPhase("opening");
          await wait(TIMING.page.open);
        }

        setPhase("idle");
        ownNavigation.current = false;
        busyRef.current = false;
      })();
    },
    [router, scrollToTop],
  );

  /* Tombol back dan forward browser: kontennya sudah berganti duluan, jadi
     tirai dipasang sekejap tanpa animasi lalu dibuka sebagai penutup gerakan. */
  const previousPath = useRef(pathname);
  useEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;
    if (ownNavigation.current) return;

    let cancelled = false;
    (async () => {
      busyRef.current = true;
      setVariant("page");
      setPhase("closed");
      await nextFrame();
      if (cancelled) return;
      window.scrollTo(0, 0);
      window.dispatchEvent(new Event("nura:scrolltop"));
      await nextFrame();
      if (cancelled) return;
      setPhase("opening");
      await wait(TIMING.page.open);
      if (cancelled) return;
      setPhase("idle");
      busyRef.current = false;
    })();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  const value = useMemo<TransitionContextValue>(
    () => ({ navigate, busy: phase !== "idle" }),
    [navigate, phase],
  );

  const covered = phase === "closing" || phase === "closed";
  const animating = phase === "closing" || phase === "opening";

  return (
    <TransitionContext.Provider value={value}>
      {children}
      <div
        aria-hidden="true"
        data-phase={phase}
        className="pointer-events-none fixed inset-0 z-curtain"
        style={{ visibility: phase === "idle" ? "hidden" : "visible" }}
      >
        <div
          className="absolute inset-x-0 top-0 h-[50svh] bg-ink"
          style={{
            transform: covered ? "translate3d(0,0,0)" : "translate3d(0,-100%,0)",
            transition: animating
              ? `transform ${phase === "closing" ? TIMING.page.close : variant === "intro" ? TIMING.intro.split : TIMING.page.open}ms var(--ease-out-quint)`
              : "none",
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-[50svh] bg-ink"
          style={{
            transform: covered ? "translate3d(0,0,0)" : "translate3d(0,100%,0)",
            transition: animating
              ? `transform ${phase === "closing" ? TIMING.page.close : variant === "intro" ? TIMING.intro.split : TIMING.page.open}ms var(--ease-out-quint)`
              : "none",
          }}
        />

        {variant === "intro" ? (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-6"
            style={{
              opacity: introStep === "draw" ? 1 : 0,
              transition: `opacity ${TIMING.intro.fade}ms linear`,
            }}
          >
            <p className="text-center text-[0.94rem] uppercase tracking-[0.34em] text-paper sm:text-[1.05rem]">
              {CLIENT.shortName}
            </p>
            <div className="h-px w-[min(280px,62vw)] overflow-hidden bg-paper/25">
              <div
                className="h-full bg-accent"
                style={{
                  transform: introStep === "idle" ? "scaleX(0)" : "scaleX(1)",
                  transformOrigin: "left center",
                  transition: `transform ${TIMING.intro.rule}ms var(--ease-out-expo)`,
                }}
              />
            </div>
            <p className="text-center text-[0.66rem] uppercase tracking-[0.22em] text-paper/60">
              {CLIENT.address.locality}
            </p>
          </div>
        ) : null}
      </div>

      {/* Tanpa JavaScript tirai tidak boleh menutupi konten selamanya. */}
      <noscript>
        <style>{`.z-curtain{display:none !important}`}</style>
      </noscript>
    </TransitionContext.Provider>
  );
}

export function useTransition(): TransitionContextValue {
  const context = useContext(TransitionContext);
  if (!context) throw new Error("useTransition harus dipakai di dalam TransitionProvider");
  return context;
}
