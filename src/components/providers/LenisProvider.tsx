"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";

import { useUi } from "@/components/providers/UiProvider";

/**
 * Lenis hanya dinyalakan di desktop dengan pointer presisi.
 * Di tablet dan HP scroll asli dibiarkan apa adanya, karena scroll buatan di
 * sana justru terasa berat dan berkelahi dengan gestur sistem.
 * Lenis juga dihentikan selama lightbox, panel filter, atau kalender terbuka.
 */
export function LenisProvider() {
  const lenisRef = useRef<Lenis | null>(null);
  const frameRef = useRef<number | null>(null);
  const { overlayCount } = useUi();

  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    function start() {
      if (lenisRef.current || reduced.matches) return;
      const lenis = new Lenis({
        duration: 1.05,
        easing: (t: number) => 1 - Math.pow(1 - t, 4),
        smoothWheel: true,
        syncTouch: false,
        touchMultiplier: 1,
      });
      lenisRef.current = lenis;
      const loop = (time: number) => {
        lenis.raf(time);
        frameRef.current = requestAnimationFrame(loop);
      };
      frameRef.current = requestAnimationFrame(loop);
    }

    function stop() {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
      lenisRef.current?.destroy();
      lenisRef.current = null;
    }

    function sync() {
      if (query.matches && !reduced.matches) start();
      else stop();
    }

    // Transisi halaman melompat ke atas selagi tirai menutup. Lenis menyimpan
    // posisi targetnya sendiri, jadi harus ikut disetel ulang.
    function toTop() {
      lenisRef.current?.scrollTo(0, { immediate: true });
    }

    sync();
    query.addEventListener("change", sync);
    reduced.addEventListener("change", sync);
    window.addEventListener("nura:scrolltop", toTop);
    return () => {
      query.removeEventListener("change", sync);
      reduced.removeEventListener("change", sync);
      window.removeEventListener("nura:scrolltop", toTop);
      stop();
    };
  }, []);

  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    if (overlayCount > 0) lenis.stop();
    else lenis.start();
  }, [overlayCount]);

  return null;
}
