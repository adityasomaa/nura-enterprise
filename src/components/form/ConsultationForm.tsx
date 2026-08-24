"use client";

import { useActionState, useEffect, useMemo, useState } from "react";

import { DateField } from "@/components/form/DateField";
import { Listbox, type Option } from "@/components/form/Listbox";
import { submitConsultation, type ConsultationResult } from "@/app/actions/consultation";
import {
  EVENT_TYPES,
  STYLES,
  VENUE_CATEGORIES,
  type Locale,
} from "@/data/site-content";
import { fill, type Dictionary } from "@/lib/i18n";

type Props = {
  locale: Locale;
  dict: Dictionary;
  /** Kode album asal, kalau form dibuka dari sebuah album galeri. */
  album?: string | null;
  /** Gaya dekorasi yang terisi otomatis dari album asal. */
  presetStyle?: string | null;
};

const MS_DAY = 86400000;

export function ConsultationForm({ locale, dict, album = null, presetStyle = null }: Props) {
  const [state, formAction, pending] = useActionState<ConsultationResult | null, FormData>(
    submitConsultation,
    null,
  );
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  const [eventDate, setEventDate] = useState<string | null>(null);
  const [undecided, setUndecided] = useState(false);
  const [eventType, setEventType] = useState<string | null>(null);
  const [venue, setVenue] = useState<string | null>(null);
  const [style, setStyle] = useState<string | null>(presetStyle);
  const [pageUrl, setPageUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setPageUrl(window.location.href);
  }, []);

  useEffect(() => {
    if (state?.ok && state.waUrl) {
      window.open(state.waUrl, "_blank", "noopener,noreferrer");
    }
  }, [state]);

  const errors = useMemo(
    () => ({ ...(state && !state.ok ? state.errors : {}), ...clientErrors }),
    [state, clientErrors],
  );

  const eventOptions: Option[] = EVENT_TYPES.map((item) => ({
    value: item.id,
    label: item.label[locale],
  }));
  const venueOptions: Option[] = VENUE_CATEGORIES.map((item) => ({
    value: item.id,
    label: item.label[locale],
  }));
  const styleOptions: Option[] = [
    ...STYLES.map((item) => ({ value: item.id, label: item.label[locale] })),
    { value: "belum-tahu", label: dict.contact.form.styleUndecided },
  ];

  /** Pemeriksaan cepat di browser. Server tetap memeriksa ulang semuanya. */
  function validateClient(formData: FormData): Record<string, string> {
    const t = dict.contact.errors;
    const found: Record<string, string> = {};
    const name = String(formData.get("name") ?? "").trim();
    if (name.length < 2) found.name = t.name;

    const whatsapp = String(formData.get("whatsapp") ?? "").replace(/[^0-9]/g, "");
    if (whatsapp.length === 0) found.whatsapp = t.whatsapp;
    else if (whatsapp.length < 8 || whatsapp.length > 15) found.whatsapp = t.whatsappFormat;

    if (!undecided) {
      if (!eventDate) found.eventDate = t.eventDate;
      else {
        const [y, m, d] = eventDate.split("-").map(Number);
        const picked = new Date(y, m - 1, d).getTime();
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        if (picked < today - MS_DAY) found.eventDate = t.eventDatePast;
      }
    }

    if (!eventType) found.eventType = t.eventType;
    if (!venue) found.venue = t.venue;
    if (!style) found.style = t.style;

    const guests = String(formData.get("guests") ?? "").trim();
    if (guests === "") found.guests = t.guests;
    else if (!/^\d{1,5}$/.test(guests) || Number(guests) < 1 || Number(guests) > 5000) {
      found.guests = t.guestsRange;
    }
    return found;
  }

  function handle(formData: FormData) {
    const found = validateClient(formData);
    setClientErrors(found);
    if (Object.keys(found).length > 0) return;
    formAction(formData);
  }

  if (state?.ok) {
    return (
      <div className="flex flex-col gap-5 border border-line-strong px-6 py-10 sm:px-10">
        <h3 className="headline-md">
          {state.waUrl ? dict.contact.form.successTitle : dict.contact.form.noWhatsappTitle}
        </h3>
        <p className="prose-measure text-[0.96rem] text-ink-2">
          {state.waUrl ? dict.contact.form.successBody : dict.contact.form.noWhatsappBody}
        </p>
        <pre className="prose-measure overflow-x-auto whitespace-pre-wrap border border-line bg-paper-2 p-4 text-[0.84rem] text-ink-2">
          {state.summary}
        </pre>
        <div className="flex flex-wrap gap-3">
          {state.waUrl ? (
            <a
              href={state.waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-11 bg-accent px-6 py-3 text-[0.94rem] text-on-accent"
            >
              {dict.contact.form.successLink}
            </a>
          ) : null}
          <button
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(state.summary);
                setCopied(true);
                setTimeout(() => setCopied(false), 2400);
              } catch {
                setCopied(false);
              }
            }}
            className="min-h-11 border border-line-strong px-6 py-3 text-[0.94rem] text-ink"
          >
            {copied ? dict.contact.form.copied : dict.contact.form.copySummary}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form action={handle} noValidate className="flex flex-col gap-7">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="album" value={album ?? ""} />
      <input type="hidden" name="pageUrl" value={pageUrl} />
      <input type="hidden" name="buttonLabel" value={dict.contact.form.submit} />

      {/* Perangkap bot. Dipindah keluar layar dengan clip, bukan posisi absolut
          negatif, supaya tidak pernah melebarkan halaman ke samping. */}
      <div className="visually-clipped" aria-hidden="true">
        <label htmlFor="company-field">Company</label>
        <input id="company-field" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {album ? (
        <p className="border border-line bg-paper-2 px-4 py-3 text-[0.88rem] text-ink-2">
          {fill(dict.contact.fromAlbum, { code: album })}
        </p>
      ) : null}

      <div className="grid gap-7 sm:grid-cols-2">
        <Field
          label={dict.contact.form.name}
          name="name"
          placeholder={dict.contact.form.namePlaceholder}
          error={errors.name}
          autoComplete="name"
        />
        <Field
          label={dict.contact.form.whatsapp}
          name="whatsapp"
          type="tel"
          inputMode="tel"
          placeholder={dict.contact.form.whatsappPlaceholder}
          error={errors.whatsapp}
          autoComplete="tel"
        />
      </div>

      <div className="grid gap-7 sm:grid-cols-2">
        <div className="flex flex-col gap-3">
          <DateField
            label={dict.contact.form.eventDate}
            name="eventDate"
            locale={locale}
            value={undecided ? null : eventDate}
            onChange={setEventDate}
            placeholder={dict.contact.form.eventDatePlaceholder}
            disabled={undecided}
            error={errors.eventDate ?? null}
            labels={{
              openCalendar: dict.contact.form.openCalendar,
              prevMonth: dict.contact.form.calendarPrevMonth,
              nextMonth: dict.contact.form.calendarNextMonth,
              clear: dict.contact.form.calendarClear,
              close: dict.common.close,
            }}
          />
          <label className="flex items-center gap-3 text-[0.88rem] text-ink-2">
            <input
              type="checkbox"
              name="dateUndecided"
              checked={undecided}
              onChange={(event) => setUndecided(event.target.checked)}
              className="h-5 w-5 shrink-0 accent-[var(--color-accent)]"
            />
            {dict.contact.form.eventDateUndecided}
          </label>
        </div>

        <Listbox
          label={dict.contact.form.eventType}
          name="eventType"
          options={eventOptions}
          value={eventType}
          onChange={setEventType}
          placeholder={dict.contact.form.selectPlaceholder}
          required
          error={errors.eventType ?? null}
        />
      </div>

      <div className="grid gap-7 sm:grid-cols-2">
        <Listbox
          label={dict.contact.form.venue}
          name="venue"
          options={venueOptions}
          value={venue}
          onChange={setVenue}
          placeholder={dict.contact.form.selectPlaceholder}
          required
          error={errors.venue ?? null}
        />
        <Field
          label={dict.contact.form.venueDetail}
          name="venueDetail"
          placeholder={dict.contact.form.venueDetailPlaceholder}
          optionalLabel={dict.common.optional}
        />
      </div>

      <div className="grid gap-7 sm:grid-cols-2">
        <Field
          label={dict.contact.form.guests}
          name="guests"
          type="number"
          inputMode="numeric"
          min={1}
          max={5000}
          placeholder={dict.contact.form.guestsPlaceholder}
          error={errors.guests}
        />
        <Listbox
          label={dict.contact.form.style}
          name="style"
          options={styleOptions}
          value={style}
          onChange={setStyle}
          placeholder={dict.contact.form.selectPlaceholder}
          required
          error={errors.style ?? null}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="notes" className="text-[0.86rem] text-ink">
          {dict.contact.form.notes}{" "}
          <span className="text-ink-3">({dict.common.optional})</span>
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          placeholder={dict.contact.form.notesPlaceholder}
          className="w-full resize-y border border-line-strong bg-paper px-4 py-3 text-[0.94rem] text-ink transition-colors duration-200 placeholder:text-ink-3 hover:border-ink"
        />
      </div>

      {errors.form ? (
        <p role="alert" className="text-[0.88rem] text-accent-strong">
          {errors.form}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="min-h-12 bg-accent px-7 py-3.5 text-[0.96rem] text-on-accent transition-colors duration-200 hover:bg-accent-strong disabled:opacity-60"
        >
          {pending ? dict.contact.form.submitting : dict.contact.form.submit}
        </button>
      </div>
    </form>
  );
}

type FieldProps = {
  label: string;
  name: string;
  placeholder?: string;
  type?: string;
  inputMode?: "text" | "tel" | "numeric";
  autoComplete?: string;
  min?: number;
  max?: number;
  error?: string;
  optionalLabel?: string;
};

function Field({
  label,
  name,
  placeholder,
  type = "text",
  inputMode,
  autoComplete,
  min,
  max,
  error,
  optionalLabel,
}: FieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-[0.86rem] text-ink">
        {label} {optionalLabel ? <span className="text-ink-3">({optionalLabel})</span> : null}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        min={min}
        max={max}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
        className={`min-h-12 w-full border bg-paper px-4 py-3 text-[0.94rem] text-ink transition-colors duration-200 placeholder:text-ink-3 ${
          error ? "border-accent-strong" : "border-line-strong hover:border-ink"
        }`}
      />
      {error ? (
        <p id={`${name}-error`} className="text-[0.82rem] text-accent-strong">
          {error}
        </p>
      ) : null}
    </div>
  );
}
