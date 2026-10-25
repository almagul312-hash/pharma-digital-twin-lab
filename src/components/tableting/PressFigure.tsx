"use client";

import type { PressKind } from "@/tableting/types";

export function pressCycle(elapsedMs: number, running: boolean, reduced: boolean) {
  if (!running) {
    return "idle" as const;
  }
  if (reduced) {
    return "compress" as const;
  }
  const turn = (elapsedMs / 900) % 1;
  if (turn < 0.34) {
    return "fill" as const;
  }
  if (turn < 0.67) {
    return "compress" as const;
  }
  return "eject" as const;
}

export function PressFigure({
  phase,
  kind,
  reduced,
  caption,
}: {
  phase: "idle" | "fill" | "compress" | "eject";
  kind: PressKind;
  reduced: boolean;
  caption: string;
}) {
  const upper = phase === "compress" ? 78 : phase === "fill" ? 34 : 42;
  const lower = phase === "eject" ? 118 : phase === "compress" ? 126 : 138;
  const tabletY = phase === "eject" ? 154 : 168;
  const motion = reduced ? "" : "transition-all duration-300";

  return (
    <svg viewBox="0 0 280 210" role="img" aria-label={caption} className="h-auto w-full max-w-sm">
      <rect x="0" y="0" width="280" height="210" rx="12" fill="#f4faf9" />
      <path d="M118 8h44l-8 28h-28z" fill="#d7ebe8" stroke="#0b3a6a" strokeWidth="2" />
      <rect x="122" y="36" width="36" height="16" rx="2" fill="#ffffff" stroke="#0b3a6a" strokeWidth="2" />
      <rect x="92" y="54" width="96" height="112" rx="6" fill="#ffffff" stroke="#0b3a6a" strokeWidth="2" />
      <rect x="126" y="70" width="28" height="78" fill="#e7f4fb" stroke="#0b3a6a" strokeWidth="2" />
      <rect x="130" y={upper} width="20" height="36" rx="2" className={motion} fill="#0e7c74" />
      <rect x="130" y={lower} width="20" height="28" rx="2" className={motion} fill="#0b3a6a" />
      {phase === "fill" ? <rect x="132" y="112" width="16" height="22" fill="#9fd4c8" /> : null}
      {phase !== "idle" ? <rect x="132" y={tabletY} width="16" height="8" rx="4" fill="#ffffff" stroke="#0e7c74" /> : null}
      <path d="M188 150h46" stroke="#0b3a6a" strokeWidth="2" />
      <rect x="214" y="156" width="36" height="22" rx="4" fill="#ffffff" stroke="#0b3a6a" strokeWidth="2" />
      {kind === "rotary" ? <circle cx="46" cy="108" r="28" fill="none" stroke="#0b3a6a" strokeWidth="2" /> : null}
      {kind === "rotary"
        ? [0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
            const rad = (angle * Math.PI) / 180;
            return <circle key={angle} cx={46 + Math.cos(rad) * 18} cy={108 + Math.sin(rad) * 18} r="3" fill="#0e7c74" />;
          })
        : null}
      <text x="16" y="198" fill="#4a5968" fontSize="11">
        {caption}
      </text>
    </svg>
  );
}
