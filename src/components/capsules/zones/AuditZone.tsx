"use client";

import { useLabStore } from "@/store/useLabStore";

export function AuditZone() {
  const log = useLabStore((state) => state.auditLog);
  return (
    <ul className="space-y-2 text-sm">
      {log.map((item) => (
        <li key={item.id} className="rounded-lg border border-line px-3 py-2">
          <p className="font-semibold text-navy">{item.summary}</p>
          <p className="text-xs text-muted">
            {item.at} · {item.action} · {item.fromState} → {item.toState}
          </p>
        </li>
      ))}
    </ul>
  );
}
