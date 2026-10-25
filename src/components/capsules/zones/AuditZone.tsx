"use client";

import { ZoneLayout } from "@/components/capsules/ZoneLayout";
import { formatStamp } from "@/lib/formatLab";
import type { LabCopy } from "@/i18n/types";
import { useLabStore } from "@/store/useLabStore";
import type { AuditRecord } from "@/types/lab";

export function AuditZone({ copy }: { copy: LabCopy }) {
  const auditLog = useLabStore((state) => state.auditLog);
  const samples = useLabStore((state) => state.samples);

  return (
    <ZoneLayout copy={copy} zone="audit">
      <div>
        <h2 className="text-2xl font-semibold text-navy">{copy.zones.audit.title}</h2>
        <p className="mt-1 text-sm text-muted">{copy.zones.audit.subtitle}</p>
      </div>
      <p className="text-sm leading-relaxed text-muted">{copy.audit.intro}</p>
      {auditLog.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line bg-white px-5 py-8 text-sm text-muted">
          {copy.audit.empty}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-sm">
          <table className="min-w-[760px] w-full border-collapse text-left text-sm">
            <thead className="bg-surface text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">{copy.audit.time}</th>
                <th className="px-4 py-3 font-semibold">{copy.audit.zone}</th>
                <th className="px-4 py-3 font-semibold">{copy.audit.equipment}</th>
                <th className="px-4 py-3 font-semibold">{copy.audit.action}</th>
                <th className="px-4 py-3 font-semibold">{copy.audit.sample}</th>
                <th className="px-4 py-3 font-semibold">{copy.audit.details}</th>
              </tr>
            </thead>
            <tbody>
              {auditLog.map((record) => {
                const sample = samples.find((item) => item.id === record.sampleId);
                return (
                  <tr key={record.id} className="border-t border-line align-top">
                    <td className="px-4 py-3 whitespace-nowrap text-muted">
                      {formatStamp(record.at)}
                    </td>
                    <td className="px-4 py-3 text-navy">{copy.zones[record.zone].tab}</td>
                    <td className="px-4 py-3 text-navy">{copy.equipment[record.equipment]}</td>
                    <td className="px-4 py-3 font-medium text-navy">
                      {copy.actions[record.action]}
                    </td>
                    <td className="px-4 py-3 text-navy">{sample?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-muted">{describe(record, copy)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </ZoneLayout>
  );
}

function describe(record: AuditRecord, copy: LabCopy) {
  if (record.from && record.to) {
    return `${copy.locations[record.from]} → ${copy.locations[record.to]}`;
  }

  return record.summary || "—";
}
