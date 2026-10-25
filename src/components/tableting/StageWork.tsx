"use client";

import { useState } from "react";
import { EDU_SPEC, materials, recipeFor, solidsMg, type MaterialId } from "@/tableting/catalog";
import { ActionButton, Field, inputClass } from "@/components/tableting/ui";
import { lotTitle, massText, roleText } from "@/components/tableting/format";
import { PressFigure, pressCycle } from "@/components/tableting/PressFigure";
import {
  acknowledgeMoisture,
  activeLots,
  confirmIdentity,
  confirmPressSetup,
  confirmWeigh,
  destinationsFor,
  forecastDrying,
  gramsFromMg,
  loadStage,
  moveLot,
  packSeries,
  readabilityGrams,
  releaseLot,
  returnWeigh,
  runQc,
  selectWeighLine,
  setBalanceMode,
  setDraftNet,
  setDryer,
  setGranulator,
  setMixer,
  setPress,
  setSieve,
  setTare,
  skipStage,
  stageView,
  startCompression,
  startDedust,
  startDrying,
  startFinal,
  startGranulation,
  startLiquid,
  startLubrication,
  startPremix,
  startSieve,
  startSizing,
  startWetScreen,
  stopJob,
  suggestFill,
  targetGrams,
  toleranceGrams,
} from "@/tableting/engine";
import { useTabletStore } from "@/tableting/store";
import { methodLabel, say, stageLabel, statusLabel, theory, tx, type L } from "@/tableting/text";
import type { Locale } from "@/i18n/config";
import type { LocationId, QcMethodId, TabletSession } from "@/tableting/types";

export function StageWork({ locale }: { locale: Locale }) {
  const session = useTabletStore((state) => state.session);
  const act = useTabletStore((state) => state.act);
  const [checked, setChecked] = useState<string | null>(null);
  const [packCount, setPackCount] = useState(20);
  const [packKind, setPackKind] = useState<"bottle" | "blister">("bottle");
  const [confirming, setConfirming] = useState<null | { text: string; run: () => void }>(null);
  const recipe = session.route ? recipeFor(session.route) : null;
  const view = stageView(session, session.selectedStage);
  const selected = session.lots.find((lot) => lot.id === session.selectedLotId) ?? null;

  function ask(text: string, run: () => void) {
    setConfirming({ text, run });
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-teal">{tx(locale, statusLabel[view.status])}</p>
        <h2 className="mt-1 text-xl font-semibold text-navy">{tx(locale, stageLabel[session.selectedStage])}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">{say(locale, view.reason, { stage: session.selectedStage })}</p>
        <p className="mt-2 text-sm leading-relaxed">{tx(locale, theory[session.selectedStage])}</p>
      </div>
      {session.job ? (
        <div className="rounded-xl border border-line bg-white p-3">
          <div className="mb-2 flex items-center justify-between gap-3 text-sm">
            <span>{say(locale, "gate_running", { stage: session.job.stage })}</span>
            <span>{Math.min(100, Math.round((session.job.elapsedMs / session.job.durationMs) * 100))}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-line">
            <div className="h-full bg-teal" style={{ width: `${Math.min(100, (session.job.elapsedMs / session.job.durationMs) * 100)}%` }} />
          </div>
          <div className="mt-3">
            <ActionButton type="button" tone="secondary" onClick={() => act(stopJob)}>
              {tx(locale, stopLabel)}
            </ActionButton>
          </div>
        </div>
      ) : null}
      {view.optional && view.status !== "done" && view.status !== "skipped" && view.status !== "unavailable" ? (
        <ActionButton
          type="button"
          tone="quiet"
          onClick={() => ask(tx(locale, skipAsk), () => act((current, now) => skipStage(current, session.selectedStage, now)))}
        >
          {tx(locale, skipLabel)}
        </ActionButton>
      ) : null}
      {session.selectedStage !== "intake" && session.selectedStage !== "weighing" && session.selectedStage !== "moisture_check" ? (
        <ActionButton type="button" tone="secondary" onClick={() => act((current, now) => loadStage(current, session.selectedStage, now))}>
          {tx(locale, loadLabel)}
        </ActionButton>
      ) : null}
      {recipe && session.selectedStage === "intake" ? <Intake locale={locale} checked={checked} setChecked={setChecked} /> : null}
      {recipe && session.selectedStage === "weighing" ? <Weighing locale={locale} /> : null}
      {session.selectedStage === "sieving" || session.selectedStage === "wet_screening" ? <Sieving locale={locale} /> : null}
      {session.selectedStage === "premix" || session.selectedStage === "final_blend" || session.selectedStage === "lubrication" ? <Mixing locale={locale} /> : null}
      {session.selectedStage === "granulating_liquid" ? <Liquid locale={locale} /> : null}
      {session.selectedStage === "granulation" ? <Granulation locale={locale} /> : null}
      {session.selectedStage === "drying" || session.selectedStage === "moisture_check" ? <Drying locale={locale} /> : null}
      {session.selectedStage === "sizing" ? <Sizing locale={locale} /> : null}
      {session.selectedStage === "compression" ? <PressPanel locale={locale} ask={ask} /> : null}
      {session.selectedStage === "dedusting" ? <Dedust locale={locale} /> : null}
      {session.selectedStage === "qc" ? <Quality locale={locale} /> : null}
      {session.selectedStage === "packaging" ? (
        <Packaging locale={locale} count={packCount} setCount={setPackCount} kind={packKind} setKind={setPackKind} ask={ask} />
      ) : null}
      {selected ? <Mover locale={locale} lotId={selected.id} /> : null}
      {confirming ? (
        <div className="rounded-xl border border-navy/20 bg-teal-soft p-4" role="alertdialog" aria-modal="false">
          <p className="text-sm leading-relaxed">{confirming.text}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <ActionButton
              type="button"
              onClick={() => {
                confirming.run();
                setConfirming(null);
              }}
            >
              {tx(locale, yesLabel)}
            </ActionButton>
            <ActionButton type="button" tone="secondary" onClick={() => setConfirming(null)}>
              {tx(locale, noLabel)}
            </ActionButton>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Intake({ locale, checked, setChecked }: { locale: Locale; checked: string | null; setChecked: (id: string | null) => void }) {
  const session = useTabletStore((state) => state.session);
  const act = useTabletStore((state) => state.act);
  const stocks = session.lots.filter((lot) => lot.kind === "stock");
  return (
    <div className="space-y-3">
      {stocks.map((lot) => {
        const material = materials[lot.materialId as MaterialId];
        return (
          <article key={lot.id} className="rounded-xl border border-line bg-white p-3">
            <h3 className="font-semibold text-navy">{lotTitle(locale, lot)}</h3>
            <p className="mt-1 text-sm text-muted">{roleText(locale, lot.role)} · {lot.batch}</p>
            <p className="mt-1 text-sm">{massText(locale, lot.massG)} · {tx(locale, identityText[lot.identity])}</p>
            <p className="mt-2 text-sm leading-relaxed">{material.storage[locale]}</p>
            <p className="mt-2 text-sm leading-relaxed">{material.passport[locale]}</p>
            <label className="mt-3 flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                className="mt-1"
                checked={checked === lot.id}
                onChange={(event) => setChecked(event.target.checked ? lot.id : null)}
              />
              <span>{tx(locale, checkPassport)}</span>
            </label>
            <div className="mt-3 flex flex-wrap gap-2">
              <ActionButton type="button" disabled={checked !== lot.id || lot.identity !== "quarantine"} onClick={() => act((current, now) => confirmIdentity(current, lot.id, now))}>
                {tx(locale, identify)}
              </ActionButton>
              <ActionButton type="button" tone="secondary" disabled={lot.identity !== "identified"} onClick={() => act((current, now) => releaseLot(current, lot.id, now))}>
                {tx(locale, release)}
              </ActionButton>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function Weighing({ locale }: { locale: Locale }) {
  const session = useTabletStore((state) => state.session);
  const act = useTabletStore((state) => state.act);
  const recipe = recipeFor(session.route!);
  const line = recipe.lines.find((item) => item.id === session.weigh.lineId);
  const target = line ? targetGrams(recipe, line, session.batchTablets) : 0;
  const tolerance = line && !line.water ? toleranceGrams(target, false) : 0;
  const step = readabilityGrams(session.weigh.mode);
  const net = session.weigh.draftNetG ?? 0;
  const rounded = Math.round(net / step) * step;
  const internal = gramsFromMg(recipe.lines.filter((item) => item.phase === "internal").reduce((sum, item) => sum + item.perTabletMg, 0) * session.batchTablets);
  const waterOk = line?.water ? rounded >= internal * 0.08 && rounded <= internal * 0.3 : Math.abs(rounded - target) <= tolerance + 1e-9;
  const analyticalNeeded = Boolean(line && !line.water && tolerance < step);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {recipe.lines.map((item) => {
          const done = session.lots.some((lot) => lot.kind === "portion" && lot.lineId === item.id && !lot.consumed);
          return (
            <ActionButton key={item.id} type="button" tone={session.weigh.lineId === item.id ? "primary" : "secondary"} onClick={() => act((current, now) => selectWeighLine(current, item.id, now))}>
              {materials[item.materialId].name[locale]} {done ? "✓" : ""}
            </ActionButton>
          );
        })}
      </div>
      {line ? (
        <div className="rounded-xl border border-line bg-white p-3 text-sm">
          <p>{tx(locale, targetLabel)}: {massText(locale, target)}</p>
          <p className="mt-1">{line.water ? `${tx(locale, waterWindowLabel)}: ${massText(locale, internal * 0.08)} – ${massText(locale, internal * 0.3)}` : `${tx(locale, toleranceLabel)}: ± ${massText(locale, tolerance)}`}</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <p>{tx(locale, tareLabel)}: {session.weigh.tareG === null ? "—" : massText(locale, session.weigh.tareG)}</p>
            <p>{tx(locale, netLabel)}: {session.weigh.draftNetG === null ? "—" : massText(locale, rounded)}</p>
            <p>{tx(locale, grossLabel)}: {session.weigh.tareG === null || session.weigh.draftNetG === null ? "—" : massText(locale, session.weigh.tareG + rounded)}</p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <ActionButton type="button" tone={session.weigh.mode === "lab" ? "primary" : "secondary"} onClick={() => act((current, now) => setBalanceMode(current, "lab", now))}>
              {tx(locale, labBalance)}
            </ActionButton>
            <ActionButton type="button" tone={session.weigh.mode === "analytical" ? "primary" : "secondary"} onClick={() => act((current, now) => setBalanceMode(current, "analytical", now))}>
              {tx(locale, analyticalBalance)}
            </ActionButton>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Field label={tx(locale, tareLabel)}>
              <input className={inputClass} type="number" min="0.1" step="0.1" defaultValue={12.5} onBlur={(event) => act((current, now) => setTare(current, Number(event.target.value), now))} />
            </Field>
            <Field label={tx(locale, netLabel)} hint={analyticalNeeded ? say(locale, "weigh_need_analytical", { tolerance, step, lineId: line.id }) : undefined}>
              <input className={inputClass} type="number" min="0" step={step} value={session.weigh.draftNetG ?? ""} onChange={(event) => act((current, now) => setDraftNet(current, Number(event.target.value), now))} />
            </Field>
          </div>
          <p className="mt-3 text-sm">{waterOk && session.weigh.zeroed && !analyticalNeeded ? tx(locale, within) : tx(locale, outsideHint)}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <ActionButton type="button" onClick={() => act(confirmWeigh)}>{tx(locale, confirmWeighLabel)}</ActionButton>
            <ActionButton type="button" tone="quiet" onClick={() => selectedPortion(session, line.id) && act((current, now) => returnWeigh(current, selectedPortion(session, line.id)!.id, now))}>
              {tx(locale, returnLabel)}
            </ActionButton>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Sieving({ locale }: { locale: Locale }) {
  const session = useTabletStore((state) => state.session);
  const act = useTabletStore((state) => state.act);
  const powders = activeLots(session).filter((lot) => lot.kind === "portion");
  const meshes = session.selectedStage === "wet_screening" ? [1, 1.6] : [0.5, 0.8, 1];
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted">{tx(locale, sieveNote)}</p>
      <Field label={tx(locale, meshLabel)}>
        <select className={inputClass} value={session.sieve.meshMm} onChange={(event) => act((current, now) => setSieve(current, { meshMm: Number(event.target.value) }, now))}>
          {meshes.map((mesh) => (
            <option key={mesh} value={mesh}>{mesh} {tx(locale, mm)}</option>
          ))}
        </select>
      </Field>
      {session.selectedStage === "sieving"
        ? powders.map((lot) => (
            <ActionButton
              key={lot.id}
              type="button"
              onClick={() =>
                act((current, now) => {
                  const placed = current.lots.find((item) => item.id === lot.id)?.location === "sieve"
                    ? { ok: true as const, session: current, tone: "info" as const, code: "move_same", params: {} }
                    : moveLot(current, lot.id, "sieve", now);
                  return placed.ok ? startSieve(placed.session, lot.id, now) : placed;
                })
              }
            >
              {lotTitle(locale, lot)} · {massText(locale, lot.massG)}
            </ActionButton>
          ))
        : null}
      {session.selectedStage === "wet_screening" ? (
        <ActionButton type="button" onClick={() => act(startWetScreen)}>{tx(locale, startLabel)}</ActionButton>
      ) : null}
    </div>
  );
}

function Mixing({ locale }: { locale: Locale }) {
  const session = useTabletStore((state) => state.session);
  const act = useTabletStore((state) => state.act);
  const here = activeLots(session).filter((lot) => lot.location === "mixer");
  const total = here.reduce((sum, lot) => sum + lot.massG, 0);
  const start = session.selectedStage === "lubrication" ? startLubrication : session.selectedStage === "final_blend" ? startFinal : startPremix;
  return (
    <div className="space-y-3">
      <p className="text-sm">{tx(locale, bowlLabel)}: {massText(locale, total)}</p>
      <ul className="space-y-1 text-sm">
        {here.map((lot) => (
          <li key={lot.id}>{lotTitle(locale, lot)} · {massText(locale, lot.massG)} · {roleText(locale, lot.role)}</li>
        ))}
      </ul>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={tx(locale, minutesLabel)} hint={session.selectedStage === "lubrication" ? tx(locale, lubeHint) : tx(locale, rsdHint)}>
          <input className={inputClass} type="number" min="0.5" max="40" step="0.5" value={session.mixer.minutes} onChange={(event) => act((current, now) => setMixer(current, { minutes: Number(event.target.value) }, now))} />
        </Field>
        <Field label={tx(locale, rpmLabel)}>
          <input className={inputClass} type="number" min="10" max="80" step="1" value={session.mixer.rpm} onChange={(event) => act((current, now) => setMixer(current, { rpm: Number(event.target.value) }, now))} />
        </Field>
      </div>
      <ActionButton type="button" onClick={() => act(start)}>{tx(locale, startLabel)}</ActionButton>
    </div>
  );
}

function Liquid({ locale }: { locale: Locale }) {
  const act = useTabletStore((state) => state.act);
  return (
    <div className="space-y-3 text-sm leading-relaxed">
      <p>{tx(locale, densityNote)}</p>
      <ActionButton type="button" onClick={() => act(startLiquid)}>{tx(locale, startLabel)}</ActionButton>
    </div>
  );
}

function Granulation({ locale }: { locale: Locale }) {
  const session = useTabletStore((state) => state.session);
  const act = useTabletStore((state) => state.act);
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={tx(locale, minutesLabel)}>
          <input className={inputClass} type="number" min="1" max="20" value={session.granulator.minutes} onChange={(event) => act((current, now) => setGranulator(current, { minutes: Number(event.target.value) }, now))} />
        </Field>
        <Field label={tx(locale, impellerLabel)}>
          <input className={inputClass} type="number" min="50" max="400" value={session.granulator.impellerRpm} onChange={(event) => act((current, now) => setGranulator(current, { impellerRpm: Number(event.target.value) }, now))} />
        </Field>
      </div>
      <ActionButton type="button" onClick={() => act(startGranulation)}>{tx(locale, startLabel)}</ActionButton>
    </div>
  );
}

function Drying({ locale }: { locale: Locale }) {
  const session = useTabletStore((state) => state.session);
  const act = useTabletStore((state) => state.act);
  const forecast = forecastDrying(session);
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={tx(locale, tempLabel)}>
          <input className={inputClass} type="number" min="40" max="70" value={session.dryer.temperatureC} onChange={(event) => act((current, now) => setDryer(current, { temperatureC: Number(event.target.value) }, now))} />
        </Field>
        <Field label={tx(locale, minutesLabel)}>
          <input className={inputClass} type="number" min="5" max="180" value={session.dryer.minutes} onChange={(event) => act((current, now) => setDryer(current, { minutes: Number(event.target.value) }, now))} />
        </Field>
      </div>
      {forecast ? (
        <p className="text-sm leading-relaxed">
          {tx(locale, forecastLabel)}: {(forecast.moisture1 * 100).toFixed(2)} %. {tx(locale, removedLabel)}: {massText(locale, forecast.removed)}. {tx(locale, simulated)}
        </p>
      ) : null}
      {session.selectedStage === "drying" ? <ActionButton type="button" onClick={() => act(startDrying)}>{tx(locale, startLabel)}</ActionButton> : null}
      {session.selectedStage === "moisture_check" ? <ActionButton type="button" onClick={() => act(acknowledgeMoisture)}>{tx(locale, recordMoisture)}</ActionButton> : null}
    </div>
  );
}

function Sizing({ locale }: { locale: Locale }) {
  const act = useTabletStore((state) => state.act);
  return (
    <div className="space-y-3 text-sm">
      <p>{tx(locale, finesNote)}</p>
      <ActionButton type="button" onClick={() => act(startSizing)}>{tx(locale, startLabel)}</ActionButton>
    </div>
  );
}

function PressPanel({ locale, ask }: { locale: Locale; ask: (text: string, run: () => void) => void }) {
  const session = useTabletStore((state) => state.session);
  const act = useTabletStore((state) => state.act);
  const suggested = suggestFill(session);
  const rotary = session.press.kind === "rotary";
  return (
    <div className="space-y-3">
      <PressFigure
        phase={pressCycle(session.job?.elapsedMs ?? 0, session.job?.stage === "compression", session.reducedMotion)}
        kind={session.press.kind}
        reduced={session.reducedMotion}
        caption={rotary ? tx(locale, rotaryCaption) : tx(locale, punchCaption)}
      />
      <Field label={tx(locale, pressKindLabel)}>
        <select className={inputClass} value={session.press.kind} onChange={(event) => act((current, now) => setPress(current, { kind: event.target.value as "single_punch" | "rotary" }, now))}>
          <option value="single_punch">{tx(locale, singlePunch)}</option>
          <option value="rotary">{tx(locale, rotaryPress)}</option>
        </select>
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={tx(locale, forceLabel)}>
          <input className={inputClass} type="number" min={5} max={25} step="0.5" value={session.press.forceKn} onChange={(event) => act((current, now) => setPress(current, { forceKn: Number(event.target.value) }, now))} />
        </Field>
        <Field label={rotary ? tx(locale, turretLabel) : tx(locale, strokeLabel)}>
          <input className={inputClass} type="number" min={rotary ? 10 : 10} max={rotary ? 40 : 60} value={session.press.speedPerMin} onChange={(event) => act((current, now) => setPress(current, { speedPerMin: Number(event.target.value) }, now))} />
        </Field>
        {rotary ? (
          <Field label={tx(locale, precompLabel)}>
            <input className={inputClass} type="number" min="0.5" max="5" step="0.1" value={session.press.precompressionKn} onChange={(event) => act((current, now) => setPress(current, { precompressionKn: Number(event.target.value) }, now))} />
          </Field>
        ) : null}
        <Field label={tx(locale, fillLabel)} hint={suggested ? `${tx(locale, suggestedLabel)}: ${suggested} ${tx(locale, mm)}` : undefined}>
          <input className={inputClass} type="number" min="4" max="14" step="0.1" value={session.press.fillDepthMm} onChange={(event) => act((current, now) => setPress(current, { fillDepthMm: Number(event.target.value) }, now))} />
        </Field>
        <Field label={tx(locale, diameterLabel)}>
          <select className={inputClass} value={session.press.punchDiameterMm} onChange={(event) => act((current, now) => setPress(current, { punchDiameterMm: Number(event.target.value) as 8 | 10 | 12 }, now))}>
            <option value={8}>8 {tx(locale, mm)}</option>
            <option value={10}>10 {tx(locale, mm)}</option>
            <option value={12}>12 {tx(locale, mm)}</option>
          </select>
        </Field>
      </div>
      <p className="text-sm text-muted">{tx(locale, lossNote)} {session.route ? `${tx(locale, tabletTarget)}: ${solidsMg(recipeFor(session.route))} ${tx(locale, mg)}` : ""}</p>
      <div className="flex flex-wrap gap-2">
        {suggested ? <ActionButton type="button" tone="secondary" onClick={() => act((current, now) => setPress(current, { fillDepthMm: Math.min(14, Math.max(4, suggested)) }, now))}>{tx(locale, useFill)}</ActionButton> : null}
        <ActionButton type="button" tone="secondary" onClick={() => act(confirmPressSetup)}>{tx(locale, confirmSetup)}</ActionButton>
        <ActionButton type="button" onClick={() => ask(tx(locale, pressAsk), () => act(startCompression))}>{tx(locale, startLabel)}</ActionButton>
      </div>
    </div>
  );
}

function Dedust({ locale }: { locale: Locale }) {
  const act = useTabletStore((state) => state.act);
  return (
    <div className="space-y-3 text-sm">
      <p>{tx(locale, dedustNote)}</p>
      <ActionButton type="button" onClick={() => act(startDedust)}>{tx(locale, startLabel)}</ActionButton>
    </div>
  );
}

function Quality({ locale }: { locale: Locale }) {
  const session = useTabletStore((state) => state.session);
  const act = useTabletStore((state) => state.act);
  const methods: QcMethodId[] = ["appearance", "average_mass", "mass_uniformity", "content_uniformity", "dimensions", "hardness", "friability", "disintegration", "dissolution", "assay"];
  return (
    <div className="space-y-3">
      <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm leading-relaxed text-amber-950">{tx(locale, qcBanner)}</p>
      {methods.map((method) => {
        const latest = session.qcRuns.find((run) => run.method === method);
        const info = qcInfo[method];
        return (
          <article key={method} className="rounded-xl border border-line bg-white p-3">
            <h3 className="font-semibold text-navy">{tx(locale, methodLabel[method])}</h3>
            <p className="mt-1 text-sm leading-relaxed">{tx(locale, info.purpose)}</p>
            <p className="mt-1 text-sm text-muted">{tx(locale, info.equipment)} · {tx(locale, info.prep)}</p>
            <p className="mt-1 text-sm">{tx(locale, info.criterion)}</p>
            {latest ? (
              <p className="mt-2 text-sm font-semibold">
                {latest.value === null ? "—" : `${latest.value} ${latest.unit}`} · {tx(locale, qcStatus[latest.status])} · {say(locale, latest.detailCode, latest.params)}
              </p>
            ) : null}
            <div className="mt-3">
              <ActionButton type="button" onClick={() => act((current, now) => runQc(current, method, now))}>{tx(locale, runTest)}</ActionButton>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function Packaging({
  locale,
  count,
  setCount,
  kind,
  setKind,
  ask,
}: {
  locale: Locale;
  count: number;
  setCount: (value: number) => void;
  kind: "bottle" | "blister";
  setKind: (value: "bottle" | "blister") => void;
  ask: (text: string, run: () => void) => void;
}) {
  const session = useTabletStore((state) => state.session);
  const act = useTabletStore((state) => state.act);
  const lot = activeLots(session).find((item) => item.role === "tablets" && item.location === "pack") ?? activeLots(session).find((item) => item.role === "tablets");
  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed">{tx(locale, packNote)}</p>
      <Field label={tx(locale, packKindLabel)}>
        <select className={inputClass} value={kind} onChange={(event) => setKind(event.target.value as "bottle" | "blister")}>
          <option value="bottle">{tx(locale, bottle)}</option>
          <option value="blister">{tx(locale, blister)}</option>
        </select>
      </Field>
      <Field label={tx(locale, countLabel)} hint={lot?.quality ? `${tx(locale, availableLabel)}: ${lot.quality.count}` : undefined}>
        <input className={inputClass} type="number" min="1" max={lot?.quality?.count ?? 1} value={count} onChange={(event) => setCount(Number(event.target.value))} />
      </Field>
      <ActionButton type="button" onClick={() => ask(tx(locale, packAsk), () => act((current, now) => packSeries(current, kind, count, now)))}>{tx(locale, packAction)}</ActionButton>
    </div>
  );
}

function Mover({ locale, lotId }: { locale: Locale; lotId: string }) {
  const session = useTabletStore((state) => state.session);
  const act = useTabletStore((state) => state.act);
  const lot = session.lots.find((item) => item.id === lotId);
  const [place, setPlace] = useState<LocationId>("mixer");
  if (!lot) {
    return null;
  }
  const places = destinationsFor(lot);
  return (
    <div className="rounded-xl border border-line bg-white p-3">
      <h3 className="font-semibold text-navy">{lotTitle(locale, lot)}</h3>
      <p className="mt-1 text-sm">{massText(locale, lot.massG)} · {roleText(locale, lot.role)}</p>
      {lot.quality ? (
        <p className="mt-1 text-sm text-muted">
          {lot.quality.count} · {lot.quality.meanMassMg} {tx(locale, mg)} · {lot.quality.hardnessN} N · {tx(locale, simulated)}
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <select className={inputClass} value={place} onChange={(event) => setPlace(event.target.value as LocationId)}>
          {places.map((item) => (
            <option key={item} value={item}>{tx(locale, placeName(item))}</option>
          ))}
        </select>
        <ActionButton type="button" tone="secondary" onClick={() => act((current, now) => moveLot(current, lot.id, place, now))}>
          {tx(locale, moveLabel)}
        </ActionButton>
      </div>
    </div>
  );
}

function selectedPortion(session: TabletSession, lineId: string) {
  return session.lots.find((lot) => lot.kind === "portion" && lot.lineId === lineId && !lot.consumed && lot.location === "scale");
}

function placeName(location: LocationId): L {
  const names: Record<LocationId, L> = {
    warehouse: { ru: "Склад", en: "Warehouse", kk: "Қойма" },
    scale: { ru: "Весы", en: "Balances", kk: "Таразы" },
    sieve: { ru: "Сита", en: "Sieves", kk: "Електер" },
    mixer: { ru: "Смеситель", en: "Mixer", kk: "Араластырғыш" },
    liquid: { ru: "Ёмкость", en: "Vessel", kk: "Ыдыс" },
    granulator: { ru: "Гранулятор", en: "Granulator", kk: "Түйіршіктегіш" },
    dryer: { ru: "Сушильный шкаф", en: "Oven", kk: "Кептіргіш шкаф" },
    calibrator: { ru: "Калибратор", en: "Calibrator", kk: "Калибратор" },
    press: { ru: "Пресс", en: "Press", kk: "Пресс" },
    deduster: { ru: "Обеспыливатель", en: "Deduster", kk: "Шаңсыздандырғыш" },
    qc: { ru: "Контроль", en: "Quality control", kk: "Бақылау" },
    pack: { ru: "Упаковка", en: "Packaging", kk: "Қаптау" },
    waste: { ru: "Потери", en: "Waste", kk: "Шығын" },
  };
  return names[location];
}

const identityText: Record<string, L> = {
  quarantine: { ru: "Карантин", en: "Quarantine", kk: "Карантин" },
  identified: { ru: "Идентифицировано, ещё не допущено", en: "Identified, not yet released", kk: "Сәйкестендірілді, әлі жіберілмеді" },
  released: { ru: "Допущено к работе", en: "Released for use", kk: "Жұмысқа жіберілді" },
};

const qcStatus: Record<string, L> = {
  pass: { ru: "соответствует профилю", en: "meets the profile", kk: "профильге сәйкес" },
  fail: { ru: "не соответствует профилю", en: "does not meet the profile", kk: "профильге сәйкес емес" },
  not_applicable: { ru: "не применяется в этом профиле", en: "not applied in this profile", kk: "бұл профильде қолданылмайды" },
};

const qcInfo: Record<QcMethodId, { purpose: L; equipment: L; prep: L; criterion: L }> = {
  appearance: {
    purpose: { ru: "Проверить, что модель не показывает скол и грубые дефекты.", en: "Check that the model does not show capping or gross defects.", kk: "Модель жарықшақ пен дөрекі ақау көрсетпейтінін тексеру." },
    equipment: { ru: "Осмотр на белом фоне.", en: "Inspection on a white background.", kk: "Ақ фонда қарау." },
    prep: { ru: "10 таблеток без разрушения.", en: "10 tablets, not destroyed.", kk: "10 таблетка, бұзылмайды." },
    criterion: { ru: "Учебный профиль: белые круглые таблетки без скола модели.", en: "Teaching profile: white round tablets without modelled capping.", kk: "Оқу профилі: модель жарықшағынсыз ақ дөңгелек таблеткалар." },
  },
  average_mass: {
    purpose: { ru: "Сравнить среднюю массу с массой рецептуры.", en: "Compare the mean mass with the recipe mass.", kk: "Орташа массаны рецептура массасымен салыстыру." },
    equipment: { ru: "Те же весы станции взвешивания.", en: "The same balances as the weighing station.", kk: "Өлшеу станциясындағы таразы." },
    prep: { ru: "20 таблеток возвращаются в серию.", en: "20 tablets are returned to the series.", kk: "20 таблетка серияға қайтарылады." },
    criterion: { ru: `Профиль ${EDU_SPEC.id}: ±5 % от массы твёрдых веществ рецептуры.`, en: `Profile ${EDU_SPEC.id}: ±5 % of the recipe solids mass.`, kk: `${EDU_SPEC.id} профилі: рецептурадағы қатты заттар массасынан ±5 %.` },
  },
  mass_uniformity: {
    purpose: { ru: "Посмотреть разброс отдельных масс. Числа детерминированы моделью, это не взвешивание 20 реальных таблеток.", en: "Inspect the spread of individual masses. The numbers are deterministic model output, not 20 real weighings.", kk: "Жеке массалардың шашырауын көру. Сандар 20 нақты өлшеу емес, модель нәтижесі." },
    equipment: { ru: "Аналитические весы модели.", en: "The model’s analytical balance.", kk: "Модельдің аналитикалық таразысы." },
    prep: { ru: "20 таблеток, выборка не расходуется.", en: "20 tablets; the sample is not consumed.", kk: "20 таблетка, іріктеме жұмсалмайды." },
    criterion: { ru: "Учебное правило профиля: не больше 2 из 20 вне ±5 % и ни одной вне ±10 % от средней массы этой партии.", en: "Profile rule: no more than 2 of 20 outside ±5 % and none outside ±10 % of this lot’s mean mass.", kk: "Профиль ережесі: 20-ның 2-інен артық емес ±5 % тыс және біреуі де ±10 % тыс емес." },
  },
  content_uniformity: {
    purpose: { ru: "Показать, почему для этой дозы испытание однородности дозированных единиц не запускается.", en: "Show why uniformity of dosage units is not started for this dose.", kk: "Бұл доза үшін доза біркелкілігі сынағы неге басталмайтынын көрсету." },
    equipment: { ru: "Отдельный прибор не используется.", en: "No separate instrument is used.", kk: "Бөлек аспап қолданылмайды." },
    prep: { ru: "Проба не отбирается.", en: "No sample is taken.", kk: "Сынама алынбайды." },
    criterion: { ru: "В профиле PAR-500-EDU доза 500 мг и доля субстанции высоки. Для реального препарата применимость берётся из монографии.", en: "In profile PAR-500-EDU the dose is 500 mg and the substance fraction is high. For a real product, applicability comes from the monograph.", kk: "PAR-500-EDU профилінде доза 500 мг. Нақты препарат үшін қолданылу монографиядан алынады." },
  },
  dimensions: {
    purpose: { ru: "Связать толщину с усилием и диаметром пуансона.", en: "Relate thickness to force and punch diameter.", kk: "Қалыңдықты күшпен және пуансон диаметрімен байланыстыру." },
    equipment: { ru: "Толщиномер модели.", en: "The model thickness gauge.", kk: "Модельдің қалыңдық өлшегіші." },
    prep: { ru: "10 таблеток возвращаются.", en: "10 tablets are returned.", kk: "10 таблетка қайтарылады." },
    criterion: { ru: "Толщина ±5 % от расчёта при 14 кН и точном заполнении; диаметр ±0,15 мм.", en: "Thickness ±5 % of the 14 kN calculation at the correct fill; diameter ±0.15 mm.", kk: "Қалыңдық 14 кН есебінен ±5 %; диаметр ±0,15 мм." },
  },
  hardness: {
    purpose: { ru: "Оценить прочность модели. Она растёт с усилием и падает при долгом смешивании стеарата.", en: "Estimate model strength. It rises with force and falls after a long stearate mix.", kk: "Модель беріктігін бағалау. Ол күшпен өседі және стеаратты ұзақ араластырса төмендейді." },
    equipment: { ru: "Прибор прочности, разрушающая выборка.", en: "Hardness tester, destructive sample.", kk: "Беріктік аспабы, бұзатын іріктеме." },
    prep: { ru: "6 таблеток списываются из серии.", en: "6 tablets are removed from the series.", kk: "6 таблетка сериядан есептен шығарылады." },
    criterion: { ru: "Окно профиля 60–140 Н.", en: "Profile window 60–140 N.", kk: "Профиль терезесі 60–140 Н." },
  },
  friability: {
    purpose: { ru: "Оценить потерю массы при модельном истирании. Обеспыливание этот показатель не улучшает.", en: "Estimate mass loss in the model friability test. Dedusting does not improve it.", kk: "Модель үйкелісіндегі масса шығынын бағалау. Шаңсыздандыру оны жақсартпайды." },
    equipment: { ru: "Барабан истираемости.", en: "Friability drum.", kk: "Үйкеліс барабаны." },
    prep: { ru: "Выборка около 6,5 г расходуется.", en: "A sample of about 6.5 g is consumed.", kk: "Шамамен 6,5 г іріктеме жұмсалады." },
    criterion: { ru: "Учебный предел профиля 1,0 %.", en: "Teaching profile limit 1.0 %.", kk: "Оқу профилінің шегі 1,0 %." },
  },
  disintegration: {
    purpose: { ru: "Оценить время распада непокрытой модели.", en: "Estimate disintegration time of the uncoated model.", kk: "Қапталмаған модельдің ыдырау уақытын бағалау." },
    equipment: { ru: "Корзина распадаемости.", en: "Disintegration basket.", kk: "Ыдырағыштық себеті." },
    prep: { ru: "6 таблеток расходуются.", en: "6 tablets are consumed.", kk: "6 таблетка жұмсалады." },
    criterion: { ru: "Учебный предел 15 мин для этой модели. Реальный предел зависит от монографии.", en: "Teaching limit 15 min for this model. A real limit depends on the monograph.", kk: "Бұл модель үшін оқу шегі 15 мин. Нақты шек монографияға байланысты." },
  },
  dissolution: {
    purpose: { ru: "Показать одну расчётную точку 30 мин. Это не испытание растворения.", en: "Show one calculated 30 min point. This is not a dissolution test.", kk: "Бір есептік 30 мин нүктені көрсету. Бұл еру сынағы емес." },
    equipment: { ru: "Условная установка растворения без паспортных оборотов и среды.", en: "A generic dissolution unit without nameplate speed or medium.", kk: "Паспорттық айналым мен ортасыз шартты еру қондырғысы." },
    prep: { ru: "6 таблеток расходуются.", en: "6 tablets are consumed.", kk: "6 таблетка жұмсалады." },
    criterion: { ru: "Учебный порог профиля: не менее 80 % за 30 мин.", en: "Teaching profile threshold: not less than 80 % at 30 min.", kk: "Оқу профилінің шегі: 30 минутта кемінде 80 %." },
  },
  assay: {
    purpose: { ru: "Пересчитать долю парацетамола в таблетке к заявленным 500 мг.", en: "Convert the paracetamol fraction in the tablet to the 500 mg claim.", kk: "Таблеткадағы парацетамол үлесін жарияланған 500 мг-ға қайта есептеу." },
    equipment: { ru: "Условная станция количественного определения, без названия прибора.", en: "A generic assay station, with no instrument name.", kk: "Аспап атауынсыз шартты сандық анықтау станциясы." },
    prep: { ru: "5 таблеток объединённой пробы расходуются.", en: "5 tablets of a composite sample are consumed.", kk: "Біріктірілген сынаманың 5 таблеткасы жұмсалады." },
    criterion: { ru: "Окно профиля 95,0–105,0 % от 500 мг.", en: "Profile window 95.0–105.0 % of 500 mg.", kk: "500 мг-нан 95,0–105,0 % профиль терезесі." },
  },
};

const stopLabel: L = { ru: "Остановить", en: "Stop", kk: "Тоқтату" };
const skipLabel: L = { ru: "Пропустить стадию", en: "Skip stage", kk: "Сатыны өткізу" };
const skipAsk: L = { ru: "Пропустить необязательную стадию? Решение запишется в журнал.", en: "Skip this optional stage? The decision will be written to the journal.", kk: "Міндетті емес сатыны өткізу керек пе? Шешім журналға жазылады." };
const loadLabel: L = { ru: "Загрузить в зону", en: "Load into the station", kk: "Аймаққа жүктеу" };
const yesLabel: L = { ru: "Подтвердить", en: "Confirm", kk: "Растау" };
const noLabel: L = { ru: "Отмена", en: "Cancel", kk: "Болдырмау" };
const checkPassport: L = { ru: "Сверяю наименование, серию и запись входного контроля с этикеткой.", en: "I am comparing the name, batch and incoming-control record with the label.", kk: "Атауын, сериясын және кіріс бақылау жазбасын жапсырмамен салыстырамын." };
const identify: L = { ru: "Подтвердить идентификацию", en: "Confirm identity", kk: "Сәйкестендіруді растау" };
const release: L = { ru: "Допустить в производство", en: "Release for use", kk: "Өндіріске жіберу" };
const targetLabel: L = { ru: "Заданная масса", en: "Target mass", kk: "Берілген масса" };
const toleranceLabel: L = { ru: "Допуск", en: "Tolerance", kk: "Рұқсат" };
const waterWindowLabel: L = { ru: "Учебное окно воды", en: "Teaching water window", kk: "Судың оқу терезесі" };
const tareLabel: L = { ru: "Тара", en: "Tare", kk: "Тара" };
const netLabel: L = { ru: "Нетто", en: "Net", kk: "Нетто" };
const grossLabel: L = { ru: "Брутто", en: "Gross", kk: "Брутто" };
const labBalance: L = { ru: "Лабораторные, 0,01 г", en: "Laboratory, 0.01 g", kk: "Зертханалық, 0,01 г" };
const analyticalBalance: L = { ru: "Аналитические, 0,001 г", en: "Analytical, 0.001 g", kk: "Аналитикалық, 0,001 г" };
const within: L = { ru: "Навеска внутри правила сценария. Её можно подтвердить.", en: "The portion is inside the scenario rule. It can be confirmed.", kk: "Өлшенді сценарий ережесінің ішінде. Оны растауға болады." };
const outsideHint: L = { ru: "Пока подтверждение заблокировано: проверьте режим весов, тару и отклонение.", en: "Confirmation is blocked for now: check the balance mode, tare and deviation.", kk: "Растау әзірге бұғатталған: таразы режимін, тараны және ауытқуды тексеріңіз." };
const confirmWeighLabel: L = { ru: "Подтвердить взвешивание", en: "Confirm weighing", kk: "Өлшеуді растау" };
const returnLabel: L = { ru: "Вернуть на склад", en: "Return to stock", kk: "Қоймаға қайтару" };
const sieveNote: L = { ru: "Доля прохода — учебная функция размера частиц, не результат ситового анализа.", en: "The passed fraction is a teaching particle-size function, not a sieve-analysis result.", kk: "Өткен үлес — бөлшек өлшемінің оқу функциясы, елек талдауының нәтижесі емес." };
const meshLabel: L = { ru: "Сито", en: "Sieve", kk: "Елек" };
const mm: L = { ru: "мм", en: "mm", kk: "мм" };
const mg: L = { ru: "мг", en: "mg", kk: "мг" };
const startLabel: L = { ru: "Запустить операцию", en: "Start operation", kk: "Операцияны бастау" };
const bowlLabel: L = { ru: "Сейчас в чаше", en: "Now in the bowl", kk: "Қазір ыдыста" };
const minutesLabel: L = { ru: "Время, мин", en: "Time, min", kk: "Уақыт, мин" };
const rpmLabel: L = { ru: "Скорость, об/мин", en: "Speed, rpm", kk: "Жылдамдық, айн/мин" };
const lubeHint: L = { ru: "Рекомендуется 1–5 мин. Дольше — учебный признак избыточного смазывания.", en: "1–5 min is recommended. Longer is the teaching sign of overlubrication.", kk: "1–5 мин ұсынылады. Ұзағырақ болса, артық майлаудың оқу белгісі." };
const rsdHint: L = { ru: "RSD после операции будет расчётным, не результатом отбора проб.", en: "The RSD after the operation will be calculated, not sampled.", kk: "Операциядан кейінгі RSD есептеледі, сынамадан алынбайды." };
const densityNote: L = { ru: "Плотность раствора повидона в модели: ρ = 0,997 + 0,25·w. Объём равен массе, делённой на эту плотность.", en: "The model povidone-solution density is ρ = 0.997 + 0.25·w. Volume equals mass divided by that density.", kk: "Модельдегі повидон ерітіндісінің тығыздығы: ρ = 0,997 + 0,25·w. Көлем массаны осы тығыздыққа бөлгенге тең." };
const impellerLabel: L = { ru: "Мешалка, об/мин", en: "Impeller, rpm", kk: "Араластырғыш, айн/мин" };
const tempLabel: L = { ru: "Температура, °C", en: "Temperature, °C", kk: "Температура, °C" };
const forecastLabel: L = { ru: "Прогноз расчётной влажности", en: "Forecast calculated moisture", kk: "Есептік ылғалдылық болжамы" };
const removedLabel: L = { ru: "Вода, которую модель удалит", en: "Water the model would remove", kk: "Модель шығаратын су" };
const simulated: L = { ru: "Симуляция, не измерение.", en: "Simulation, not a measurement.", kk: "Симуляция, өлшеу емес." };
const recordMoisture: L = { ru: "Записать расчётную влажность", en: "Record calculated moisture", kk: "Есептік ылғалдылықты жазу" };
const finesNote: L = { ru: "Мелочь можно затем перенести в смеситель внешней фазы. Масса не копируется.", en: "Fines can then be moved into the external-phase mixer. The mass is not copied.", kk: "Ұсақ фракцияны кейін сыртқы фаза араластырғышына көшіруге болады. Масса көшірілмейді." };
const pressKindLabel: L = { ru: "Тип пресса", en: "Press type", kk: "Пресс түрі" };
const singlePunch: L = { ru: "Однопуансонный", en: "Single-punch", kk: "Бір пуансонды" };
const rotaryPress: L = { ru: "Роторный, учебные 8 станций", en: "Rotary, 8 teaching stations", kk: "Роторлы, 8 оқу станциясы" };
const forceLabel: L = { ru: "Усилие, кН", en: "Force, kN", kk: "Күш, кН" };
const strokeLabel: L = { ru: "Циклы в минуту", en: "Cycles per minute", kk: "Минутына цикл" };
const turretLabel: L = { ru: "Ротор, об/мин", en: "Turret, rpm", kk: "Ротор, айн/мин" };
const precompLabel: L = { ru: "Предварительное усилие, кН", en: "Precompression, kN", kk: "Алдын ала күш, кН" };
const fillLabel: L = { ru: "Глубина заполнения, мм", en: "Fill depth, mm", kk: "Толтыру тереңдігі, мм" };
const diameterLabel: L = { ru: "Диаметр пуансона", en: "Punch diameter", kk: "Пуансон диаметрі" };
const suggestedLabel: L = { ru: "Расчётная глубина под массу рецептуры", en: "Calculated depth for the recipe mass", kk: "Рецептура массасына есептік тереңдік" };
const lossNote: L = { ru: "Учебные потери прессования 2 % массы, прошедшей через матрицу. Бесконечный выпуск одним нажатием невозможен.", en: "Teaching compression loss is 2 % of the mass that passes through the die. One click cannot create an unlimited batch.", kk: "Престеудің оқу шығыны матрицадан өткен массаның 2 %. Бір басу шексіз серия жасамайды." };
const tabletTarget: L = { ru: "Масса твёрдых веществ одной таблетки", en: "Solids mass of one tablet", kk: "Бір таблетканың қатты заттарының массасы" };
const useFill: L = { ru: "Подставить расчётную глубину", en: "Use the calculated depth", kk: "Есептік тереңдікті қою" };
const confirmSetup: L = { ru: "Подтвердить настройку", en: "Confirm setup", kk: "Баптауды растау" };
const pressAsk: L = { ru: "Запустить прессование? Масса смеси будет пересчитана в конечное число таблеток.", en: "Start compression? The blend mass will be converted into a finite tablet count.", kk: "Престеуді бастау керек пе? Қоспа массасы таблетканың ақырлы санына қайта есептеледі." };
const punchCaption: L = { ru: "Заполнение, прессование, выталкивание", en: "Fill, compress, eject", kk: "Толтыру, престеу, шығару" };
const rotaryCaption: L = { ru: "Ротор и ролики, учебная схема", en: "Rotor and rolls, teaching diagram", kk: "Ротор және біліктер, оқу схемасы" };
const dedustNote: L = { ru: "Снимется около 0,4 % массы как пыль. Число таблеток и твёрдость не изменятся.", en: "About 0.4 % of the mass is removed as dust. Tablet count and hardness stay the same.", kk: "Массаның шамамен 0,4 % шаң ретінде алынады. Таблетка саны мен беріктік өзгермейді." };
const qcBanner: L = { ru: "Все числа ниже — симуляция профиля PAR-500-EDU. Они не заменяют испытание, квалификацию оборудования и нормы действующей фармакопеи.", en: "Every figure below is a PAR-500-EDU profile simulation. It does not replace a test, equipment qualification or a current pharmacopoeia limit.", kk: "Төмендегі сандардың бәрі PAR-500-EDU профилінің симуляциясы. Олар сынақты, жабдық біліктілігін және қолданыстағы фармакопея нормасын алмастырмайды." };
const runTest: L = { ru: "Выполнить учебное испытание", en: "Run teaching test", kk: "Оқу сынағын орындау" };
const packNote: L = { ru: "Маркировка учебная. Номер регистрационного удостоверения и разрешение на выпуск не формируются.", en: "The label is educational. No marketing-authorisation number or release permission is created.", kk: "Таңба оқуға арналған. Тіркеу куәлігінің нөмірі және шығару рұқсаты жасалмайды." };
const packKindLabel: L = { ru: "Упаковка", en: "Pack", kk: "Қаптама" };
const bottle: L = { ru: "Учебный флакон", en: "Teaching bottle", kk: "Оқу құтысы" };
const blister: L = { ru: "Учебный блистер", en: "Teaching blister", kk: "Оқу блистері" };
const countLabel: L = { ru: "Число таблеток", en: "Tablet count", kk: "Таблетка саны" };
const availableLabel: L = { ru: "Доступно", en: "Available", kk: "Қолжетімді" };
const packAction: L = { ru: "Упаковать", en: "Pack", kk: "Қаптау" };
const packAsk: L = { ru: "Перенести выбранное число таблеток в учебную упаковку?", en: "Move the selected number of tablets into the teaching pack?", kk: "Таңдалған таблетка санын оқу қаптамасына көшіру керек пе?" };
const moveLabel: L = { ru: "Переместить", en: "Move", kk: "Көшіру" };
