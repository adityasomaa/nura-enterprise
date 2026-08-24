"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";

import { useTransition } from "@/components/providers/TransitionProvider";

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: ReactNode;
  onNavigate?: () => void;
};

/**
 * Tautan internal yang melewati urutan transisi:
 * halaman menutup, konten berganti, balik ke atas, halaman membuka.
 * Klik dengan modifier atau klik tengah dibiarkan berperilaku normal.
 */
export function TransitionLink({ href, children, onClick, onNavigate, ...rest }: Props) {
  const { navigate } = useTransition();
  const pathname = usePathname();

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
      return;
    }
    event.preventDefault();
    onNavigate?.();
    navigate(href);
  }

  const current = pathname === href.split("?")[0].split("#")[0];

  // Tautan yang membawa query menunjuk halaman yang sama dengan versi tanpa
  // query, jadi prefetch-nya hanya menambah permintaan jaringan tanpa manfaat.
  const prefetch = href.includes("?") ? false : undefined;

  return (
    <Link
      href={href}
      prefetch={prefetch}
      onClick={handleClick}
      aria-current={current ? "page" : undefined}
      {...rest}
    >
      {children}
    </Link>
  );
}
