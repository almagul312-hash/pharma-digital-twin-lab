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
import type { LabCopy } from "@/i18n/types";
import { useLabStore } from "@/store/useLabStore";

export function EncapsulationZone({ copy }: { copy: LabCopy }) {
  const machine = useLabStore((state) => state.encapsulator);
  const selectedSampleId = useLabStore((state) => state.selectedSampleId);
  const setSpeed = useLabStore((state) => state.setEncapsulatorSpeed);
  const setFill = useLabStore((state) => state.setEncapsulatorFill);
  const start = useLabStore((state) => state.startEncapsulator);
  const stop = useLabStore((state) => state.stopEncapsulator);
  const setDedusting = useLabStore((state) => state.setDedusting);
  const rejectCapsule = useLabStore((state) => state.rejectCapsule);

  return (
    <ZoneLayout copy={copy} zone="encapsulation">
      <div>
        <h2 className="text-2xl font-semibold text-navy">
          {copy.zones.encapsulation.title}
        </h2>
        <p className="mt-1 text-sm text-muted">{copy.zones.encapsulation.subtitle}</p>
      </div>
      <SamplePicker copy={copy} />
      <Panel title={copy.move}>
        <MoveControl copy={copy} />
      </Panel>
      <Panel title={copy.encapsulation.machineTitle} text={copy.encapsulation.machineText}>
        <StatusPill active={machine.running} copy={copy} />
        <LoadedLine copy={copy} sampleId={machine.loadedSampleId} />
        <CommitField
          label={copy.encapsulation.speed}
          value={machine.speed}
          min={10}
          max={120}
          step={1}
          unit={copy.units.perMin}
          onCommit={setSpeed}
        />
        <CommitField
          label={copy.encapsulation.fillMass}
          value={machine.fillMass}
          min={50}
          max={800}
          step={5}
          unit={copy.units.mg}
          onCommit={setFill}
        />
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl bg-surface px-3 py-3">
            <dt className="text-xs text-muted">{copy.encapsulation.produced}</dt>
            <dd className="text-xl font-semibold text-navy">{Math.floor(machine.produced)}</dd>
          </div>
          <div className="rounded-xl bg-surface px-3 py-3">
            <dt className="text-xs text-muted">{copy.encapsulation.rejected}</dt>
            <dd className="text-xl font-semibold text-navy">{machine.rejected}</dd>
          </div>
        </dl>
        <div className="flex flex-wrap gap-2">
          <PrimaryButton onClick={() => start(selectedSampleId)} disabled={machine.running}>
            {copy.encapsulation.start}
          </PrimaryButton>
          <SecondaryButton onClick={stop} disabled={!machine.running}>
            {copy.encapsulation.stop}
          </SecondaryButton>
        </div>
      </Panel>
      <Panel title={copy.encapsulation.dedustTitle} text={copy.encapsulation.dedustText}>
        <div className="flex flex-wrap gap-2">
          <PrimaryButton
            onClick={() => setDedusting(!machine.dedusting, selectedSampleId)}
          >
            {machine.dedusting ? copy.encapsulation.dedustOff : copy.encapsulation.dedustOn}
          </PrimaryButton>
          <SecondaryButton onClick={() => rejectCapsule(selectedSampleId)}>
            {copy.encapsulation.reject}
          </SecondaryButton>
        </div>
      </Panel>
    </ZoneLayout>
  );
}
