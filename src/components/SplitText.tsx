"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  text: string;
  className?: string;
  /** Jeda sebelum huruf pertama bergerak. */
  delay?: number;
  /** Jeda antar huruf. */
  stagger?: number;
  as?: "h1" | "h2" | "p" | "span";
};

/**
 * Teks yang muncul huruf per huruf.
 *
 * Pembaca layar hanya membaca satu label utuh di elemen induk; tiap huruf
 * disembunyikan dengan aria-hidden supaya tidak dieja satu per satu.
 * Pemenggalan baris tetap terjadi antar kata, tidak di tengah kata, jadi batas
 * jumlah baris per viewport tidak berubah karena animasi ini.
 */
export function SplitText({
  text,
  className = "",
  delay = 0,
  stagger = 26,
  as: Tag = "span",
}: Props) {
  const [active, setActive] = useState(false);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const id = setTimeout(() => setActive(true), 30);
    return () => clearTimeout(id);
  }, []);

  const words = text.split(" ");
  let index = 0;

  return (
    <Tag className={className} aria-label={text}>
      {words.map((word, wordIndex) => {
        const letters = Array.from(word);
        return (
          <span key={`${word}-${wordIndex}`} aria-hidden="true" className="inline-block whitespace-nowrap">
            {letters.map((letter, letterIndex) => {
              const own = index;
              index += 1;
              return (
                <span
                  key={`${letter}-${letterIndex}`}
                  className="inline-block will-change-transform"
                  style={{
                    opacity: active ? 1 : 0,
                    transform: active ? "translate3d(0,0,0)" : "translate3d(0,0.42em,0)",
                    transition: `opacity 620ms var(--ease-out-quint) ${delay + own * stagger}ms, transform 720ms var(--ease-out-quint) ${delay + own * stagger}ms`,
                  }}
                >
                  {letter}
                </span>
              );
            })}
            {wordIndex < words.length - 1 ? <span className="inline-block">&nbsp;</span> : null}
          </span>
        );
      })}
    </Tag>
  );
}
