"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  as?: ElementType;
  delay?: number;
  className?: string;
};

/**
 * Muncul halus saat masuk viewport.
 *
 * Catatan penting: IntersectionObserver tidak pernah dipasang di elemen yang
 * induknya memotong overflow, karena rasionya akan selalu nol dan animasinya
 * tidak pernah jalan. Sebagai jaring pengaman, kalau dalam 1,2 detik belum ada
 * laporan perpotongan sama sekali, elemennya ditampilkan begitu saja. Lebih
 * baik tampil tanpa animasi daripada tidak pernah tampil.
 */
export function Reveal({ children, as: Tag = "div", delay = 0, className = "" }: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setRevealed(true);
      return;
    }

    let settled = false;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            settled = true;
            setRevealed(true);
            observer.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0 },
    );
    observer.observe(node);

    const guard = setTimeout(() => {
      if (!settled) setRevealed(true);
    }, 1200);

    return () => {
      clearTimeout(guard);
      observer.disconnect();
    };
  }, []);

  return (
    <Tag
      ref={ref}
      className={`reveal ${className}`}
      data-revealed={revealed ? "true" : "false"}
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </Tag>
  );
}
