"use client";

import { ArrowLeft, Boxes } from "lucide-react";
import { useEffect } from "react";
import { Container } from "@/components/Container";
import { InventoryDrawer } from "@/components/capsules/InventoryDrawer";
import { ZoneNav } from "@/components/capsules/ZoneNav";
import { AuditZone } from "@/components/capsules/zones/AuditZone";
import { BinderZone } from "@/components/capsules/zones/BinderZone";
import { EncapsulationZone } from "@/components/capsules/zones/EncapsulationZone";
import { QcLabZone } from "@/components/capsules/zones/QcLabZone";
import { WarehouseZone } from "@/components/capsules/zones/WarehouseZone";
import type { LabCopy } from "@/i18n/types";
import { useLabStore } from "@/store/useLabStore";
import type { AuditRecord } from "@/types/lab";

export function DigitalTwinWorkspace({
  copy,
  onBack,
}: {
  copy: LabCopy;
  onBack: () => void;
}) {
  const zone = useLabStore((state) => state.zone);
  const toggleInventory = useLabStore((state) => state.toggleInventory);
  const latest = useLabStore((state) => state.auditLog[0]);
  const tick = useLabStore((state) => state.tick);

  useEffect(() => {
    const id = window.setInterval(() => tick(), 1000);
    return () => window.clearInterval(id);
  }, [tick]);

  return (
    <div className="bg-surface pb-24">
      <div className="border-b border-line bg-white">
        <Container className="py-4 sm:py-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-teal">{copy.workspaceEyebrow}</p>
              <h1 className="mt-1 text-2xl font-semibold text-navy sm:text-3xl">
                {copy.workspaceTitle}
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
                {copy.workspaceNote}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={toggleInventory}
                className="inline-flex items-center gap-2 rounded-lg border border-navy px-4 py-2.5 text-sm font-semibold text-navy hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
              >
                <Boxes className="h-4 w-4" aria-hidden="true" />
                {copy.inventory}
              </button>
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                {copy.backToMenu}
              </button>
            </div>
          </div>
          {latest ? (
            <p className="mt-3 text-xs text-muted">
              {copy.lastRecord}: {copy.actions[latest.action]}
              {recordDetails(latest, copy) ? ` · ${recordDetails(latest, copy)}` : ""}
            </p>
          ) : null}
          <div className="mt-4">
            <ZoneNav copy={copy} />
          </div>
        </Container>
      </div>
      <Container className="py-6">
        {zone === "warehouse" ? <WarehouseZone copy={copy} /> : null}
        {zone === "encapsulation" ? <EncapsulationZone copy={copy} /> : null}
        {zone === "binder" ? <BinderZone copy={copy} /> : null}
        {zone === "qc" ? <QcLabZone copy={copy} /> : null}
        {zone === "audit" ? <AuditZone copy={copy} /> : null}
      </Container>
      <InventoryDrawer copy={copy} />
    </div>
  );
}

function recordDetails(record: AuditRecord, copy: LabCopy) {
  if (record.from && record.to) {
    return `${copy.locations[record.from]} → ${copy.locations[record.to]}`;
  }

  return record.summary;
}
