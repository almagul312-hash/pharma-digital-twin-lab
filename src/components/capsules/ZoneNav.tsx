"use client";

import { ClipboardList, Factory, FlaskConical, Thermometer, Warehouse } from "lucide-react";
import type { LabCopy } from "@/i18n/types";
import { useLabStore } from "@/store/useLabStore";
import type { ZoneId } from "@/types/lab";

const zones: { id: ZoneId; icon: typeof Warehouse }[] = [
  { id: "warehouse", icon: Warehouse },
  { id: "encapsulation", icon: Factory },
  { id: "binder", icon: Thermometer },
  { id: "qc", icon: FlaskConical },
  { id: "audit", icon: ClipboardList },
];

export function ZoneNav({ copy }: { copy: LabCopy }) {
  const zone = useLabStore((state) => state.zone);
  const setZone = useLabStore((state) => state.setZone);

  return (
    <nav className="flex gap-2 overflow-x-auto pb-1" aria-label={copy.workspaceTitle}>
      {zones.map((item) => {
        const active = item.id === zone;
        const Icon = item.icon;

        return (
          <button
            key={item.id}
            type="button"
            aria-current={active ? "page" : undefined}
            onClick={() => setZone(item.id)}
            className={`flex min-w-[11.5rem] shrink-0 items-start gap-2 rounded-xl px-3 py-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy ${
              active ? "bg-navy text-white" : "bg-surface text-navy hover:bg-teal-soft"
            }`}
          >
            <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              <span className="block text-sm font-semibold">{copy.zones[item.id].tab}</span>
              <span className={`mt-0.5 block text-xs leading-snug ${active ? "text-white/80" : "text-muted"}`}>
                {copy.zones[item.id].subtitle}
              </span>
            </span>
          </button>
        );
      })}
    </nav>
  );
}
