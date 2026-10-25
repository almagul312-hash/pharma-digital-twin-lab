"use client";

import { operationsFor } from "@/data/operations";
import type { SimCopy } from "@/i18n/simCopy";
import type { Locale } from "@/i18n/config";
import { operationStatus, blockedReason, explainBlock } from "@/lib/processGraph";
import { weighedLineCoverage } from "@/lib/balance";
import { useLabStore } from "@/store/useLabStore";

export function ProcessRail({ copy, locale }: { copy: SimCopy; locale: Locale }) {
  const route = useLabStore((state) => state.route);
  const recipe = useLabStore((state) => state.recipe);
  const completed = useLabStore((state) => state.completed);
  const lots = useLabStore((state) => state.lots);
  const startOperation = useLabStore((state) => state.startOperation);
  const identify = useLabStore((state) => state.identifyMaterials);
  const release = useLabStore((state) => state.releaseMaterials);
  const setRoute = useLabStore((state) => state.setRoute);
  const coverage = weighedLineCoverage(recipe, lots);
  const ctx = {
    route,
    recipe,
    completed,
    weighedLineIds: coverage.weighedLineIds,
    hasReleasedMaterials: lots.every((lot) => lot.releaseStatus !== "quarantine"),
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <RouteButton active={route === "direct_blend"} onClick={() => setRoute("direct_blend")} label={copy.routeA} hint={copy.routeAHint} />
        <RouteButton active={route === "wet_granulation"} onClick={() => setRoute("wet_granulation")} label={copy.routeB} hint={copy.routeBHint} />
      </div>
      <div className="flex flex-wrap gap-2">
        <Mini action={identify} label={copy.identify} />
        <Mini action={release} label={copy.release} />
      </div>
      <ol className="space-y-2">
        {operationsFor(route).map((op) => {
          const status = operationStatus(op, ctx);
          const reason = blockedReason(op, ctx);
          return (
            <li
              key={op.id}
              className={`rounded-xl border px-3 py-3 ${
                status === "available"
                  ? "border-teal bg-teal-soft/50"
                  : status === "done"
                    ? "border-line bg-surface"
                    : "border-line bg-white opacity-80"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-navy">{op.title[locale]}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted">{op.purpose[locale]}</p>
                </div>
                <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-navy">
                  {status === "done" ? copy.done : status === "available" ? copy.available : copy.blocked}
                  {op.optional ? ` · ${copy.optional}` : ""}
                </span>
              </div>
              {status === "blocked" && reason ? (
                <p className="mt-2 text-xs text-muted">{explainBlock(reason, locale)}</p>
              ) : null}
              {status === "available" ? (
                <button
                  type="button"
                  onClick={() => startOperation(op.id)}
                  className="mt-3 rounded-lg bg-teal px-3 py-2 text-sm font-semibold text-white hover:bg-teal-dark"
                >
                  {copy.startOp}
                </button>
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function RouteButton({
  active,
  onClick,
  label,
  hint,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-3 py-3 text-left ${active ? "border-navy bg-navy text-white" : "border-line bg-white text-navy hover:bg-surface"}`}
    >
      <span className="block text-sm font-semibold">{label}</span>
      <span className={`mt-1 block text-xs leading-snug ${active ? "text-white/80" : "text-muted"}`}>{hint}</span>
    </button>
  );
}

function Mini({ action, label }: { action: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={action}
      className="rounded-lg border border-navy px-3 py-2 text-xs font-semibold text-navy hover:bg-surface"
    >
      {label}
    </button>
  );
}
