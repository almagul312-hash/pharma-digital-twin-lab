"use client";

import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { EDU_SPEC, isOptional, materials, recipeFor, stagesFor, type MaterialId } from "@/tableting/catalog";
import { equipmentDoc, equipmentDocs } from "@/tableting/equipment";
import { FloorPlan } from "@/components/tableting/FloorPlan";
import { lotTitle, massText } from "@/components/tableting/format";
import { StageWork } from "@/components/tableting/StageWork";
import { ActionButton, inputClass } from "@/components/tableting/ui";
import { balanceSheet, chooseRoute, closeSeries, listStages, nextHint, selectUi, setBatch, targetGrams } from "@/tableting/engine";
import { tabletingStorage } from "@/tableting/archive";
import { useTabletStore } from "@/tableting/store";
import { locationLabel, methodLabel, routeLabel, say, stageLabel, statusLabel, tx, type L } from "@/tableting/text";
import type { Locale } from "@/i18n/config";
import type { TabletRouteId } from "@/tableting/types";

export function TabletingLab({ locale, onBack }: { locale: Locale; onBack: () => void }) {
  const session = useTabletStore((state) => state.session);
  const patch = useTabletStore((state) => state.patch);
  const dismiss = useTabletStore((state) => state.dismiss);
  const reset = useTabletStore((state) => state.reset);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<"work" | "stages" | "object" | "log">("work");
  const [dock, setDock] = useState<"journal" | "balance" | "theory" | "report">("journal");
  const [query, setQuery] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    let active = true;
    const finish = () => {
      if (!active) {
        return;
      }
      const current = useTabletStore.getState().session;
      if (current.job) {
        useTabletStore.setState({ session: { ...current, job: null } });
      }
      setReady(true);
    };
    try {
      const pending = useTabletStore.persist.rehydrate();
      void Promise.resolve(pending).then(finish, finish);
    } catch {
      finish();
    }
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => useTabletStore.getState().tick(250), 250);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const previous = root.style.scrollPaddingBottom;
    root.style.scrollPaddingBottom = "5rem";
    return () => {
      root.style.scrollPaddingBottom = previous;
    };
  }, []);

  if (!ready) {
    return <p className="px-4 py-10 text-sm text-muted">{tx(locale, loading)}</p>;
  }

  const storage = tabletingStorage();
  const hint = nextHint(session);
  const stages = listStages(session);
  const required = session.route ? stagesFor(session.route).filter((stage) => !isOptional(stage)) : [];
  const doneCount = required.filter((stage) => session.marks[stage] === "done" || session.marks[stage] === "warning").length;
  const balance = balanceSheet(session);
  const filteredStages = stages.filter((stage) => tx(locale, stageLabel[stage.id]).toLowerCase().includes(query.trim().toLowerCase()));
  const equipment = equipmentDoc(session.selectedEquipmentId ?? "balance_lab");

  return (
    <div className="bg-surface">
      <div className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-start justify-between gap-3 px-4 py-4">
          <div>
            <button type="button" onClick={onBack} className="inline-flex items-center gap-2 text-sm font-semibold text-teal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {tx(locale, back)}
            </button>
            <h1 className="mt-2 text-2xl font-semibold text-navy">{tx(locale, title)}</h1>
            <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted">{tx(locale, disclaimer)}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-teal-soft px-3 py-1 text-xs font-semibold text-teal-dark">
              {session.route ? tx(locale, routeLabel[session.route]) : tx(locale, noRoute)}
            </span>
            <span className="text-xs text-muted">{session.seriesId ?? "—"}</span>
            <span className="text-xs text-muted">{doneCount}/{required.length || 0}</span>
          </div>
        </div>
        <div className="mx-auto flex max-w-7xl flex-wrap gap-2 px-4 pb-4">
          <ActionButton type="button" tone={session.view === "floor" ? "primary" : "secondary"} onClick={() => patch((item) => selectUi(item, { view: "floor" }))}>{tx(locale, floorMode)}</ActionButton>
          <ActionButton type="button" tone={session.view === "classic" ? "primary" : "secondary"} onClick={() => patch((item) => selectUi(item, { view: "classic" }))}>{tx(locale, classicMode)}</ActionButton>
          <ActionButton type="button" tone="quiet" onClick={() => patch((item) => selectUi(item, { guidance: item.guidance === "guided" ? "independent" : "guided" }))}>
            {session.guidance === "guided" ? tx(locale, guided) : tx(locale, independent)}
          </ActionButton>
          <ActionButton type="button" tone="quiet" onClick={() => patch((item) => selectUi(item, { reducedMotion: !item.reducedMotion }))}>
            {session.reducedMotion ? tx(locale, motionOff) : tx(locale, motionOn)}
          </ActionButton>
          <ActionButton type="button" tone="secondary" onClick={() => setConfirmReset(true)}>{tx(locale, newSeries)}</ActionButton>
        </div>
      </div>
      {session.guidance === "guided" ? <p className="mx-auto max-w-7xl px-4 py-3 text-sm text-navy">{say(locale, hint.code, hint.params)}</p> : null}
      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-4 lg:grid-cols-[16rem_minmax(0,1fr)_22rem]">
        <aside className={`${tab === "stages" ? "block" : "hidden"} space-y-3 lg:block`}>
          <input className={inputClass} value={query} onChange={(event) => setQuery(event.target.value)} placeholder={tx(locale, search)} aria-label={tx(locale, search)} />
          <ol className="space-y-2">
            {filteredStages.map((stage) => (
              <li key={stage.id}>
                <button
                  type="button"
                  onClick={() => {
                    patch((item) => selectUi(item, { selectedStage: stage.id }));
                    setTab("object");
                  }}
                  className={`w-full rounded-xl border px-3 py-2 text-left ${session.selectedStage === stage.id ? "border-teal bg-white" : "border-line bg-white/80"}`}
                >
                  <span className="block text-sm font-semibold text-navy">{tx(locale, stageLabel[stage.id])}</span>
                  <span className="mt-1 block text-xs text-muted">{tx(locale, statusLabel[stage.status])}{stage.optional ? ` · ${tx(locale, optional)}` : ""}</span>
                </button>
              </li>
            ))}
          </ol>
        </aside>
        <section className={`${tab === "work" ? "block" : "hidden"} min-w-0 lg:block`}>
          {!session.route ? <RoutePicker locale={locale} /> : session.view === "floor" ? <FloorPlan locale={locale} /> : <div className="rounded-2xl bg-white p-4 shadow-sm"><StageWork locale={locale} /></div>}
        </section>
        <aside className={`${tab === "object" ? "block" : "hidden"} space-y-4 lg:block`}>
          {session.route && session.view === "floor" ? (
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <StageWork locale={locale} />
            </div>
          ) : null}
          <article className="rounded-2xl bg-white p-4 shadow-sm text-sm leading-relaxed">
            <h2 className="text-lg font-semibold text-navy">{equipment.title[locale]}</h2>
            <EquipmentLine label={tx(locale, purpose)} text={equipment.purpose[locale]} />
            <EquipmentLine label={tx(locale, principle)} text={equipment.principle[locale]} />
            <EquipmentLine label={tx(locale, parts)} text={equipment.parts[locale]} />
            <EquipmentLine label={tx(locale, inputs)} text={equipment.inputs[locale]} />
            <EquipmentLine label={tx(locale, outputs)} text={equipment.outputs[locale]} />
            <EquipmentLine label={tx(locale, parameters)} text={equipment.parameters[locale]} />
            <EquipmentLine label={tx(locale, preparation)} text={equipment.preparation[locale]} />
            <EquipmentLine label={tx(locale, start)} text={equipment.start[locale]} />
            <EquipmentLine label={tx(locale, limits)} text={equipment.limits[locale]} />
            <EquipmentLine label={tx(locale, actions)} text={equipment.actions[locale]} />
            <EquipmentLine label={tx(locale, source)} text={equipment.source[locale]} />
          </article>
          <label className="block text-sm">
            <span className="font-semibold text-navy">{tx(locale, equipmentSearch)}</span>
            <select className={`${inputClass} mt-2`} value={session.selectedEquipmentId ?? equipment.id} onChange={(event) => patch((item) => selectUi(item, { selectedEquipmentId: event.target.value }))}>
              {equipmentDocs.filter((item) => item.title[locale].toLowerCase().includes(query.trim().toLowerCase()) || query.trim() === "").map((item) => (
                <option key={item.id} value={item.id}>{item.title[locale]}</option>
              ))}
            </select>
          </label>
        </aside>
      </div>
      <div className={`${tab === "log" ? "block" : "hidden"} mx-auto max-w-7xl px-4 pb-6 lg:block`}>
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {(["journal", "balance", "theory", "report"] as const).map((item) => (
              <ActionButton key={item} type="button" tone={dock === item ? "primary" : "quiet"} onClick={() => setDock(item)}>
                {tx(locale, dockLabel[item])}
              </ActionButton>
            ))}
          </div>
          {dock === "journal" ? (
            <ul className="mt-4 max-h-72 space-y-2 overflow-auto text-sm">
              {session.journal.length === 0 ? <li className="text-muted">{tx(locale, emptyJournal)}</li> : null}
              {session.journal.map((entry) => (
                <li key={entry.id} className="rounded-lg bg-surface px-3 py-2">
                  <span className="text-xs text-muted">{entry.at.slice(0, 16).replace("T", " ")} · {tx(locale, stageLabel[entry.stage])}</span>
                  <p>{say(locale, entry.code, entry.params)}</p>
                  {entry.massInG !== null ? <p className="text-xs text-muted">{tx(locale, inLabel)} {entry.massInG} / {tx(locale, outLabel)} {entry.massOutG} / {tx(locale, lossLabel)} {entry.lossG}</p> : null}
                </li>
              ))}
            </ul>
          ) : null}
          {dock === "balance" ? (
            <div className="mt-4 text-sm leading-relaxed">
              <p>{tx(locale, issued)}: {massText(locale, balance.inputsG)}</p>
              <p>{tx(locale, activeMass)}: {massText(locale, balance.activeG)}</p>
              <p>{tx(locale, packedMass)}: {massText(locale, balance.packedG)}</p>
              <p>{tx(locale, lossMass)}: {massText(locale, balance.lossG)}</p>
              <p>{tx(locale, gap)}: {massText(locale, balance.gapG)}</p>
              <ul className="mt-3 space-y-1">
                {session.lots.filter((lot) => !lot.consumed && lot.massG > 0 && lot.kind !== "stock").map((lot) => (
                  <li key={lot.id}>{lotTitle(locale, lot)} · {massText(locale, lot.massG)} · {tx(locale, locationLabel[lot.location])}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {dock === "theory" ? <p className="mt-4 text-sm leading-relaxed">{session.route ? tx(locale, sourcesNote) : tx(locale, pickFirst)}</p> : null}
          {dock === "report" ? <Report locale={locale} /> : null}
          {session.notices.length ? (
            <ul className="mt-4 space-y-2" aria-live="polite">
              {session.notices.map((notice) => (
                <li key={notice.id} className={`rounded-lg px-3 py-2 text-sm ${notice.tone === "error" ? "bg-red-50 text-red-900" : notice.tone === "warning" ? "bg-amber-50 text-amber-950" : "bg-teal-soft text-navy"}`}>
                  <button type="button" className="text-left" onClick={() => dismiss(notice.id)}>{say(locale, notice.code, notice.params)}</button>
                </li>
              ))}
            </ul>
          ) : null}
          <p className="mt-4 text-xs leading-relaxed text-muted">{storage.note}</p>
        </div>
      </div>
      <div className="sticky bottom-0 z-20 grid grid-cols-4 border-t border-line bg-white shadow-[0_-8px_16px_rgba(11,58,106,0.06)] lg:hidden">
        {(["work", "stages", "object", "log"] as const).map((item) => (
          <button key={item} type="button" className={`min-h-12 text-xs font-semibold ${tab === item ? "text-teal" : "text-navy"}`} onClick={() => setTab(item)}>
            {tx(locale, mobileTab[item])}
          </button>
        ))}
      </div>
      {confirmReset ? (
        <div className="fixed inset-x-4 bottom-20 z-30 mx-auto max-w-lg rounded-2xl border border-line bg-white p-4 shadow-lg lg:bottom-6">
          <p className="text-sm">{tx(locale, resetAsk)}</p>
          <div className="mt-3 flex gap-2">
            <ActionButton type="button" onClick={() => { reset(); setConfirmReset(false); }}>{tx(locale, yes)}</ActionButton>
            <ActionButton type="button" tone="secondary" onClick={() => setConfirmReset(false)}>{tx(locale, no)}</ActionButton>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function RoutePicker({ locale }: { locale: Locale }) {
  const session = useTabletStore((state) => state.session);
  const act = useTabletStore((state) => state.act);
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="md:col-span-2">
        <label className="text-sm font-semibold text-navy">
          {tx(locale, batchLabel)}
          <select className={`${inputClass} mt-2`} value={session.batchTablets} onChange={(event) => act((current, now) => setBatch(current, Number(event.target.value), now))}>
            {EDU_SPEC.batchChoices.map((count) => (
              <option key={count} value={count}>{count}</option>
            ))}
          </select>
        </label>
      </div>
      <RouteCard locale={locale} route="direct" />
      <RouteCard locale={locale} route="wet_granulation" />
    </div>
  );
}

function RouteCard({ locale, route }: { locale: Locale; route: TabletRouteId }) {
  const act = useTabletStore((state) => state.act);
  const recipe = recipeFor(route);
  return (
    <article className="rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-navy">{tx(locale, routeLabel[route])}</h2>
      <p className="mt-2 text-sm leading-relaxed">{route === "direct" ? tx(locale, directText) : tx(locale, wetText)}</p>
      <ul className="mt-3 space-y-1 text-sm">
        {recipe.lines.map((line) => (
          <li key={line.id}>{lotName(locale, line.materialId)} · {targetGrams(recipe, line, useTabletStore.getState().session.batchTablets).toFixed(3)} {locale === "en" ? "g" : "г"}</li>
        ))}
      </ul>
      <div className="mt-4">
        <ActionButton type="button" onClick={() => act((current, now) => chooseRoute(current, route, now))}>{tx(locale, choose)}</ActionButton>
      </div>
    </article>
  );
}

function Report({ locale }: { locale: Locale }) {
  const session = useTabletStore((state) => state.session);
  const act = useTabletStore((state) => state.act);
  const report = session.report;
  if (!report) {
    return (
      <div className="mt-4">
        <p className="text-sm leading-relaxed">{tx(locale, reportHint)}</p>
        <div className="mt-3">
          <ActionButton type="button" onClick={() => act(closeSeries)}>{tx(locale, makeReport)}</ActionButton>
        </div>
      </div>
    );
  }
  return (
    <div className="mt-4 space-y-2 text-sm leading-relaxed">
      <p className="font-semibold text-navy">{report.seriesId}</p>
      <p>{tx(locale, routeLabel[report.route])} · {say(locale, report.status, {})}</p>
      <p>{tx(locale, produced)}: {report.tabletCount}. {tx(locale, packed)}: {report.packedCount}.</p>
      <ul>
        {report.composition.map((line) => (
          <li key={line.lineId}>{lotName(locale, line.materialId)}: {tx(locale, target)} {line.targetG} / {tx(locale, actual)} {line.actualG}</li>
        ))}
      </ul>
      <ul>
        {report.qc.map((item) => (
          <li key={item.method}>{tx(locale, methodLabel[item.method])}: {item.status}</li>
        ))}
      </ul>
      <p>{tx(locale, reportDisclaimer)}</p>
    </div>
  );
}

function EquipmentLine({ label, text }: { label: string; text: string }) {
  return (
    <p className="mt-2">
      <span className="font-semibold text-navy">{label}. </span>
      {text}
    </p>
  );
}

function lotName(locale: Locale, materialId: string) {
  const material = materials[materialId as MaterialId];
  return material ? material.name[locale] : materialId;
}

const title: L = { ru: "Лаборатория таблетирования", en: "Tableting laboratory", kk: "Таблеткалау зертханасы" };
const back: L = { ru: "К описанию", en: "Back to the description", kk: "Сипаттамаға оралу" };
const disclaimer: L = { ru: "Учебная симуляция. Она не заменяет квалификацию оборудования, валидацию процесса, реальные испытания и правила GMP.", en: "A teaching simulation. It does not replace equipment qualification, process validation, real tests or GMP rules.", kk: "Оқу симуляциясы. Ол жабдық біліктілігін, процесті валидациялауды, нақты сынақтарды және GMP ережелерін алмастырмайды." };
const noRoute: L = { ru: "Маршрут не выбран", en: "No route selected", kk: "Маршрут таңдалмаған" };
const floorMode: L = { ru: "Схема", en: "Floor plan", kk: "Схема" };
const classicMode: L = { ru: "Формы", en: "Forms", kk: "Пішіндер" };
const guided: L = { ru: "Подсказки включены", en: "Hints on", kk: "Кеңестер қосулы" };
const independent: L = { ru: "Самостоятельная работа", en: "Independent work", kk: "Өзіндік жұмыс" };
const motionOn: L = { ru: "Анимация включена", en: "Animation on", kk: "Анимация қосулы" };
const motionOff: L = { ru: "Анимация уменьшена", en: "Animation reduced", kk: "Анимация азайтылған" };
const newSeries: L = { ru: "Новая серия", en: "New series", kk: "Жаңа серия" };
const loading: L = { ru: "Открываем лабораторию…", en: "Opening the laboratory…", kk: "Зертхана ашылуда…" };
const search: L = { ru: "Поиск стадии или оборудования", en: "Search a stage or equipment", kk: "Сатыны немесе жабдықты іздеу" };
const optional: L = { ru: "необязательно", en: "optional", kk: "міндетті емес" };
const purpose: L = { ru: "Назначение", en: "Purpose", kk: "Мақсаты" };
const principle: L = { ru: "Принцип", en: "Principle", kk: "Принципі" };
const parts: L = { ru: "Основные части", en: "Main parts", kk: "Негізгі бөліктері" };
const inputs: L = { ru: "Вход", en: "Input", kk: "Кіріс" };
const outputs: L = { ru: "Выход", en: "Output", kk: "Шығыс" };
const parameters: L = { ru: "Параметры", en: "Parameters", kk: "Параметрлер" };
const preparation: L = { ru: "Подготовка", en: "Preparation", kk: "Дайындық" };
const start: L = { ru: "Условие пуска", en: "Start condition", kk: "Іске қосу шарты" };
const limits: L = { ru: "Ограничения", en: "Limits", kk: "Шектеулер" };
const actions: L = { ru: "Действия", en: "Actions", kk: "Әрекеттер" };
const source: L = { ru: "Источник", en: "Source", kk: "Дереккөз" };
const equipmentSearch: L = { ru: "Карточка оборудования", en: "Equipment card", kk: "Жабдық картасы" };
const dockLabel: Record<"journal" | "balance" | "theory" | "report", L> = {
  journal: { ru: "Журнал", en: "Journal", kk: "Журнал" },
  balance: { ru: "Баланс", en: "Balance", kk: "Баланс" },
  theory: { ru: "Источники", en: "Sources", kk: "Дереккөздер" },
  report: { ru: "Отчёт", en: "Report", kk: "Есеп" },
};
const mobileTab: Record<"work" | "stages" | "object" | "log", L> = {
  work: { ru: "Работа", en: "Work", kk: "Жұмыс" },
  stages: { ru: "Стадии", en: "Stages", kk: "Сатылар" },
  object: { ru: "Объект", en: "Object", kk: "Нысан" },
  log: { ru: "Журнал", en: "Journal", kk: "Журнал" },
};
const emptyJournal: L = { ru: "Журнал пока пуст.", en: "The journal is empty so far.", kk: "Журнал әзірге бос." };
const inLabel: L = { ru: "вход, г", en: "in, g", kk: "кіріс, г" };
const outLabel: L = { ru: "выход, г", en: "out, g", kk: "шығыс, г" };
const lossLabel: L = { ru: "потери, г", en: "loss, g", kk: "шығын, г" };
const issued: L = { ru: "Взято со склада", en: "Issued from stock", kk: "Қоймадан алынғаны" };
const activeMass: L = { ru: "Сейчас в процессе и в остатках", en: "Now in process and remainders", kk: "Қазір процесте және қалдықта" };
const packedMass: L = { ru: "В упаковке", en: "Packed", kk: "Қаптамада" };
const lossMass: L = { ru: "Записанные потери", en: "Recorded losses", kk: "Жазылған шығын" };
const gap: L = { ru: "Невязка баланса", en: "Balance gap", kk: "Баланс айырмасы" };
const sourcesNote: L = { ru: "Ориентиры для чтения, не цитаты пределов: Государственная фармакопея Республики Казахстан; Ph. Eur. 2.9.1, 2.9.3, 2.9.5, 2.9.7, 2.9.8; USP <701>, <711>, <905>, <1216>; ICH Q8 как рамка понимания процесса. Номер статьи и числовой предел зависят от издания и препарата, поэтому в расчётах используется только профиль PAR-500-EDU.", en: "Reading guides, not quotations of limits: the State Pharmacopoeia of the Republic of Kazakhstan; Ph. Eur. 2.9.1, 2.9.3, 2.9.5, 2.9.7 and 2.9.8; USP <701>, <711>, <905> and <1216>; ICH Q8 as a process-understanding frame. A chapter number and a numeric limit depend on the edition and the product, so the calculations use only profile PAR-500-EDU.", kk: "Шектердің дәйексөзі емес, оқу бағдарлары: Қазақстан Республикасының Мемлекеттік фармакопеясы; Ph. Eur. 2.9.1, 2.9.3, 2.9.5, 2.9.7, 2.9.8; USP <701>, <711>, <905>, <1216>; ICH Q8. Бап нөмірі мен сандық шек басылымға және препаратқа байланысты, сондықтан есепте тек PAR-500-EDU профилі қолданылады." };
const pickFirst: L = { ru: "Сначала выберите маршрут.", en: "Choose a route first.", kk: "Алдымен маршрутты таңдаңыз." };
const batchLabel: L = { ru: "Учебный размер серии, таблеток", en: "Teaching series size, tablets", kk: "Оқу сериясының мөлшері, таблетка" };
const directText: L = { ru: "Сырьё для прямого прессования смешивают, стеарат магния вносят последним и прессуют. Сушка, гранулирование и калибровка в этот маршрут не входят.", en: "Direct-compression materials are blended, magnesium stearate is added last and the blend is compressed. Drying, granulation and sizing are not part of this route.", kk: "Тікелей престеу шикізаты араластырылады, магний стеараты соңында енгізіледі және қоспа престеледі. Кептіру, түйіршіктеу және калибрлеу бұл маршрутқа кірмейді." };
const wetText: L = { ru: "Кристаллический парацетамол гранулируют раствором повидона, сушат до расчётной влажности, затем добавляют внешнюю фазу и стеарат магния. Влажное просеивание, калибровка и обеспыливание можно пропустить.", en: "Crystalline paracetamol is granulated with povidone solution, dried to a calculated moisture, then the external phase and magnesium stearate are added. Wet screening, sizing and dedusting can be skipped.", kk: "Кристалды парацетамол повидон ерітіндісімен түйіршіктеледі, есептік ылғалдылыққа дейін кептіріледі, содан кейін сыртқы фаза мен магний стеараты қосылады. Ылғалды елеуді, калибрлеуді және шаңсыздандыруды өткізуге болады." };
const choose: L = { ru: "Выбрать маршрут", en: "Choose route", kk: "Маршрутты таңдау" };
const reportHint: L = { ru: "Отчёт откроется, когда обязательные стадии, пропуски необязательных и учебные испытания будут записаны.", en: "The report opens once the required stages, optional skips and teaching tests are recorded.", kk: "Есеп міндетті сатылар, міндетті емес өткізулер және оқу сынақтары жазылғанда ашылады." };
const makeReport: L = { ru: "Сформировать отчёт серии", en: "Create the series report", kk: "Серия есебін жасау" };
const produced: L = { ru: "Получено таблеток", en: "Tablets produced", kk: "Алынған таблетка" };
const packed: L = { ru: "Упаковано", en: "Packed", kk: "Қапталғаны" };
const target: L = { ru: "цель", en: "target", kk: "мақсат" };
const actual: L = { ru: "факт", en: "actual", kk: "факт" };
const reportDisclaimer: L = { ru: "Статус относится только к учебной модели. Это не досье на серию и не разрешение выпуска.", en: "The status belongs only to the teaching model. It is not a batch record or a release permission.", kk: "Күй тек оқу моделіне қатысты. Бұл серия құжаты немесе шығару рұқсаты емес." };
const resetAsk: L = { ru: "Начать новую пустую серию? Текущий ход останется в отчёте только если отчёт уже сформирован.", en: "Start a new empty series? The current run stays in the archive only if the report was already created.", kk: "Жаңа бос серияны бастау керек пе? Ағымдағы барыс есеп бұрын жасалған болса ғана мұрағатта қалады." };
const yes: L = { ru: "Да, начать заново", en: "Yes, start again", kk: "Иә, қайта бастау" };
const no: L = { ru: "Оставить", en: "Keep", kk: "Қалдыру" };
