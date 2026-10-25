"use client";

import { tools } from "@/data/tools";
import type { Locale } from "@/i18n/config";
import type { SimCopy } from "@/i18n/simCopy";
import { lotMass } from "@/lib/materials";
import { useLabStore } from "@/store/useLabStore";

export function MaterialsDock({ copy, locale }: { copy: SimCopy; locale: Locale }) {
  const lots = useLabStore((state) => state.lots);
  const selectedLotId = useLabStore((state) => state.selectedLotId);
  const selectLot = useLabStore((state) => state.selectLot);
  const selectTool = useLabStore((state) => state.selectTool);
  const selectedToolId = useLabStore((state) => state.selectedToolId);
  const confirmWeigh = useLabStore((state) => state.confirmWeigh);
  const splitSelected = useLabStore((state) => state.splitSelected);
  const mergeSelected = useLabStore((state) => state.mergeSelected);
  const unloadSelected = useLabStore((state) => state.unloadSelected);
  const loadOntoEquipment = useLabStore((state) => state.loadOntoEquipment);
  const rejectCapsules = useLabStore((state) => state.rejectCapsules);
  const selectedEquipmentId = useLabStore((state) => state.selectedEquipmentId);
  const zone = useLabStore((state) => state.zone);
  const selected = lots.find((lot) => lot.id === selectedLotId);
  const others = lots.filter((lot) => lot.id !== selectedLotId);

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-muted">{copy.grabHint}</p>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-teal">{copy.tools}</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {tools
            .filter((tool) => tool.zone === zone)
            .map((tool) => (
              <button
                key={tool.id}
                type="button"
                onClick={() => selectTool(tool.id)}
                className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                  selectedToolId === tool.id ? "bg-navy text-white" : "bg-surface text-navy hover:bg-teal-soft"
                }`}
              >
                {tool.title[locale]}
              </button>
            ))}
        </div>
      </div>
      <ul className="space-y-2">
        {lots.map((lot) => {
          const active = lot.id === selectedLotId;
          return (
            <li key={lot.id}>
              <button
                type="button"
                onClick={() => selectLot(lot.id)}
                className={`w-full rounded-xl border px-3 py-3 text-left transition hover:bg-surface active:scale-[0.99] ${active ? "border-teal bg-teal-soft/40" : "border-line bg-white"}`}
              >
                <span className="block text-sm font-semibold text-navy">{lot.name}</span>
                <span className="mt-1 block text-xs text-muted">
                  {lot.kind} · {lotMass(lot).toFixed(3)} g · {lot.releaseStatus}
                  {lot.place.kind === "table" ? ` · ${lot.place.zone}` : ""}
                  {lot.place.kind === "equipment" ? ` · ${copy.loaded}` : ""}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {selected ? (
        <div className="space-y-2 rounded-xl border border-line p-3">
          <p className="text-sm font-semibold text-navy">{selected.name}</p>
          <p className="text-xs text-muted">
            H₂O {selected.moisturePercent}% · ρ {selected.bulkDensityGCm3} g/cm³ · {selected.batchNo}
          </p>
          <ul className="text-xs text-muted">
            {selected.components.map((part) => (
              <li key={`${part.substanceId}-${part.role}`}>
                {part.substanceId} ({copy.roles[part.role] ?? part.role}) · {part.massG.toFixed(3)} g
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={btn} onClick={() => confirmWeigh()}>
              {copy.weigh}
            </button>
            <button type="button" className={btn} onClick={() => splitSelected(Math.min(1, lotMass(selected) / 2))}>
              {copy.split}
            </button>
            <button type="button" className={btn} onClick={() => loadOntoEquipment(selected.id, selectedEquipmentId)}>
              {copy.load}
            </button>
            <button type="button" className={btn} onClick={() => unloadSelected()}>
              {copy.unload}
            </button>
            {selected.kind === "capsules" ? (
              <button type="button" className={btn} onClick={() => rejectCapsules(1)}>
                {copy.reject}
              </button>
            ) : null}
          </div>
          {others.length > 0 ? (
            <label className="block text-xs font-semibold text-navy">
              {copy.merge}
              <select
                className="mt-1 w-full rounded-lg border border-line px-2 py-1.5 text-sm font-normal"
                defaultValue=""
                onChange={(event) => {
                  if (event.target.value) {
                    mergeSelected(event.target.value);
                    event.target.value = "";
                  }
                }}
              >
                <option value="">—</option>
                {others.map((lot) => (
                  <option key={lot.id} value={lot.id}>
                    {lot.name} ({lotMass(lot).toFixed(2)} g)
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

const btn =
  "rounded-lg bg-navy px-3 py-2 text-xs font-semibold text-white transition hover:bg-navy-dark active:scale-[0.98] disabled:opacity-50";
