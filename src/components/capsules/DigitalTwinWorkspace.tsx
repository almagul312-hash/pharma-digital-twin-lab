"use client";

import { ArrowLeft, Boxes, ClipboardList, Cog, GitBranch, Layers } from "lucide-react";
import { useEffect } from "react";
import { Container } from "@/components/Container";
import { EquipmentConsole } from "@/components/capsules/EquipmentConsole";
import { MaterialsDock } from "@/components/capsules/MaterialsDock";
import { Notices } from "@/components/capsules/Notices";
import { ProcessRail } from "@/components/capsules/ProcessRail";
import { RecipeEditor } from "@/components/capsules/RecipeEditor";
import { ZoneNav } from "@/components/capsules/ZoneNav";
import { LabViewport } from "@/components/capsules/scene/LabViewport";
import { DropZoneButtons, useKeyboardMove } from "@/components/capsules/scene/interaction";
import { getSimCopy } from "@/i18n/simCopy";
import type { Locale } from "@/i18n/config";
import type { LabCopy } from "@/i18n/types";
import { useLabStore } from "@/store/useLabStore";

export function DigitalTwinWorkspace({
  copy,
  locale,
  onBack,
}: {
  copy: LabCopy;
  locale: Locale;
  onBack: () => void;
}) {
  const zone = useLabStore((state) => state.zone);
  const panel = useLabStore((state) => state.panel);
  const setPanel = useLabStore((state) => state.setPanel);
  const tick = useLabStore((state) => state.tick);
  const graphics = useLabStore((state) => state.graphics);
  const setGraphics = useLabStore((state) => state.setGraphics);
  const latest = useLabStore((state) => state.auditLog[0]);
  const sim = getSimCopy(locale);
  useKeyboardMove();

  useEffect(() => {
    const id = window.setInterval(() => tick(), 1000);
    return () => window.clearInterval(id);
  }, [tick]);

  const panels = [
    { id: "process" as const, label: sim.process, icon: GitBranch },
    { id: "recipe" as const, label: sim.recipe, icon: Layers },
    { id: "materials" as const, label: sim.materials, icon: Boxes },
    { id: "equipment" as const, label: sim.equipment, icon: Cog },
    { id: "log" as const, label: sim.log, icon: ClipboardList },
  ];

  return (
    <div className="bg-surface pb-16">
      <div className="border-b border-line bg-white">
        <Container className="py-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-teal">{copy.workspaceEyebrow}</p>
              <h1 className="mt-1 text-2xl font-semibold text-navy">{copy.workspaceTitle}</h1>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
                {copy.workspaceNote} {sim.sessionOnly}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setGraphics(graphics === "high" ? "low" : "high")}
                className="rounded-lg border border-navy px-3 py-2 text-sm font-semibold text-navy transition hover:bg-surface active:scale-[0.98]"
              >
                {sim.quality}: {graphics === "high" ? sim.qualityHigh : sim.qualityLow}
              </button>
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-dark active:scale-[0.98]"
              >
                <ArrowLeft className="h-4 w-4" />
                {copy.backToMenu}
              </button>
            </div>
          </div>
          {latest ? (
            <p className="mt-3 text-xs text-muted">
              {copy.lastRecord}: {latest.summary}
            </p>
          ) : null}
          <div className="mt-4">
            <ZoneNav copy={copy} />
          </div>
        </Container>
      </div>
      <Container className="py-5">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.9fr)]">
          <div>
            <LabViewport zone={zone} hint={sim.grabHint} loading={copy.canvasLoading} error={copy.canvasError} />
            <DropZoneButtons />
          </div>
          <div className="min-w-0">
            <div className="mb-3 flex gap-1 overflow-x-auto">
              {panels.map((item) => {
                const Icon = item.icon;
                const active = panel === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPanel(item.id)}
                    className={`inline-flex shrink-0 items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold ${
                      active ? "bg-navy text-white" : "bg-white text-navy ring-1 ring-line"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {item.label}
                  </button>
                );
              })}
            </div>
            <div className="rounded-2xl border border-line bg-white p-4">
              {panel === "process" ? <ProcessRail copy={sim} locale={locale} /> : null}
              {panel === "recipe" ? <RecipeEditor copy={sim} locale={locale} /> : null}
              {panel === "materials" ? <MaterialsDock copy={sim} locale={locale} /> : null}
              {panel === "equipment" ? <EquipmentConsole copy={sim} locale={locale} /> : null}
              {panel === "log" ? <LogPanel /> : null}
            </div>
          </div>
        </div>
      </Container>
      <Notices />
    </div>
  );
}

function LogPanel() {
  const log = useLabStore((state) => state.auditLog);
  if (log.length === 0) {
    return <p className="text-sm text-muted">—</p>;
  }
  return (
    <ul className="space-y-2 text-xs">
      {log.slice(0, 40).map((item) => (
        <li key={item.id} className="border-b border-line pb-2">
          <span className="font-semibold text-navy">{item.summary}</span>
          <span className="mt-1 block text-muted">
            {item.at.slice(0, 19).replace("T", " ")} · {item.fromState} → {item.toState}
            {item.warning ? ` · ${item.warning}` : ""}
          </span>
        </li>
      ))}
    </ul>
  );
}
