import { shellMass, solidsMass, solventMass } from "@/lib/materials";
import { scaleRecipe } from "@/lib/recipeMath";
import { roundTo } from "@/lib/formatLab";
import type { MaterialLot, Recipe } from "@/types/process";

const TOLERANCE_G = 0.05;

export function massBalance(recipe: Recipe, lots: MaterialLot[]) {
  const scaled = scaleRecipe(recipe);
  const inputSolids = roundTo(scaled.lines.filter((line) => line.inFill).reduce((sum, line) => sum + line.nominalG, 0), 4);
  const inputSolvent = roundTo(
    scaled.lines.filter((line) => line.substanceId === "water" || line.role === "wetting").reduce((sum, line) => sum + line.nominalG, 0),
    4,
  );
  const inputShells = roundTo(
    scaled.lines.filter((line) => line.role === "capsule_shell").reduce((sum, line) => sum + line.nominalG, 0),
    4,
  );

  let solids = 0;
  let solvent = 0;
  let shells = 0;
  let capsulesG = 0;
  let rejectedG = 0;
  let powderG = 0;

  for (const lot of lots) {
    const lotSolids = solidsMass(lot.components);
    const lotSolvent = solventMass(lot.components);
    const lotShells = shellMass(lot.components);
    solids += lotSolids;
    solvent += lotSolvent;
    shells += lotShells;
    if (lot.kind === "capsules") {
      capsulesG += lotSolids + lotSolvent + lotShells;
    } else if (lot.kind === "rejected") {
      rejectedG += lotSolids + lotSolvent + lotShells;
    } else {
      powderG += lotSolids + lotSolvent + lotShells;
    }
  }

  solids = roundTo(solids, 4);
  solvent = roundTo(solvent, 4);
  shells = roundTo(shells, 4);
  const solidsGap = roundTo(solids - inputSolids, 4);
  const shellGap = roundTo(shells - inputShells, 4);
  const solventGap = roundTo(solvent - inputSolvent, 4);
  const gap = roundTo(solidsGap + shellGap, 4);
  const solventRemoved = roundTo(Math.max(0, -solventGap), 4);

  let explained: "balanced" | "solvent_removed" | "extra_mass" | "solids_mismatch" = "balanced";
  if (Math.abs(gap) >= TOLERANCE_G) {
    explained = gap > 0 ? "extra_mass" : "solids_mismatch";
  } else if (solventGap > TOLERANCE_G) {
    explained = "extra_mass";
  } else if (solventRemoved >= TOLERANCE_G) {
    explained = "solvent_removed";
  }

  return {
    recipeInputG: roundTo(inputSolids + inputSolvent + inputShells, 4),
    fillMassG: scaled.fillMassG,
    solidsG: solids,
    solventG: solvent,
    shellsG: shells,
    solventRemovedG: solventRemoved,
    powderG: roundTo(powderG, 4),
    capsulesG: roundTo(capsulesG, 4),
    rejectedG: roundTo(rejectedG, 4),
    accountedG: roundTo(solids + solvent + shells, 4),
    gapG: gap,
    explained,
  };
}

export function weighedLineCoverage(recipe: Recipe, lots: MaterialLot[]) {
  const needed = recipe.lines.filter((line) => line.role !== "wetting");
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
