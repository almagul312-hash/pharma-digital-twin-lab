"use client";

import { Boxes, ChevronDown, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { MarkChips, SampleNameField } from "@/components/capsules/controls";
import { formatStamp } from "@/lib/formatLab";
import { SAMPLE_LOCATIONS } from "@/lib/labFlow";
import type { LabCopy } from "@/i18n/types";
import { useLabStore } from "@/store/useLabStore";
import type { SampleLocation } from "@/types/lab";

export function InventoryDrawer({ copy }: { copy: LabCopy }) {
  const open = useLabStore((state) => state.inventoryOpen);
  const toggleInventory = useLabStore((state) => state.toggleInventory);
  const setInventoryOpen = useLabStore((state) => state.setInventoryOpen);
  const samples = useLabStore((state) => state.samples);
  const selectedSampleId = useLabStore((state) => state.selectedSampleId);
  const selectSample = useLabStore((state) => state.selectSample);
  const moveSample = useLabStore((state) => state.moveSample);
  const openSampleZone = useLabStore((state) => state.openSampleZone);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    closeRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setInventoryOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, setInventoryOpen]);

  return (
    <>
      {open ? null : (
        <button
          type="button"
          onClick={toggleInventory}
          className="fixed right-4 bottom-4 z-30 inline-flex items-center gap-2 rounded-full bg-navy px-4 py-3 text-sm font-semibold text-white shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
        >
          <Boxes className="h-4 w-4" aria-hidden="true" />
          {copy.inventory}
        </button>
      )}
      {open ? (
        <button
          type="button"
          aria-label={copy.close}
          className="fixed inset-0 z-40 bg-navy/40"
          onClick={() => setInventoryOpen(false)}
        />
      ) : null}
      <aside
        role="dialog"
        aria-modal={open}
        aria-hidden={!open}
        inert={!open}
        aria-label={copy.inventoryTitle}
        className={`fixed top-0 right-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-200 ${
          open ? "translate-x-0" : "pointer-events-none translate-x-full"
        }`}
      >
        <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-teal">
              {copy.inventory}
            </p>
            <h2 className="text-xl font-semibold text-navy">{copy.inventoryTitle}</h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={() => setInventoryOpen(false)}
            className="rounded-lg p-2 text-navy hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
          >
            <X className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">{copy.close}</span>
          </button>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
          {samples.map((sample) => {
            const active = sample.id === selectedSampleId;
            return (
              <article
                key={sample.id}
                className={`rounded-xl border ${
                  active ? "border-teal bg-teal-soft/40" : "border-line bg-white"
                }`}
              >
                <button
                  type="button"
                  aria-expanded={active}
                  onClick={() => selectSample(sample.id)}
                  className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left"
                >
                  <span>
                    <span className="block font-semibold text-navy">{sample.name}</span>
                    <span className="mt-1 block text-sm text-muted">
                      {copy.sampleTypes[sample.type]} · {copy.locations[sample.location]}
                    </span>
                    <span className="mt-2 block">
                      <MarkChips marks={sample.marks} copy={copy} limit={3} />
                    </span>
                  </span>
                  <ChevronDown
                    className={`mt-1 h-4 w-4 shrink-0 text-navy transition-transform ${
                      active ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  />
                </button>
                {active ? (
                  <div className="space-y-4 border-t border-teal/30 px-4 py-4 text-sm">
                    <SampleNameField sample={sample} copy={copy} />
                    <dl className="grid grid-cols-2 gap-3">
                      <Item label={copy.mass} value={`${sample.mass} ${copy.units.g}`} />
                      <Item
                        label={copy.moisture}
                        value={`${sample.moisture.toFixed(2)} ${copy.units.percent}`}
                      />
                      <Item
                        label={copy.api}
                        value={`${sample.apiConcentration.toFixed(1)} ${copy.units.percent}`}
                      />
                      <Item label={copy.status} value={copy.statuses[sample.status]} />
                    </dl>
                    <div>
                      <p className="font-semibold text-navy">{copy.marksTitle}</p>
                      <div className="mt-2">
                        <MarkChips marks={sample.marks} copy={copy} />
                      </div>
                    </div>
                    <label className="block font-semibold text-navy">
                      {copy.location}
                      <select
                        value={sample.location}
                        onChange={(event) =>
                          moveSample(sample.id, event.target.value as SampleLocation)
                        }
                        className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 font-medium outline-none focus:border-teal"
                      >
                        {SAMPLE_LOCATIONS.map((location) => (
                          <option key={location} value={location}>
                            {copy.locations[location]}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        openSampleZone(sample.id);
                        setInventoryOpen(false);
                      }}
                      className="w-full rounded-lg border border-navy px-3 py-2 font-semibold text-navy hover:bg-white"
                    >
                      {copy.openZone}
                    </button>
                    <div>
                      <h3 className="font-semibold text-navy">{copy.history}</h3>
                      <ul className="mt-2 space-y-2">
                        {[...sample.history].reverse().slice(0, 8).map((entry) => (
                          <li
                            key={`${entry.at}-${entry.action}-${entry.location}`}
                            className="text-muted"
                          >
                            <span className="text-navy">{formatStamp(entry.at)}</span>
                            {" · "}
                            {copy.actions[entry.action]}
                            {" · "}
                            {copy.locations[entry.location]}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </aside>
    </>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="font-semibold text-navy">{value}</dd>
    </div>
  );
}
