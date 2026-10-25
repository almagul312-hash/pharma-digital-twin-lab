import { substanceById } from "@/data/substances";
import type { IngredientRole, Recipe, RecipeLine } from "@/types/process";

export type ScaledLine = RecipeLine & {
  nominalG: number;
  fractionPercent: number;
  inFill: boolean;
};

const FILL_ROLES: IngredientRole[] = [
  "api",
  "filler",
  "binder",
  "disintegrant",
  "glidant",
  "lubricant",
];

export function isFillComponent(role: IngredientRole) {
  return FILL_ROLES.includes(role);
}

export function scaleRecipe(recipe: Recipe, capsuleCount = recipe.targetCapsules) {
  const count = Math.max(1, Math.round(capsuleCount));
  const lines: ScaledLine[] = recipe.lines.map((line) => {
    const inFill = isFillComponent(line.role) && line.substanceId !== "water";
    const nominalG = (line.mgPerCapsule * count) / 1000;
    return { ...line, nominalG, fractionPercent: 0, inFill };
  });

  const fillMassG = lines
    .filter((line) => line.inFill)
    .reduce((sum, line) => sum + line.nominalG, 0);

  return {
    capsuleCount: count,
    fillMassG,
    fillMgPerCapsule: fillMassG > 0 ? (fillMassG * 1000) / count : 0,
    totalMassG: lines.reduce((sum, line) => sum + line.nominalG, 0),
    lines: lines.map((line) => ({
      ...line,
      fractionPercent: fillMassG > 0 && line.inFill ? (line.nominalG / fillMassG) * 100 : 0,
    })),
  };
}

export function recipeWarnings(recipe: Recipe) {
  const scaled = scaleRecipe(recipe);
  const warnings: string[] = [];
  const roles = new Set(recipe.lines.map((line) => line.role));

  if (!roles.has("api")) {
    warnings.push("missing_api");
  }
  if (![...roles].some((role) => role === "filler")) {
    warnings.push("missing_filler");
  }
  if (recipe.route === "wet_granulation" && !roles.has("binder")) {
    warnings.push("missing_binder");
  }
  if (recipe.route === "wet_granulation" && !roles.has("wetting")) {
    warnings.push("missing_vehicle");
  }
  if (!roles.has("capsule_shell")) {
    warnings.push("missing_shells");
  }

  for (const line of scaled.lines) {
    const substance = substanceById(line.substanceId);
    if (!substance?.trainingRangePercent || !line.inFill) {
      continue;
    }
    const { min, max } = substance.trainingRangePercent;
    if (line.fractionPercent < min - 0.05 || line.fractionPercent > max + 0.05) {
      warnings.push(`range:${line.substanceId}`);
    }
  }

  if (recipe.lines.some((line) => line.mgPerCapsule < 0)) {
    warnings.push("negative_mass");
  }

  return { scaled, warnings };
}

export function cloneRecipe(recipe: Recipe, capsuleCount: number): Recipe {
  return { ...recipe, targetCapsules: Math.max(1, Math.round(capsuleCount)) };
}
