import {
  EDU_SPEC,
  isOptional,
  materials,
  recipeFor,
  qcMethods,
  solidsMg,
  stagesFor,
  targetMg,
  type Recipe,
  type RecipeLine,
} from "@/tableting/catalog";
import type {
  ActionResult,
  BalanceMode,
  DryerState,
  GranulatorState,
  LocationId,
  Lot,
  MaterialRole,
  MixerState,
  NoticeTone,
  PackKind,
  Params,
  PressState,
  QcMethodId,
  QcRun,
  SeriesReport,
  SieveState,
  StageId,
  StageView,
  TabletQuality,
  TabletRouteId,
  TabletSession,
  WeighState,
} from "@/tableting/types";

const EPS = 1e-6;

export function roundMass(value: number) {
  if (!Number.isFinite(value)) {
    return Number.NaN;
  }
  return Math.round(value * 1e6) / 1e6;
}

export function gramsFromMg(mg: number) {
  return roundMass(mg / 1000);
}

function num(value: number, digits = 4) {
  return Math.round(value * 10 ** digits) / 10 ** digits;
}

function sum(values: number[]) {
  return roundMass(values.reduce((total, value) => total + value, 0));
}

export function createSession(): TabletSession {
  return {
    seq: 1,
    seriesId: null,
    route: null,
    batchTablets: EDU_SPEC.batchDefault,
    view: "floor",
    guidance: "guided",
    reducedMotion: false,
    selectedStage: "intake",
    selectedLotId: null,
    selectedEquipmentId: "balance_lab",
    marks: {},
    lots: [],
    weigh: emptyWeigh(),
    press: emptyPress(),
    dryer: { temperatureC: 55, minutes: 40 },
    mixer: { minutes: 8, rpm: 30 },
    sieve: { meshMm: 0.8 },
    granulator: { minutes: 6, impellerRpm: 200 },
    job: null,
    journal: [],
    notices: [],
    losses: [],
    inputsG: 0,
    weighedByLine: {},
    qcRuns: [],
    packed: [],
    report: null,
    closed: false,
    moistureAcknowledged: false,
    floor: { x: 0, y: 0, scale: 1 },
  };
}

function emptyWeigh(): WeighState {
  return { lineId: null, tareG: null, zeroed: false, draftNetG: null, mode: "lab" };
}

function emptyPress(): PressState {
  return {
    kind: "single_punch",
    forceKn: 14,
    speedPerMin: 30,
    precompressionKn: 1.5,
    fillDepthMm: 8,
    punchDiameterMm: 12,
    setupConfirmed: false,
  };
}

function blankLot(seed: Omit<Lot, "consumed" | "dedusted" | "quality" | "volumeMl" | "densityGPerMl" | "granuleQuality" | "lubricantMinutes" | "rsdPercent"> & Partial<Lot>): Lot {
  return {
    volumeMl: null,
    densityGPerMl: null,
    granuleQuality: null,
    lubricantMinutes: 0,
    rsdPercent: null,
    consumed: false,
    dedusted: false,
    quality: null,
    ...seed,
    massG: roundMass(seed.massG),
  };
}

function recipeOf(session: TabletSession) {
  return session.route ? recipeFor(session.route) : null;
}

function lineOf(recipe: Recipe, lineId: string) {
  return recipe.lines.find((line) => line.id === lineId);
}

export function targetGrams(recipe: Recipe, line: RecipeLine, batchTablets: number) {
  return gramsFromMg(targetMg(recipe, line) * batchTablets);
}

export function toleranceGrams(targetG: number, water: boolean) {
  if (water) {
    return roundMass(Math.max(targetG * 0.05, 0.05));
  }
  if (targetG < 1) {
    return 0.005;
  }
  return roundMass(targetG * 0.01);
}

export function readabilityGrams(mode: BalanceMode) {
  return mode === "analytical" ? 0.001 : 0.01;
}

export function activeLots(session: TabletSession) {
  return session.lots.filter((lot) => !lot.consumed && lot.massG > EPS);
}

function bump(session: TabletSession, prefix: string) {
  const seq = session.seq + 1;
  return { session: { ...session, seq }, id: `${prefix}-${seq}` };
}

function pushNotice(session: TabletSession, tone: NoticeTone, code: string, params: Params, now: string) {
  const next = bump(session, "n");
  return {
    ...next.session,
    notices: [{ id: next.id, at: now, tone, code, params }, ...session.notices].slice(0, 12),
  };
}

function pushJournal(
  session: TabletSession,
  stage: StageId,
  code: string,
  params: Params,
  massInG: number | null,
  massOutG: number | null,
  lossG: number | null,
  now: string,
) {
  const next = bump(session, "log");
  return {
    ...next.session,
    journal: [
      { id: next.id, at: now, stage, code, params, massInG, massOutG, lossG },
      ...session.journal,
    ].slice(0, 400),
  };
}

function finish(
  session: TabletSession,
  ok: boolean,
  tone: NoticeTone,
  code: string,
  params: Params,
  now: string,
  journalStage?: StageId,
  masses?: { massInG?: number; massOutG?: number; lossG?: number },
): ActionResult {
  let next = session;
  if (journalStage) {
    next = pushJournal(
      next,
      journalStage,
      code,
      params,
      masses?.massInG ?? null,
      masses?.massOutG ?? null,
      masses?.lossG ?? null,
      now,
    );
  }
  next = pushNotice(next, tone, code, params, now);
  return { ok, session: next, tone, code, params };
}

function ok(session: TabletSession, code: string, params: Params, now: string, stage?: StageId, masses?: { massInG?: number; massOutG?: number; lossG?: number }, tone: NoticeTone = "success"): ActionResult {
  return finish(session, true, tone, code, params, now, stage, masses);
}

function fail(session: TabletSession, code: string, params: Params, now: string, tone: NoticeTone = "error"): ActionResult {
  return finish(session, false, tone, code, params, now);
}

function guard(session: TabletSession, now: string) {
  if (session.closed) {
    return fail(session, "series_closed", {}, now);
  }
  if (session.job) {
    return fail(session, "job_busy", { stage: session.job.stage }, now);
  }
  return null;
}

function replaceLot(session: TabletSession, id: string, lot: Lot) {
  return { ...session, lots: session.lots.map((item) => (item.id === id ? lot : item)) };
}

function consumeLot(lot: Lot): Lot {
  return { ...lot, consumed: true, massG: 0 };
}

function addLoss(session: TabletSession, stage: StageId, code: string, grams: number) {
  const mass = roundMass(grams);
  if (mass <= EPS) {
    return session;
  }
  const next = bump(session, "loss");
  return {
    ...next.session,
    losses: [...session.losses, { id: next.id, stage, code, grams: mass }],
  };
}

function weighted(lots: Lot[], pick: (lot: Lot) => number) {
  const mass = sum(lots.map((lot) => lot.massG));
  if (mass <= EPS) {
    return 0;
  }
  return sum(lots.map((lot) => lot.massG * pick(lot))) / mass;
}

export function passFraction(meshMm: number, d50Mm: number) {
  if (d50Mm <= 0) {
    return 1;
  }
  const ratio = Math.max(meshMm, 0) / d50Mm;
  const fraction = 1 - Math.exp(-(ratio ** 1.4));
  return Math.min(0.995, Math.max(0.05, fraction));
}

export function blendRsd(minutes: number, rpm: number, components: number) {
  const intensity = Math.max(0.2, minutes * (rpm / 30));
  return num(6.5 * Math.exp(-intensity / 6) + 0.8 + Math.max(0, components - 2) * 0.05, 3);
}

export function solutionDensity(solidsG: number, waterG: number) {
  const total = solidsG + waterG;
  if (total <= EPS) {
    return 0.997;
  }
  return num(0.997 + 0.25 * (solidsG / total), 4);
}

export function granuleQuality(liquidToPowder: number, minutes: number) {
  let quality = 0.4;
  if (liquidToPowder < 0.1) {
    quality = 0.35;
  } else if (liquidToPowder < 0.14) {
    quality = 0.7;
  } else if (liquidToPowder <= 0.22) {
    quality = 0.95;
  } else if (liquidToPowder <= 0.28) {
    quality = 0.62;
  } else {
    quality = 0.3;
  }
  if (minutes < 3) {
    quality *= 0.75;
  }
  return num(quality, 3);
}

export function driedMoisture(initial: number, tempC: number, minutes: number) {
  const equilibrium = tempC >= 68 ? 0.005 : 0.012;
  const rate = Math.max(0, (tempC - 25) / 40) * 0.08;
  const value = equilibrium + (initial - equilibrium) * Math.exp(-rate * Math.max(0, minutes));
  return num(Math.max(0.004, value), 4);
}

export function massAfterDrying(massG: number, moisture0: number, moisture1: number) {
  const solids = massG * (1 - moisture0);
  if (moisture1 >= 0.999) {
    return roundMass(massG);
  }
  return roundMass(Math.min(massG, solids / (1 - moisture1)));
}

export function requiredFillMm(targetMassG: number, bulkDensity: number, diameterMm: number) {
  const radiusCm = diameterMm / 20;
  const area = Math.PI * radiusCm * radiusCm;
  const volumeMl = targetMassG / Math.max(bulkDensity, 0.05);
  return num((volumeMl / area) * 10, 2);
}

function syncFront(session: TabletSession) {
  const recipe = recipeOf(session);
  if (!recipe) {
    return session;
  }
  const released = recipe.lines.every((line) => {
    const stock = session.lots.find((lot) => lot.kind === "stock" && lot.lineId === line.id && !lot.consumed);
    return stock?.identity === "released";
  });
  const weighed = recipe.lines.every((line) =>
    session.lots.some((lot) => lot.kind === "portion" && lot.lineId === line.id && !lot.consumed && lot.massG > EPS),
  );
  const marks = { ...session.marks };
  if (released) {
    marks.intake = "done";
  } else {
    delete marks.intake;
  }
  if (weighed) {
    marks.weighing = "done";
  } else {
    delete marks.weighing;
  }
  return { ...session, marks };
}

function mark(session: TabletSession, stage: StageId, value: "done" | "warning" | "skipped") {
  return { ...session, marks: { ...session.marks, [stage]: value } };
}

function hasProgress(session: TabletSession) {
  return Boolean(
    session.inputsG > EPS ||
      session.job ||
      session.qcRuns.length ||
      session.packed.length ||
      Object.keys(session.marks).length ||
      session.lots.some((lot) => lot.kind !== "stock" || lot.identity !== "quarantine"),
  );
}

export function chooseRoute(session: TabletSession, route: TabletRouteId, now: string, force = false): ActionResult {
  if (session.route === route && session.seriesId) {
    return ok(session, "route_same", { route }, now, undefined, undefined, "info");
  }
  if (hasProgress(session) && !force) {
    return fail(session, "route_busy", { route }, now);
  }
  const seeded = bump(session, "series");
  const day = now.slice(0, 10).replaceAll("-", "");
  const code = route === "direct" ? "DC" : "WG";
  const seriesId = `EDU-TAB-${code}-${day}-${seeded.session.seq}`;
  let seq = seeded.session.seq;
  const recipe = recipeFor(route);
  const lots = recipe.lines.map((line) => {
    const def = materials[line.materialId];
    seq += 1;
    return blankLot({
      id: `lot-${seq}`,
      materialId: line.materialId,
      nameKey: line.materialId,
      role: line.role,
      kind: "stock",
      batch: def.batch,
      massG: def.stockG,
      moistureFraction: def.moisture,
      apiFraction: def.apiFraction,
      location: "warehouse",
      identity: "quarantine",
      parentIds: [],
      seriesId,
      lineId: line.id,
      d50Mm: def.d50Mm,
      bulkDensityGPerMl: def.bulkDensity,
    });
  });
  const next: TabletSession = {
    ...createSession(),
    seq,
    seriesId,
    route,
    batchTablets: session.batchTablets,
    view: session.view,
    guidance: session.guidance,
    reducedMotion: session.reducedMotion,
    floor: session.floor,
    lots,
    selectedStage: "intake",
    selectedLotId: lots[0]?.id ?? null,
  };
  return ok(next, "route_set", { route, seriesId }, now, "intake");
}

export function setBatch(session: TabletSession, batchTablets: number, now: string): ActionResult {
  if (!EDU_SPEC.batchChoices.includes(batchTablets as (typeof EDU_SPEC.batchChoices)[number])) {
    return fail(session, "batch_range", {}, now);
  }
  if (session.inputsG > EPS || session.lots.some((lot) => lot.kind === "portion" && !lot.consumed)) {
    return fail(session, "batch_locked", {}, now);
  }
  return ok({ ...session, batchTablets }, "batch_set", { batch: batchTablets }, now, undefined, undefined, "info");
}

export function confirmIdentity(session: TabletSession, lotId: string, now: string): ActionResult {
  const blocked = guard(session, now);
  if (blocked) {
    return blocked;
  }
  const lot = session.lots.find((item) => item.id === lotId);
  if (!lot || lot.kind !== "stock") {
    return fail(session, "lot_missing", {}, now);
  }
  if (lot.identity !== "quarantine") {
    return fail(session, "identity_state", { state: lot.identity }, now);
  }
  const next = syncFront(replaceLot(session, lot.id, { ...lot, identity: "identified" }));
  return ok(next, "identity_ok", { materialId: lot.materialId, batch: lot.batch }, now, "intake");
}

export function releaseLot(session: TabletSession, lotId: string, now: string): ActionResult {
  const blocked = guard(session, now);
  if (blocked) {
    return blocked;
  }
  const lot = session.lots.find((item) => item.id === lotId);
  if (!lot || lot.kind !== "stock") {
    return fail(session, "lot_missing", {}, now);
  }
  if (lot.identity === "quarantine") {
    return fail(session, "release_need_identity", { materialId: lot.materialId }, now);
  }
  if (lot.identity === "released") {
    return fail(session, "already_released", { materialId: lot.materialId }, now, "info");
  }
  const next = syncFront(replaceLot(session, lot.id, { ...lot, identity: "released" }));
  return ok(next, "release_ok", { materialId: lot.materialId }, now, "intake");
}

export function selectWeighLine(session: TabletSession, lineId: string, now: string): ActionResult {
  const recipe = recipeOf(session);
  if (!recipe || !lineOf(recipe, lineId)) {
    return fail(session, "line_missing", {}, now);
  }
  return ok(
    { ...session, weigh: { ...session.weigh, lineId, draftNetG: null }, selectedStage: "weighing" },
    "weigh_selected",
    { lineId },
    now,
    undefined,
    undefined,
    "info",
  );
}

export function setBalanceMode(session: TabletSession, mode: BalanceMode, now: string): ActionResult {
  return ok({ ...session, weigh: { ...session.weigh, mode } }, "balance_mode", { mode }, now, undefined, undefined, "info");
}

export function setTare(session: TabletSession, tareG: number, now: string): ActionResult {
  if (!Number.isFinite(tareG) || tareG < 0.1 || tareG > 500) {
    return fail(session, "tare_range", {}, now);
  }
  return ok(
    { ...session, weigh: { ...session.weigh, tareG: num(tareG, 3), zeroed: true, draftNetG: null } },
    "tare_set",
    { tare: num(tareG, 3) },
    now,
    "weighing",
  );
}

export function setDraftNet(session: TabletSession, draftNetG: number, now: string): ActionResult {
  if (!Number.isFinite(draftNetG) || draftNetG < 0) {
    return fail(session, "mass_invalid", {}, now);
  }
  return {
    ok: true,
    session: { ...session, weigh: { ...session.weigh, draftNetG } },
    tone: "info",
    code: "draft_set",
    params: {},
  };
}

export function confirmWeigh(session: TabletSession, now: string): ActionResult {
  const blocked = guard(session, now);
  if (blocked) {
    return blocked;
  }
  const recipe = recipeOf(session);
  if (!recipe || session.marks.intake !== "done") {
    return fail(session, "gate_need_intake", {}, now);
  }
  const line = session.weigh.lineId ? lineOf(recipe, session.weigh.lineId) : undefined;
  if (!line || session.weigh.tareG === null || !session.weigh.zeroed || session.weigh.draftNetG === null) {
    return fail(session, "weigh_need_zero", {}, now);
  }
  const targetG = targetGrams(recipe, line, session.batchTablets);
  const tolerance = toleranceGrams(targetG, false);
  const step = readabilityGrams(session.weigh.mode);
  const net = roundMass(Math.round(session.weigh.draftNetG / step) * step);
  if (line.water) {
    const internalG = gramsFromMg(
      recipe.lines.filter((item) => item.phase === "internal").reduce((total, item) => total + item.perTabletMg, 0) * session.batchTablets,
    );
    const min = roundMass(internalG * 0.08);
    const max = roundMass(internalG * 0.3);
    if (net < min - 1e-9 || net > max + 1e-9) {
      return fail(session, "water_window", { net: num(net, 3), min: num(min, 3), max: num(max, 3), target: num(targetG, 3) }, now);
    }
  } else {
    if (tolerance + 1e-12 < step) {
      return fail(session, "weigh_need_analytical", { tolerance, step, lineId: line.id }, now);
    }
    if (Math.abs(net - targetG) > tolerance + 1e-9) {
      return fail(session, "weigh_outside", { net: num(net, 3), target: num(targetG, 3), tolerance: num(tolerance, 3), lineId: line.id }, now);
    }
  }
  if (session.lots.some((lot) => lot.kind === "portion" && lot.lineId === line.id && !lot.consumed && lot.massG > EPS)) {
    return fail(session, "weigh_duplicate", { lineId: line.id }, now);
  }
  const stock = session.lots.find((lot) => lot.kind === "stock" && lot.lineId === line.id && !lot.consumed);
  if (!stock || stock.identity !== "released") {
    return fail(session, "weigh_not_released", { lineId: line.id }, now);
  }
  if (stock.massG + 1e-9 < net) {
    return fail(session, "weigh_stock", { have: num(stock.massG, 3), need: num(net, 3) }, now);
  }
  const taken = bump(session, "lot");
  const portion = blankLot({
    id: taken.id,
    materialId: stock.materialId,
    nameKey: stock.materialId,
    role: stock.role,
    kind: "portion",
    batch: stock.batch,
    massG: net,
    moistureFraction: stock.moistureFraction,
    apiFraction: stock.apiFraction,
    location: "scale",
    identity: "released",
    parentIds: [stock.id],
    seriesId: session.seriesId ?? "",
    lineId: line.id,
    d50Mm: stock.d50Mm,
    bulkDensityGPerMl: stock.bulkDensityGPerMl,
  });
  let next = replaceLot(taken.session, stock.id, { ...stock, massG: roundMass(stock.massG - net) });
  next = {
    ...next,
    lots: [...next.lots, portion],
    inputsG: roundMass(next.inputsG + net),
    weighedByLine: { ...next.weighedByLine, [line.id]: roundMass((next.weighedByLine[line.id] ?? 0) + net) },
    selectedLotId: portion.id,
    weigh: { ...next.weigh, draftNetG: null },
  };
  next = syncFront(next);
  return ok(next, "weigh_ok", { lineId: line.id, net: num(net, 3), target: num(targetG, 3), gross: num(next.weigh.tareG! + net, 3) }, now, "weighing", {
    massInG: num(stock.massG, 4),
    massOutG: num(net, 4),
  });
}

export function returnWeigh(session: TabletSession, lotId: string, now: string): ActionResult {
  const blocked = guard(session, now);
  if (blocked) {
    return blocked;
  }
  if (session.marks.premix) {
    return fail(session, "weigh_locked", {}, now);
  }
  const lot = session.lots.find((item) => item.id === lotId);
  if (!lot || lot.kind !== "portion" || lot.consumed || lot.location !== "scale") {
    return fail(session, "weigh_return_state", {}, now);
  }
  if (session.lots.some((item) => item.parentIds.includes(lot.id) && !item.consumed)) {
    return fail(session, "weigh_return_state", {}, now);
  }
  const stock = session.lots.find((item) => item.id === lot.parentIds[0]);
  if (!stock) {
    return fail(session, "lot_missing", {}, now);
  }
  let next = replaceLot(session, stock.id, { ...stock, massG: roundMass(stock.massG + lot.massG) });
  next = replaceLot(next, lot.id, consumeLot(lot));
  const lineKey = lot.lineId ?? "";
  next = syncFront({
    ...next,
    inputsG: roundMass(Math.max(0, next.inputsG - lot.massG)),
    weighedByLine: { ...next.weighedByLine, [lineKey]: roundMass(Math.max(0, (next.weighedByLine[lineKey] ?? 0) - lot.massG)) },
  });
  return ok(next, "weigh_returned", { lineId: lot.lineId ?? "", mass: num(lot.massG, 3) }, now, "weighing");
}

export function destinationsFor(lot: Lot): LocationId[] {
  if (lot.consumed || lot.massG <= EPS) {
    return [];
  }
  if (lot.kind === "stock") {
    return lot.identity === "released" ? ["warehouse", "scale"] : ["warehouse"];
  }
  const map: Record<MaterialRole, LocationId[]> = {
    api: ["scale", "sieve", "mixer", "waste"],
    filler: ["scale", "sieve", "mixer", "waste"],
    binder: ["scale", "liquid", "waste"],
    disintegrant: ["scale", "sieve", "mixer", "waste"],
    glidant: ["scale", "sieve", "mixer", "waste"],
    lubricant: ["scale", "mixer", "waste"],
    solvent: ["scale", "liquid", "waste"],
    blend: ["mixer", "granulator", "press", "waste"],
    granulating_liquid: ["liquid", "granulator", "waste"],
    wet_granules: ["granulator", "sieve", "dryer", "waste"],
    granules: ["dryer", "calibrator", "mixer", "waste"],
    press_mass: ["mixer", "press", "waste"],
    tablets: ["press", "deduster", "qc", "pack", "waste"],
    dust: ["waste"],
    fines: ["calibrator", "mixer", "waste"],
    retained: ["sieve", "dryer", "waste"],
  };
  return map[lot.role];
}

export function moveLot(session: TabletSession, lotId: string, location: LocationId, now: string): ActionResult {
  const blocked = guard(session, now);
  if (blocked) {
    return blocked;
  }
  const lot = session.lots.find((item) => item.id === lotId);
  if (!lot || lot.consumed) {
    return fail(session, "lot_missing", {}, now);
  }
  if (lot.kind === "stock" && location === "scale") {
    if (lot.identity !== "released" || !lot.lineId) {
      return fail(session, "weigh_not_released", { materialId: lot.materialId }, now);
    }
    return selectWeighLine(session, lot.lineId, now);
  }
  if (lot.location === location) {
    return ok({ ...session, selectedLotId: lot.id }, "move_same", { location }, now, undefined, undefined, "info");
  }
  if (!destinationsFor(lot).includes(location)) {
    return fail(session, "move_rejected", { role: lot.role, location, materialId: lot.materialId }, now);
  }
  const next = { ...replaceLot(session, lot.id, { ...lot, location }), selectedLotId: lot.id };
  const early = lot.role === "lubricant" && location === "mixer" && !session.marks.premix;
  return ok(next, early ? "move_lubricant_early" : "move_ok", { materialId: lot.materialId, location, mass: num(lot.massG, 3) }, now, undefined, undefined, early ? "warning" : "success");
}

export function loadStage(session: TabletSession, stage: StageId, now: string): ActionResult {
  const blocked = guard(session, now);
  if (blocked) {
    return blocked;
  }
  const recipe = recipeOf(session);
  if (!recipe || !session.route) {
    return fail(session, "gate_no_route", {}, now);
  }
  const view = stageView(session, stage);
  if (view.status === "blocked" || view.status === "unavailable") {
    return fail(session, view.reason, { stage }, now);
  }
  const needed = lotsNeeded(session, stage);
  if (!needed.ok) {
    return fail(session, needed.code, needed.params, now);
  }
  let next = session;
  for (const lot of needed.lots) {
    if (lot.location !== needed.location) {
      next = replaceLot(next, lot.id, { ...lot, location: needed.location });
    }
  }
  return ok({ ...next, selectedStage: stage }, "load_ok", { stage, count: needed.lots.length }, now, stage);
}

function lotsNeeded(session: TabletSession, stage: StageId): { ok: true; lots: Lot[]; location: LocationId } | { ok: false; code: string; params: Params } {
  const recipe = recipeOf(session);
  if (!recipe) {
    return { ok: false, code: "gate_no_route", params: {} };
  }
  const portions = (phase: RecipeLine["phase"]) =>
    recipe.lines.filter((line) => line.phase === phase).map((line) => portionLine(session, line.id));
  if (stage === "premix") {
    const lots = portions("internal");
    if (lots.some((lot) => !lot)) {
      return { ok: false, code: "load_missing", params: { stage } };
    }
    return { ok: true, lots: lots.filter((lot): lot is Lot => Boolean(lot)), location: "mixer" };
  }
  if (stage === "granulating_liquid") {
    const lots = [...portions("liquid_solid"), ...portions("solvent")];
    if (lots.some((lot) => !lot)) {
      return { ok: false, code: "load_missing", params: { stage } };
    }
    return { ok: true, lots: lots.filter((lot): lot is Lot => Boolean(lot)), location: "liquid" };
  }
  if (stage === "granulation") {
    const blend = findRole(session, "blend");
    const liquid = findRole(session, "granulating_liquid");
    if (!blend || !liquid) {
      return { ok: false, code: "load_missing", params: { stage } };
    }
    return { ok: true, lots: [blend, liquid], location: "granulator" };
  }
  if (stage === "wet_screening") {
    const wet = findRole(session, "wet_granules");
    if (!wet) {
      return { ok: false, code: "load_missing", params: { stage } };
    }
    return { ok: true, lots: [wet], location: "sieve" };
  }
  if (stage === "drying") {
    const wet = activeLots(session).filter((lot) => lot.role === "wet_granules" || lot.role === "granules");
    if (!wet.length) {
      return { ok: false, code: "load_missing", params: { stage } };
    }
    return { ok: true, lots: wet, location: "dryer" };
  }
  if (stage === "sizing") {
    const granules = findRole(session, "granules");
    if (!granules) {
      return { ok: false, code: "load_missing", params: { stage } };
    }
    return { ok: true, lots: [granules], location: "calibrator" };
  }
  if (stage === "final_blend") {
    const granules = findRole(session, "granules");
    const external = portions("external").filter((lot): lot is Lot => Boolean(lot));
    if (!granules || external.length !== recipe.lines.filter((line) => line.phase === "external").length) {
      return { ok: false, code: "load_missing", params: { stage } };
    }
    const fines = activeLots(session).filter((lot) => lot.role === "fines");
    return { ok: true, lots: [granules, ...external, ...fines], location: "mixer" };
  }
  if (stage === "lubrication") {
    const blend = findRole(session, "blend");
    const lubricant = portions("lubricant").find((lot): lot is Lot => Boolean(lot));
    if (!blend || !lubricant) {
      return { ok: false, code: "load_missing", params: { stage } };
    }
    return { ok: true, lots: [blend, lubricant], location: "mixer" };
  }
  if (stage === "compression") {
    const mass = findRole(session, "press_mass");
    if (!mass) {
      return { ok: false, code: "load_missing", params: { stage } };
    }
    return { ok: true, lots: [mass], location: "press" };
  }
  if (stage === "dedusting") {
    const tablets = findRole(session, "tablets");
    if (!tablets) {
      return { ok: false, code: "load_missing", params: { stage } };
    }
    return { ok: true, lots: [tablets], location: "deduster" };
  }
  if (stage === "qc") {
    const tablets = activeLots(session).filter((lot) => lot.role === "tablets");
    if (!tablets.length) {
      return { ok: false, code: "load_missing", params: { stage } };
    }
    return { ok: true, lots: tablets, location: "qc" };
  }
  if (stage === "packaging") {
    const tablets = activeLots(session).filter((lot) => lot.role === "tablets");
    if (!tablets.length) {
      return { ok: false, code: "load_missing", params: { stage } };
    }
    return { ok: true, lots: tablets, location: "pack" };
  }
  if (stage === "sieving") {
    const powders = activeLots(session).filter((lot) => lot.kind === "portion" && lot.role !== "solvent" && lot.role !== "lubricant");
    if (!powders.length) {
      return { ok: false, code: "load_missing", params: { stage } };
    }
    return { ok: true, lots: powders, location: "sieve" };
  }
  return { ok: false, code: "load_missing", params: { stage } };
}

function portionLine(session: TabletSession, lineId: string) {
  return activeLots(session).find((lot) => lot.kind === "portion" && lot.lineId === lineId);
}

function findRole(session: TabletSession, role: MaterialRole) {
  return activeLots(session).find((lot) => lot.role === role);
}

export function skipStage(session: TabletSession, stage: StageId, now: string): ActionResult {
  const blocked = guard(session, now);
  if (blocked) {
    return blocked;
  }
  if (!session.route || !isOptional(stage) || !stagesFor(session.route).includes(stage)) {
    return fail(session, "skip_not_optional", { stage }, now);
  }
  const view = stageView(session, stage);
  if (view.status === "blocked" || view.status === "unavailable") {
    return fail(session, view.reason, { stage }, now);
  }
  if (view.status === "done" || view.status === "skipped") {
    return fail(session, "already_done", { stage }, now, "info");
  }
  return ok(mark(session, stage, "skipped"), "skip_ok", { stage }, now, stage, undefined, "warning");
}

function prereq(session: TabletSession, stage: StageId): { ok: true } | { ok: false; reason: string } {
  const ready = (id: StageId, allowWarning = true) => {
    const value = session.marks[id];
    if (value === "done" || value === "skipped") {
      return true;
    }
    return allowWarning && value === "warning";
  };
  if (stage === "intake") {
    return { ok: true };
  }
  if (stage === "weighing") {
    return ready("intake") ? { ok: true } : { ok: false, reason: "gate_need_intake" };
  }
  if (stage === "sieving" || stage === "premix" || stage === "granulating_liquid") {
    return ready("weighing") ? { ok: true } : { ok: false, reason: "gate_need_weighing" };
  }
  if (stage === "granulation") {
    if (!ready("premix")) {
      return { ok: false, reason: "gate_need_premix" };
    }
    if (!ready("granulating_liquid")) {
      return { ok: false, reason: "gate_need_liquid" };
    }
    return { ok: true };
  }
  if (stage === "wet_screening") {
    return ready("granulation") ? { ok: true } : { ok: false, reason: "gate_need_granulation" };
  }
  if (stage === "drying") {
    if (!ready("granulation")) {
      return { ok: false, reason: "gate_need_granulation" };
    }
    if (!ready("wet_screening")) {
      return { ok: false, reason: "gate_need_screen" };
    }
    return { ok: true };
  }
  if (stage === "moisture_check") {
    return session.marks.drying ? { ok: true } : { ok: false, reason: "gate_need_drying" };
  }
  if (stage === "sizing") {
    return ready("moisture_check") ? { ok: true } : { ok: false, reason: "gate_need_moisture" };
  }
  if (stage === "final_blend") {
    if (!ready("moisture_check")) {
      return { ok: false, reason: "gate_need_moisture" };
    }
    if (!ready("sizing")) {
      return { ok: false, reason: "gate_need_sizing" };
    }
    return { ok: true };
  }
  if (stage === "lubrication") {
    const previous = session.route === "wet_granulation" ? "final_blend" : "premix";
    return ready(previous) ? { ok: true } : { ok: false, reason: session.route === "wet_granulation" ? "gate_need_final" : "gate_need_premix" };
  }
  if (stage === "compression") {
    if (!ready("lubrication")) {
      return { ok: false, reason: "gate_need_lubrication" };
    }
    if (session.route === "wet_granulation") {
      if (session.marks.drying !== "done") {
        return { ok: false, reason: "gate_moisture" };
      }
      if (!ready("moisture_check", false)) {
        return { ok: false, reason: "gate_need_moisture" };
      }
    }
    return { ok: true };
  }
  if (stage === "dedusting" || stage === "qc" || stage === "packaging") {
    return ready("compression") ? { ok: true } : { ok: false, reason: "gate_need_compression" };
  }
  return { ok: false, reason: "gate_not_in_route" };
}

function placed(session: TabletSession, stage: StageId) {
  if (stage === "intake" || stage === "weighing" || stage === "moisture_check" || stage === "qc" || stage === "packaging") {
    return true;
  }
  const needed = lotsNeeded(session, stage);
  if (!needed.ok) {
    return false;
  }
  return needed.lots.every((lot) => lot.location === needed.location);
}

export function stageView(session: TabletSession, id: StageId): StageView {
  const optional = isOptional(id);
  if (!session.route) {
    return { id, status: "unavailable", reason: "gate_no_route", optional };
  }
  if (!stagesFor(session.route).includes(id)) {
    return { id, status: "unavailable", reason: "gate_not_in_route", optional };
  }
  if (session.job?.stage === id) {
    return { id, status: "running", reason: "gate_running", optional };
  }
  const current = session.marks[id];
  if (current === "skipped") {
    return { id, status: "skipped", reason: "gate_skipped", optional };
  }
  if (current === "warning") {
    return { id, status: "done_warning", reason: "gate_warning", optional };
  }
  if (current === "done" && id !== "compression" && id !== "drying" && id !== "qc" && id !== "packaging") {
    return { id, status: "done", reason: "gate_done", optional };
  }
  if (current === "done" && (id === "qc" || id === "packaging" || id === "compression" || id === "drying")) {
    return { id, status: "done", reason: "gate_done", optional };
  }
  const gate = prereq(session, id);
  if (!gate.ok) {
    return { id, status: "blocked", reason: gate.reason, optional };
  }
  if (!placed(session, id) && id !== "intake" && id !== "weighing") {
    return { id, status: "awaiting", reason: "gate_need_place", optional };
  }
  return { id, status: current === "done" ? "done" : "ready", reason: current === "done" ? "gate_done" : "gate_ready", optional };
}

export function listStages(session: TabletSession) {
  const ids = session.route ? stagesFor(session.route) : stagesFor("wet_granulation");
  return ids.map((id) => stageView(session, id));
}

function arm(session: TabletSession, stage: StageId, techMinutes: number, payload: Params, now: string, code: string): ActionResult {
  const blocked = guard(session, now);
  if (blocked) {
    return blocked;
  }
  const view = stageView(session, stage);
  if (view.status === "blocked" || view.status === "unavailable" || view.status === "skipped") {
    return fail(session, view.reason, { stage }, now);
  }
  const durationMs = Math.max(900, Math.round(Math.max(techMinutes, 0.8) * 380));
  const next = bump(session, "job");
  return ok(
    {
      ...next.session,
      selectedStage: stage,
      job: { id: next.id, stage, elapsedMs: 0, durationMs, techMinutes, payload },
    },
    code,
    { ...payload, stage },
    now,
    stage,
  );
}

export function tick(session: TabletSession, dtMs: number, now: string) {
  if (!session.job || session.closed) {
    return session;
  }
  const elapsed = session.job.elapsedMs + Math.max(0, dtMs);
  if (elapsed < session.job.durationMs) {
    return { ...session, job: { ...session.job, elapsedMs: elapsed } };
  }
  return completeJob(session, 1, now).session;
}

export function stopJob(session: TabletSession, now: string): ActionResult {
  if (!session.job) {
    return fail(session, "job_missing", {}, now);
  }
  const fraction = session.job.elapsedMs / session.job.durationMs;
  const stage = session.job.stage;
  if ((stage === "drying" || stage === "granulation" || stage === "compression") && fraction >= 0.05) {
    return completeJob(session, fraction, now);
  }
  return ok({ ...session, job: null }, "job_cancelled", { stage }, now, stage, undefined, "warning");
}

function payloadNumber(payload: Params, key: string, fallback: number) {
  const value = payload[key];
  return typeof value === "number" ? value : fallback;
}

function completeJob(session: TabletSession, fraction: number, now: string): ActionResult {
  const job = session.job;
  if (!job) {
    return fail(session, "job_missing", {}, now);
  }
  const base = { ...session, job: null };
  const applied = Math.min(1, Math.max(0, fraction));
  if (job.stage === "sieving") {
    return finishSieve(base, String(job.payload.lotId ?? ""), now);
  }
  if (job.stage === "premix") {
    return finishPremix(base, payloadNumber(job.payload, "minutes", 8), payloadNumber(job.payload, "rpm", 30), now);
  }
  if (job.stage === "granulating_liquid") {
    return finishLiquid(base, now);
  }
  if (job.stage === "granulation") {
    return finishGranulation(base, payloadNumber(job.payload, "minutes", 6) * applied, now);
  }
  if (job.stage === "wet_screening") {
    return finishWetScreen(base, payloadNumber(job.payload, "mesh", 1.6), now);
  }
  if (job.stage === "drying") {
    return finishDrying(base, payloadNumber(job.payload, "temp", 55), payloadNumber(job.payload, "minutes", 40) * applied, now);
  }
  if (job.stage === "sizing") {
    return finishSizing(base, now);
  }
  if (job.stage === "final_blend") {
    return finishFinal(base, payloadNumber(job.payload, "minutes", 5), payloadNumber(job.payload, "rpm", 25), now);
  }
  if (job.stage === "lubrication") {
    return finishLube(base, payloadNumber(job.payload, "minutes", 2), payloadNumber(job.payload, "rpm", 20), now);
  }
  if (job.stage === "compression") {
    return finishPress(base, job.payload, applied, now);
  }
  if (job.stage === "dedusting") {
    return finishDedust(base, String(job.payload.lotId ?? ""), now);
  }
  return fail(base, "job_missing", { stage: job.stage }, now);
}

export function startSieve(session: TabletSession, lotId: string, now: string): ActionResult {
  const lot = session.lots.find((item) => item.id === lotId);
  if (!lot || lot.consumed || lot.location !== "sieve" || lot.kind !== "portion") {
    return fail(session, "sieve_lot", {}, now);
  }
  if (!EDU_SPEC.sievePowderMm.includes(session.sieve.meshMm as (typeof EDU_SPEC.sievePowderMm)[number])) {
    return fail(session, "mesh_range", {}, now);
  }
  return arm(session, "sieving", 2, { lotId, mesh: session.sieve.meshMm }, now, "sieve_started");
}

function finishSieve(session: TabletSession, lotId: string, now: string): ActionResult {
  const lot = session.lots.find((item) => item.id === lotId && !item.consumed);
  if (!lot) {
    return fail(session, "sieve_lot", {}, now);
  }
  const mesh = session.sieve.meshMm;
  const fraction = passFraction(mesh, lot.d50Mm);
  let passedMass = roundMass(lot.massG * fraction);
  let retainedMass = roundMass(lot.massG - passedMass);
  if (retainedMass <= 0.0005) {
    passedMass = lot.massG;
    retainedMass = 0;
  }
  const passedId = bump(session, "lot");
  const passed = blankLot({
    ...lot,
    id: passedId.id,
    massG: passedMass,
    parentIds: [lot.id],
    location: "sieve",
  });
  let next = replaceLot(passedId.session, lot.id, consumeLot(lot));
  next = { ...next, lots: [...next.lots, passed], selectedLotId: passed.id };
  if (retainedMass > 0.0005) {
    const retainedId = bump(next, "lot");
    const retained = blankLot({
      ...lot,
      id: retainedId.id,
      nameKey: "retained",
      role: "retained",
      kind: "intermediate",
      massG: retainedMass,
      lineId: null,
      parentIds: [lot.id],
      location: "sieve",
    });
    next = { ...retainedId.session, lots: [...next.lots, retained] };
  }
  next = mark(next, "sieving", "done");
  return ok(next, "sieve_done", { mesh, passed: num(passedMass, 3), retained: num(retainedMass, 3), materialId: lot.materialId }, now, "sieving", {
    massInG: num(lot.massG, 4),
    massOutG: num(passedMass + retainedMass, 4),
    lossG: 0,
  });
}

export function startPremix(session: TabletSession, now: string): ActionResult {
  const recipe = recipeOf(session);
  if (!recipe) {
    return fail(session, "gate_no_route", {}, now);
  }
  if (session.marks.premix === "done") {
    return fail(session, "already_done", { stage: "premix" }, now);
  }
  const required = recipe.lines.filter((line) => line.phase === "internal");
  for (const line of required) {
    const lot = portionLine(session, line.id);
    if (!lot || lot.location !== "mixer") {
      return fail(session, "premix_missing", { lineId: line.id }, now);
    }
  }
  if (activeLots(session).some((lot) => lot.location === "mixer" && lot.role === "lubricant")) {
    return fail(session, "premix_lubricant", {}, now);
  }
  return arm(session, "premix", session.mixer.minutes, { minutes: session.mixer.minutes, rpm: session.mixer.rpm }, now, "premix_started");
}

function finishPremix(session: TabletSession, minutes: number, rpm: number, now: string): ActionResult {
  const recipe = recipeOf(session);
  if (!recipe) {
    return fail(session, "gate_no_route", {}, now);
  }
  const sources = recipe.lines
    .filter((line) => line.phase === "internal")
    .map((line) => portionLine(session, line.id))
    .filter((lot): lot is Lot => Boolean(lot && lot.location === "mixer"));
  if (sources.length !== recipe.lines.filter((line) => line.phase === "internal").length) {
    return fail(session, "premix_missing", {}, now);
  }
  return combine(session, sources, "blend", "mixer", minutes, rpm, "premix", "premix_done", now, false);
}

function combine(
  session: TabletSession,
  sources: Lot[],
  role: MaterialRole,
  location: LocationId,
  minutes: number,
  rpm: number,
  stage: StageId,
  code: string,
  now: string,
  lubricant: boolean,
): ActionResult {
  const massIn = sum(sources.map((lot) => lot.massG));
  const loss = roundMass(massIn * (lubricant ? EDU_SPEC.lubricationLossFraction : EDU_SPEC.mixLossFraction));
  const massOut = roundMass(massIn - loss);
  if (massOut <= EPS) {
    return fail(session, "mass_invalid", {}, now);
  }
  const created = bump(session, "lot");
  const over = lubricant && minutes > EDU_SPEC.lubricantMinutesWarn;
  const blend = blankLot({
    id: created.id,
    materialId: role,
    nameKey: role,
    role,
    kind: "intermediate",
    batch: session.seriesId ?? "",
    massG: massOut,
    moistureFraction: num(weighted(sources, (lot) => lot.moistureFraction), 4),
    apiFraction: weighted(sources, (lot) => lot.apiFraction),
    location,
    identity: "released",
    parentIds: sources.map((lot) => lot.id),
    seriesId: session.seriesId ?? "",
    lineId: null,
    d50Mm: num(weighted(sources, (lot) => lot.d50Mm), 3),
    bulkDensityGPerMl: role === "press_mass" || role === "blend" ? num(weighted(sources, (lot) => lot.bulkDensityGPerMl), 3) : 0.5,
    granuleQuality: sources.find((lot) => lot.granuleQuality !== null)?.granuleQuality ?? null,
    lubricantMinutes: lubricant ? minutes : 0,
    rsdPercent: blendRsd(minutes, rpm, sources.length),
  });
  let next = created.session;
  for (const source of sources) {
    next = replaceLot(next, source.id, consumeLot(source));
  }
  next = addLoss(next, stage, lubricant ? "loss_lubrication" : "loss_mix", loss);
  next = { ...next, lots: [...next.lots, blend], selectedLotId: blend.id };
  next = mark(next, stage, over ? "warning" : "done");
  return ok(next, over ? "lube_long" : code, { mass: num(massOut, 3), loss: num(loss, 3), rsd: blend.rsdPercent ?? 0, minutes }, now, stage, {
    massInG: num(massIn, 4),
    massOutG: num(massOut, 4),
    lossG: num(loss, 4),
  }, over ? "warning" : "success");
}

export function startLiquid(session: TabletSession, now: string): ActionResult {
  if (session.marks.granulating_liquid === "done") {
    return fail(session, "already_done", { stage: "granulating_liquid" }, now);
  }
  const recipe = recipeOf(session);
  if (!recipe) {
    return fail(session, "gate_no_route", {}, now);
  }
  const sources = recipe.lines
    .filter((line) => line.phase === "liquid_solid" || line.phase === "solvent")
    .map((line) => portionLine(session, line.id));
  if (sources.some((lot) => !lot || lot.location !== "liquid")) {
    return fail(session, "liquid_missing", {}, now);
  }
  return arm(session, "granulating_liquid", 2, {}, now, "liquid_started");
}

function finishLiquid(session: TabletSession, now: string): ActionResult {
  const recipe = recipeOf(session);
  if (!recipe) {
    return fail(session, "gate_no_route", {}, now);
  }
  const sources = recipe.lines
    .filter((line) => line.phase === "liquid_solid" || line.phase === "solvent")
    .map((line) => portionLine(session, line.id))
    .filter((lot): lot is Lot => Boolean(lot && lot.location === "liquid"));
  if (sources.length < 2) {
    return fail(session, "liquid_missing", {}, now);
  }
  const solids = sources.filter((lot) => lot.role !== "solvent");
  const solvent = sources.filter((lot) => lot.role === "solvent");
  const solidsG = sum(solids.map((lot) => lot.massG));
  const waterG = sum(solvent.map((lot) => lot.massG));
  const massIn = roundMass(solidsG + waterG);
  const density = solutionDensity(solidsG, waterG);
  const created = bump(session, "lot");
  const liquid = blankLot({
    id: created.id,
    materialId: "granulating_liquid",
    nameKey: "granulating_liquid",
    role: "granulating_liquid",
    kind: "intermediate",
    batch: session.seriesId ?? "",
    massG: massIn,
    moistureFraction: num(weighted(sources, (lot) => lot.moistureFraction), 4),
    apiFraction: 0,
    location: "liquid",
    identity: "released",
    parentIds: sources.map((lot) => lot.id),
    seriesId: session.seriesId ?? "",
    lineId: null,
    d50Mm: 0,
    bulkDensityGPerMl: density,
    volumeMl: num(massIn / density, 2),
    densityGPerMl: density,
  });
  let next = created.session;
  for (const source of sources) {
    next = replaceLot(next, source.id, consumeLot(source));
  }
  next = mark({ ...next, lots: [...next.lots, liquid], selectedLotId: liquid.id }, "granulating_liquid", "done");
  return ok(next, "liquid_done", { mass: num(massIn, 3), volume: liquid.volumeMl ?? 0, density }, now, "granulating_liquid", {
    massInG: num(massIn, 4),
    massOutG: num(massIn, 4),
    lossG: 0,
  });
}

export function startGranulation(session: TabletSession, now: string): ActionResult {
  if (session.marks.granulation === "done") {
    return fail(session, "already_done", { stage: "granulation" }, now);
  }
  const blend = activeLots(session).find((lot) => lot.role === "blend" && lot.location === "granulator");
  const liquid = activeLots(session).find((lot) => lot.role === "granulating_liquid" && lot.location === "granulator");
  if (!blend || !liquid) {
    return fail(session, "granulation_missing", {}, now);
  }
  return arm(session, "granulation", session.granulator.minutes, { minutes: session.granulator.minutes, rpm: session.granulator.impellerRpm }, now, "granulation_started");
}

function finishGranulation(session: TabletSession, minutes: number, now: string): ActionResult {
  const blend = activeLots(session).find((lot) => lot.role === "blend" && lot.location === "granulator");
  const liquid = activeLots(session).find((lot) => lot.role === "granulating_liquid" && lot.location === "granulator");
  if (!blend || !liquid) {
    return fail(session, "granulation_missing", {}, now);
  }
  const waterG = liquid.massG * liquid.moistureFraction;
  const ratio = waterG / Math.max(blend.massG, EPS);
  const quality = granuleQuality(ratio, minutes);
  const massIn = roundMass(blend.massG + liquid.massG);
  const loss = roundMass(massIn * EDU_SPEC.granulationLossFraction);
  const massOut = roundMass(massIn - loss);
  const created = bump(session, "lot");
  const wet = blankLot({
    id: created.id,
    materialId: "wet_granules",
    nameKey: "wet_granules",
    role: "wet_granules",
    kind: "intermediate",
    batch: session.seriesId ?? "",
    massG: massOut,
    moistureFraction: num(weighted([blend, liquid], (lot) => lot.moistureFraction), 4),
    apiFraction: weighted([blend, liquid], (lot) => lot.apiFraction),
    location: "granulator",
    identity: "released",
    parentIds: [blend.id, liquid.id],
    seriesId: session.seriesId ?? "",
    lineId: null,
    d50Mm: num(0.35 + quality * 0.5, 3),
    bulkDensityGPerMl: num(0.42 + quality * 0.14, 3),
    granuleQuality: quality,
  });
  let next = created.session;
  next = replaceLot(next, blend.id, consumeLot(blend));
  next = replaceLot(next, liquid.id, consumeLot(liquid));
  next = addLoss(next, "granulation", "loss_granulation", loss);
  next = mark({ ...next, lots: [...next.lots, wet], selectedLotId: wet.id }, "granulation", "done");
  return ok(next, "granulation_done", { mass: num(massOut, 3), quality, ratio: num(ratio, 3), moisture: wet.moistureFraction }, now, "granulation", {
    massInG: num(massIn, 4),
    massOutG: num(massOut, 4),
    lossG: num(loss, 4),
  });
}

export function startWetScreen(session: TabletSession, now: string): ActionResult {
  const wet = activeLots(session).find((lot) => lot.role === "wet_granules" && lot.location === "sieve");
  if (!wet) {
    return fail(session, "screen_missing", {}, now);
  }
  if (!EDU_SPEC.sieveWetMm.includes(session.sieve.meshMm as (typeof EDU_SPEC.sieveWetMm)[number])) {
    return fail(session, "mesh_range", {}, now);
  }
  return arm(session, "wet_screening", 2, { mesh: session.sieve.meshMm, lotId: wet.id }, now, "screen_started");
}

function finishWetScreen(session: TabletSession, mesh: number, now: string): ActionResult {
  const wet = activeLots(session).find((lot) => lot.role === "wet_granules" && lot.location === "sieve");
  if (!wet) {
    return fail(session, "screen_missing", {}, now);
  }
  const quality = wet.granuleQuality ?? 0.5;
  const retainedFraction = Math.min(0.35, Math.max(0.02, (1 - quality) * 0.18 * (1.6 / mesh)));
  const retainedMass = roundMass(wet.massG * retainedFraction);
  const passedMass = roundMass(wet.massG - retainedMass);
  const passedId = bump(session, "lot");
  const passed = blankLot({ ...wet, id: passedId.id, massG: passedMass, parentIds: [wet.id] });
  const retainedId = bump(passedId.session, "lot");
  const retained = blankLot({
    ...wet,
    id: retainedId.id,
    nameKey: "retained",
    role: "retained",
    massG: retainedMass,
    parentIds: [wet.id],
  });
  let next = replaceLot(retainedId.session, wet.id, consumeLot(wet));
  next = mark({ ...next, lots: [...next.lots, passed, retained], selectedLotId: passed.id }, "wet_screening", "done");
  return ok(next, "screen_done", { passed: num(passedMass, 3), retained: num(retainedMass, 3), mesh }, now, "wet_screening", {
    massInG: num(wet.massG, 4),
    massOutG: num(passedMass + retainedMass, 4),
    lossG: 0,
  });
}

export function startDrying(session: TabletSession, now: string): ActionResult {
  const loads = activeLots(session).filter((lot) => (lot.role === "wet_granules" || lot.role === "granules") && lot.location === "dryer");
  if (!loads.length) {
    return fail(session, "dry_missing", {}, now);
  }
  if (session.dryer.temperatureC < EDU_SPEC.dryingTempMin || session.dryer.temperatureC > EDU_SPEC.dryingTempMax) {
    return fail(session, "dry_temp_range", { min: EDU_SPEC.dryingTempMin, max: EDU_SPEC.dryingTempMax }, now);
  }
  if (session.dryer.minutes < 5 || session.dryer.minutes > 180) {
    return fail(session, "dry_time_range", {}, now);
  }
  return arm(session, "drying", session.dryer.minutes / 8, { temp: session.dryer.temperatureC, minutes: session.dryer.minutes }, now, "dry_started");
}

function finishDrying(session: TabletSession, temp: number, minutes: number, now: string): ActionResult {
  const loads = activeLots(session).filter((lot) => (lot.role === "wet_granules" || lot.role === "granules") && lot.location === "dryer");
  if (!loads.length) {
    return fail(session, "dry_missing", {}, now);
  }
  const massIn = sum(loads.map((lot) => lot.massG));
  const moisture0 = weighted(loads, (lot) => lot.moistureFraction);
  const moisture1 = driedMoisture(moisture0, temp, minutes);
  const massOut = massAfterDrying(massIn, moisture0, moisture1);
  const removed = roundMass(massIn - massOut);
  const apiMass = sum(loads.map((lot) => lot.massG * lot.apiFraction));
  const created = bump(session, "lot");
  const dry = blankLot({
    id: created.id,
    materialId: "granules",
    nameKey: "granules",
    role: "granules",
    kind: "intermediate",
    batch: session.seriesId ?? "",
    massG: massOut,
    moistureFraction: moisture1,
    apiFraction: massOut > EPS ? apiMass / massOut : 0,
    location: "dryer",
    identity: "released",
    parentIds: loads.map((lot) => lot.id),
    seriesId: session.seriesId ?? "",
    lineId: null,
    d50Mm: num(weighted(loads, (lot) => lot.d50Mm), 3),
    bulkDensityGPerMl: num(Math.max(...loads.map((lot) => lot.bulkDensityGPerMl)), 3),
    granuleQuality: loads.find((lot) => lot.granuleQuality !== null)?.granuleQuality ?? null,
  });
  let next = created.session;
  for (const lot of loads) {
    next = replaceLot(next, lot.id, consumeLot(lot));
  }
  next = addLoss(next, "drying", "loss_drying", removed);
  const inWindow = moisture1 >= EDU_SPEC.moistureMin && moisture1 <= EDU_SPEC.moistureMax;
  next = mark({ ...next, lots: [...next.lots, dry], selectedLotId: dry.id, moistureAcknowledged: false }, "drying", inWindow ? "done" : "warning");
  if (session.marks.moisture_check) {
    const marks = { ...next.marks };
    delete marks.moisture_check;
    next = { ...next, marks };
  }
  return ok(next, inWindow ? "dry_done" : "dry_out_of_window", { moisture: num(moisture1 * 100, 2), removed: num(removed, 3), temp, minutes: num(minutes, 1) }, now, "drying", {
    massInG: num(massIn, 4),
    massOutG: num(massOut, 4),
    lossG: num(removed, 4),
  }, inWindow ? "success" : "warning");
}

export function acknowledgeMoisture(session: TabletSession, now: string): ActionResult {
  const blocked = guard(session, now);
  if (blocked) {
    return blocked;
  }
  if (!session.marks.drying) {
    return fail(session, "gate_need_drying", {}, now);
  }
  const granules = activeLots(session).find((lot) => lot.role === "granules");
  if (!granules) {
    return fail(session, "moisture_missing", {}, now);
  }
  const next = mark({ ...session, moistureAcknowledged: true, selectedStage: "moisture_check" }, "moisture_check", "done");
  return ok(next, "moisture_ack", { moisture: num(granules.moistureFraction * 100, 2) }, now, "moisture_check", undefined, "info");
}

export function startSizing(session: TabletSession, now: string): ActionResult {
  const granules = activeLots(session).find((lot) => lot.role === "granules" && lot.location === "calibrator");
  if (!granules) {
    return fail(session, "size_missing", {}, now);
  }
  return arm(session, "sizing", 2, { lotId: granules.id }, now, "size_started");
}

function finishSizing(session: TabletSession, now: string): ActionResult {
  const granules = activeLots(session).find((lot) => lot.role === "granules" && lot.location === "calibrator");
  if (!granules) {
    return fail(session, "size_missing", {}, now);
  }
  const quality = granules.granuleQuality ?? 0.8;
  const finesFraction = Math.min(0.4, Math.max(0.04, 0.3 - 0.22 * quality));
  const finesMass = roundMass(granules.massG * finesFraction);
  const sizedMass = roundMass(granules.massG - finesMass);
  const sizedId = bump(session, "lot");
  const sized = blankLot({ ...granules, id: sizedId.id, massG: sizedMass, parentIds: [granules.id], location: "calibrator" });
  const finesId = bump(sizedId.session, "lot");
  const fines = blankLot({
    ...granules,
    id: finesId.id,
    nameKey: "fines",
    role: "fines",
    massG: finesMass,
    parentIds: [granules.id],
    location: "calibrator",
  });
  let next = replaceLot(finesId.session, granules.id, consumeLot(granules));
  next = mark({ ...next, lots: [...next.lots, sized, fines], selectedLotId: sized.id }, "sizing", "done");
  return ok(next, "size_done", { sized: num(sizedMass, 3), fines: num(finesMass, 3) }, now, "sizing", {
    massInG: num(granules.massG, 4),
    massOutG: num(sizedMass + finesMass, 4),
    lossG: 0,
  });
}

export function startFinal(session: TabletSession, now: string): ActionResult {
  if (session.marks.final_blend === "done") {
    return fail(session, "already_done", { stage: "final_blend" }, now);
  }
  const recipe = recipeOf(session);
  if (!recipe) {
    return fail(session, "gate_no_route", {}, now);
  }
  const granules = activeLots(session).find((lot) => lot.role === "granules" && lot.location === "mixer");
  const external = recipe.lines.filter((line) => line.phase === "external");
  if (!granules || external.some((line) => portionLine(session, line.id)?.location !== "mixer")) {
    return fail(session, "final_missing", {}, now);
  }
  if (activeLots(session).some((lot) => lot.location === "mixer" && lot.role === "lubricant")) {
    return fail(session, "premix_lubricant", {}, now);
  }
  return arm(session, "final_blend", session.mixer.minutes, { minutes: session.mixer.minutes, rpm: session.mixer.rpm }, now, "final_started");
}

function finishFinal(session: TabletSession, minutes: number, rpm: number, now: string): ActionResult {
  const recipe = recipeOf(session);
  if (!recipe) {
    return fail(session, "gate_no_route", {}, now);
  }
  const granules = activeLots(session).find((lot) => lot.role === "granules" && lot.location === "mixer");
  const portions = recipe.lines
    .filter((line) => line.phase === "external")
    .map((line) => portionLine(session, line.id))
    .filter((lot): lot is Lot => Boolean(lot && lot.location === "mixer"));
  const fines = activeLots(session).filter((lot) => lot.role === "fines" && lot.location === "mixer");
  if (!granules || portions.length !== recipe.lines.filter((line) => line.phase === "external").length) {
    return fail(session, "final_missing", {}, now);
  }
  return combine(session, [granules, ...portions, ...fines], "blend", "mixer", minutes, rpm, "final_blend", "final_done", now, false);
}

export function startLubrication(session: TabletSession, now: string): ActionResult {
  if (session.mixer.minutes < EDU_SPEC.lubricantMinutesMin) {
    return fail(session, "lube_short", { minutes: session.mixer.minutes }, now);
  }
  const blend = activeLots(session).find((lot) => lot.role === "blend" && lot.location === "mixer");
  const lubricant = activeLots(session).find((lot) => lot.role === "lubricant" && lot.location === "mixer" && lot.kind === "portion");
  if (!blend || !lubricant) {
    return fail(session, "lube_missing", {}, now);
  }
  const extras = activeLots(session).filter((lot) => lot.location === "mixer" && lot.id !== blend.id && lot.id !== lubricant.id);
  if (extras.length) {
    return fail(session, "lube_extra", {}, now);
  }
  return arm(session, "lubrication", session.mixer.minutes, { minutes: session.mixer.minutes, rpm: session.mixer.rpm }, now, "lube_started");
}

function finishLube(session: TabletSession, minutes: number, rpm: number, now: string): ActionResult {
  const blend = activeLots(session).find((lot) => lot.role === "blend" && lot.location === "mixer");
  const lubricant = activeLots(session).find((lot) => lot.role === "lubricant" && lot.location === "mixer");
  if (!blend || !lubricant) {
    return fail(session, "lube_missing", {}, now);
  }
  const result = combine(session, [blend, lubricant], "press_mass", "mixer", minutes, rpm, "lubrication", "lube_done", now, true);
  if (!result.ok) {
    return result;
  }
  const mass = activeLots(result.session).find((lot) => lot.role === "press_mass");
  if (!mass) {
    return result;
  }
  const density = session.route === "direct" ? 0.48 : num(0.5 + (mass.granuleQuality ?? 0.7) * 0.12, 3);
  return { ...result, session: replaceLot(result.session, mass.id, { ...mass, bulkDensityGPerMl: density }) };
}

export function setMixer(session: TabletSession, patch: Partial<MixerState>, now: string): ActionResult {
  if (session.job) {
    return fail(session, "job_busy", {}, now);
  }
  const mixer = { ...session.mixer, ...patch };
  if (mixer.minutes < 0.5 || mixer.minutes > 40 || mixer.rpm < 10 || mixer.rpm > 80) {
    return fail(session, "mixer_range", {}, now);
  }
  return { ok: true, session: { ...session, mixer }, tone: "info", code: "param_set", params: {} };
}

export function setDryer(session: TabletSession, patch: Partial<DryerState>, now: string): ActionResult {
  if (session.job) {
    return fail(session, "job_busy", {}, now);
  }
  return { ok: true, session: { ...session, dryer: { ...session.dryer, ...patch } }, tone: "info", code: "param_set", params: {} };
}

export function setSieve(session: TabletSession, patch: Partial<SieveState>, now: string): ActionResult {
  if (session.job) {
    return fail(session, "job_busy", {}, now);
  }
  return { ok: true, session: { ...session, sieve: { ...session.sieve, ...patch } }, tone: "info", code: "param_set", params: {} };
}

export function setGranulator(session: TabletSession, patch: Partial<GranulatorState>, now: string): ActionResult {
  if (session.job) {
    return fail(session, "job_busy", {}, now);
  }
  const granulator = { ...session.granulator, ...patch };
  if (granulator.minutes < 1 || granulator.minutes > 20 || granulator.impellerRpm < 50 || granulator.impellerRpm > 400) {
    return fail(session, "granulator_range", {}, now);
  }
  return { ok: true, session: { ...session, granulator }, tone: "info", code: "param_set", params: {} };
}

export function setPress(session: TabletSession, patch: Partial<PressState>, now: string): ActionResult {
  if (session.job) {
    return fail(session, "job_busy", {}, now);
  }
  const press = { ...session.press, ...patch, setupConfirmed: false };
  return { ok: true, session: { ...session, press }, tone: "info", code: "param_set", params: {} };
}

export function confirmPressSetup(session: TabletSession, now: string): ActionResult {
  const blocked = guard(session, now);
  if (blocked) {
    return blocked;
  }
  const issue = pressIssue(session.press);
  if (issue) {
    return fail(session, issue, {}, now);
  }
  return ok({ ...session, press: { ...session.press, setupConfirmed: true } }, "press_setup_ok", { kind: session.press.kind }, now, "compression");
}

function pressIssue(press: PressState) {
  if (press.forceKn < EDU_SPEC.forceMin || press.forceKn > EDU_SPEC.forceMax) {
    return "press_force_range";
  }
  if (![8, 10, 12].includes(press.punchDiameterMm) || press.fillDepthMm < EDU_SPEC.fillMin || press.fillDepthMm > EDU_SPEC.fillMax) {
    return "press_fill_range";
  }
  if (press.kind === "single_punch") {
    if (press.speedPerMin < EDU_SPEC.singleSpeedMin || press.speedPerMin > EDU_SPEC.singleSpeedMax) {
      return "press_speed_range";
    }
    return null;
  }
  if (press.speedPerMin < EDU_SPEC.rotarySpeedMin || press.speedPerMin > EDU_SPEC.rotarySpeedMax) {
    return "press_speed_range";
  }
  if (press.precompressionKn < EDU_SPEC.precompMin || press.precompressionKn > EDU_SPEC.precompMax || press.precompressionKn >= press.forceKn) {
    return "press_precomp_range";
  }
  return null;
}

export function tabletsPerMinute(press: PressState) {
  if (press.kind === "rotary") {
    return press.speedPerMin * EDU_SPEC.rotaryStations;
  }
  return press.speedPerMin;
}

export type CompressionPlan = {
  count: number;
  meanMassG: number;
  productG: number;
  remainderG: number;
  lossG: number;
  fillFactor: number;
  requiredFillMm: number;
  quality: TabletQuality;
};

export function compressionPlan(input: {
  massG: number;
  targetMassG: number;
  fillDepthMm: number;
  diameterMm: number;
  bulkDensity: number;
  forceKn: number;
  moisture: number;
  lubricantMinutes: number;
  rsd: number;
  granuleQuality: number | null;
  apiFraction: number;
  hasDisintegrant: boolean;
  labelClaimMg: number;
  route: TabletRouteId;
}): CompressionPlan | null {
  const required = requiredFillMm(input.targetMassG, input.bulkDensity, input.diameterMm);
  const rawFactor = required > 0 ? input.fillDepthMm / required : 1;
  const fillFactor = Math.min(1.3, Math.max(0.7, rawFactor));
  const meanMassG = roundMass(input.targetMassG * fillFactor);
  if (meanMassG <= EPS) {
    return null;
  }
  const lossG = roundMass(input.massG * EDU_SPEC.pressLossFraction);
  const usable = roundMass(input.massG - lossG);
  const count = Math.floor((usable + 1e-9) / meanMassG);
  if (count < 1) {
    return null;
  }
  const productG = roundMass(count * meanMassG);
  let remainderG = roundMass(usable - productG);
  const drift = roundMass(input.massG - productG - remainderG - lossG);
  remainderG = roundMass(remainderG + drift);
  if (remainderG < -1e-6) {
    return null;
  }
  const meanMassMg = meanMassG * 1000;
  const overLubricated = input.lubricantMinutes > EDU_SPEC.lubricantMinutesWarn;
  const capping = input.forceKn > 22;
  let hardness = input.forceKn * 6.2;
  if (overLubricated) {
    hardness *= 0.82;
  }
  if (input.moisture > 0.02) {
    hardness *= 0.9;
  }
  if (input.route === "wet_granulation" && input.moisture < EDU_SPEC.moistureMin) {
    hardness *= 0.75;
  }
  if (input.forceKn < 8) {
    hardness *= 0.7;
  }
  hardness = num(hardness, 1);
  const radiusCm = input.diameterMm / 20;
  const area = Math.PI * radiusCm * radiusCm;
  const compactDensity = Math.min(1.35, 0.85 + input.forceKn * 0.02);
  const thicknessMm = num(((meanMassG / compactDensity) / area) * 10, 2);
  const referenceDensity = Math.min(1.35, 0.85 + EDU_SPEC.referenceForceKn * 0.02);
  const referenceThicknessMm = num(((input.targetMassG / referenceDensity) / area) * 10, 2);
  let friability = Math.max(0.12, num(58 / Math.max(hardness, 1), 2));
  if (capping) {
    friability = num(friability + 1.2, 2);
  }
  if (overLubricated) {
    friability = num(friability + 0.15, 2);
  }
  let disintegration = hardness * 0.11;
  if (!input.hasDisintegrant) {
    disintegration *= 2.2;
  }
  if (overLubricated) {
    disintegration *= 1.7;
  }
  if (input.route === "direct") {
    disintegration *= 0.85;
  }
  disintegration = num(disintegration, 1);
  let dissolution = 100 * (1 - Math.exp(-18 / Math.max(disintegration, 0.4)));
  if (overLubricated) {
    dissolution *= 0.72;
  }
  if (capping) {
    dissolution = Math.min(dissolution, 70);
  }
  dissolution = num(Math.min(99, dissolution), 1);
  const labelFraction = input.labelClaimMg / meanMassMg;
  const assay = num(labelFraction > 0 ? (input.apiFraction / labelFraction) * 100 : 0, 1);
  let massRsd = (input.rsd || 2) * 0.55;
  if (Math.abs(fillFactor - 1) > 0.08) {
    massRsd += 2.5;
  }
  if (input.granuleQuality !== null && input.granuleQuality < 0.5) {
    massRsd += 1.5;
  }
  return {
    count,
    meanMassG,
    productG,
    remainderG,
    lossG,
    fillFactor: num(fillFactor, 3),
    requiredFillMm: required,
    quality: {
      count,
      meanMassMg: num(meanMassMg, 2),
      hardnessN: hardness,
      thicknessMm,
      diameterMm: input.diameterMm,
      friabilityPercent: friability,
      disintegrationMin: disintegration,
      dissolution30Percent: dissolution,
      assayPercent: assay,
      massRsdPercent: num(massRsd, 2),
      capping,
      overLubricated,
      hasDisintegrant: input.hasDisintegrant,
      referenceThicknessMm,
      simulated: true,
    },
  };
}

function carriesDisintegrant(lots: Lot[], lot: Lot, seen = new Set<string>()): boolean {
  if (seen.has(lot.id)) {
    return false;
  }
  seen.add(lot.id);
  if (lot.role === "disintegrant") {
    return true;
  }
  return lot.parentIds.some((id) => {
    const parent = lots.find((item) => item.id === id);
    return parent ? carriesDisintegrant(lots, parent, seen) : false;
  });
}

export function suggestFill(session: TabletSession) {
  const recipe = recipeOf(session);
  const mass = activeLots(session).find((lot) => lot.role === "press_mass");
  if (!recipe || !mass) {
    return null;
  }
  const target = gramsFromMg(solidsMg(recipe));
  return requiredFillMm(target, mass.bulkDensityGPerMl, session.press.punchDiameterMm);
}

export function startCompression(session: TabletSession, now: string): ActionResult {
  const issue = pressIssue(session.press);
  if (issue) {
    return fail(session, issue, {}, now);
  }
  if (!session.press.setupConfirmed) {
    return fail(session, "press_setup_required", {}, now);
  }
  const mass = activeLots(session).find((lot) => lot.role === "press_mass" && lot.location === "press");
  if (!mass) {
    return fail(session, "press_missing", {}, now);
  }
  if (session.route === "wet_granulation" && (mass.moistureFraction < EDU_SPEC.moistureMin || mass.moistureFraction > EDU_SPEC.moistureMax)) {
    return fail(session, "press_moisture", { moisture: num(mass.moistureFraction * 100, 2) }, now);
  }
  const recipe = recipeOf(session);
  if (!recipe || !session.route) {
    return fail(session, "gate_no_route", {}, now);
  }
  const plan = compressionPlan({
    massG: mass.massG,
    targetMassG: gramsFromMg(solidsMg(recipe)),
    fillDepthMm: session.press.fillDepthMm,
    diameterMm: session.press.punchDiameterMm,
    bulkDensity: mass.bulkDensityGPerMl,
    forceKn: session.press.forceKn,
    moisture: mass.moistureFraction,
    lubricantMinutes: mass.lubricantMinutes,
    rsd: mass.rsdPercent ?? 2,
    granuleQuality: mass.granuleQuality,
    apiFraction: mass.apiFraction,
    hasDisintegrant: carriesDisintegrant(session.lots, mass),
    labelClaimMg: recipe.labelClaimMg,
    route: session.route,
  });
  if (!plan) {
    return fail(session, "press_not_enough", { mass: num(mass.massG, 3) }, now);
  }
  const techMinutes = Math.max(0.8, plan.count / Math.max(tabletsPerMinute(session.press), 1));
  return arm(session, "compression", techMinutes, {
    lotId: mass.id,
    kind: session.press.kind,
    force: session.press.forceKn,
    speed: session.press.speedPerMin,
    fill: session.press.fillDepthMm,
    diameter: session.press.punchDiameterMm,
    precomp: session.press.precompressionKn,
  }, now, "press_started");
}

function finishPress(session: TabletSession, payload: Params, fraction: number, now: string): ActionResult {
  const lotId = String(payload.lotId ?? "");
  const mass = session.lots.find((lot) => lot.id === lotId && !lot.consumed && lot.role === "press_mass");
  const recipe = recipeOf(session);
  if (!mass || !recipe || !session.route) {
    return fail(session, "press_missing", {}, now);
  }
  const used = roundMass(mass.massG * fraction);
  const idle = roundMass(mass.massG - used);
  const plan = compressionPlan({
    massG: used,
    targetMassG: gramsFromMg(solidsMg(recipe)),
    fillDepthMm: payloadNumber(payload, "fill", session.press.fillDepthMm),
    diameterMm: payloadNumber(payload, "diameter", session.press.punchDiameterMm) as 8 | 10 | 12,
    bulkDensity: mass.bulkDensityGPerMl,
    forceKn: payloadNumber(payload, "force", session.press.forceKn),
    moisture: mass.moistureFraction,
    lubricantMinutes: mass.lubricantMinutes,
    rsd: mass.rsdPercent ?? 2,
    granuleQuality: mass.granuleQuality,
    apiFraction: mass.apiFraction,
    hasDisintegrant: carriesDisintegrant(session.lots, mass),
    labelClaimMg: recipe.labelClaimMg,
    route: session.route,
  });
  if (!plan) {
    return ok(session, "job_cancelled", { stage: "compression" }, now, "compression", undefined, "warning");
  }
  const hopper = roundMass(idle + plan.remainderG);
  const created = bump(session, "lot");
  const tablets = blankLot({
    id: created.id,
    materialId: "tablets",
    nameKey: "tablets",
    role: "tablets",
    kind: "product",
    batch: session.seriesId ?? "",
    massG: plan.productG,
    moistureFraction: mass.moistureFraction,
    apiFraction: mass.apiFraction,
    location: "press",
    identity: "released",
    parentIds: [mass.id],
    seriesId: session.seriesId ?? "",
    lineId: null,
    d50Mm: payloadNumber(payload, "diameter", 12),
    bulkDensityGPerMl: mass.bulkDensityGPerMl,
    granuleQuality: mass.granuleQuality,
    lubricantMinutes: mass.lubricantMinutes,
    rsdPercent: mass.rsdPercent,
    quality: { ...plan.quality, count: plan.count },
  });
  let next = created.session;
  if (hopper > 0.01) {
    next = replaceLot(next, mass.id, { ...mass, massG: hopper });
  } else {
    next = replaceLot(next, mass.id, consumeLot({ ...mass, massG: 0 }));
    if (hopper > EPS) {
      next = addLoss(next, "compression", "loss_press", hopper);
    }
  }
  const dustId = bump(next, "lot");
  const dust = blankLot({
    id: dustId.id,
    materialId: "dust",
    nameKey: "dust",
    role: "dust",
    kind: "waste",
    batch: session.seriesId ?? "",
    massG: plan.lossG,
    moistureFraction: mass.moistureFraction,
    apiFraction: mass.apiFraction,
    location: "waste",
    identity: "released",
    parentIds: [mass.id],
    seriesId: session.seriesId ?? "",
    lineId: null,
    d50Mm: 0.05,
    bulkDensityGPerMl: 0.4,
  });
  next = mark({ ...dustId.session, lots: [...next.lots, tablets, dust], selectedLotId: tablets.id }, "compression", "done");
  const partial = fraction < 0.999;
  return ok(next, partial ? "press_partial" : "press_done", { count: plan.count, mass: num(plan.productG, 3), loss: num(plan.lossG, 3), remainder: num(hopper, 3), mean: plan.quality.meanMassMg }, now, "compression", {
    massInG: num(used, 4),
    massOutG: num(plan.productG, 4),
    lossG: num(plan.lossG, 4),
  });
}

export function startDedust(session: TabletSession, now: string): ActionResult {
  const lot = activeLots(session).find((item) => item.role === "tablets" && item.location === "deduster" && !item.dedusted);
  if (!lot) {
    return fail(session, "dedust_missing", {}, now);
  }
  return arm(session, "dedusting", 1.5, { lotId: lot.id }, now, "dedust_started");
}

function finishDedust(session: TabletSession, lotId: string, now: string): ActionResult {
  const lot = session.lots.find((item) => item.id === lotId && !item.consumed);
  if (!lot?.quality) {
    return fail(session, "dedust_missing", {}, now);
  }
  const dustMass = roundMass(lot.massG * EDU_SPEC.dedustLossFraction);
  const massOut = roundMass(lot.massG - dustMass);
  const mean = num((massOut / lot.quality.count) * 1000, 2);
  const updated: Lot = {
    ...lot,
    massG: massOut,
    dedusted: true,
    quality: { ...lot.quality, meanMassMg: mean },
  };
  const dustId = bump(replaceLot(session, lot.id, updated), "lot");
  const dust = blankLot({
    id: dustId.id,
    materialId: "dust",
    nameKey: "dust",
    role: "dust",
    kind: "waste",
    batch: session.seriesId ?? "",
    massG: dustMass,
    moistureFraction: lot.moistureFraction,
    apiFraction: lot.apiFraction,
    location: "waste",
    identity: "released",
    parentIds: [lot.id],
    seriesId: session.seriesId ?? "",
    lineId: null,
    d50Mm: 0.02,
    bulkDensityGPerMl: 0.3,
  });
  const next = mark({ ...dustId.session, lots: [...dustId.session.lots, dust] }, "dedusting", "done");
  return ok(next, "dedust_done", { mass: num(massOut, 3), dust: num(dustMass, 3), hardness: lot.quality.hardnessN }, now, "dedusting", {
    massInG: num(lot.massG, 4),
    massOutG: num(massOut, 4),
    lossG: num(dustMass, 4),
  });
}

function hashString(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function unitZ(seed: number, index: number) {
  let x = (seed ^ Math.imul(index + 1, 0x9e3779b1)) >>> 0;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  const u1 = Math.max(((x >>> 0) % 100000) / 100000, 1e-6);
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  const u2 = ((x >>> 0) % 100000) / 100000;
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

export function simulatedMasses(lot: Lot) {
  if (!lot.quality) {
    return [];
  }
  const seed = hashString(`${lot.seriesId}:${lot.id}`);
  const rsd = lot.quality.massRsdPercent / 100;
  return Array.from({ length: EDU_SPEC.massUniformitySample }, (_, index) => {
    const z = Math.max(-2.5, Math.min(2.5, unitZ(seed, index)));
    return num(lot.quality!.meanMassMg * (1 + z * rsd), 2);
  });
}

function takeTablets(session: TabletSession, lot: Lot, count: number, now: string, method: QcMethodId) {
  if (!lot.quality || lot.quality.count < count) {
    return null;
  }
  const meanG = lot.quality.meanMassMg / 1000;
  const removed = roundMass(meanG * count);
  const left = lot.quality.count - count;
  const updated: Lot = left > 0
    ? { ...lot, massG: roundMass(lot.massG - removed), quality: { ...lot.quality, count: left } }
    : consumeLot({ ...lot, quality: { ...lot.quality, count: 0 } });
  let next = addLoss(replaceLot(session, lot.id, updated), "qc", `qc_${method}`, removed);
  next = pushJournal(next, "qc", "qc_sample", { method, count, mass: num(removed, 3) }, num(lot.massG, 4), num(Math.max(0, lot.massG - removed), 4), num(removed, 4), now);
  return next;
}

export function runQc(session: TabletSession, method: QcMethodId, now: string): ActionResult {
  const blocked = guard(session, now);
  if (blocked) {
    return blocked;
  }
  if (stageView(session, "qc").status === "blocked") {
    return fail(session, "gate_need_compression", {}, now);
  }
  const selected = session.lots.find((lot) => lot.id === session.selectedLotId && lot.role === "tablets" && !lot.consumed);
  const located = activeLots(session).filter((lot) => lot.role === "tablets" && lot.location === "qc");
  const lot = selected && selected.location === "qc" ? selected : located.length === 1 ? located[0] : undefined;
  if (!lot?.quality || !session.seriesId) {
    return fail(session, located.length > 1 ? "qc_select_lot" : "qc_need_tablets", {}, now);
  }
  if (method === "content_uniformity") {
    const fraction = (session.route ? solidsMg(recipeFor(session.route)) : lot.quality.meanMassMg) > 0
      ? (EDU_SPEC.labelClaimMg / lot.quality.meanMassMg) * 100
      : 0;
    return recordQc(session, lot, method, "not_applicable", null, "", 0, 0, "qc_content_na", { fraction: num(fraction, 1) }, now);
  }
  const quality = lot.quality;
  if (method === "appearance") {
    const pass = !quality.capping && quality.hardnessN >= 40;
    return recordQc(session, lot, method, pass ? "pass" : "fail", null, "", 10, 0, pass ? "qc_appearance_pass" : "qc_appearance_fail", { capping: quality.capping ? 1 : 0 }, now);
  }
  if (method === "average_mass") {
    const target = session.route ? solidsMg(recipeFor(session.route)) : quality.meanMassMg;
    const delta = Math.abs(quality.meanMassMg - target) / target;
    const pass = delta <= EDU_SPEC.meanMassFraction;
    return recordQc(session, lot, method, pass ? "pass" : "fail", quality.meanMassMg, "mg", 20, 0, pass ? "qc_mass_pass" : "qc_mass_fail", { value: quality.meanMassMg, target: num(target, 1) }, now);
  }
  if (method === "mass_uniformity") {
    if (quality.count < EDU_SPEC.massUniformitySample) {
      return fail(session, "qc_need_sample", { need: EDU_SPEC.massUniformitySample, have: quality.count }, now);
    }
    const masses = simulatedMasses(lot);
    const target = quality.meanMassMg;
    const outsideInner = masses.filter((mass) => Math.abs(mass - target) / target > EDU_SPEC.massUniformityInner).length;
    const outsideOuter = masses.filter((mass) => Math.abs(mass - target) / target > EDU_SPEC.massUniformityOuter).length;
    const pass = outsideOuter === 0 && outsideInner <= EDU_SPEC.massUniformityMaxOutside;
    return recordQc(session, lot, method, pass ? "pass" : "fail", outsideInner, "tablets", EDU_SPEC.massUniformitySample, 0, pass ? "qc_uniform_pass" : "qc_uniform_fail", { outside: outsideInner, outer: outsideOuter }, now);
  }
  if (method === "dimensions") {
    const thicknessOk = Math.abs(quality.thicknessMm - quality.referenceThicknessMm) / quality.referenceThicknessMm <= EDU_SPEC.thicknessFraction;
    const diameterOk = Math.abs(quality.diameterMm - session.press.punchDiameterMm) <= EDU_SPEC.diameterToleranceMm;
    const pass = thicknessOk && diameterOk;
    return recordQc(session, lot, method, pass ? "pass" : "fail", quality.thicknessMm, "mm", 10, 0, pass ? "qc_size_pass" : "qc_size_fail", { thickness: quality.thicknessMm, reference: quality.referenceThicknessMm, diameter: quality.diameterMm }, now);
  }
  const destructive: Record<string, { count: number; value: number; unit: string; pass: boolean; passCode: string; failCode: string }> = {
    hardness: {
      count: 6,
      value: quality.hardnessN,
      unit: "N",
      pass: quality.hardnessN >= EDU_SPEC.hardnessMinN && quality.hardnessN <= EDU_SPEC.hardnessMaxN,
      passCode: "qc_hardness_pass",
      failCode: "qc_hardness_fail",
    },
    friability: {
      count: Math.max(1, Math.ceil(6.5 / (quality.meanMassMg / 1000))),
      value: quality.friabilityPercent,
      unit: "%",
      pass: quality.friabilityPercent <= EDU_SPEC.friabilityMaxPercent,
      passCode: "qc_friability_pass",
      failCode: "qc_friability_fail",
    },
    disintegration: {
      count: 6,
      value: quality.disintegrationMin,
      unit: "min",
      pass: quality.disintegrationMin <= EDU_SPEC.disintegrationMaxMin,
      passCode: "qc_disint_pass",
      failCode: "qc_disint_fail",
    },
    dissolution: {
      count: 6,
      value: quality.dissolution30Percent,
      unit: "%",
      pass: quality.dissolution30Percent >= EDU_SPEC.dissolutionMinPercent,
      passCode: "qc_dissolution_pass",
      failCode: "qc_dissolution_fail",
    },
    assay: {
      count: 5,
      value: quality.assayPercent,
      unit: "%",
      pass: quality.assayPercent >= EDU_SPEC.assayMin && quality.assayPercent <= EDU_SPEC.assayMax,
      passCode: "qc_assay_pass",
      failCode: "qc_assay_fail",
    },
  };
  const test = destructive[method];
  if (!test) {
    return fail(session, "qc_need_tablets", {}, now);
  }
  if (quality.count < test.count) {
    return fail(session, "qc_need_sample", { need: test.count, have: quality.count }, now);
  }
  const taken = takeTablets(session, lot, test.count, now, method);
  if (!taken) {
    return fail(session, "qc_need_sample", { need: test.count, have: quality.count }, now);
  }
  return recordQc(taken, lot, method, test.pass ? "pass" : "fail", test.value, test.unit, test.count, test.count, test.pass ? test.passCode : test.failCode, { value: test.value }, now);
}

function recordQc(
  session: TabletSession,
  lot: Lot,
  method: QcMethodId,
  status: QcRun["status"],
  value: number | null,
  unit: string,
  sampleCount: number,
  consumedCount: number,
  detailCode: string,
  params: Params,
  now: string,
): ActionResult {
  const nextId = bump(session, "qc");
  const run: QcRun = {
    id: nextId.id,
    method,
    seriesId: session.seriesId ?? "",
    lotId: lot.id,
    at: now,
    status,
    value,
    unit,
    sampleCount,
    consumedCount,
    simulated: true,
    detailCode,
    params,
  };
  const doneMethods = new Set([...session.qcRuns.map((item) => item.method), method]);
  const allDone = (["appearance", "average_mass", "mass_uniformity", "content_uniformity", "dimensions", "hardness", "friability", "disintegration", "dissolution", "assay"] as QcMethodId[]).every((item) => doneMethods.has(item));
  let next = { ...nextId.session, qcRuns: [run, ...session.qcRuns] };
  if (allDone) {
    next = mark(next, "qc", "done");
  }
  const tone: NoticeTone = status === "fail" ? "warning" : "success";
  return ok(next, detailCode, { ...params, method }, now, "qc", undefined, tone);
}

export function packSeries(session: TabletSession, kind: PackKind, count: number, now: string): ActionResult {
  const blocked = guard(session, now);
  if (blocked) {
    return blocked;
  }
  if (stageView(session, "packaging").status === "blocked") {
    return fail(session, "gate_need_compression", {}, now);
  }
  const selected = session.lots.find((lot) => lot.id === session.selectedLotId && lot.role === "tablets" && lot.location === "pack" && !lot.consumed);
  const located = activeLots(session).filter((lot) => lot.role === "tablets" && lot.location === "pack");
  const lot = selected ?? (located.length === 1 ? located[0] : undefined);
  if (!lot?.quality) {
    return fail(session, located.length > 1 ? "qc_select_lot" : "pack_missing", {}, now);
  }
  if (!Number.isInteger(count) || count < 1 || count > lot.quality.count) {
    return fail(session, "pack_count", { have: lot.quality.count }, now);
  }
  const meanG = lot.quality.meanMassMg / 1000;
  const removed = roundMass(meanG * count);
  const left = lot.quality.count - count;
  const updated: Lot = left > 0
    ? { ...lot, massG: roundMass(Math.max(0, lot.massG - removed)), quality: { ...lot.quality, count: left } }
    : consumeLot({ ...lot, quality: { ...lot.quality, count: 0 } });
  const labelNo = session.packed.length + 1;
  const label = `${session.seriesId ?? "EDU-TAB"}-${kind}-${labelNo}`;
  const packedId = bump(replaceLot(session, lot.id, updated), "pack");
  const next = mark({
    ...packedId.session,
    packed: [...session.packed, { id: packedId.id, kind, count, massG: removed, label, lotId: lot.id }],
  }, "packaging", "done");
  return ok(next, "pack_done", { count, label, kind }, now, "packaging", { massInG: num(lot.massG, 4), massOutG: num(removed, 4) });
}

function reportGap(session: TabletSession) {
  if (!session.route) {
    return "gate_no_route";
  }
  const required: StageId[] = session.route === "direct"
    ? ["intake", "weighing", "premix", "lubrication", "compression", "packaging"]
    : ["intake", "weighing", "premix", "granulating_liquid", "granulation", "drying", "moisture_check", "final_blend", "lubrication", "compression", "packaging"];
  for (const stage of required) {
    const value = session.marks[stage];
    if (value !== "done" && value !== "warning") {
      return `gate_need_${stage}`;
    }
  }
  for (const stage of stagesFor(session.route).filter((item) => isOptional(item))) {
    if (!session.marks[stage]) {
      return "gate_optional_open";
    }
  }
  const methods: QcMethodId[] = ["appearance", "average_mass", "mass_uniformity", "content_uniformity", "dimensions", "hardness", "friability", "disintegration", "dissolution", "assay"];
  for (const method of methods) {
    if (!session.qcRuns.some((run) => run.method === method && run.seriesId === session.seriesId)) {
      return "gate_need_qc";
    }
  }
  if (!session.packed.length) {
    return "pack_missing";
  }
  return null;
}

export function closeSeries(session: TabletSession, now: string): ActionResult {
  const blocked = guard(session, now);
  if (blocked) {
    return blocked;
  }
  const gap = reportGap(session);
  if (gap || !session.route || !session.seriesId) {
    return fail(session, "report_incomplete", { reason: gap ?? "gate_no_route" }, now);
  }
  const recipe = recipeFor(session.route);
  const report: SeriesReport = {
    seriesId: session.seriesId,
    route: session.route,
    createdAt: now,
    batchTablets: session.batchTablets,
    composition: recipe.lines.map((line) => ({
      lineId: line.id,
      materialId: line.materialId,
      targetG: num(targetGrams(recipe, line, session.batchTablets), 4),
      actualG: num(session.weighedByLine[line.id] ?? 0, 4),
    })),
    losses: session.losses.map((loss) => ({ code: loss.code, grams: loss.grams })),
    tabletCount: session.journal
      .filter((entry) => entry.code === "press_done" || entry.code === "press_partial")
      .reduce((total, entry) => total + Number(entry.params.count ?? 0), 0),
    packedCount: session.packed.reduce((total, item) => total + item.count, 0),
    remainderG: num(sum(activeLots(session).filter((lot) => lot.kind !== "product").map((lot) => lot.massG)), 4),
    qc: qcMethods.map((method) => {
      const runs = session.qcRuns.filter((run) => run.method === method);
      const latest = runs[0];
      return { method, status: latest?.status ?? "fail" };
    }),
    status: session.qcRuns.some((run) => run.status === "fail") ? "complete_with_deviations" : "complete",
    simulation: true,
  };
  const next = { ...session, report, closed: true };
  return ok(next, "report_ready", { seriesId: session.seriesId, status: report.status }, now, "packaging");
}

export function balanceSheet(session: TabletSession) {
  const active = session.lots.filter((lot) => lot.kind !== "stock" && !lot.consumed);
  const activeG = sum(active.map((lot) => lot.massG));
  const lossG = sum(session.losses.map((loss) => loss.grams));
  const packedG = sum(session.packed.map((item) => item.massG));
  const accounted = roundMass(activeG + lossG + packedG);
  return {
    inputsG: session.inputsG,
    activeG,
    lossG,
    packedG,
    gapG: roundMass(session.inputsG - accounted),
    losses: session.losses,
  };
}

export function forecastDrying(session: TabletSession) {
  const loads = activeLots(session).filter((lot) => (lot.role === "wet_granules" || lot.role === "granules") && lot.location === "dryer");
  if (!loads.length) {
    return null;
  }
  const moisture0 = weighted(loads, (lot) => lot.moistureFraction);
  const moisture1 = driedMoisture(moisture0, session.dryer.temperatureC, session.dryer.minutes);
  const massIn = sum(loads.map((lot) => lot.massG));
  const massOut = massAfterDrying(massIn, moisture0, moisture1);
  return { moisture0, moisture1, removed: roundMass(massIn - massOut), simulated: true as const };
}

export function nextHint(session: TabletSession): { code: string; params: Params } {
  if (!session.route) {
    return { code: "hint_route", params: {} };
  }
  if (session.job) {
    return { code: "hint_running", params: { stage: session.job.stage } };
  }
  const stages = listStages(session);
  const current = stages.find((stage) => stage.status === "ready" || stage.status === "awaiting" || stage.status === "blocked");
  if (!current) {
    return { code: session.report ? "hint_report" : "hint_close", params: {} };
  }
  if (current.status === "awaiting") {
    return { code: "hint_place", params: { stage: current.id } };
  }
  if (current.status === "blocked") {
    return { code: current.reason, params: { stage: current.id } };
  }
  return { code: `hint_${current.id}`, params: { stage: current.id } };
}

export function dismissNotice(session: TabletSession, id: string) {
  return { ...session, notices: session.notices.filter((notice) => notice.id !== id) };
}

export function selectUi(
  session: TabletSession,
  patch: Partial<Pick<TabletSession, "view" | "guidance" | "reducedMotion" | "selectedStage" | "selectedLotId" | "selectedEquipmentId" | "floor">>,
) {
  return { ...session, ...patch };
}

