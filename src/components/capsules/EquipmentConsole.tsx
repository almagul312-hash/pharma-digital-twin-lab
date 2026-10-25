"use client";

import { equipmentByCategory, equipmentCatalog, equipmentById } from "@/data/equipmentCatalog";
import { operationsFor } from "@/data/operations";
import { qcApplicable } from "@/lib/qcModel";
import type { Locale } from "@/i18n/config";
import type { SimCopy } from "@/i18n/simCopy";
import { formatDuration } from "@/lib/formatLab";
import { useLabStore } from "@/store/useLabStore";
import type { EquipmentCategory, QcMethod, QcStage } from "@/types/process";

export function EquipmentConsole({ copy, locale }: { copy: SimCopy; locale: Locale }) {
  const selectedEquipmentId = useLabStore((state) => state.selectedEquipmentId);
  const chooseEquipment = useLabStore((state) => state.chooseEquipment);
  const selectEquipment = useLabStore((state) => state.selectEquipment);
  const machines = useLabStore((state) => state.machines);
  const startOperation = useLabStore((state) => state.startOperation);
  const pauseActive = useLabStore((state) => state.pauseActive);
  const resumeActive = useLabStore((state) => state.resumeActive);
  const stopActive = useLabStore((state) => state.stopActive);
  const setMachineParam = useLabStore((state) => state.setMachineParam);
  const runQc = useLabStore((state) => state.runQc);
  const zone = useLabStore((state) => state.zone);
  const route = useLabStore((state) => state.route);
  const lots = useLabStore((state) => state.lots);
  const qcRuns = useLabStore((state) => state.qcRuns);
  const model = equipmentCatalog.find((item) => item.id === selectedEquipmentId);
  const machine = selectedEquipmentId ? machines[selectedEquipmentId] : undefined;
  const category = model?.category ?? categoryForZone(zone);
  const loaded = lots.filter((lot) => lot.place.kind === "equipment" && lot.place.equipmentId === selectedEquipmentId);
  const zoneOps = operationsFor(route).filter((op) => op.zone === zone && op.equipment.length > 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {equipmentByCategory(category).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => chooseEquipment(item.category, item.id)}
            className={`rounded-lg border px-3 py-2 text-xs font-semibold transition hover:bg-teal-soft active:scale-[0.98] ${
              item.id === selectedEquipmentId ? "border-navy bg-navy text-white hover:bg-navy" : "border-line bg-white text-navy"
            }`}
          >
            {item.modelName}
          </button>
        ))}
      </div>
      {model ? (
        <div className="rounded-xl border border-line p-3 text-sm">
          <p className="font-semibold text-navy">{model.modelName}</p>
          <p className="mt-1 text-xs text-muted">
            {model.manufacturer} · {model.scale} · {model.specStatus}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-muted">{model.notes[locale]}</p>
          <ul className="mt-2 space-y-1 text-[11px] text-muted">
            {model.sources.map((source) => (
              <li key={source.text}>
                {source.url ? (
                  <a className="underline" href={source.url} target="_blank" rel="noreferrer">
                    {source.text}
                  </a>
                ) : (
                  source.text
                )}
              </li>
            ))}
          </ul>
          {machine ? (
            <div className="mt-3">
              <p className="text-sm">
                <span className="font-semibold">{copy.phase[machine.phase]}</span>
                {machine.durationSec > 0
                  ? ` · ${formatDuration(machine.elapsedSec)} / ${formatDuration(machine.durationSec)} · ${Math.round(machine.progress * 100)}%`
                  : ""}
              </p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface">
                <div className="h-full bg-teal transition-[width]" style={{ width: `${Math.round((machine.progress || 0) * 100)}%` }} />
              </div>
              {machine.actual.temperature ? (
                <p className="mt-2 text-xs text-muted">
                  T {machine.actual.temperature.toFixed(1)} / {machine.params.temperature ?? "—"} °C
                </p>
              ) : null}
            </div>
          ) : null}
          <p className="mt-2 text-xs text-muted">
            {copy.loaded}: {loaded.length ? loaded.map((lot) => lot.name).join(", ") : copy.noneLoaded}
          </p>
          {model.category === "mixer" || model.category === "granulator" ? (
            <ParamField
              label={`${copy.rpm}${model.speedRpm ? ` (${model.speedRpm.min}–${model.speedRpm.max})` : ""}`}
              value={machine?.params.rpm ?? model.speedRpm?.min ?? 20}
              onChange={(value) => setMachineParam("rpm", value)}
            />
          ) : null}
          {model.category === "mixer" || model.category === "dryer" || model.category === "granulator" ? (
            <ParamField label={copy.minutes} value={machine?.params.minutes ?? 8} onChange={(value) => setMachineParam("minutes", value)} />
          ) : null}
          {model.category === "dryer" ? (
            <>
              <ParamField
                label={`${copy.temperature}${model.temperatureC ? ` (${model.temperatureC.min}–${model.temperatureC.max} °C)` : ""}`}
                value={machine?.params.temperature ?? 50}
                onChange={(value) => setMachineParam("temperature", value)}
              />
              <button
                type="button"
                className={`${primary} mt-2`}
                onClick={() => setMachineParam("door", machine?.params.door === 1 ? 0 : 1)}
              >
                {copy.door}: {machine?.params.door === 1 ? "open" : "closed"}
              </button>
            </>
          ) : null}
          <p className="mt-2 text-[11px] leading-relaxed text-muted">{copy.timeScale}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className={primary} onClick={() => selectEquipment(model.id)}>
              {model.category}
            </button>
            <button type="button" className={primary} onClick={() => pauseActive()}>
              {copy.pause}
            </button>
            <button type="button" className={primary} onClick={() => resumeActive()}>
              {copy.resume}
            </button>
            <button
              type="button"
              className="rounded-lg border border-navy px-3 py-2 text-xs font-semibold text-navy hover:bg-surface active:scale-[0.98]"
              onClick={() => stopActive()}
            >
              {copy.stop}
            </button>
          </div>
        </div>
      ) : null}
      {zoneOps.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {zoneOps.map((op) => (
            <button key={op.id} type="button" className={primary} onClick={() => startOperation(op.id)}>
              {copy.startOp}: {op.title[locale]}
            </button>
          ))}
        </div>
      ) : null}
      {zone === "qc" ? <QcBlock copy={copy} runQc={runQc} /> : null}
      {qcRuns[0] ? (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-navy">
          {copy.modelData}: {qcRuns[0].summary}. {qcRuns[0].criterion}
        </p>
      ) : null}
      {equipmentById("desiccator_lab") && zone === "drying" ? (
        <p className="text-xs leading-relaxed text-muted">{equipmentById("desiccator_lab")?.notes[locale]}</p>
      ) : null}
    </div>
  );
}

function ParamField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="mt-2 block text-xs font-semibold text-navy">
      {label}
      <input
        type="number"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-1 w-full rounded-lg border border-line px-2 py-1.5 text-sm font-normal"
      />
    </label>
  );
}

function QcBlock({
  copy,
  runQc,
}: {
  copy: SimCopy;
  runQc: (method: QcMethod, stage: QcStage) => void;
}) {
  const stages: QcStage[] = ["ipc", "intermediate", "finished"];
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-teal">{copy.modelData}</p>
      {stages.map((stage) => (
        <div key={stage}>
          <p className="text-xs font-semibold text-navy">{copy[stage]}</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {qcApplicable[stage].map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => runQc(method, stage)}
                className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-navy hover:bg-teal-soft active:scale-[0.98]"
              >
                {method}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function categoryForZone(zone: string): EquipmentCategory {
  if (zone === "process") {
    return "mixer";
  }
  if (zone === "drying") {
    return "dryer";
  }
  if (zone === "encapsulation") {
    return "encapsulator";
  }
  if (zone === "qc") {
    return "qc";
  }
  return "scale";
}

const primary =
  "rounded-lg bg-teal px-3 py-2 text-xs font-semibold text-white transition hover:bg-teal-dark active:scale-[0.98]";
