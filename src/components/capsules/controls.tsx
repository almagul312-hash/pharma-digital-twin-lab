"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import type { LabCopy } from "@/i18n/types";
import { nextLocation, PROCESS_MARKS, SAMPLE_LOCATIONS } from "@/lib/labFlow";
import { useLabStore } from "@/store/useLabStore";
import type { LabSample, ProcessMark, SampleLocation } from "@/types/lab";

export function Panel({
  title,
  text,
  children,
}: {
  title: string;
  text?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-5">
      <h3 className="text-lg font-semibold text-navy">{title}</h3>
      {text ? <p className="mt-1 text-sm leading-relaxed text-muted">{text}</p> : null}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

export function PrimaryButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-lg bg-teal px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-dark disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy ${className}`}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border border-navy bg-white px-4 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy ${className}`}
    >
      {children}
    </button>
  );
}

export function StatusPill({ active, copy }: { active: boolean; copy: LabCopy }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
        active ? "bg-teal-soft text-teal-dark" : "bg-surface text-muted"
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${active ? "bg-teal" : "bg-muted"}`}
        aria-hidden="true"
      />
      {active ? copy.running : copy.idle}
    </span>
  );
}

export function MarkChips({
  marks,
  copy,
  limit,
}: {
  marks: ProcessMark[];
  copy: LabCopy;
  limit?: number;
}) {
  const visible = PROCESS_MARKS.filter((mark) => marks.includes(mark));
  const shown = limit ? visible.slice(0, limit) : visible;
  const rest = limit ? Math.max(0, visible.length - shown.length) : 0;

  if (visible.length === 0) {
    return <span className="text-xs text-muted">—</span>;
  }

  return (
    <span className="flex flex-wrap gap-1.5">
      {shown.map((mark) => (
        <span
          key={mark}
          className="rounded-full bg-teal-soft px-2 py-0.5 text-[11px] font-semibold text-teal-dark"
        >
          {copy.marks[mark]}
        </span>
      ))}
      {rest > 0 ? (
        <span className="rounded-full bg-surface px-2 py-0.5 text-[11px] font-semibold text-muted">
          +{rest}
        </span>
      ) : null}
    </span>
  );
}

export function SampleNameField({
  sample,
  copy,
}: {
  sample: LabSample;
  copy: LabCopy;
}) {
  const renameSample = useLabStore((state) => state.renameSample);
  const [draft, setDraft] = useState(sample.name);
  const tracked = `${sample.id}:${sample.name}`;
  const [seen, setSeen] = useState(tracked);
  const draftRef = useRef(draft);
  const sampleIdRef = useRef(sample.id);

  if (seen !== tracked) {
    setSeen(tracked);
    setDraft(sample.name);
  }

  draftRef.current = draft;
  sampleIdRef.current = sample.id;

  useEffect(() => {
    return () => {
      renameSample(sampleIdRef.current, draftRef.current);
    };
  }, [renameSample]);

  function commit(value: string) {
    setDraft(value);
    draftRef.current = value;
    renameSample(sample.id, value);
    if (!value.trim()) {
      setDraft(sample.name);
      draftRef.current = sample.name;
    }
  }

  return (
    <label className="block text-sm font-semibold text-navy">
      {copy.sampleName}
      <input
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={(event) => commit(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.currentTarget.blur();
          }
        }}
        className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm font-medium text-navy outline-none focus:border-teal"
      />
    </label>
  );
}

export function LoadedLine({
  copy,
  sampleId,
}: {
  copy: LabCopy;
  sampleId: string | null;
}) {
  const sample = useLabStore((state) =>
    state.samples.find((item) => item.id === sampleId),
  );

  return (
    <p className="text-sm text-muted">
      <span className="font-semibold text-navy">{copy.loaded}: </span>
      {sample ? sample.name : copy.noneLoaded}
    </p>
  );
}

export function SamplePicker({ copy }: { copy: LabCopy }) {
  const fieldId = useId();
  const samples = useLabStore((state) => state.samples);
  const selectedSampleId = useLabStore((state) => state.selectedSampleId);
  const selectSample = useLabStore((state) => state.selectSample);
  const openSampleZone = useLabStore((state) => state.openSampleZone);
  const selected = samples.find((sample) => sample.id === selectedSampleId);

  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <label className="block text-sm font-semibold text-navy" htmlFor={fieldId}>
        {copy.sample}
        <select
          id={fieldId}
          value={selectedSampleId}
          onChange={(event) => selectSample(event.target.value)}
          className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm font-medium text-navy outline-none focus:border-teal"
        >
          {samples.map((sample) => (
            <option key={sample.id} value={sample.id}>
              {sample.name} · {copy.locations[sample.location]}
            </option>
          ))}
        </select>
      </label>
      {selected ? (
        <div className="mt-3 space-y-3">
          <SampleNameField sample={selected} copy={copy} />
          <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <Fact label={copy.mass} value={`${selected.mass} ${copy.units.g}`} />
            <Fact
              label={copy.moisture}
              value={`${selected.moisture.toFixed(2)} ${copy.units.percent}`}
            />
            <Fact
              label={copy.api}
              value={`${selected.apiConcentration.toFixed(1)} ${copy.units.percent}`}
            />
            <Fact label={copy.location} value={copy.locations[selected.location]} />
          </dl>
          <div>
            <p className="text-xs font-semibold text-navy">{copy.marksTitle}</p>
            <div className="mt-1.5">
              <MarkChips marks={selected.marks} copy={copy} />
            </div>
          </div>
          <SecondaryButton onClick={() => openSampleZone(selected.id)}>
            {copy.openZone}
          </SecondaryButton>
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted">{copy.noSample}</p>
      )}
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="font-semibold text-navy">{value}</dd>
    </div>
  );
}

export function MoveControl({
  copy,
  targets = SAMPLE_LOCATIONS,
}: {
  copy: LabCopy;
  targets?: SampleLocation[];
}) {
  const moveSample = useLabStore((state) => state.moveSample);
  const selected = useLabStore((state) =>
    state.samples.find((sample) => sample.id === state.selectedSampleId),
  );
  const suggested = selected ? nextLocation(selected) : targets[0];
  const initial = targets.includes(suggested) ? suggested : targets[0];
  const signature = `${targets.join("|")}:${selected?.id ?? ""}:${initial}`;
  const [target, setTarget] = useState<SampleLocation>(initial);
  const [trackedSignature, setTrackedSignature] = useState(signature);

  if (trackedSignature !== signature) {
    setTrackedSignature(signature);
    setTarget(initial);
  }

  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed text-muted">{copy.pipelineHint}</p>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="block flex-1 text-sm font-semibold text-navy">
          {copy.target}
          <select
            value={target}
            onChange={(event) => setTarget(event.target.value as SampleLocation)}
            className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm font-medium outline-none focus:border-teal"
          >
            {targets.map((item) => (
              <option key={item} value={item}>
                {copy.locations[item]}
                {item === suggested ? " →" : ""}
              </option>
            ))}
          </select>
        </label>
        <PrimaryButton
          onClick={() => selected && moveSample(selected.id, target)}
          disabled={!selected || selected.location === target}
        >
          {copy.move}
        </PrimaryButton>
      </div>
    </div>
  );
}

export function CommitField({
  label,
  value,
  min,
  max,
  step,
  unit,
  onCommit,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onCommit: (value: number) => void;
}) {
  const [draft, setDraft] = useState(String(value));
  const [trackedValue, setTrackedValue] = useState(value);

  if (trackedValue !== value) {
    setTrackedValue(value);
    setDraft(String(value));
  }

  function commit(next: string) {
    const parsed = Number(next);
    if (!Number.isFinite(parsed)) {
      setDraft(String(value));
      return;
    }
    onCommit(parsed);
  }

  const sliderValue = Number.isFinite(Number(draft)) ? Number(draft) : min;

  return (
    <label className="block text-sm font-semibold text-navy">
      {label}
      <span className="mt-2 flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={sliderValue}
          onChange={(event) => setDraft(event.target.value)}
          onPointerUp={(event) => commit(event.currentTarget.value)}
          onKeyUp={(event) => commit(event.currentTarget.value)}
          onBlur={(event) => commit(event.target.value)}
          className="h-2 w-full cursor-pointer accent-[#0e7c74]"
        />
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={(event) => commit(event.target.value)}
          className="w-24 rounded-lg border border-line px-2 py-1.5 text-sm font-medium outline-none focus:border-teal"
        />
        <span className="w-16 shrink-0 text-xs font-medium text-muted">{unit}</span>
      </span>
    </label>
  );
}
