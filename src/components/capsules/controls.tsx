"use client";

import { useState, type ReactNode } from "react";

export function Panel({
  title,
  text,
  children,
}: {
  title: string;
  text?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-5">
      <h3 className="text-lg font-semibold text-navy">{title}</h3>
      {text ? <p className="mt-1 text-sm leading-relaxed text-muted">{text}</p> : null}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

export function PrimaryButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-lg bg-teal px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-dark disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border border-navy bg-white px-4 py-2.5 text-sm font-semibold text-navy hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

export function CommitField({
  label,
  value,
  min,
  max,
  step,
  unit,
  onCommit,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onCommit: (value: number) => void;
}) {
  const [draft, setDraft] = useState(String(value));
  const [trackedValue, setTrackedValue] = useState(value);

  if (trackedValue !== value) {
    setTrackedValue(value);
    setDraft(String(value));
  }

  function commit(next: string) {
    const parsed = Number(next);
    if (!Number.isFinite(parsed)) {
      setDraft(String(value));
      return;
    }
    onCommit(parsed);
  }

  const sliderValue = Number.isFinite(Number(draft)) ? Number(draft) : min;

  return (
    <label className="block text-sm font-semibold text-navy">
      {label}
      <span className="mt-2 flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={sliderValue}
          onChange={(event) => setDraft(event.target.value)}
          onPointerUp={(event) => commit(event.currentTarget.value)}
          onBlur={(event) => commit(event.target.value)}
          className="h-2 w-full cursor-pointer accent-[#0e7c74]"
        />
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={(event) => commit(event.target.value)}
          className="w-24 rounded-lg border border-line px-2 py-1.5 text-sm"
        />
        <span className="w-16 shrink-0 text-xs text-muted">{unit}</span>
      </span>
    </label>
  );
}
