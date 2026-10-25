import type { ToolDef } from "@/types/process";

export const tools: ToolDef[] = [
  { id: "spatula", title: { ru: "Шпатель", en: "Spatula", kk: "Шпатель" }, zone: "warehouse" },
  { id: "scoop", title: { ru: "Совок для порошков", en: "Powder scoop", kk: "Ұнтақ совы" }, zone: "warehouse" },
  { id: "pestle_mortar", title: { ru: "Ступка с пестиком", en: "Mortar and pestle", kk: "Келі мен келсап" }, zone: "warehouse" },
  { id: "weigh_boat", title: { ru: "Весовая лодочка", en: "Weigh boat", kk: "Өлшеу қайықшасы" }, zone: "warehouse" },
  { id: "watch_glass", title: { ru: "Часовое стекло", en: "Watch glass", kk: "Сағат әйнегі" }, zone: "warehouse" },
  { id: "beaker_100", title: { ru: "Стакан 100 мл", en: "Beaker 100 mL", kk: "Стакан 100 мл" }, zone: "process" },
  { id: "beaker_250", title: { ru: "Стакан 250 мл", en: "Beaker 250 mL", kk: "Стакан 250 мл" }, zone: "process" },
  { id: "cylinder_50", title: { ru: "Мерный цилиндр 50 мл", en: "Measuring cylinder 50 mL", kk: "Өлшеу цилиндрі 50 мл" }, zone: "process" },
  { id: "funnel", title: { ru: "Воронка", en: "Funnel", kk: "Құйғыш" }, zone: "process" },
  { id: "glass_rod", title: { ru: "Стеклянная палочка", en: "Glass rod", kk: "Шыны таяқша" }, zone: "process" },
  { id: "sieve_hand", title: { ru: "Ручное сито", en: "Hand sieve", kk: "Қол елегі" }, zone: "process" },
  { id: "tray", title: { ru: "Противень / лоток", en: "Tray", kk: "Науа" }, zone: "drying" },
  { id: "tweezers", title: { ru: "Пинцет", en: "Tweezers", kk: "Пинцет" }, zone: "encapsulation" },
  { id: "powder_jar", title: { ru: "Контейнер для порошка", en: "Powder jar", kk: "Ұнтақ контейнері" }, zone: "warehouse" },
  { id: "brush", title: { ru: "Кисточка для очистки", en: "Cleaning brush", kk: "Тазалау қылқаламы" }, zone: "encapsulation" },
];
