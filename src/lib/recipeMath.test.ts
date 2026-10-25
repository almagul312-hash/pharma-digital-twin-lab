import { describe, expect, it } from "vitest";
import { exampleRecipes } from "@/data/recipes";
import { recipeWarnings, scaleRecipe } from "@/lib/recipeMath";
import { capsuleYield, fillMassMg } from "@/lib/capsuleFill";
import { canMerge, mergeLots, splitLot } from "@/lib/materials";
import { massBalance } from "@/lib/balance";
import { canStartOperation, wallSecondsForProcess } from "@/lib/processGraph";
import { nearestEquipmentSlot } from "@/lib/sceneSlots";
import { seedLots } from "@/data/seed";
import type { GraphContext } from "@/lib/processGraph";
import type { MaterialLot } from "@/types/process";

const recipe = exampleRecipes[0];

function ctx(partial: Partial<GraphContext> = {}): GraphContext {
  return {
    route: "direct_blend",
    recipe,
    completed: [],
    weighedLineIds: [],
    hasReleasedMaterials: false,
    ...partial,
  };
}

function lot(partial: Partial<MaterialLot> & Pick<MaterialLot, "id" | "massG">): MaterialLot {
  return {
    name: partial.id,
    kind: "weighed",
    moisturePercent: 2,
    bulkDensityGCm3: 0.45,
    components: [{ substanceId: "ibuprofen", role: "api", massG: partial.massG }],
    batchNo: "T",
    releaseStatus: "released",
    place: { kind: "inventory" },
    history: [],
    ...partial,
  };
}

describe("recipe scaling", () => {
  it("scales component masses with capsule count", () => {
    const a = scaleRecipe(recipe, 200);
    const b = scaleRecipe(recipe, 400);
    expect(b.fillMassG).toBeCloseTo(a.fillMassG * 2, 5);
    expect(a.lines.find((line) => line.substanceId === "ibuprofen")?.nominalG).toBeCloseTo(40, 5);
    const fractions = a.lines.filter((line) => line.inFill).reduce((sum, line) => sum + line.fractionPercent, 0);
    expect(fractions).toBeCloseTo(100, 4);
  });

  it("flags a missing API", () => {
    const broken = { ...recipe, lines: recipe.lines.filter((line) => line.role !== "api") };
    expect(recipeWarnings(broken).warnings).toContain("missing_api");
  });
});

describe("capsule fill", () => {
  it("uses density and capsule volume rather than an arbitrary fill", () => {
    const dense = fillMassMg(0.8, "1");
    const light = fillMassMg(0.4, "1");
    expect(dense).toBeGreaterThan(light);
    expect(dense).toBeCloseTo(0.8 * 0.5 * 0.9 * 1000, 1);
  });

  it("limits capsule count by blend mass and empty shells", () => {
    const blend = lot({ id: "b", massG: 32, bulkDensityGCm3: 0.5, kind: "final_blend" });
    const result = capsuleYield(blend, "1", 20);
    expect(result.possible).toBeLessThanOrEqual(20);
    expect(result.usedBlendG + result.leftoverG).toBeCloseTo(32, 3);
  });
});

describe("material split and merge", () => {
  it("preserves mass when splitting", () => {
    const source = lot({ id: "a", massG: 10 });
    const result = splitLot(source, 4, "b", "t");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.taken.massG + result.remaining.massG).toBeCloseTo(10, 4);
      expect(result.taken.id).toBe("b");
      expect(result.remaining.id).toBe("a");
    }
  });

  it("rejects merging capsules", () => {
    const a = lot({ id: "c1", massG: 1, kind: "capsules" });
    const b = lot({ id: "c2", massG: 1, kind: "capsules" });
    expect(canMerge(a, b).ok).toBe(false);
  });

  it("merges compatible powders", () => {
    const a = lot({ id: "p1", massG: 5 });
    const b = lot({
      id: "p2",
      massG: 3,
      components: [{ substanceId: "lactose", role: "filler", massG: 3 }],
    });
    const merged = mergeLots(a, b, "t");
    expect(merged.massG).toBeCloseTo(8, 4);
  });
});

describe("process graph", () => {
  it("blocks blending before weighing", () => {
    const result = canStartOperation("blend_main", ctx({ completed: ["receive", "identity_release"] }));
    expect(result.ok).toBe(false);
  });

  it("does not require drying on the direct-blend route", () => {
    const drying = canStartOperation(
      "dry",
      ctx({
        completed: ["receive", "identity_release", "weigh", "preblend", "blend_main", "add_glidant_lubricant"],
      }),
    );
    expect(drying.ok).toBe(false);
  });

  it("requires drying after wet granulation", () => {
    const wet = canStartOperation(
      "dry",
      ctx({
        route: "wet_granulation",
        recipe: exampleRecipes[1],
        completed: ["receive", "identity_release", "weigh", "preblend", "binder_solution", "wet_granulate"],
      }),
    );
    expect(wet.ok).toBe(true);
  });

  it("blocks encapsulation until IPC on the matching route", () => {
    const early = canStartOperation(
      "encapsulate",
      ctx({
        completed: ["receive", "identity_release", "weigh", "preblend", "blend_main", "add_glidant_lubricant"],
      }),
    );
    expect(early.ok).toBe(false);
  });

  it("allows encapsulation after blend IPC on the direct-blend route", () => {
    const ready = canStartOperation(
      "encapsulate",
      ctx({
        completed: [
          "receive",
          "identity_release",
          "weigh",
          "preblend",
          "blend_main",
          "add_glidant_lubricant",
          "ipc_blend",
        ],
      }),
    );
    expect(ready.ok).toBe(true);
  });

  it("keeps milling optional after weighing", () => {
    const mill = canStartOperation("mill", ctx({ completed: ["receive", "identity_release", "weigh"] }));
    expect(mill.ok).toBe(true);
  });

  it("does not offer main dry-blend on the wet-granulation route", () => {
    const blend = canStartOperation(
      "blend_main",
      ctx({
        route: "wet_granulation",
        recipe: exampleRecipes[1],
        completed: ["receive", "identity_release", "weigh", "preblend"],
      }),
    );
    expect(blend.ok).toBe(false);
  });
});

describe("timers and drop targeting", () => {
  it("does not treat any non-zero time as a completed mix", () => {
    expect(wallSecondsForProcess(8, 40)).toBe(40);
    expect(wallSecondsForProcess(1, 40)).toBe(10);
    expect(wallSecondsForProcess(undefined, 25)).toBe(25);
  });

  it("maps a drop to the nearest machine, not a free location skip", () => {
    const choice = {
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
    expect(nearestEquipmentSlot("warehouse", -1.25, 0.05, choice)).toBe("scale_precision");
    expect(nearestEquipmentSlot("warehouse", 1.15, 0.5, choice)).toBe("sieve_vibe");
    expect(nearestEquipmentSlot("warehouse", 0, -1.8, choice)).toBeNull();
  });
});

describe("mass balance", () => {
  it("accounts for seeded lots against the formula", () => {
    const lots = seedLots(recipe, "t");
    const balance = massBalance(recipe, lots);
    expect(Math.abs(balance.gapG)).toBeLessThan(0.05);
    expect(balance.explained).toBe("balanced");
  });
});
