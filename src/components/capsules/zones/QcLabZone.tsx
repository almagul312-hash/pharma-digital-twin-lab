"use client";

import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MoveControl, Panel, PrimaryButton, SamplePicker } from "@/components/capsules/controls";
import { ZoneLayout } from "@/components/capsules/ZoneLayout";
import { buildChromatogram, buildFtir, buildUv } from "@/lib/labSignals";
import type { LabCopy } from "@/i18n/types";
import { useLabStore } from "@/store/useLabStore";
import type { QcMethod, QcRun } from "@/types/lab";

const methods: QcMethod[] = ["hplc", "gc", "ftir", "uv", "physchem"];

export function QcLabZone({ copy }: { copy: LabCopy }) {
  const [method, setMethod] = useState<QcMethod>("hplc");
  const selectedSampleId = useLabStore((state) => state.selectedSampleId);
  const sample = useLabStore((state) =>
    state.samples.find((item) => item.id === state.selectedSampleId),
  );
  const run = useLabStore((state) =>
    state.qcRuns.find(
      (item) => item.method === method && item.sampleId === state.selectedSampleId,
    ),
  );
  const runAnalysis = useLabStore((state) => state.runAnalysis);

  return (
    <ZoneLayout copy={copy} zone="qc">
      <div>
        <h2 className="text-2xl font-semibold text-navy">{copy.zones.qc.title}</h2>
        <p className="mt-1 text-sm text-muted">{copy.zones.qc.subtitle}</p>
      </div>
      <p className="text-sm leading-relaxed text-muted">{copy.qc.intro}</p>
      <SamplePicker copy={copy} />
      <Panel title={copy.move}>
        <MoveControl copy={copy} />
      </Panel>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {methods.map((item) => {
          const active = item === method;
          return (
            <button
              key={item}
              type="button"
              onClick={() => setMethod(item)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy ${
                active ? "bg-navy text-white" : "bg-white text-navy ring-1 ring-line"
              }`}
            >
              {copy.qc.methods[item]}
            </button>
          );
        })}
      </div>
      <Panel title={copy.qc.methods[method]} text={copy.qc.simulated}>
        <PrimaryButton
          onClick={() => runAnalysis(method, selectedSampleId)}
          disabled={!sample}
        >
          {copy.qc.run}
        </PrimaryButton>
        {run && sample ? (
          <MethodResult copy={copy} method={method} run={run} api={sample.apiConcentration} />
        ) : (
          <p className="text-sm text-muted">{copy.qc.empty}</p>
        )}
      </Panel>
    </ZoneLayout>
  );
}

function MethodResult({
  copy,
  method,
  run,
  api,
}: {
  copy: LabCopy;
  method: QcMethod;
  run: QcRun;
  api: number;
}) {
  if (method === "hplc" || method === "gc") {
    const trace = buildChromatogram(method, run.seed, api);
    return (
      <div className="space-y-3">
        <TraceChart
          data={trace.points}
          domain={trace.domain}
          xLabel={copy.qc.retentionAxis}
          yLabel={copy.qc.signalAxis}
        />
        <ul className="grid gap-2 text-sm sm:grid-cols-2">
          {trace.peaks.map((peak) => (
            <li key={peak.id} className="rounded-lg bg-surface px-3 py-2 text-navy">
              <span className="font-semibold">{copy.qc.peakNames[peak.id]}</span>
              <span className="text-muted"> · tR {peak.x.toFixed(2)} {copy.units.min}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (method === "ftir") {
    const trace = buildFtir(run.seed);
    return (
      <div className="space-y-3">
        <TraceChart
          data={trace.points}
          domain={trace.domain}
          xLabel={copy.qc.waveAxis}
          yLabel={copy.qc.transmittanceAxis}
        />
        <ul className="grid gap-2 text-sm sm:grid-cols-2">
          {trace.bands.map((band) => (
            <li key={band.id} className="rounded-lg bg-surface px-3 py-2 text-navy">
              <span className="font-semibold">{copy.qc.bandNames[band.id]}</span>
              <span className="text-muted"> · {band.x} cm⁻¹</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (method === "uv") {
    const trace = buildUv(run.seed, api);
    return (
      <div className="space-y-3">
        <TraceChart
          data={trace.points}
          domain={trace.domain}
          xLabel={copy.qc.wavelengthAxis}
          yLabel={copy.qc.absorbanceAxis}
        />
        <p className="rounded-lg bg-surface px-3 py-2 text-sm font-semibold text-navy">
          λ {trace.peak} nm
        </p>
      </div>
    );
  }

  if (!run.physchem) {
    return <p className="text-sm text-muted">{copy.qc.empty}</p>;
  }

  const cards = [
    {
      label: copy.qc.disintegration,
      value: `${run.physchem.disintegrationMin} ${copy.units.min}`,
    },
    {
      label: copy.qc.hardness,
      value: `${run.physchem.hardnessN} ${copy.units.newton}`,
    },
    {
      label: copy.qc.residualMoisture,
      value: `${run.physchem.residualMoisture} ${copy.units.percent}`,
    },
  ];

  return (
    <dl className="grid gap-3 sm:grid-cols-3">
      {cards.map((card) => (
        <div key={card.label} className="rounded-xl bg-surface px-3 py-3">
          <dt className="text-xs text-muted">{card.label}</dt>
          <dd className="mt-1 text-xl font-semibold text-navy">{card.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function TraceChart({
  data,
  domain,
  xLabel,
  yLabel,
}: {
  data: { x: number; y: number }[];
  domain: [number, number];
  xLabel: string;
  yLabel: string;
}) {
  const reversed = domain[0] > domain[1];
  const ordered: [number, number] = reversed ? [domain[1], domain[0]] : domain;

  return (
    <div className="h-72 w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 16, left: 8, bottom: 20 }}>
          <CartesianGrid stroke="#e1e7ee" />
          <XAxis
            dataKey="x"
            type="number"
            domain={ordered}
            reversed={reversed}
            tick={{ fontSize: 12, fill: "#4a5968" }}
            label={{ value: xLabel, position: "insideBottom", offset: -8, fontSize: 12, fill: "#4a5968" }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#4a5968" }}
            width={44}
            label={{ value: yLabel, angle: -90, position: "insideLeft", fontSize: 12, fill: "#4a5968" }}
          />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="y"
            stroke="#0e7c74"
            dot={false}
            strokeWidth={2}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
