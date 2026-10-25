import { capsuleVolumeMl } from "@/data/capsules";
import { compositionOf, lotMass, reconcileMass, shellMass, solidsMass } from "@/lib/materials";
import { roundTo } from "@/lib/formatLab";
import type { CapsuleSize, MaterialLot } from "@/types/process";

const FILL_FRACTION = 0.9;

export function fillMassMg(bulkDensityGCm3: number, size: CapsuleSize, fillFraction = FILL_FRACTION) {
  const volumeMl = capsuleVolumeMl(size);
  const grams = bulkDensityGCm3 * volumeMl * fillFraction;
  return roundTo(grams * 1000, 1);
}

export function capsuleYield(blend: MaterialLot, size: CapsuleSize, emptyCapsules: number) {
  const fillMg = fillMassMg(blend.bulkDensityGCm3, size);
  const fillG = fillMg / 1000;
  if (fillG <= 0) {
    return { fillMg, possible: 0, usedBlendG: 0, leftoverG: lotMass(blend) };
  }
  const fromBlend = Math.floor(lotMass(blend) / fillG);
  const possible = Math.max(0, Math.min(fromBlend, Math.floor(emptyCapsules)));
  const usedBlendG = roundTo(possible * fillG, 4);
  return {
    fillMg,
    possible,
    usedBlendG,
    leftoverG: roundTo(lotMass(blend) - usedBlendG, 4),
  };
}

function complement(source: MaterialLot["components"], taken: MaterialLot["components"]) {
  const used = new Map(taken.map((item) => [`${item.substanceId}:${item.role}`, item.massG]));
  return source.map((item) => ({
    ...item,
    massG: roundTo(Math.max(0, item.massG - (used.get(`${item.substanceId}:${item.role}`) ?? 0)), 4),
  }));
}

export function portionComponents(lot: MaterialLot, grams: number) {
  const mass = lotMass(lot);
  if (mass <= 0 || grams <= 0) {
    return [];
  }
  const ratio = Math.min(1, grams / mass);
  return reconcileMass(
    lot.components.map((item) => ({ ...item, massG: item.massG * ratio })),
    roundTo(mass * ratio, 4),
  );
}

/**
 * Moves blend solids and empty-shell mass into filled capsules.
 * Shell unit mass comes from the formula line, not from a universal capsule weight.
 * Fill mass uses bulk density and the catalog geometric volume (training fill fraction).
 */
export function encapsulateBlend(input: {
  blend: MaterialLot;
  shells?: MaterialLot;
  shellUnitG: number;
  size: CapsuleSize;
  newId: string;
  at: string;
}) {
  const emptyCount =
    input.shells && input.shellUnitG > 0 ? Math.floor(lotMass(input.shells) / input.shellUnitG + 1e-6) : 0;
  const yieldInfo = capsuleYield(input.blend, input.size, emptyCount);
  if (yieldInfo.possible <= 0 || !input.shells) {
    return { ok: false as const, reason: emptyCount <= 0 ? "no_shells" : "no_blend", yieldInfo };
  }

  const shellsUsed = roundTo(yieldInfo.possible * input.shellUnitG, 4);
  const blendParts = portionComponents(input.blend, yieldInfo.usedBlendG);
  const shellParts = portionComponents(input.shells, shellsUsed);
  const capsuleMass = roundTo(yieldInfo.usedBlendG + shellsUsed, 4);
  const capsules: MaterialLot = {
    id: input.newId,
    name: "Наполненные капсулы",
    kind: "capsules",
    massG: capsuleMass,
    moisturePercent: input.blend.moisturePercent,
    bulkDensityGCm3: input.blend.bulkDensityGCm3,
    components: reconcileMass(compositionOf([{ ...input.blend, components: blendParts }, { ...input.shells, components: shellParts }]), capsuleMass),
    batchNo: input.blend.batchNo,
    releaseStatus: "released",
    place: input.blend.place,
    history: [
      ...input.blend.history,
      {
        at: input.at,
        action: "encapsulate",
        detail: `${yieldInfo.possible} caps × ${yieldInfo.fillMg} mg fill + shells ${shellsUsed} g (training model)`,
      },
    ],
  };

  const blendLeftParts = complement(input.blend.components, blendParts);
  const blendLeftMass = roundTo(blendLeftParts.reduce((sum, item) => sum + item.massG, 0), 4);
  const leftoverBlend =
    blendLeftMass > 0.01
      ? {
          ...input.blend,
          massG: blendLeftMass,
          components: blendLeftParts,
        }
      : null;
  const shellLeftParts = complement(input.shells.components, shellParts);
  const shellLeft = roundTo(shellLeftParts.reduce((sum, item) => sum + item.massG, 0), 4);
  const leftoverShells =
    shellLeft > 0.01
      ? {
          ...input.shells,
          massG: shellLeft,
          components: shellLeftParts,
        }
      : null;

  const conservedSolids = roundTo(
    solidsMass(capsules.components) + (leftoverBlend ? solidsMass(leftoverBlend.components) : 0),
    4,
  );
  const conservedShells = roundTo(shellMass(capsules.components) + (leftoverShells ? shellMass(leftoverShells.components) : 0), 4);

  return {
    ok: true as const,
    capsules,
    leftoverBlend,
    leftoverShells,
    yieldInfo,
    conservedSolids,
    conservedShells,
    sourceSolids: solidsMass(input.blend.components),
    sourceShells: shellMass(input.shells.components),
  };
}
