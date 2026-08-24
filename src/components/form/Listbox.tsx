"use client";

import { useEffect, useId, useRef, useState } from "react";

export type Option = { value: string; label: string };

type Props = {
  label: string;
  options: Option[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder: string;
  name: string;
  required?: boolean;
  error?: string | null;
  describedBy?: string;
};

/**
 * Dropdown buatan sendiri, bukan select bawaan browser.
 *
 * Mengikuti pola ARIA listbox yang sebenarnya: tombol pemicu berperan sebagai
 * combobox, fokus tidak pernah berpindah keluar dari tombol, dan opsi aktif
 * ditunjuk lewat aria-activedescendant. Panah atas dan bawah, Home, End,
 * ketik-untuk-mencari, Enter, spasi, dan Escape semuanya jalan, dan fokus
 * selalu kembali ke tombol pemicu setelah daftar ditutup.
 */
export function Listbox({
  label,
  options,
  value,
  onChange,
  placeholder,
  name,
  required = false,
  error = null,
  describedBy,
}: Props) {
  const id = useId();
  const listId = `${id}-list`;
  const labelId = `${id}-label`;
  const errorId = `${id}-error`;

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.max(0, options.findIndex((option) => option.value === value)),
  );
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const typeahead = useRef({ buffer: "", at: 0 });

  const selected = options.find((option) => option.value === value) ?? null;

  useEffect(() => {
    if (!open) return;
    const node = listRef.current?.children[activeIndex] as HTMLElement | undefined;
    node?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (buttonRef.current?.contains(target) || listRef.current?.contains(target)) return;
      setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  function commit(index: number) {
    const option = options[index];
    if (!option) return;
    onChange(option.value);
    setOpen(false);
    buttonRef.current?.focus();
  }

  function move(delta: number) {
    setActiveIndex((current) => {
      const next = current + delta;
      if (next < 0) return 0;
      if (next > options.length - 1) return options.length - 1;
      return next;
    });
  }

  function searchByLetter(letter: string) {
    const now = Date.now();
    const buffer = now - typeahead.current.at < 600 ? typeahead.current.buffer + letter : letter;
    typeahead.current = { buffer, at: now };
    const found = options.findIndex((option) =>
      option.label.toLowerCase().startsWith(buffer.toLowerCase()),
    );
    if (found >= 0) {
      setActiveIndex(found);
      if (!open) commit(found);
    }
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (!open) {
          setOpen(true);
          return;
        }
        move(1);
        return;
      case "ArrowUp":
        event.preventDefault();
        if (!open) {
          setOpen(true);
          return;
        }
        move(-1);
        return;
      case "Home":
        if (!open) return;
        event.preventDefault();
        setActiveIndex(0);
        return;
      case "End":
        if (!open) return;
        event.preventDefault();
        setActiveIndex(options.length - 1);
        return;
      case "Enter":
      case " ":
        event.preventDefault();
        if (open) commit(activeIndex);
        else setOpen(true);
        return;
      case "Escape":
        if (!open) return;
        event.preventDefault();
        setOpen(false);
        buttonRef.current?.focus();
        return;
      case "Tab":
        if (open) setOpen(false);
        return;
      default:
        if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
          event.preventDefault();
          searchByLetter(event.key);
        }
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <span id={labelId} className="text-[0.86rem] text-ink">
        {label}
      </span>
      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          aria-labelledby={`${labelId} ${id}-value`}
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={[error ? errorId : null, describedBy].filter(Boolean).join(" ") || undefined}
          aria-activedescendant={open ? `${id}-option-${activeIndex}` : undefined}
          onClick={() => setOpen((current) => !current)}
          onKeyDown={onKeyDown}
          className={`flex min-h-12 w-full items-center justify-between gap-3 border bg-paper px-4 py-3 text-left text-[0.94rem] transition-colors duration-200 ${
            error ? "border-accent-strong" : "border-line-strong hover:border-ink"
          }`}
        >
          <span id={`${id}-value`} className={selected ? "text-ink" : "text-ink-3"}>
            {selected ? selected.label : placeholder}
          </span>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            className={`h-4 w-4 shrink-0 text-ink-2 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          >
            <path d="m5 9 7 7 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-labelledby={labelId}
          hidden={!open}
          className="absolute left-0 right-0 top-[calc(100%+4px)] z-filter max-h-64 overflow-y-auto border border-line-strong bg-paper py-1 shadow-[0_18px_40px_-28px_oklch(0.216_0.013_62/0.55)]"
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isActive = index === activeIndex;
            return (
              <li
                key={option.value}
                id={`${id}-option-${index}`}
                role="option"
                aria-selected={isSelected}
                onPointerDown={(event) => {
                  event.preventDefault();
                  commit(index);
                }}
                onPointerEnter={() => setActiveIndex(index)}
                className={`cursor-pointer px-4 py-2.5 text-[0.92rem] ${
                  isActive ? "bg-paper-3 text-ink" : "text-ink-2"
                } ${isSelected ? "font-medium text-ink" : ""}`}
              >
                {option.label}
              </li>
            );
          })}
        </ul>
      </div>

      <input type="hidden" name={name} value={value ?? ""} />

      {error ? (
        <p id={errorId} className="text-[0.82rem] text-accent-strong">
          {error}
        </p>
      ) : null}
    </div>
  );
}
