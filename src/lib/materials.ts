import { substanceById } from "@/data/substances";
import type { LotComponent, MaterialLot } from "@/types/process";
import { roundTo } from "@/lib/formatLab";

export function lotMass(lot: MaterialLot) {
  const fromParts = lot.components.reduce((sum, item) => sum + item.massG, 0);
  return roundTo(fromParts || lot.massG, 4);
}

export function compositionOf(lots: MaterialLot[]): LotComponent[] {
  const map = new Map<string, LotComponent>();
  for (const lot of lots) {
    for (const part of lot.components) {
      const key = `${part.substanceId}:${part.role}`;
      const current = map.get(key);
      if (current) {
        current.massG += part.massG;
      } else {
        map.set(key, { ...part });
      }
    }
  }
  return [...map.values()].map((item) => ({ ...item, massG: roundTo(item.massG, 4) }));
}

export function solventMass(components: LotComponent[]) {
  return roundTo(
    components.filter((item) => item.substanceId === "water" || item.role === "wetting").reduce((sum, item) => sum + item.massG, 0),
    4,
  );
}

export function solidsMass(components: LotComponent[]) {
  return roundTo(
    components
      .filter((item) => item.substanceId !== "water" && item.role !== "wetting" && item.role !== "capsule_shell")
      .reduce((sum, item) => sum + item.massG, 0),
    4,
  );
}

export function shellMass(components: LotComponent[]) {
  return roundTo(components.filter((item) => item.role === "capsule_shell").reduce((sum, item) => sum + item.massG, 0), 4);
}

/** Shift the largest part so the component sum matches the stated mass. */
export function reconcileMass(components: LotComponent[], massG: number) {
  if (components.length === 0) {
    return components;
  }
  const next = components.map((item) => ({ ...item, massG: roundTo(item.massG, 4) }));
  const drift = roundTo(massG - next.reduce((sum, item) => sum + item.massG, 0), 4);
  if (Math.abs(drift) < 0.00005) {
    return next;
  }
  let index = 0;
  for (let cursor = 1; cursor < next.length; cursor += 1) {
    if (next[cursor].massG > next[index].massG) {
      index = cursor;
    }
  }
  next[index] = { ...next[index], massG: roundTo(next[index].massG + drift, 4) };
  return next;
}

export function weightedMoisture(components: LotComponent[]) {
  const total = components.reduce((sum, item) => sum + item.massG, 0);
  if (total <= 0) {
    return 0;
  }
  let acc = 0;
  for (const part of components) {
    const moisture = part.substanceId === "water" || part.role === "wetting" ? 100 : (substanceById(part.substanceId)?.moisturePercent ?? 0);
    acc += part.massG * moisture;
  }
  return roundTo(acc / total, 3);
}

export function weightedDensity(components: LotComponent[]) {
  const total = components.reduce((sum, item) => sum + item.massG, 0);
  if (total <= 0) {
    return 0.4;
  }
  let acc = 0;
  for (const part of components) {
    const density = substanceById(part.substanceId)?.bulkDensityGCm3 ?? 0.4;
    acc += part.massG * density;
  }
  return roundTo(acc / total, 3);
}

export function canMerge(a: MaterialLot, b: MaterialLot) {
  if (a.id === b.id) {
    return { ok: false as const, reason: "same_lot" };
  }
  const rejectable = new Set(["capsules", "rejected"]);
  if (rejectable.has(a.kind) || rejectable.has(b.kind)) {
    return { ok: false as const, reason: "capsules_not_merged" };
  }
  return { ok: true as const };
}

export function splitLot(lot: MaterialLot, takeG: number, newId: string, at: string) {
  const mass = lotMass(lot);
  const take = roundTo(Math.min(Math.max(0, takeG), mass), 4);
  if (take <= 0 || take >= mass) {
    return { ok: false as const, reason: "invalid_split" };
  }
  const ratio = take / mass;
  const remainMass = roundTo(mass - take, 4);
  const takenComponents = reconcileMass(
    lot.components.map((item) => ({
      ...item,
      massG: item.massG * ratio,
    })),
    take,
  );
  const remainComponents = reconcileMass(
    lot.components.map((item) => ({
      ...item,
      massG: item.massG * (1 - ratio),
    })),
    remainMass,
  );
  const taken: MaterialLot = {
    ...lot,
    id: newId,
    name: `${lot.name} · навеска`,
    massG: take,
    components: takenComponents,
    history: [
      ...lot.history,
      { at, action: "split", detail: `take ${take} g from ${lot.id}` },
    ],
  };
  const remaining: MaterialLot = {
    ...lot,
    massG: remainMass,
    components: remainComponents,
    history: [
      ...lot.history,
      { at, action: "split", detail: `remain ${roundTo(mass - take, 4)} g` },
    ],
  };
  return { ok: true as const, taken, remaining };
}

export function mergeLots(a: MaterialLot, b: MaterialLot, at: string): MaterialLot {
  const massG = roundTo(lotMass(a) + lotMass(b), 4);
  const components = reconcileMass(compositionOf([a, b]), massG);
  return {
    ...a,
    name: `${a.name} + ${b.name}`,
    kind: a.kind === b.kind ? a.kind : "blend",
    massG,
    components,
    moisturePercent: weightedMoisture(components),
    bulkDensityGCm3: weightedDensity(components),
    history: [
      ...a.history,
      { at, action: "merge", detail: `merged ${b.id} (${lotMass(b)} g)` },
    ],
  };
}

export function apiPercent(lot: MaterialLot) {
  const mass = lotMass(lot);
  if (mass <= 0) {
    return 0;
  }
  const api = lot.components
    .filter((item) => item.role === "api")
    .reduce((sum, item) => sum + item.massG, 0);
  return roundTo((api / mass) * 100, 2);
}
