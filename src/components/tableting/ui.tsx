"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

export function ActionButton({
  children,
  tone = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: "primary" | "secondary" | "quiet" }) {
  const toneClass =
    tone === "primary"
      ? "bg-teal text-white hover:bg-teal-dark"
      : tone === "secondary"
        ? "border border-navy bg-white text-navy hover:bg-surface"
        : "bg-surface text-navy hover:bg-line";
  return (
    <button
      {...props}
      className={`inline-flex min-h-11 scroll-mb-24 items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy ${toneClass} ${props.className ?? ""}`}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="font-semibold text-navy">{label}</span>
      {hint ? <span className="mt-1 block text-xs leading-relaxed text-muted">{hint}</span> : null}
      <span className="mt-2 block">{children}</span>
    </label>
  );
}

export const inputClass =
  "min-h-11 w-full rounded-lg border border-line bg-white px-3 text-sm text-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy";
