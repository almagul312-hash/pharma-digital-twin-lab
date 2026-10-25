import { materials, type MaterialId } from "@/tableting/catalog";
import { roleLabel, tx, type L } from "@/tableting/text";
import type { Locale } from "@/i18n/config";
import type { Lot } from "@/tableting/types";

const names: Record<string, L> = {
  blend: { ru: "Смесь", en: "Blend", kk: "Қоспа" },
  granulating_liquid: { ru: "Гранулирующая жидкость", en: "Granulating liquid", kk: "Түйіршіктеу сұйықтығы" },
  wet_granules: { ru: "Влажные гранулы", en: "Wet granules", kk: "Ылғал түйіршік" },
  granules: { ru: "Гранулы", en: "Granules", kk: "Түйіршік" },
  press_mass: { ru: "Прессуемая масса", en: "Compression blend", kk: "Престелетін масса" },
  tablets: { ru: "Таблетки", en: "Tablets", kk: "Таблеткалар" },
  dust: { ru: "Пыль", en: "Dust", kk: "Шаң" },
  fines: { ru: "Мелочь", en: "Fines", kk: "Ұсақ фракция" },
  retained: { ru: "Сход", en: "Retained fraction", kk: "Қалған фракция" },
};

export function lotTitle(locale: Locale, lot: Lot) {
  const material = materials[lot.materialId as MaterialId];
  if (material) {
    return material.name[locale];
  }
  return names[lot.nameKey] ? tx(locale, names[lot.nameKey]) : lot.nameKey;
}

export function massText(locale: Locale, grams: number) {
  const language = locale === "en" ? "en-GB" : "ru-RU";
  const g = grams.toLocaleString(language, { minimumFractionDigits: 3, maximumFractionDigits: 3 });
  const mg = (grams * 1000).toLocaleString(language, { maximumFractionDigits: 1 });
  const gram = locale === "en" ? "g" : "г";
  const milligram = locale === "en" ? "mg" : "мг";
  if (Math.abs(grams) < 1) {
    return `${mg} ${milligram} (${g} ${gram})`;
  }
  return `${g} ${gram}`;
}

export function roleText(locale: Locale, role: string) {
  return roleLabel[role] ? tx(locale, roleLabel[role]) : role;
}
