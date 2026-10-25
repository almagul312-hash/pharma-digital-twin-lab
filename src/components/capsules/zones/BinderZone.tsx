"use client";

import {
  CommitField,
  LoadedLine,
  MoveControl,
  Panel,
  PrimaryButton,
  SamplePicker,
  SecondaryButton,
  StatusPill,
} from "@/components/capsules/controls";
import { ZoneLayout } from "@/components/capsules/ZoneLayout";
import { formatDuration } from "@/lib/formatLab";
import type { LabCopy } from "@/i18n/types";
import { useLabStore } from "@/store/useLabStore";

export function BinderZone({ copy }: { copy: LabCopy }) {
  const binder = useLabStore((state) => state.binder);
  const desiccator = useLabStore((state) => state.desiccator);
  const selectedSampleId = useLabStore((state) => state.selectedSampleId);
  const setTemperature = useLabStore((state) => state.setBinderTemperature);
  const setVacuum = useLabStore((state) => state.setBinderVacuum);
  const setTimer = useLabStore((state) => state.setBinderTimer);
  const startBinder = useLabStore((state) => state.startBinder);
  const stopBinder = useLabStore((state) => state.stopBinder);
  const setDesiccatorVacuum = useLabStore((state) => state.setDesiccatorVacuum);
  const startDesiccator = useLabStore((state) => state.startDesiccator);
  const stopDesiccator = useLabStore((state) => state.stopDesiccator);
  const samples = useLabStore((state) => state.samples);
  const inOven = samples.filter((sample) => sample.location === "binder_oven");
  const inDesiccator = samples.filter((sample) => sample.location === "desiccator");

  return (
    <ZoneLayout copy={copy} zone="binder">
      <div>
        <h2 className="text-2xl font-semibold text-navy">{copy.zones.binder.title}</h2>
        <p className="mt-1 text-sm text-muted">{copy.zones.binder.subtitle}</p>
      </div>
      <SamplePicker copy={copy} />
      <Panel title={copy.move} text={copy.binder.loadHint}>
        <MoveControl copy={copy} />
      </Panel>
      <Panel title={copy.binder.ovenTitle} text={copy.binder.ovenText}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <StatusPill active={binder.running} copy={copy} />
          <span className="text-sm font-semibold text-navy">
            {copy.binder.elapsed}: {formatDuration(binder.elapsedSeconds)} /{" "}
            {binder.timerMinutes} {copy.units.min}
          </span>
        </div>
        <Readout
          label={copy.binder.actualTemperature}
          value={`${binder.actualTemperature.toFixed(1)} °C`}
        />
        <Readout
          label={copy.binder.actualVacuum}
          value={`${binder.actualVacuum.toFixed(0)} ${copy.units.mbar}`}
        />
        <CommitField
          label={copy.binder.temperature}
          value={binder.temperature}
          min={20}
          max={200}
          step={1}
          unit="°C"
          onCommit={setTemperature}
        />
        <CommitField
          label={copy.binder.vacuum}
          value={binder.vacuum}
          min={1}
          max={1013}
          step={1}
          unit={copy.units.mbar}
          onCommit={setVacuum}
        />
        <CommitField
          label={copy.binder.timer}
          value={binder.timerMinutes}
          min={1}
          max={240}
          step={1}
          unit={copy.units.min}
          onCommit={setTimer}
        />
        <LoadedLine copy={copy} sampleId={binder.loadedSampleId} />
        <SampleLine copy={copy} names={inOven.map((sample) => sample.name)} />
        <div className="flex flex-wrap gap-2">
          <PrimaryButton
            onClick={() => startBinder(selectedSampleId)}
            disabled={binder.running}
          >
            {copy.binder.start}
          </PrimaryButton>
          <SecondaryButton onClick={stopBinder} disabled={!binder.running}>
            {copy.binder.stop}
          </SecondaryButton>
        </div>
      </Panel>
      <Panel title={copy.binder.desiccatorTitle} text={copy.binder.desiccatorText}>
        <StatusPill active={desiccator.running} copy={copy} />
        <LoadedLine copy={copy} sampleId={desiccator.loadedSampleId} />
        <Readout
          label={copy.binder.actualVacuum}
          value={`${desiccator.actualVacuum.toFixed(0)} ${copy.units.mbar}`}
        />
        <CommitField
          label={copy.binder.vacuum}
          value={desiccator.vacuum}
          min={1}
          max={1013}
          step={1}
          unit={copy.units.mbar}
          onCommit={setDesiccatorVacuum}
        />
        <SampleLine copy={copy} names={inDesiccator.map((sample) => sample.name)} />
        <div className="flex flex-wrap gap-2">
          <PrimaryButton
            onClick={() => startDesiccator(selectedSampleId)}
            disabled={desiccator.running}
          >
            {copy.binder.start}
          </PrimaryButton>
          <SecondaryButton onClick={stopDesiccator} disabled={!desiccator.running}>
            {copy.binder.stop}
          </SecondaryButton>
        </div>
      </Panel>
    </ZoneLayout>
  );
}

function Readout({ label, value }: { label: string; value: string }) {
  return (
    <p className="flex items-center justify-between gap-3 rounded-lg bg-surface px-3 py-2 text-sm">
      <span className="text-muted">{label}</span>
      <span className="font-semibold text-navy">{value}</span>
    </p>
  );
}

function SampleLine({ copy, names }: { copy: LabCopy; names: string[] }) {
  return (
    <p className="text-sm text-muted">
      <span className="font-semibold text-navy">{copy.sample}: </span>
      {names.length > 0 ? names.join(", ") : "—"}
    </p>
  );
}
