import type { EquipmentCategory, ZoneId } from "@/types/process";

export type SceneSlot = {
  category: EquipmentCategory;
  x: number;
  z: number;
};

export const zoneSlots: Record<ZoneId, SceneSlot[]> = {
  warehouse: [
    { category: "scale", x: -1.3, z: 0.1 },
    { category: "mill", x: 0.2, z: 0.55 },
    { category: "sieve", x: 1.2, z: 0.55 },
  ],
  process: [
    { category: "mixer", x: -0.9, z: 0 },
    { category: "granulator", x: 1.1, z: 0 },
  ],
  drying: [{ category: "dryer", x: 0, z: 0 }],
  encapsulation: [
    { category: "encapsulator", x: -0.8, z: 0 },
    { category: "deduster", x: 1.1, z: 0 },
  ],
  qc: [{ category: "qc", x: 0.7, z: 0 }],
  audit: [],
};

export function nearestEquipmentSlot(
  zone: ZoneId,
  x: number,
  z: number,
  choice: Record<EquipmentCategory, string>,
  maxDist = 0.6,
) {
  let best: { id: string; dist: number } | null = null;
  for (const slot of zoneSlots[zone]) {
    const dist = Math.hypot(x - slot.x, z - slot.z);
    if (dist <= maxDist && (!best || dist < best.dist)) {
      best = { id: choice[slot.category], dist };
    }
  }
  return best?.id ?? null;
}
