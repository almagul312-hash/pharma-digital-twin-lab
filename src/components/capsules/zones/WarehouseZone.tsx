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

export function WarehouseZone({ copy }: { copy: LabCopy }) {
  const mixer = useLabStore((state) => state.mixer);
  const selectedSampleId = useLabStore((state) => state.selectedSampleId);
  const weighSample = useLabStore((state) => state.weighSample);
  const debagSample = useLabStore((state) => state.debagSample);
  const millSample = useLabStore((state) => state.millSample);
  const setMixerMinutes = useLabStore((state) => state.setMixerMinutes);
  const startMixer = useLabStore((state) => state.startMixer);
  const stopMixer = useLabStore((state) => state.stopMixer);

  return (
    <ZoneLayout copy={copy} zone="warehouse">
      <div>
        <h2 className="text-2xl font-semibold text-navy">{copy.zones.warehouse.title}</h2>
        <p className="mt-1 text-sm text-muted">{copy.zones.warehouse.subtitle}</p>
      </div>
      <SamplePicker copy={copy} />
      <Panel title={copy.move}>
        <MoveControl copy={copy} />
      </Panel>
      <Panel title={copy.warehouse.scaleTitle} text={copy.warehouse.scaleText}>
        <PrimaryButton onClick={() => weighSample(selectedSampleId)} disabled={!selectedSampleId}>
          {copy.warehouse.weigh}
        </PrimaryButton>
      </Panel>
      <Panel title={copy.warehouse.debagTitle} text={copy.warehouse.debagText}>
        <SecondaryButton
          onClick={() => debagSample(selectedSampleId)}
          disabled={!selectedSampleId}
        >
          {copy.warehouse.debag}
        </SecondaryButton>
      </Panel>
      <Panel title={copy.warehouse.millTitle} text={copy.warehouse.millText}>
        <PrimaryButton onClick={() => millSample(selectedSampleId)} disabled={!selectedSampleId}>
          {copy.warehouse.mill}
        </PrimaryButton>
      </Panel>
      <Panel title={copy.warehouse.mixerTitle} text={copy.warehouse.mixerText}>
        <div className="flex items-center justify-between gap-3">
          <StatusPill active={mixer.running} copy={copy} />
          <span className="text-sm font-semibold text-navy">
            {copy.binder.elapsed}: {formatDuration(mixer.elapsedSeconds)}
          </span>
        </div>
        <LoadedLine copy={copy} sampleId={mixer.loadedSampleId} />
        <CommitField
          label={copy.warehouse.blendMinutes}
          value={mixer.minutes}
          min={1}
          max={120}
          step={1}
          unit={copy.units.min}
          onCommit={setMixerMinutes}
        />
        <div className="flex flex-wrap gap-2">
          <PrimaryButton onClick={() => startMixer(selectedSampleId)} disabled={mixer.running}>
            {copy.warehouse.startMix}
          </PrimaryButton>
          <SecondaryButton onClick={stopMixer} disabled={!mixer.running}>
            {copy.warehouse.stopMix}
          </SecondaryButton>
        </div>
      </Panel>
    </ZoneLayout>
  );
}
