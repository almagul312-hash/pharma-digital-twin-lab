import { isFillComponent, scaleRecipe } from "@/lib/recipeMath";
import { lotMass } from "@/lib/materials";
import { roundTo } from "@/lib/formatLab";
import type { MaterialLot, Recipe } from "@/types/process";

export function massBalance(recipe: Recipe, lots: MaterialLot[]) {
  const scaled = scaleRecipe(recipe);
  const inputG = scaled.lines
    .filter((line) => line.substanceId !== "water")
    .reduce((sum, line) => sum + line.nominalG, 0);

  const powderLots = lots.filter((lot) => lot.kind !== "capsules" && lot.kind !== "rejected");
  const capsuleLots = lots.filter((lot) => lot.kind === "capsules");
  const rejectedLots = lots.filter((lot) => lot.kind === "rejected");

  const powderG = roundTo(
    powderLots.reduce((sum, lot) => sum + lotMass(lot), 0),
    4,
  );
  const capsulesG = roundTo(
    capsuleLots.reduce((sum, lot) => sum + lotMass(lot), 0),
    4,
  );
  const rejectedG = roundTo(
    rejectedLots.reduce((sum, lot) => sum + lotMass(lot), 0),
    4,
  );
  const accounted = roundTo(powderG + capsulesG + rejectedG, 4);
  const gap = roundTo(accounted - inputG, 4);

  return {
    recipeInputG: roundTo(inputG, 4),
    fillMassG: scaled.fillMassG,
    powderG,
    capsulesG,
    rejectedG,
    accountedG: accounted,
    gapG: gap,
    explained:
      Math.abs(gap) < 0.05
        ? "balanced"
        : gap < 0
          ? "in_process_or_model_loss"
          : "extra_mass",
  };
}

export function weighedLineCoverage(recipe: Recipe, lots: MaterialLot[]) {
  const needed = recipe.lines.filter(
    (line) => isFillComponent(line.role) || line.role === "capsule_shell" || line.role === "binder",
  );
  const weighed = new Set(
    lots
      .filter((lot) => lot.kind === "weighed" || lot.kind === "sieved" || lot.kind === "milled")
      .flatMap((lot) => lot.components.map((part) => part.substanceId)),
  );
  return {
    needed: needed.map((line) => line.id),
    weighedLineIds: needed.filter((line) => weighed.has(line.substanceId)).map((line) => line.id),
  };
}
