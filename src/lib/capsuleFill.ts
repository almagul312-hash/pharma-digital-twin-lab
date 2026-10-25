import { capsuleVolumeMl } from "@/data/capsules";
import { lotMass } from "@/lib/materials";
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
