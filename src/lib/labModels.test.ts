import { describe, expect, it } from "vitest";
import { exampleRecipes } from "@/data/recipes";
import { massBalance } from "@/lib/balance";
import { encapsulateBlend } from "@/lib/capsuleFill";
import { moistureFromSolvent, stepDrying } from "@/lib/drying";
import { nextLocation } from "@/lib/labFlow";
import { shellMass, solidsMass, splitLot } from "@/lib/materials";
import { placeWithoutOverlap } from "@/lib/placement";
import { seedLots } from "@/data/seed";
import type { LabSample } from "@/types/lab";
import type { MaterialLot } from "@/types/process";

function sample(marks: LabSample["marks"]): LabSample {
  return {
    id: "s",
    name: "s",
    type: "blend",
    mass: 1,
    moisture: 1,
    apiConcentration: 50,
    location: "warehouse",
    status: "in_process",
    marks,
    createdAt: "t",
    history: [],
  };
}

describe("drying model", () => {
  it("does not change solvent at time zero and does not use a fixed step", () => {
    const start = stepDrying({
      solventG: 8,
      solidsG: 60,
      processMinutes: 0,
      temperatureC: 50,
      targetMoisturePercent: 2,
      mode: "cabinet",
    });
    expect(start.solventG).toBeCloseTo(8, 3);
    const hot = stepDrying({
      solventG: 8,
      solidsG: 60,
      processMinutes: 4,
      temperatureC: 70,
      targetMoisturePercent: 2,
      mode: "cabinet",
    });
    const cold = stepDrying({
      solventG: 8,
      solidsG: 60,
      processMinutes: 4,
      temperatureC: 30,
      targetMoisturePercent: 2,
      mode: "cabinet",
    });
    expect(hot.solventG).toBeLessThan(cold.solventG);
    const one = stepDrying({
      solventG: 8,
      solidsG: 60,
      processMinutes: 1,
      temperatureC: 50,
      targetMoisturePercent: 2,
      mode: "cabinet",
    });
    expect(8 - one.solventG).not.toBeCloseTo(0.15, 2);
  });

  it("approaches the target without crossing it", () => {
    const late = stepDrying({
      solventG: 8,
      solidsG: 60,
      processMinutes: 40,
      temperatureC: 50,
      targetMoisturePercent: 2,
      mode: "cabinet",
    });
    const target = (60 * 0.02) / 0.98;
    expect(late.solventG).toBeGreaterThan(target - 0.05);
    expect(late.moisturePercent).toBeGreaterThan(1.5);
    expect(late.moisturePercent).toBeLessThan(3);
    expect(moistureFromSolvent(late.solventG, 60)).toBeCloseTo(late.moisturePercent, 2);
  });
});

describe("placement", () => {
  it("keeps a disk out of a locked footprint and inside the bench", () => {
    const placed = placeWithoutOverlap(0, 0, 0.16, [{ x: 0, z: 0, radius: 0.4 }]);
    expect(Math.hypot(placed.x, placed.z)).toBeGreaterThanOrEqual(0.55);
    const edge = placeWithoutOverlap(9, -9, 0.1, []);
    expect(Math.abs(edge.x)).toBeLessThanOrEqual(2.02);
    expect(Math.abs(edge.z)).toBeLessThanOrEqual(0.86);
  });
});

describe("route locations", () => {
  it("does not send a direct-blend sample to the dryer or desiccator", () => {
    expect(nextLocation(sample(["weighed", "blended"]), "direct_blend")).toBe("encapsulation");
  });

  it("sends wet granulation to the drying cabinet until it is dried", () => {
    expect(nextLocation(sample(["weighed", "blended"]), "wet_granulation")).toBe("binder_oven");
    expect(nextLocation(sample(["weighed", "blended", "dried"]), "wet_granulation")).toBe("encapsulation");
  });
});

describe("encapsulation and wet balance", () => {
  it("keeps solids and shells when capsules are filled", () => {
    const blend: MaterialLot = {
      id: "blend",
      name: "blend",
      kind: "final_blend",
      massG: 32,
      moisturePercent: 2,
      bulkDensityGCm3: 0.5,
      components: [{ substanceId: "ibuprofen", role: "api", massG: 32 }],
      batchNo: "T",
      releaseStatus: "released",
      place: { kind: "inventory" },
      history: [],
    };
    const shells: MaterialLot = {
      id: "shells",
      name: "shells",
      kind: "weighed",
      massG: 7.6,
      moisturePercent: 0,
      bulkDensityGCm3: 0.4,
      components: [{ substanceId: "capsule_shell", role: "capsule_shell", massG: 7.6 }],
      batchNo: "T",
      releaseStatus: "released",
      place: { kind: "inventory" },
      history: [],
    };
    const filled = encapsulateBlend({
      blend,
      shells,
      shellUnitG: 0.076,
      size: "1",
      newId: "caps",
      at: "t",
    });
    expect(filled.ok).toBe(true);
    if (!filled.ok) {
      return;
    }
    const solids =
      solidsMass(filled.capsules.components) + (filled.leftoverBlend ? solidsMass(filled.leftoverBlend.components) : 0);
    const shellsLeft =
      shellMass(filled.capsules.components) + (filled.leftoverShells ? shellMass(filled.leftoverShells.components) : 0);
    expect(solids).toBeCloseTo(32, 2);
    expect(shellsLeft).toBeCloseTo(7.6, 2);
    expect(filled.capsules.massG).toBeGreaterThan(filled.yieldInfo.usedBlendG);
  });

  it("explains solvent loss without a solids gap", () => {
    const recipe = exampleRecipes[1];
    const lots = seedLots(recipe, "t");
    const before = massBalance(recipe, lots);
    expect(before.explained).toBe("balanced");
    const dried = lots.map((lot) =>
      lot.components[0]?.substanceId === "water"
        ? { ...lot, massG: 0.2, components: [{ ...lot.components[0], massG: 0.2 }] }
        : lot,
    );
    const after = massBalance(recipe, dried);
    expect(Math.abs(after.gapG)).toBeLessThan(0.05);
    expect(after.explained).toBe("solvent_removed");
    expect(after.solventRemovedG).toBeGreaterThan(1);
  });

  it("keeps component sums aligned after a split", () => {
    const source: MaterialLot = {
      id: "a",
      name: "a",
      kind: "weighed",
      massG: 10,
      moisturePercent: 1,
      bulkDensityGCm3: 0.4,
      components: [
        { substanceId: "ibuprofen", role: "api", massG: 7 },
        { substanceId: "lactose", role: "filler", massG: 3 },
      ],
      batchNo: "T",
      releaseStatus: "released",
      place: { kind: "inventory" },
      history: [],
    };
    const result = splitLot(source, 4, "b", "t");
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    const taken = result.taken.components.reduce((sum, item) => sum + item.massG, 0);
    const left = result.remaining.components.reduce((sum, item) => sum + item.massG, 0);
    expect(taken + left).toBeCloseTo(10, 3);
  });
});
