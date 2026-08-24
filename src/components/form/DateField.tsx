"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { useScrollLock } from "@/components/providers/UiProvider";
import type { Locale } from "@/data/site-content";

type Props = {
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder: string;
  name: string;
  locale: Locale;
  disabled?: boolean;
  error?: string | null;
  labels: {
    openCalendar: string;
    prevMonth: string;
    nextMonth: string;
    clear: string;
    close: string;
  };
};

const MS_DAY = 86400000;

function toKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function fromKey(key: string | null): Date | null {
  if (!key) return null;
  const [y, m, d] = key.split("-").map(Number);
  if (!y || !m || !d) return null;
  const date = new Date(y, m - 1, d);
  return Number.isNaN(date.getTime()) ? null : date;
}

function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/**
 * Pemilih tanggal buatan sendiri, bukan input date bawaan.
 *
 * Kalendernya dirender lewat portal ke <body> karena kalender di dalam form
 * sering terpotong di HP saat salah satu induknya memotong overflow.
 * Tanggal yang sudah lewat tidak bisa dipilih di sini, dan ditolak lagi di
 * server saat form dikirim.
 */
export function DateField({
  label,
  value,
  onChange,
  placeholder,
  name,
  locale,
  disabled = false,
  error = null,
  labels,
}: Props) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [cursor, setCursor] = useState<Date>(() => fromKey(value) ?? startOfToday());
  const [position, setPosition] = useState<{ top: number; left: number; width: number } | null>(
    null,
  );

  const fieldRef = useRef<HTMLButtonElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);

  useScrollLock(open);
  useEffect(() => setMounted(true), []);

  const today = startOfToday();
  const selected = fromKey(value);

  const formatter = new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const monthFormatter = new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-GB", {
    month: "long",
    year: "numeric",
  });
  const weekdayFormatter = new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-GB", {
    weekday: "short",
  });

  useLayoutEffect(() => {
    if (!open) return;
    function place() {
      const rect = fieldRef.current?.getBoundingClientRect();
      if (!rect) return;
      const width = Math.min(340, Math.max(288, rect.width));
      const margin = 12;
      const estimatedHeight = 392;
      const spaceBelow = window.innerHeight - rect.bottom;
      const top =
        spaceBelow > estimatedHeight + margin
          ? rect.bottom + 6
          : Math.max(margin, rect.top - estimatedHeight - 6);
      const left = Math.min(
        Math.max(margin, rect.left),
        Math.max(margin, window.innerWidth - width - margin),
      );
      setPosition({ top, left, width });
    }
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      gridRef.current?.querySelector<HTMLElement>('[data-selected="true"], [data-today="true"]')?.focus();
    }, 20);
    return () => clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (fieldRef.current?.contains(target) || popupRef.current?.contains(target)) return;
      setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  function close(focusField = true) {
    setOpen(false);
    if (focusField) fieldRef.current?.focus();
  }

  function shiftCursor(days: number) {
    setCursor((current) => new Date(current.getTime() + days * MS_DAY));
  }

  function shiftMonth(months: number) {
    setCursor((current) => {
      const next = new Date(current.getFullYear(), current.getMonth() + months, 1);
      const lastDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
      next.setDate(Math.min(current.getDate(), lastDay));
      return next;
    });
  }

  function onGridKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    switch (event.key) {
      case "ArrowLeft":
        event.preventDefault();
        shiftCursor(-1);
        break;
      case "ArrowRight":
        event.preventDefault();
        shiftCursor(1);
        break;
      case "ArrowUp":
        event.preventDefault();
        shiftCursor(-7);
        break;
      case "ArrowDown":
        event.preventDefault();
        shiftCursor(7);
        break;
      case "PageUp":
        event.preventDefault();
        shiftMonth(-1);
        break;
      case "PageDown":
        event.preventDefault();
        shiftMonth(1);
        break;
      case "Home":
        event.preventDefault();
        shiftCursor(-cursor.getDay());
        break;
      case "End":
        event.preventDefault();
        shiftCursor(6 - cursor.getDay());
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        if (cursor.getTime() >= today.getTime()) {
          onChange(toKey(cursor));
          close();
        }
        break;
      case "Escape":
        event.preventDefault();
        close();
        break;
      default:
        break;
    }
  }

  useEffect(() => {
    if (!open) return;
    const node = gridRef.current?.querySelector<HTMLElement>('[data-cursor="true"]');
    node?.focus();
  }, [cursor, open]);

  const firstOfMonth = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const leading = firstOfMonth.getDay();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < leading; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), day));
  }

  const weekdayNames = Array.from({ length: 7 }, (_, index) =>
    weekdayFormatter.format(new Date(2024, 0, 7 + index)),
  );

  const popup =
    open && mounted && position
      ? createPortal(
          <>
            <div
              className="fixed inset-0 z-overlay"
              aria-hidden="true"
              onPointerDown={() => close()}
            />
            <div
              ref={popupRef}
              role="dialog"
              aria-modal="true"
              aria-label={label}
              className="fixed z-overlay border border-line-strong bg-paper p-4 shadow-[0_28px_60px_-32px_oklch(0.216_0.013_62/0.6)]"
              style={{ top: position.top, left: position.left, width: position.width }}
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => shiftMonth(-1)}
                  className="grid h-11 w-11 place-items-center border border-line text-ink"
                >
                  <span className="sr-only">{labels.prevMonth}</span>
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                    <path d="M15 4 7 12l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <p aria-live="polite" className="text-[0.94rem] font-medium capitalize text-ink">
                  {monthFormatter.format(cursor)}
                </p>
                <button
                  type="button"
                  onClick={() => shiftMonth(1)}
                  className="grid h-11 w-11 place-items-center border border-line text-ink"
                >
                  <span className="sr-only">{labels.nextMonth}</span>
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                    <path d="m9 4 8 8-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 pb-1">
                {weekdayNames.map((day) => (
                  <span
                    key={day}
                    aria-hidden="true"
                    className="grid h-8 place-items-center text-[0.68rem] uppercase tracking-[0.08em] text-ink-3"
                  >
                    {day.slice(0, 2)}
                  </span>
                ))}
              </div>

              <div
                ref={gridRef}
                role="grid"
                aria-label={label}
                onKeyDown={onGridKeyDown}
                className="grid grid-cols-7 gap-1"
              >
                {cells.map((date, index) => {
                  if (!date) return <span key={`empty-${index}`} aria-hidden="true" />;
                  const key = toKey(date);
                  const past = date.getTime() < today.getTime();
                  const isSelected = selected ? toKey(selected) === key : false;
                  const isCursor = toKey(cursor) === key;
                  const isToday = toKey(today) === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      role="gridcell"
                      tabIndex={isCursor ? 0 : -1}
                      disabled={past}
                      aria-selected={isSelected}
                      aria-current={isToday ? "date" : undefined}
                      data-cursor={isCursor ? "true" : "false"}
                      data-selected={isSelected ? "true" : "false"}
                      data-today={isToday ? "true" : "false"}
                      onClick={() => {
                        onChange(key);
                        close();
                      }}
                      className={`grid h-11 place-items-center text-[0.88rem] transition-colors duration-150 ${
                        isSelected
                          ? "bg-accent text-on-accent"
                          : past
                            ? "text-ink-3/45"
                            : "text-ink hover:bg-paper-3"
                      } ${isToday && !isSelected ? "border border-line-strong" : ""}`}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 flex items-center justify-between gap-3 border-t border-line pt-3">
                <button
                  type="button"
                  onClick={() => {
                    onChange(null);
                    close();
                  }}
                  className="min-h-11 px-2 text-[0.84rem] text-ink-2 hover:text-ink"
                >
                  {labels.clear}
                </button>
                <button
                  type="button"
                  onClick={() => close()}
                  className="min-h-11 px-2 text-[0.84rem] text-ink-2 hover:text-ink"
                >
                  {labels.close}
                </button>
              </div>
            </div>
          </>,
          document.body,
        )
      : null;

  return (
    <div className="flex flex-col gap-2">
      <span id={`${id}-label`} className="text-[0.86rem] text-ink">
        {label}
      </span>
      {/* Seluruh permukaan field bisa diklik untuk membuka kalender. */}
      <button
        ref={fieldRef}
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-labelledby={`${id}-label ${id}-value`}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        onClick={() => setOpen((current) => !current)}
        className={`flex min-h-12 w-full items-center justify-between gap-3 border bg-paper px-4 py-3 text-left text-[0.94rem] transition-colors duration-200 disabled:cursor-not-allowed disabled:bg-paper-2 disabled:text-ink-3 ${
          error ? "border-accent-strong" : "border-line-strong hover:border-ink"
        }`}
      >
        <span id={`${id}-value`} className={selected ? "text-ink" : "text-ink-3"}>
          {selected ? formatter.format(selected) : placeholder}
        </span>
        <span className="sr-only">{labels.openCalendar}</span>
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0 text-ink-2">
          <path
            d="M7 3v3m10-3v3M4 9h16M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <input type="hidden" name={name} value={value ?? ""} />

      {error ? (
        <p id={`${id}-error`} className="text-[0.82rem] text-accent-strong">
          {error}
        </p>
      ) : null}

      {popup}
    </div>
  );
}
