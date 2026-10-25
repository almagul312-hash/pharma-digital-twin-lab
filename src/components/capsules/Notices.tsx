"use client";

import { X } from "lucide-react";
import { useLabStore } from "@/store/useLabStore";

const tone = {
  success: "border-teal bg-teal-soft text-navy",
  warning: "border-amber-400 bg-amber-50 text-navy",
  error: "border-red-400 bg-red-50 text-navy",
  info: "border-line bg-white text-navy",
};

export function Notices() {
  const notices = useLabStore((state) => state.notices);
  const dismiss = useLabStore((state) => state.dismissNotice);

  if (notices.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-40 flex w-[min(100%-2rem,20rem)] flex-col gap-2">
      {notices.slice(0, 2).map((item) => (
        <div
          key={item.id}
          role="status"
          className={`pointer-events-auto rounded-xl border px-3 py-3 shadow-lg ${tone[item.kind]}`}
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold">{item.title}</p>
            <button type="button" onClick={() => dismiss(item.id)} className="rounded p-1 hover:bg-white/60">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted">{item.detail}</p>
        </div>
      ))}
    </div>
  );
}
