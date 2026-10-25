import { describe, expect, it } from "vitest";
import { EDU_SPEC, recipeFor, solidsMg } from "@/tableting/catalog";
import {
  acknowledgeMoisture,
  activeLots,
  balanceSheet,
  chooseRoute,
  closeSeries,
  confirmIdentity,
  confirmPressSetup,
  confirmWeigh,
  createSession,
  driedMoisture,
  granuleQuality,
  loadStage,
  massAfterDrying,
  moveLot,
  packSeries,
  releaseLot,
  roundMass,
  runQc,
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
  suggestFill,
  targetGrams,
  tick,
} from "@/tableting/engine";
import type { ActionResult, QcMethodId, TabletSession } from "@/tableting/types";

const NOW = "2026-10-25T12:00:00.000Z";

function done(result: ActionResult, code?: string) {
  expect(result.ok, `${result.code} ${JSON.stringify(result.params)}`).toBe(true);
  if (code) {
    expect(result.code).toBe(code);
  }
  return result.session;
}

function fast(session: TabletSession) {
  expect(session.job).not.toBeNull();
  return tick(session, (session.job?.durationMs ?? 0) + 20, NOW);
}

function releaseAll(session: TabletSession) {
  let next = session;
  for (const lot of session.lots.filter((item) => item.kind === "stock")) {
    if (lot.identity === "quarantine") {
      next = done(confirmIdentity(next, lot.id, NOW));
    }
    const current = next.lots.find((item) => item.id === lot.id);
    if (current?.identity === "identified") {
      next = done(releaseLot(next, lot.id, NOW));
    }
  }
  return next;
}

function portion(session: TabletSession, lineId: string) {
  return activeLots(session).find((lot) => lot.kind === "portion" && lot.lineId === lineId);
}

function weighAll(session: TabletSession, analyticalLines: string[] = []) {
  const recipe = recipeFor(session.route!);
  let next = session;
  for (const line of recipe.lines) {
    next = done(setBalanceMode(next, analyticalLines.includes(line.id) ? "analytical" : "lab", NOW));
    next = done(setTare(next, 12.5, NOW));
    const target = targetGrams(recipe, line, next.batchTablets);
    next = done(setDraftNet(next, target, NOW));
    const confirmed = confirmWeigh({ ...next, weigh: { ...next.weigh, lineId: line.id } }, NOW);
    next = done(confirmed);
  }
  return next;
}

describe("tableting material balance", () => {
  it("converts milligrams to grams and keeps the direct-compression target", () => {
    const recipe = recipeFor("direct");
    expect(targetGrams(recipe, recipe.lines[0]!, 120)).toBe(60);
    expect(solidsMg(recipe)).toBe(628);
    expect(roundMass(0.1 + 0.2)).toBeCloseTo(0.3, 6);
  });

  it("blocks use before identity and release, and does not duplicate a moved portion", () => {
    let session = done(chooseRoute(createSession(), "direct", NOW));
    const stock = session.lots.find((lot) => lot.lineId === "api");
    expect(stock).toBeTruthy();
    const denied = releaseLot(session, stock!.id, NOW);
    expect(denied.ok).toBe(false);
    expect(denied.code).toBe("release_need_identity");
    session = done(confirmIdentity(session, stock!.id, NOW));
    session = releaseAll(session);
    session = weighAll(session, ["sio2", "mgst"]);
    const weighed = portion(session, "api");
    expect(weighed).toBeTruthy();
    const before = activeLots(session).filter((lot) => lot.kind === "portion").length;
    const mass = weighed!.massG;
    session = done(moveLot(session, weighed!.id, "mixer", NOW));
    const copies = activeLots(session).filter((lot) => lot.kind === "portion" && lot.lineId === "api");
    expect(copies).toHaveLength(1);
    expect(copies[0]?.massG).toBe(mass);
    expect(copies[0]?.location).toBe("mixer");
    expect(activeLots(session).filter((lot) => lot.kind === "portion")).toHaveLength(before);
    expect(balanceSheet(session).gapG).toBe(0);
  });

  it("rejects an out-of-tolerance weight without changing stock", () => {
    let session = done(chooseRoute(createSession(), "direct", NOW));
    session = releaseAll(session);
    const stock = session.lots.find((lot) => lot.lineId === "api")!;
    session = done(setTare(session, 10, NOW));
    session = done(setDraftNet(session, 10, NOW));
    const result = confirmWeigh({ ...session, weigh: { ...session.weigh, lineId: "api" } }, NOW);
    expect(result.ok).toBe(false);
    expect(result.code).toBe("weigh_outside");
    expect(result.session.lots.find((lot) => lot.id === stock.id)?.massG).toBe(stock.massG);
    expect(result.session.inputsG).toBe(0);
  });

  it("keeps sieve fractions equal to the feed", () => {
    let session = done(chooseRoute(createSession(), "direct", NOW));
    session = releaseAll(session);
    session = weighAll(session, ["sio2", "mgst"]);
    const api = portion(session, "api")!;
    session = done(moveLot(session, api.id, "sieve", NOW));
    session = done(setSieve(session, { meshMm: 0.5 }, NOW));
    session = done(startSieve(session, api.id, NOW));
    session = fast(session);
    const children = session.lots.filter((lot) => lot.parentIds.includes(api.id) && !lot.consumed);
    expect(roundMass(children.reduce((total, lot) => total + lot.massG, 0))).toBe(api.massG);
    expect(balanceSheet(session).gapG).toBe(0);
  });

  it("completes direct compression without drying and conserves mass", () => {
    let session = done(chooseRoute(createSession(), "direct", NOW));
    expect(stageView(session, "drying").status).toBe("unavailable");
    expect(stageView(session, "granulation").reason).toBe("gate_not_in_route");
    session = releaseAll(session);
    session = weighAll(session, ["sio2", "mgst"]);
    session = done(skipStage(session, "sieving", NOW));
    session = done(loadStage(session, "premix", NOW));
    session = done(setMixer(session, { minutes: 8, rpm: 30 }, NOW));
    session = done(startPremix(session, NOW));
    const second = startPremix(session, NOW);
    expect(second.ok).toBe(false);
    expect(second.code).toBe("job_busy");
    session = fast(session);
    const lubricant = portion(session, "mgst")!;
    session = done(moveLot(session, lubricant.id, "mixer", NOW));
    session = done(setMixer(session, { minutes: 2, rpm: 20 }, NOW));
    session = done(startLubrication(session, NOW));
    session = fast(session);
    const fill = suggestFill(session);
    expect(fill).not.toBeNull();
    session = done(setPress(session, { kind: "single_punch", forceKn: 14, speedPerMin: 30, fillDepthMm: fill!, punchDiameterMm: 12 }, NOW));
    session = done(confirmPressSetup(session, NOW));
    session = done(loadStage(session, "compression", NOW));
    const blockedDry = startDrying(session, NOW);
    expect(blockedDry.ok).toBe(false);
    session = done(startCompression(session, NOW));
    session = fast(session);
    const tablets = activeLots(session).find((lot) => lot.role === "tablets");
    expect(tablets?.quality?.count).toBeGreaterThan(20);
    expect(tablets?.quality?.simulated).toBe(true);
    const produced = tablets!.quality!.count;
    const available = 74;
    expect(produced).toBeLessThanOrEqual(Math.floor((session.inputsG * (1 - EDU_SPEC.pressLossFraction)) / (solidsMg(recipeFor("direct")) / 1000)) + 2);
    expect(produced).toBeGreaterThan(available);
    expect(Math.abs(balanceSheet(session).gapG)).toBeLessThan(0.001);
    const hardness = tablets!.quality!.hardnessN;
    session = done(loadStage(session, "dedusting", NOW));
    session = done(startDedust(session, NOW));
    session = fast(session);
    const dedusted = activeLots(session).find((lot) => lot.role === "tablets")!;
    expect(dedusted.quality?.hardnessN).toBe(hardness);
    expect(dedusted.quality?.count).toBe(produced);
    expect(dedusted.massG).toBeLessThan(tablets!.massG);
    session = done(loadStage(session, "qc", NOW));
    const methods: QcMethodId[] = ["appearance", "average_mass", "mass_uniformity", "content_uniformity", "dimensions", "hardness", "friability", "disintegration", "dissolution", "assay"];
    for (const method of methods) {
      session = done(runQc({ ...session, selectedLotId: dedusted.id }, method, NOW));
    }
    expect(session.qcRuns.every((run) => run.seriesId === session.seriesId)).toBe(true);
    expect(session.qcRuns.find((run) => run.method === "content_uniformity")?.status).toBe("not_applicable");
    session = done(loadStage(session, "packaging", NOW));
    const left = activeLots(session).find((lot) => lot.role === "tablets")!;
    session = done(packSeries({ ...session, selectedLotId: left.id }, "bottle", left.quality!.count, NOW));
    session = done(closeSeries(session, NOW));
    expect(session.report?.simulation).toBe(true);
    expect(session.report?.route).toBe("direct");
    expect(session.closed).toBe(true);
    expect(Math.abs(balanceSheet(session).gapG)).toBeLessThan(0.001);
  });

  it("does not let a wet-granulation batch skip granulation or treat time as proof of dryness", () => {
    let session = done(chooseRoute(createSession(), "wet_granulation", NOW));
    expect(stageView(session, "compression").status).toBe("blocked");
    expect(startCompression(session, NOW).ok).toBe(false);
    session = releaseAll(session);
    session = weighAll(session, ["sio2", "mgst"]);
    session = done(skipStage(session, "sieving", NOW));
    session = done(loadStage(session, "premix", NOW));
    session = done(setMixer(session, { minutes: 6, rpm: 30 }, NOW));
    session = done(startPremix(session, NOW));
    session = fast(session);
    session = done(loadStage(session, "granulating_liquid", NOW));
    session = done(startLiquid(session, NOW));
    session = fast(session);
    const liquid = activeLots(session).find((lot) => lot.role === "granulating_liquid")!;
    expect(liquid.volumeMl).toBeGreaterThan(0);
    expect(liquid.volumeMl).not.toBe(liquid.massG);
    session = done(loadStage(session, "granulation", NOW));
    session = done(setGranulator(session, { minutes: 2, impellerRpm: 180 }, NOW));
    session = done(startGranulation(session, NOW));
    session = fast(session);
    const short = activeLots(session).find((lot) => lot.role === "wet_granules")!.granuleQuality;
    expect(granuleQuality(0.08, 2)).toBeLessThan(granuleQuality(0.18, 6));
    expect(short).toBeLessThan(0.9);
    session = done(skipStage(session, "wet_screening", NOW));
    session = done(loadStage(session, "drying", NOW));
    const wetMass = activeLots(session).find((lot) => lot.role === "wet_granules")!.massG;
    session = done(setDryer(session, { temperatureC: 30, minutes: 10 }, NOW));
    expect(startDrying(session, NOW).code).toBe("dry_temp_range");
    session = done(setDryer(session, { temperatureC: 45, minutes: 8 }, NOW));
    session = done(startDrying(session, NOW));
    session = fast(session);
    const damp = activeLots(session).find((lot) => lot.role === "granules")!;
    expect(damp.moistureFraction).toBeGreaterThan(EDU_SPEC.moistureMax);
    expect(damp.massG).toBeLessThan(wetMass);
    expect(session.marks.drying).toBe("warning");
    expect(stageView(session, "compression").status).toBe("blocked");
    session = done(moveLot(session, damp.id, "dryer", NOW));
    session = done(setDryer(session, { temperatureC: 60, minutes: 45 }, NOW));
    session = done(startDrying(session, NOW));
    session = fast(session);
    const dry = activeLots(session).find((lot) => lot.role === "granules")!;
    expect(dry.moistureFraction).toBeLessThanOrEqual(EDU_SPEC.moistureMax);
    expect(dry.moistureFraction).toBeGreaterThanOrEqual(EDU_SPEC.moistureMin);
    const removed = roundMass(wetMass - dry.massG);
    expect(removed).toBeGreaterThan(0);
    expect(Math.abs(balanceSheet(session).gapG)).toBeLessThan(0.001);
    session = done(acknowledgeMoisture(session, NOW));
    session = done(loadStage(session, "sizing", NOW));
    session = done(startSizing(session, NOW));
    session = fast(session);
    const sized = activeLots(session).filter((lot) => lot.role === "granules" || lot.role === "fines");
    expect(roundMass(sized.reduce((total, lot) => total + lot.massG, 0))).toBeCloseTo(dry.massG, 4);
    session = done(loadStage(session, "final_blend", NOW));
    session = done(setMixer(session, { minutes: 5, rpm: 25 }, NOW));
    session = done(startFinal(session, NOW));
    session = fast(session);
    const lubricant = portion(session, "mgst")!;
    session = done(moveLot(session, lubricant.id, "mixer", NOW));
    session = done(setMixer(session, { minutes: 2, rpm: 20 }, NOW));
    session = done(startLubrication(session, NOW));
    session = fast(session);
    const fill = suggestFill(session)!;
    session = done(setPress(session, { kind: "rotary", forceKn: 16, speedPerMin: 20, precompressionKn: 2, fillDepthMm: Math.min(14, Math.max(4, fill)), punchDiameterMm: 12 }, NOW));
    session = done(confirmPressSetup(session, NOW));
    session = done(loadStage(session, "compression", NOW));
    session = done(startCompression(session, NOW));
    session = fast(session);
    const tablets = activeLots(session).find((lot) => lot.role === "tablets")!;
    expect(tablets.quality?.count).toBeGreaterThan(10);
    expect(tablets.quality?.count).toBeLessThanOrEqual(session.batchTablets);
    expect(Math.abs(balanceSheet(session).gapG)).toBeLessThan(0.001);
    expect(closeSeries(session, NOW).ok).toBe(false);
  });

  it("removes only water during drying and keeps a low temperature from looking dry", () => {
    const cool = driedMoisture(0.16, 45, 8);
    const warm = driedMoisture(0.16, 60, 45);
    expect(cool).toBeGreaterThan(warm);
    expect(cool).toBeGreaterThan(EDU_SPEC.moistureMax);
    expect(massAfterDrying(100, 0.16, cool)).toBeLessThan(100);
    expect(massAfterDrying(100, 0.16, cool)).toBeGreaterThan(massAfterDrying(100, 0.16, warm));
  });

  it("does not invent tablets when the press has no usable mass", () => {
    let session = done(chooseRoute(createSession(), "direct", NOW));
    session = releaseAll(session);
    expect(startCompression(session, NOW).ok).toBe(false);
    expect(activeLots(session).some((lot) => lot.role === "tablets")).toBe(false);
  });
});
