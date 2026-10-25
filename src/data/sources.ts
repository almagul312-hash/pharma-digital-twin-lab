import type { SourceNote } from "@/types/process";

export const sources = {
  ichQ8: {
    text: "ICH Q8(R2) Pharmaceutical Development — разработка состава и понимание процесса; не задаёт универсальные концентрации вспомогательных веществ.",
    url: "https://database.ich.org/sites/default/files/Q8_R2_Guideline.pdf",
  },
  ichQ9: {
    text: "ICH Q9(R1) Quality Risk Management — оценка рисков процесса и контроля.",
    url: "https://database.ich.org/sites/default/files/ICH_Q9%28R1%29_Guideline_Step4_2023_0126.pdf",
  },
  ichQ10: {
    text: "ICH Q10 Pharmaceutical Quality System — система качества, прослеживаемость и управление изменениями.",
    url: "https://database.ich.org/sites/default/files/Q10%20Guideline.pdf",
  },
  gmpDocs: {
    text: "Принципы GMP: документирование операций, идентификация материалов и прослеживаемость серии. Учебный журнал сессии не является нормативно значимой электронной записью.",
  },
  pharmacopoeiaTests: {
    text: "Испытания твёрдых капсул (внешний вид, однородность массы / дозированных единиц, распадаемость, растворение, количественное определение) задаются применимой фармакопеей (ГФ РК, ГФ ЕАЭС, Ph. Eur. и др.). Конкретные номера статей требуют сверки актуального издания.",
  },
  capsuleVolumes: {
    text: "Типовые геометрические объёмы пустых твёрдых желатиновых капсул по каталогам производителей оболочек (семейство Coni-Snap и аналоги). Значения учебные; фактический объём конкретной партии оболочек проверяется по сертификату.",
  },
  excipientRanges: {
    text: "Ориентировочные учебные диапазоны уровней вспомогательных веществ по справочникам по фармацевтическим эксципиентам (Handbook of Pharmaceutical Excipients и учебники технологии ЛФ). Это не производственная норма конкретной регистрации.",
  },
  ohausPx224: {
    text: "OHAUS Pioneer PX224, страница модели (проверено 2026-10-25): capacity 220 g, readability 0.1 mg, linearity ±0.0002 g, pan 90 mm stainless steel, repeatability typical 0.0001 g, USP typical minimum weight 200 mg. Readability is not the same as linearity or minimum weight.",
    url: "https://us.ohaus.com/en-us/products/balances-scales/analytical-balances/pioneer-analytical-(1)/electronic-balance-px224-am",
  },
  ohausPxDatasheet: {
    text: "OHAUS Pioneer datasheet PX (2024), family table including PX224. Some rows group PX124 and PX224. Used as a second source, not as a substitute for the model page.",
    url: "https://ohaus.ca/product/pdf/PX_Datasheet_US_80775267_M_2024.pdf",
  },
  equipmentClass: {
    text: "Метрологические и технологические пределы указаны как типичный класс лабораторного / пилотного оборудования. Конкретная модель и актуальные характеристики требуют сверки с официальным каталогом производителя.",
  },
} satisfies Record<string, SourceNote>;
