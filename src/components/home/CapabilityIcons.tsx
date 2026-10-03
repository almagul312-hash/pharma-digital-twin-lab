import type { ReactNode } from "react";

const stroke = {
  navy: "#0b3a6a",
  sky: "#3aa0c8",
  teal: "#0e7c74",
} as const;

function IconCanvas({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 200 120"
      className="h-24 w-40"
      fill="none"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function ProcessIcon() {
  return (
    <IconCanvas>
      <rect x="14" y="34" width="40" height="52" rx="10" fill="#d7eef8" stroke={stroke.navy} strokeWidth="3" />
      <path d="M22 34c0-10 6-16 12-16s12 6 12 16" stroke={stroke.navy} strokeWidth="3" />
      <path d="M34 86v10" stroke={stroke.teal} strokeWidth="3" strokeLinecap="round" />
      <path d="M58 60h18" stroke={stroke.teal} strokeWidth="3" strokeLinecap="round" />
      <path d="M70 54l8 6-8 6" stroke={stroke.teal} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="80" y="30" width="40" height="58" rx="10" fill="#e7f6f4" stroke={stroke.navy} strokeWidth="3" />
      <path d="M92 48h16M100 40v28" stroke={stroke.sky} strokeWidth="3" strokeLinecap="round" />
      <path d="M90 78h20" stroke={stroke.teal} strokeWidth="3" strokeLinecap="round" />
      <path d="M124 58h18" stroke={stroke.teal} strokeWidth="3" strokeLinecap="round" />
      <path d="M136 52l8 6-8 6" stroke={stroke.teal} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="148" y="36" width="38" height="48" rx="8" fill="#d7eef8" stroke={stroke.navy} strokeWidth="3" />
      <path d="M160 36v48M174 36v48" stroke={stroke.sky} strokeWidth="3" />
      <path d="M154 84h26" stroke={stroke.teal} strokeWidth="3" strokeLinecap="round" />
    </IconCanvas>
  );
}

export function ParametersIcon() {
  return (
    <IconCanvas>
      <rect x="18" y="16" width="164" height="88" rx="14" fill="#f4fbfe" stroke={stroke.navy} strokeWidth="3" />
      <path d="M36 42h78" stroke={stroke.sky} strokeWidth="4" strokeLinecap="round" />
      <circle cx="86" cy="42" r="7" fill={stroke.teal} stroke={stroke.navy} strokeWidth="2" />
      <path d="M36 64h78" stroke={stroke.sky} strokeWidth="4" strokeLinecap="round" />
      <circle cx="58" cy="64" r="7" fill="#7ec8e3" stroke={stroke.navy} strokeWidth="2" />
      <path d="M36 86h78" stroke={stroke.sky} strokeWidth="4" strokeLinecap="round" />
      <circle cx="98" cy="86" r="7" fill={stroke.teal} stroke={stroke.navy} strokeWidth="2" />
      <path d="M140 28v64" stroke={stroke.navy} strokeWidth="3" strokeLinecap="round" />
      <rect x="134" y="48" width="12" height="22" rx="6" fill="#d7eef8" stroke={stroke.teal} strokeWidth="3" />
      <circle cx="140" cy="44" r="5" fill={stroke.teal} />
      <path d="M158 34a22 22 0 0 1 0 36" stroke={stroke.sky} strokeWidth="3" strokeLinecap="round" />
      <path d="M166 42v20" stroke={stroke.navy} strokeWidth="3" strokeLinecap="round" />
    </IconCanvas>
  );
}

export function ResultsIcon() {
  return (
    <IconCanvas>
      <path d="M28 34h28M42 24v20" stroke={stroke.navy} strokeWidth="3" strokeLinecap="round" />
      <path d="M24 48h36" stroke={stroke.teal} strokeWidth="3" strokeLinecap="round" />
      <rect x="30" y="56" width="24" height="14" rx="3" fill="#d7eef8" stroke={stroke.sky} strokeWidth="3" />
      <rect x="78" y="24" width="46" height="52" rx="6" fill="#f4fbfe" stroke={stroke.navy} strokeWidth="3" />
      <path d="M86 38h30M86 50h30M86 62h30" stroke={stroke.sky} strokeWidth="3" strokeLinecap="round" />
      <path d="M138 92V28M138 92h48" stroke={stroke.navy} strokeWidth="3" strokeLinecap="round" />
      <path d="M146 78l12-14 10 8 16-28" stroke={stroke.teal} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="184" cy="44" r="4" fill={stroke.teal} />
    </IconCanvas>
  );
}

export function ExperimentIcon() {
  return (
    <IconCanvas>
      <rect x="16" y="22" width="34" height="46" rx="8" fill="#d7eef8" stroke={stroke.navy} strokeWidth="3" />
      <path d="M26 22c0-8 5-12 7-12s7 4 7 12" stroke={stroke.navy} strokeWidth="3" />
      <rect x="62" y="22" width="34" height="46" rx="8" fill="#e7f6f4" stroke={stroke.teal} strokeWidth="3" />
      <path d="M72 22c0-8 5-12 7-12s7 4 7 12" stroke={stroke.teal} strokeWidth="3" />
      <path d="M22 84h160M22 84V46" stroke={stroke.navy} strokeWidth="3" strokeLinecap="round" />
      <path d="M34 78l28-10 24 6 36-24 28-8" stroke={stroke.sky} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M34 70l30-16 22 8 34-18 30 6" stroke={stroke.teal} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </IconCanvas>
  );
}
