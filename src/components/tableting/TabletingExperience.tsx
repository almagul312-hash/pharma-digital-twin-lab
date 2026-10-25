"use client";

import { Play } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Container } from "@/components/Container";
import { TabletingLab } from "@/components/tableting/TabletingLab";
import { equipmentDocs } from "@/tableting/equipment";
import { withLocale, type Locale } from "@/i18n/config";
import type { ScreenMode } from "@/types/lab";

export function TabletingExperience({
  initialWorkspace,
  locale,
  title,
  description,
  backLabel,
}: {
  initialWorkspace: boolean;
  locale: Locale;
  title: string;
  description: string;
  backLabel: string;
}) {
  const [pending, setPending] = useState<ScreenMode | null>(null);
  const [trackedStart, setTrackedStart] = useState(initialWorkspace);
  const router = useRouter();
  const pathname = usePathname();

  if (trackedStart !== initialWorkspace) {
    setTrackedStart(initialWorkspace);
    setPending(null);
  }

  const screen: ScreenMode = pending ?? (initialWorkspace ? "workspace" : "menu");

  function openWorkspace() {
    setPending("workspace");
    router.replace(`${pathname}?start=1`, { scroll: false });
  }

  function returnToMenu() {
    setPending("menu");
    router.replace(pathname, { scroll: false });
  }

  if (screen === "workspace") {
    return <TabletingLab locale={locale} onBack={returnToMenu} />;
  }

  const copy = overview[locale];

  return (
    <div className="py-12 sm:py-16">
      <Container>
        <Link href={withLocale(locale, "/digital-twins")} className="text-sm font-semibold text-teal hover:text-teal-dark">
          {backLabel}
        </Link>
        <h1 className="mt-6 max-w-4xl text-3xl font-semibold leading-tight text-navy sm:text-4xl">{title}</h1>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed">{description}</p>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted">{copy.disclaimer}</p>
        <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-teal/30 bg-teal-soft px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-navy">{copy.startTitle}</h2>
            <p className="mt-2 max-w-2xl leading-relaxed">{copy.startText}</p>
          </div>
          <button
            type="button"
            onClick={openWorkspace}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-teal px-6 py-3 font-semibold text-white hover:bg-teal-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
          >
            <Play className="h-5 w-5" aria-hidden="true" />
            {copy.start}
          </button>
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <article className="rounded-2xl border border-line bg-white p-5">
            <h2 className="text-xl font-semibold text-navy">{copy.directTitle}</h2>
            <p className="mt-3 leading-relaxed">{copy.direct}</p>
          </article>
          <article className="rounded-2xl border border-line bg-white p-5">
            <h2 className="text-xl font-semibold text-navy">{copy.wetTitle}</h2>
            <p className="mt-3 leading-relaxed">{copy.wet}</p>
          </article>
        </div>
        <h2 className="mt-10 text-2xl font-semibold text-navy">{copy.tasksTitle}</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed">
          {copy.tasks.map((task) => (
            <li key={task}>{task}</li>
          ))}
        </ul>
        <h2 className="mt-10 text-2xl font-semibold text-navy">{copy.equipmentTitle}</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {equipmentDocs.map((item) => (
            <li key={item.id} className="rounded-xl bg-surface px-4 py-3">
              <p className="font-semibold text-navy">{item.title[locale]}</p>
              <p className="mt-1 text-sm leading-relaxed">{item.purpose[locale]}</p>
            </li>
          ))}
        </ul>
      </Container>
    </div>
  );
}

const overview = {
  ru: {
    disclaimer: "Это учебная симуляция технологической схемы. Она не квалифицирует оборудование, не валидирует процесс и не заменяет испытания фармакопеи или правила GMP.",
    startTitle: "Рабочая лаборатория",
    startText: "Кнопка открывает схему и формы управления, а не эту справочную страницу.",
    start: "Приступить",
    directTitle: "Прямое прессование",
    direct: "Приёмка, взвешивание, необязательное просеивание, смешивание без стеарата магния, короткое смазывание, прессование, необязательное обеспыливание, контроль и учебная упаковка. Сушка не требуется.",
    wetTitle: "Влажная грануляция",
    wet: "К прямому маршруту добавляются гранулирующая жидкость, гранулирование и сушка до расчётной влажности. Влажное просеивание, калибровка и обеспыливание можно явно пропустить.",
    tasksTitle: "Учебные задачи",
    tasks: [
      "Отличить карантин, идентификацию и допуск сырья.",
      "Свести тару, нетто и брутто и не подтвердить массу вне допуска.",
      "Не внести стеарат магния до конца основной смеси.",
      "Увидеть, что время сушки само по себе не доказывает влажность.",
      "Получить число таблеток из массы смеси, а не из повторных нажатий.",
      "Прочитать, какие испытания относятся к учебному профилю, а какие зависят от монографии.",
    ],
    equipmentTitle: "Оборудование лаборатории",
  },
  en: {
    disclaimer: "This is a teaching simulation of a process scheme. It does not qualify equipment, validate a process, or replace a pharmacopoeial test or GMP rule.",
    startTitle: "Working laboratory",
    startText: "The button opens the floor plan and the control forms, not this reference page.",
    start: "Start",
    directTitle: "Direct compression",
    direct: "Receipt, weighing, optional sieving, mixing without magnesium stearate, a short lubrication, compression, optional dedusting, testing and a teaching pack. Drying is not required.",
    wetTitle: "Wet granulation",
    wet: "The direct route gains a granulating liquid, granulation and drying to a calculated moisture. Wet screening, sizing and dedusting can be explicitly skipped.",
    tasksTitle: "Learning tasks",
    tasks: [
      "Separate quarantine, identification and release.",
      "Reconcile tare, net and gross, and do not confirm a mass outside tolerance.",
      "Keep magnesium stearate out until the main blend is finished.",
      "See that drying time alone does not prove moisture.",
      "Obtain the tablet count from the blend mass, not from repeated clicks.",
      "Read which tests belong to the teaching profile and which depend on a monograph.",
    ],
    equipmentTitle: "Laboratory equipment",
  },
  kk: {
    disclaimer: "Бұл технологиялық схеманың оқу симуляциясы. Ол жабдықты біліктілендірмейді, процесті валидацияламайды және фармакопея сынағын немесе GMP ережесін алмастырмайды.",
    startTitle: "Жұмыс зертханасы",
    startText: "Батырма анықтамалық бетті емес, схема мен басқару пішіндерін ашады.",
    start: "Бастау",
    directTitle: "Тікелей престеу",
    direct: "Қабылдау, өлшеу, міндетті емес елеу, магний стеаратынсыз араластыру, қысқа майлау, престеу, міндетті емес шаңсыздандыру, бақылау және оқу қаптамасы. Кептіру керек емес.",
    wetTitle: "Ылғалды түйіршіктеу",
    wet: "Тікелей маршрутқа түйіршіктеу сұйықтығы, түйіршіктеу және есептік ылғалдылыққа дейін кептіру қосылады. Ылғалды елеуді, калибрлеуді және шаңсыздандыруды анық өткізуге болады.",
    tasksTitle: "Оқу тапсырмалары",
    tasks: [
      "Карантинді, сәйкестендіруді және рұқсатты ажырату.",
      "Тараны, неттоны және бруттоны түйістіріп, рұқсаттан тыс массаны растамау.",
      "Негізгі қоспа біткенше магний стеаратын қоспау.",
      "Кептіру уақытының өзі ылғалдылықты дәлелдемейтінін көру.",
      "Таблетка санын қайта басудан емес, қоспа массасынан алу.",
      "Қай сынақ оқу профиліне жататынын және қайсысы монографияға байланысты екенін оқу.",
    ],
    equipmentTitle: "Зертхана жабдығы",
  },
} as const;
