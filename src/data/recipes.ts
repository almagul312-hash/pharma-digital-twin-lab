import { sources } from "@/data/sources";
import type { Recipe } from "@/types/process";

const modelDisclaimer = {
  ru: "Модельная учебная рецептура. Не является утверждённым составом зарегистрированного лекарственного препарата.",
  en: "Laboratory training formula. Not an approved composition of a registered medicinal product.",
  kk: "Оқулық модельдік рецептура. Тіркелген препарат құрамы емес.",
};

export const exampleRecipes: Recipe[] = [
  {
    id: "model_ibuprofen_direct",
    name: {
      ru: "Ибупрофен 200 мг, твёрдые капсулы — прямое смешивание (модель)",
      en: "Ibuprofen 200 mg hard capsules — direct blend (model)",
      kk: "Ибупрофен 200 мг қатты капсула — тікелей араластыру (модель)",
    },
    route: "direct_blend",
    modelDisclaimer,
    capsuleSize: "1",
    targetCapsules: 200,
    lines: [
      { id: "l1", substanceId: "ibuprofen", role: "api", mgPerCapsule: 200, unit: "mg" },
      { id: "l2", substanceId: "lactose", role: "filler", mgPerCapsule: 70, unit: "mg" },
      { id: "l3", substanceId: "mcc", role: "filler", mgPerCapsule: 35, unit: "mg" },
      { id: "l4", substanceId: "croscarmellose", role: "disintegrant", mgPerCapsule: 8, unit: "mg" },
      { id: "l5", substanceId: "colloidal_silica", role: "glidant", mgPerCapsule: 2, unit: "mg" },
      { id: "l6", substanceId: "mg_stearate", role: "lubricant", mgPerCapsule: 5, unit: "mg" },
      { id: "l7", substanceId: "capsule_shell", role: "capsule_shell", mgPerCapsule: 76, unit: "mg" },
    ],
    sources: [sources.ichQ8, sources.excipientRanges, sources.capsuleVolumes],
  },
  {
    id: "model_ibuprofen_wet",
    name: {
      ru: "Ибупрофен 200 мг — влажная грануляция (модель)",
      en: "Ibuprofen 200 mg — wet granulation (model)",
      kk: "Ибупрофен 200 мг — ылғал түйіршіктеу (модель)",
    },
    route: "wet_granulation",
    modelDisclaimer,
    capsuleSize: "1",
    targetCapsules: 200,
    targetLodPercent: 2,
    lines: [
      { id: "w1", substanceId: "ibuprofen", role: "api", mgPerCapsule: 200, unit: "mg" },
      { id: "w2", substanceId: "lactose", role: "filler", mgPerCapsule: 55, unit: "mg" },
      { id: "w3", substanceId: "mcc", role: "filler", mgPerCapsule: 30, unit: "mg" },
      { id: "w4", substanceId: "povidone_k30", role: "binder", mgPerCapsule: 10, unit: "mg" },
      { id: "w5", substanceId: "water", role: "wetting", mgPerCapsule: 40, unit: "mg" },
      { id: "w6", substanceId: "croscarmellose", role: "disintegrant", mgPerCapsule: 8, unit: "mg" },
      { id: "w7", substanceId: "colloidal_silica", role: "glidant", mgPerCapsule: 2, unit: "mg" },
      { id: "w8", substanceId: "mg_stearate", role: "lubricant", mgPerCapsule: 5, unit: "mg" },
      { id: "w9", substanceId: "capsule_shell", role: "capsule_shell", mgPerCapsule: 76, unit: "mg" },
    ],
    sources: [sources.ichQ8, sources.excipientRanges, sources.capsuleVolumes],
  },
];

export function recipeById(id: string) {
  return exampleRecipes.find((item) => item.id === id);
}
