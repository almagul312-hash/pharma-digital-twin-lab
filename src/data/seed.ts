import { exampleRecipes } from "@/data/recipes";
import { substanceById } from "@/data/substances";
import { scaleRecipe } from "@/lib/recipeMath";
import type {
  EquipmentCategory,
  MachineRuntime,
  MaterialLot,
  Recipe,
  ToolId,
  ZoneId,
} from "@/types/process";

export type ToolPlace = {
  id: ToolId;
  zone: ZoneId;
  x: number;
  z: number;
};

export function seedTools(): ToolPlace[] {
  return [
    { id: "spatula", zone: "warehouse", x: 1.7, z: 0.85 },
    { id: "scoop", zone: "warehouse", x: 1.95, z: 0.85 },
    { id: "pestle_mortar", zone: "warehouse", x: 1.7, z: 0.45 },
    { id: "weigh_boat", zone: "warehouse", x: -0.35, z: 0.85 },
    { id: "watch_glass", zone: "warehouse", x: -0.05, z: 0.85 },
    { id: "powder_jar", zone: "warehouse", x: 0.9, z: 0.9 },
    { id: "beaker_100", zone: "process", x: 0.15, z: 0.85 },
    { id: "beaker_250", zone: "process", x: 0.45, z: 0.85 },
    { id: "cylinder_50", zone: "process", x: 0.75, z: 0.85 },
    { id: "funnel", zone: "process", x: 0.15, z: 0.5 },
    { id: "glass_rod", zone: "process", x: 0.4, z: 0.5 },
    { id: "sieve_hand", zone: "process", x: 0.7, z: 0.5 },
    { id: "tray", zone: "drying", x: 0.9, z: 0.7 },
    { id: "tweezers", zone: "encapsulation", x: 0.2, z: 0.75 },
    { id: "brush", zone: "encapsulation", x: 0.45, z: 0.75 },
  ];
}

export const defaultEquipment: Record<EquipmentCategory, string> = {
  scale: "scale_precision",
  mixer: "mixer_v",
  mill: "mill_lab",
  sieve: "sieve_vibe",
  granulator: "granulator_hs",
  dryer: "dryer_cabinet",
  encapsulator: "encap_manual",
  deduster: "deduster_lab",
  desiccator: "desiccator_lab",
  qc: "qc_bench",
};

export function idleMachine(catalogId: string, extra: Record<string, number> = {}): MachineRuntime {
  return {
    catalogId,
    phase: "idle",
    progress: 0,
    elapsedSec: 0,
    durationSec: 0,
    loadedLotIds: [],
    params: extra,
    actual: {},
  };
}

export function seedLots(recipe: Recipe, at: string): MaterialLot[] {
  const scaled = scaleRecipe(recipe);
  return scaled.lines.map((line, index) => {
    const substance = substanceById(line.substanceId);
    const name = substance?.name.ru ?? line.substanceId;
    return {
      id: `lot-${line.id}`,
      name,
      kind: "raw" as const,
      massG: line.nominalG,
      moisturePercent: substance?.moisturePercent ?? 1,
      bulkDensityGCm3: substance?.bulkDensityGCm3 ?? 0.4,
      components: [
        {
          substanceId: line.substanceId,
          role: line.role,
          massG: line.nominalG,
        },
      ],
      batchNo: `TRN-24-${String(index + 1).padStart(2, "0")}`,
      releaseStatus: "quarantine" as const,
      place: {
        kind: "table" as const,
        zone: "warehouse" as const,
        x: -1.4 + (index % 5) * 0.55,
        z: 0.9 - Math.floor(index / 5) * 0.45,
      },
      history: [{ at, action: "seed", detail: "session start" }],
    };
  });
}

export function defaultRecipe() {
  return structuredClone(exampleRecipes[0]);
}
