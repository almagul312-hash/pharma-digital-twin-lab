import type { Locale } from "@/i18n/config";
import type {
  LocationId,
  MaterialRole,
  Phase,
  StageId,
  TabletRouteId,
} from "@/tableting/types";

export type L10n = { ru: string; en: string; kk: string };

export function tx(text: L10n, locale: Locale) {
  return text[locale];
}

export const EDU_SPEC = {
  id: "PAR-500-EDU",
  labelClaimMg: 500,
  batchDefault: 120,
  batchChoices: [80, 120, 200] as const,
  meanMassFraction: 0.05,
  massUniformityInner: 0.05,
  massUniformityOuter: 0.1,
  massUniformityMaxOutside: 2,
  massUniformitySample: 20,
  hardnessMinN: 60,
  hardnessMaxN: 140,
  friabilityMaxPercent: 1,
  disintegrationMaxMin: 15,
  dissolutionMinPercent: 80,
  dissolutionTimeMin: 30,
  assayMin: 95,
  assayMax: 105,
  thicknessFraction: 0.05,
  diameterToleranceMm: 0.15,
  referenceForceKn: 14,
  moistureMin: 0.008,
  moistureMax: 0.025,
  pressLossFraction: 0.02,
  dedustLossFraction: 0.004,
  mixLossFraction: 0.003,
  granulationLossFraction: 0.002,
  lubricationLossFraction: 0.002,
  waterFractionOfInternal: 0.18,
  liquidWindowMin: 0.1,
  liquidWindowMax: 0.24,
  lubricantMinutesMin: 1,
  lubricantMinutesWarn: 5,
  dryingTempMin: 40,
  dryingTempMax: 70,
  forceMin: 5,
  forceMax: 25,
  singleSpeedMin: 10,
  singleSpeedMax: 60,
  rotarySpeedMin: 10,
  rotarySpeedMax: 40,
  rotaryStations: 8,
  precompMin: 0.5,
  precompMax: 5,
  fillMin: 4,
  fillMax: 14,
  sievePowderMm: [0.5, 0.8, 1] as const,
  sieveWetMm: [1, 1.6] as const,
  sieveDryMm: [0.8, 1] as const,
} as const;

export type MaterialDef = {
  id: string;
  name: L10n;
  role: MaterialRole;
  roleNote: L10n;
  storage: L10n;
  passport: L10n;
  moisture: number;
  apiFraction: number;
  d50Mm: number;
  bulkDensity: number;
  stockG: number;
  batch: string;
};

export const materials = {
  "paracetamol-dc": {
    id: "paracetamol-dc",
    name: {
      ru: "Парацетамол для прямого прессования",
      en: "Paracetamol, direct-compression grade",
      kk: "Тікелей престеуге арналған парацетамол",
    },
    role: "api",
    roleNote: {
      ru: "Действующее вещество. Учебная марка с улучшенной сыпучестью, не коммерческий продукт.",
      en: "Active substance. An educational grade with improved flow, not a commercial product.",
      kk: "Әсер етуші зат. Ағындылығы жақсартылған оқу маркасы, коммерциялық өнім емес.",
    },
    storage: {
      ru: "Сухое место, плотно закрытая учебная тара, комнатная температура.",
      en: "Dry place, closed educational container, room temperature.",
      kk: "Құрғақ орын, тығыз жабылған оқу ыдысы, бөлме температурасы.",
    },
    passport: {
      ru: "Учебный паспорт: описание — белый кристаллический порошок; идентификация отмечена как совпавшая с учебным эталоном; заявленное содержание субстанции 99,0 %. Это запись входного контроля модели, не протокол лаборатории.",
      en: "Educational passport: white crystalline powder; identity marked as matching the teaching standard; labelled substance assay 99.0 %. This is a model incoming-control record, not a laboratory certificate.",
      kk: "Оқу паспорты: ақ кристалды ұнтақ; сәйкестендіру оқу эталонымен сәйкес деп белгіленген; субстанция мөлшері 99,0 %. Бұл модельдің кіріс бақылау жазбасы, зертхана хаттамасы емес.",
    },
    moisture: 0.004,
    apiFraction: 1,
    d50Mm: 0.22,
    bulkDensity: 0.46,
    stockG: 250,
    batch: "EDU-RM-PARA-DC",
  },
  "paracetamol-cryst": {
    id: "paracetamol-cryst",
    name: {
      ru: "Парацетамол кристаллический",
      en: "Crystalline paracetamol",
      kk: "Кристалды парацетамол",
    },
    role: "api",
    roleNote: {
      ru: "Действующее вещество для влажной грануляции. Мелкие кристаллы плохо текут без грануляции.",
      en: "Active substance for wet granulation. Fine crystals flow poorly without granulation.",
      kk: "Ылғалды түйіршіктеуге арналған әсер етуші зат. Ұсақ кристалдар түйіршіктеусіз нашар ағады.",
    },
    storage: {
      ru: "Сухое место, плотно закрытая учебная тара.",
      en: "Dry place, closed educational container.",
      kk: "Құрғақ орын, тығыз жабылған оқу ыдысы.",
    },
    passport: {
      ru: "Учебный паспорт: белый кристаллический порошок; идентификация совпала с учебным эталоном; заявленное содержание 99,0 %.",
      en: "Educational passport: white crystalline powder; identity matched the teaching standard; labelled assay 99.0 %.",
      kk: "Оқу паспорты: ақ кристалды ұнтақ; сәйкестендіру оқу эталонымен сәйкес; мөлшері 99,0 %.",
    },
    moisture: 0.004,
    apiFraction: 1,
    d50Mm: 0.08,
    bulkDensity: 0.34,
    stockG: 250,
    batch: "EDU-RM-PARA-CR",
  },
  mcc: {
    id: "mcc",
    name: {
      ru: "Целлюлоза микрокристаллическая",
      en: "Microcrystalline cellulose",
      kk: "Микрокристалды целлюлоза",
    },
    role: "filler",
    roleNote: {
      ru: "Наполнитель и сухой связующий для прямого прессования.",
      en: "Filler and dry binder for direct compression.",
      kk: "Тікелей престеуге арналған толтырғыш және құрғақ байланыстырғыш.",
    },
    storage: {
      ru: "Сухое место. Учебная модель учитывает влажность около 4 %.",
      en: "Dry place. The teaching model uses about 4 % moisture.",
      kk: "Құрғақ орын. Оқу моделі шамамен 4 % ылғалдылықты ескереді.",
    },
    passport: {
      ru: "Учебный паспорт: белый сыпучий порошок; идентификация по описанию подтверждена в модели.",
      en: "Educational passport: white free-flowing powder; identity by description is confirmed in the model.",
      kk: "Оқу паспорты: ақ сусымалы ұнтақ; сипаттама бойынша сәйкестендіру моделде расталған.",
    },
    moisture: 0.04,
    apiFraction: 0,
    d50Mm: 0.09,
    bulkDensity: 0.32,
    stockG: 250,
    batch: "EDU-RM-MCC",
  },
  pgs: {
    id: "pgs",
    name: {
      ru: "Крахмал прежелатинизированный",
      en: "Pregelatinized starch",
      kk: "Прежелатинделген крахмал",
    },
    role: "disintegrant",
    roleNote: {
      ru: "Дезинтегрант и вспомогательный сухой связующий прямого прессования.",
      en: "Disintegrant and auxiliary dry binder for direct compression.",
      kk: "Тікелей престеудің ыдыратушысы және қосалқы құрғақ байланыстырғышы.",
    },
    storage: {
      ru: "Сухое место, закрытая тара.",
      en: "Dry place, closed container.",
      kk: "Құрғақ орын, жабық ыдыс.",
    },
    passport: {
      ru: "Учебный паспорт: белый или кремовый порошок; описание соответствует этикетке модели.",
      en: "Educational passport: white or cream powder; the description matches the model label.",
      kk: "Оқу паспорты: ақ немесе кілегейлі ұнтақ; сипаттама модель жапсырмасына сәйкес.",
    },
    moisture: 0.08,
    apiFraction: 0,
    d50Mm: 0.12,
    bulkDensity: 0.5,
    stockG: 200,
    batch: "EDU-RM-PGS",
  },
  "lactose-mh": {
    id: "lactose-mh",
    name: {
      ru: "Лактозы моногидрат",
      en: "Lactose monohydrate",
      kk: "Лактоза моногидраты",
    },
    role: "filler",
    roleNote: {
      ru: "Наполнитель внутренней фазы влажной грануляции.",
      en: "Filler of the wet-granulation inner phase.",
      kk: "Ылғалды түйіршіктеудің ішкі фазасының толтырғышы.",
    },
    storage: {
      ru: "Сухое место, закрытая тара.",
      en: "Dry place, closed container.",
      kk: "Құрғақ орын, жабық ыдыс.",
    },
    passport: {
      ru: "Учебный паспорт: белый кристаллический порошок; идентификация по описанию подтверждена в модели.",
      en: "Educational passport: white crystalline powder; identity by description is confirmed in the model.",
      kk: "Оқу паспорты: ақ кристалды ұнтақ; сипаттама бойынша сәйкестендіру моделде расталған.",
    },
    moisture: 0.005,
    apiFraction: 0,
    d50Mm: 0.1,
    bulkDensity: 0.55,
    stockG: 250,
    batch: "EDU-RM-LAC",
  },
  povidone: {
    id: "povidone",
    name: {
      ru: "Повидон",
      en: "Povidone",
      kk: "Повидон",
    },
    role: "binder",
    roleNote: {
      ru: "Связующее гранулирующей жидкости. В таблетке остаётся после удаления воды.",
      en: "Binder of the granulating liquid. It remains in the tablet after the water is removed.",
      kk: "Түйіршіктеу сұйықтығының байланыстырғышы. Су кеткеннен кейін таблеткада қалады.",
    },
    storage: {
      ru: "Сухое место, плотно закрытая тара. Повидон гигроскопичен.",
      en: "Dry place, tightly closed container. Povidone is hygroscopic.",
      kk: "Құрғақ орын, тығыз жабық ыдыс. Повидон гигроскопиялық.",
    },
    passport: {
      ru: "Учебный паспорт: белый порошок; идентификация подтверждена в модели.",
      en: "Educational passport: white powder; identity confirmed in the model.",
      kk: "Оқу паспорты: ақ ұнтақ; сәйкестендіру моделде расталған.",
    },
    moisture: 0.03,
    apiFraction: 0,
    d50Mm: 0.08,
    bulkDensity: 0.35,
    stockG: 100,
    batch: "EDU-RM-PVP",
  },
  water: {
    id: "water",
    name: {
      ru: "Вода очищенная",
      en: "Purified water",
      kk: "Тазартылған су",
    },
    role: "solvent",
    roleNote: {
      ru: "Растворитель гранулирующей жидкости. При сушке удаляется и в состав таблетки не входит.",
      en: "Solvent of the granulating liquid. Drying removes it; it is not part of the tablet.",
      kk: "Түйіршіктеу сұйықтығының еріткіші. Кептіруде шығарылады және таблетка құрамына кірмейді.",
    },
    storage: {
      ru: "Закрытая учебная ёмкость. Это не модель валидированной системы воды очищенной.",
      en: "Closed educational vessel. This is not a model of a validated purified-water system.",
      kk: "Жабық оқу ыдысы. Бұл валидацияланған тазартылған су жүйесінің моделі емес.",
    },
    passport: {
      ru: "Учебная запись: прозрачная жидкость без видимых частиц. Чистота в модели задана, а не измерена.",
      en: "Educational record: clear liquid without visible particles. Purity is assigned in the model, not measured.",
      kk: "Оқу жазбасы: көрінетін бөлшексіз мөлдір сұйықтық. Тазалық моделде берілген, өлшенбеген.",
    },
    moisture: 1,
    apiFraction: 0,
    d50Mm: 0,
    bulkDensity: 0.997,
    stockG: 1000,
    batch: "EDU-RM-PW",
  },
  ccs: {
    id: "ccs",
    name: {
      ru: "Кроскармеллоза натрия",
      en: "Croscarmellose sodium",
      kk: "Натрий кроскармеллозасы",
    },
    role: "disintegrant",
    roleNote: {
      ru: "Дезинтегрант внешней фазы. Вносится после сушки и калибровки.",
      en: "External-phase disintegrant. Added after drying and sizing.",
      kk: "Сыртқы фазаның ыдыратушысы. Кептіру мен калибрлеуден кейін енгізіледі.",
    },
    storage: {
      ru: "Сухое место, закрытая тара.",
      en: "Dry place, closed container.",
      kk: "Құрғақ орын, жабық ыдыс.",
    },
    passport: {
      ru: "Учебный паспорт: белый волокнистый порошок; идентификация по описанию подтверждена в модели.",
      en: "Educational passport: white fibrous powder; identity by description is confirmed in the model.",
      kk: "Оқу паспорты: ақ талшықты ұнтақ; сипаттама бойынша сәйкестендіру моделде расталған.",
    },
    moisture: 0.02,
    apiFraction: 0,
    d50Mm: 0.05,
    bulkDensity: 0.48,
    stockG: 80,
    batch: "EDU-RM-CCS",
  },
  sio2: {
    id: "sio2",
    name: {
      ru: "Кремния диоксид коллоидный",
      en: "Colloidal silicon dioxide",
      kk: "Коллоидты кремний диоксиді",
    },
    role: "glidant",
    roleNote: {
      ru: "Скользящее вещество. Масса мала, поэтому в сценарии нужны аналитические весы.",
      en: "Glidant. The mass is small, so the scenario requires the analytical balance.",
      kk: "Сырғытқыш зат. Массасы аз, сондықтан сценарийде аналитикалық таразы керек.",
    },
    storage: {
      ru: "Сухое место, плотно закрытая тара.",
      en: "Dry place, tightly closed container.",
      kk: "Құрғақ орын, тығыз жабық ыдыс.",
    },
    passport: {
      ru: "Учебный паспорт: лёгкий белый порошок; идентификация по описанию подтверждена в модели.",
      en: "Educational passport: light white powder; identity by description is confirmed in the model.",
      kk: "Оқу паспорты: жеңіл ақ ұнтақ; сипаттама бойынша сәйкестендіру моделде расталған.",
    },
    moisture: 0.01,
    apiFraction: 0,
    d50Mm: 0.02,
    bulkDensity: 0.05,
    stockG: 40,
    batch: "EDU-RM-SIO",
  },
  mgst: {
    id: "mgst",
    name: {
      ru: "Магния стеарат",
      en: "Magnesium stearate",
      kk: "Магний стеараты",
    },
    role: "lubricant",
    roleNote: {
      ru: "Смазывающее вещество. Вносится последним и смешивается коротко: длительное смешивание ухудшает распадаемость и растворение.",
      en: "Lubricant. Added last and mixed briefly: long mixing impairs disintegration and dissolution.",
      kk: "Майлаушы зат. Соңында енгізіледі және қысқа араластырылады: ұзақ араластыру ыдырау мен еруді нашарлатады.",
    },
    storage: {
      ru: "Сухое место, закрытая тара.",
      en: "Dry place, closed container.",
      kk: "Құрғақ орын, жабық ыдыс.",
    },
    passport: {
      ru: "Учебный паспорт: белый жирный на ощупь порошок; идентификация по описанию подтверждена в модели.",
      en: "Educational passport: white powder with a fatty feel; identity by description is confirmed in the model.",
      kk: "Оқу паспорты: майлы ақ ұнтақ; сипаттама бойынша сәйкестендіру моделде расталған.",
    },
    moisture: 0.02,
    apiFraction: 0,
    d50Mm: 0.02,
    bulkDensity: 0.3,
    stockG: 40,
    batch: "EDU-RM-MGST",
  },
} as const satisfies Record<string, MaterialDef>;

export type MaterialId = keyof typeof materials;

export type RecipeLine = {
  id: string;
  materialId: MaterialId;
  role: MaterialRole;
  phase: Phase;
  perTabletMg: number;
  water: boolean;
};

export type Recipe = {
  id: string;
  route: TabletRouteId;
  labelClaimMg: number;
  lines: RecipeLine[];
};

export const recipes: Record<TabletRouteId, Recipe> = {
  direct: {
    id: "para-dc-edu",
    route: "direct",
    labelClaimMg: EDU_SPEC.labelClaimMg,
    lines: [
      { id: "api", materialId: "paracetamol-dc", role: "api", phase: "internal", perTabletMg: 500, water: false },
      { id: "mcc", materialId: "mcc", role: "filler", phase: "internal", perTabletMg: 80, water: false },
      { id: "pgs", materialId: "pgs", role: "disintegrant", phase: "internal", perTabletMg: 40, water: false },
      { id: "sio2", materialId: "sio2", role: "glidant", phase: "internal", perTabletMg: 3, water: false },
      { id: "mgst", materialId: "mgst", role: "lubricant", phase: "lubricant", perTabletMg: 5, water: false },
    ],
  },
  wet_granulation: {
    id: "para-wg-edu",
    route: "wet_granulation",
    labelClaimMg: EDU_SPEC.labelClaimMg,
    lines: [
      { id: "api", materialId: "paracetamol-cryst", role: "api", phase: "internal", perTabletMg: 500, water: false },
      { id: "lactose", materialId: "lactose-mh", role: "filler", phase: "internal", perTabletMg: 70, water: false },
      { id: "pvp", materialId: "povidone", role: "binder", phase: "liquid_solid", perTabletMg: 15, water: false },
      { id: "water", materialId: "water", role: "solvent", phase: "solvent", perTabletMg: 0, water: true },
      { id: "ccs", materialId: "ccs", role: "disintegrant", phase: "external", perTabletMg: 12, water: false },
      { id: "sio2", materialId: "sio2", role: "glidant", phase: "external", perTabletMg: 2, water: false },
      { id: "mgst", materialId: "mgst", role: "lubricant", phase: "lubricant", perTabletMg: 4, water: false },
    ],
  },
};

export function recipeFor(route: TabletRouteId) {
  return recipes[route];
}

export function targetMg(recipe: Recipe, line: RecipeLine) {
  if (line.water) {
    const internal = recipe.lines
      .filter((item) => item.phase === "internal")
      .reduce((sum, item) => sum + item.perTabletMg, 0);
    return EDU_SPEC.waterFractionOfInternal * internal;
  }
  return line.perTabletMg;
}

export function solidsMg(recipe: Recipe) {
  return recipe.lines.reduce((sum, line) => sum + (line.water ? 0 : line.perTabletMg), 0);
}

export const directStages: StageId[] = [
  "intake",
  "weighing",
  "sieving",
  "premix",
  "lubrication",
  "compression",
  "dedusting",
  "qc",
  "packaging",
];

export const wetStages: StageId[] = [
  "intake",
  "weighing",
  "sieving",
  "premix",
  "granulating_liquid",
  "granulation",
  "wet_screening",
  "drying",
  "moisture_check",
  "sizing",
  "final_blend",
  "lubrication",
  "compression",
  "dedusting",
  "qc",
  "packaging",
];

export const optionalStages: StageId[] = ["sieving", "wet_screening", "sizing", "dedusting"];

export function stagesFor(route: TabletRouteId) {
  return route === "direct" ? directStages : wetStages;
}

export function isOptional(stage: StageId) {
  return optionalStages.includes(stage);
}

export const zoneLayout: {
  id: LocationId;
  x: number;
  y: number;
  w: number;
  h: number;
  stage: StageId;
}[] = [
  { id: "warehouse", x: 20, y: 18, w: 250, h: 188, stage: "intake" },
  { id: "scale", x: 286, y: 18, w: 250, h: 188, stage: "weighing" },
  { id: "sieve", x: 552, y: 18, w: 250, h: 188, stage: "sieving" },
  { id: "mixer", x: 818, y: 18, w: 250, h: 188, stage: "premix" },
  { id: "liquid", x: 20, y: 222, w: 250, h: 168, stage: "granulating_liquid" },
  { id: "granulator", x: 286, y: 222, w: 250, h: 168, stage: "granulation" },
  { id: "dryer", x: 552, y: 222, w: 250, h: 168, stage: "drying" },
  { id: "calibrator", x: 818, y: 222, w: 250, h: 168, stage: "sizing" },
  { id: "press", x: 20, y: 406, w: 516, h: 250, stage: "compression" },
  { id: "deduster", x: 552, y: 406, w: 250, h: 250, stage: "dedusting" },
  { id: "qc", x: 818, y: 406, w: 250, h: 118, stage: "qc" },
  { id: "pack", x: 818, y: 536, w: 250, h: 120, stage: "packaging" },
];

export const qcMethods = [
  "appearance",
  "average_mass",
  "mass_uniformity",
  "content_uniformity",
  "dimensions",
  "hardness",
  "friability",
  "disintegration",
  "dissolution",
  "assay",
] as const;

export const equipmentIds = [
  "balance_lab",
  "balance_analytical",
  "sieves",
  "powder_mixer",
  "liquid_vessel",
  "granulator",
  "tray_dryer",
  "calibrator",
  "single_punch",
  "rotary_press",
  "deduster",
  "thickness_gauge",
  "hardness_tester",
  "friabilator",
  "disintegration_basket",
  "dissolution_apparatus",
  "assay_station",
  "glassware",
] as const;

export type EquipmentId = (typeof equipmentIds)[number];

export function equipmentForZone(location: LocationId): EquipmentId {
  switch (location) {
    case "scale":
      return "balance_lab";
    case "sieve":
    case "calibrator":
      return location === "calibrator" ? "calibrator" : "sieves";
    case "mixer":
      return "powder_mixer";
    case "liquid":
      return "liquid_vessel";
    case "granulator":
      return "granulator";
    case "dryer":
      return "tray_dryer";
    case "press":
      return "single_punch";
    case "deduster":
      return "deduster";
    case "qc":
      return "hardness_tester";
    case "pack":
      return "glassware";
    default:
      return "glassware";
  }
}
