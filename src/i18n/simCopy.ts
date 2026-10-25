import type { Locale } from "@/i18n/config";

export type SimCopy = {
  sessionOnly: string;
  modelData: string;
  routeA: string;
  routeB: string;
  routeAHint: string;
  routeBHint: string;
  process: string;
  recipe: string;
  materials: string;
  equipment: string;
  log: string;
  available: string;
  done: string;
  blocked: string;
  optional: string;
  startOp: string;
  pause: string;
  resume: string;
  stop: string;
  identify: string;
  release: string;
  weigh: string;
  split: string;
  load: string;
  reject: string;
  unload: string;
  merge: string;
  tools: string;
  loaded: string;
  noneLoaded: string;
  rpm: string;
  temperature: string;
  minutes: string;
  timeScale: string;
  runQc: string;
  grabHint: string;
  quality: string;
  qualityHigh: string;
  qualityLow: string;
  balance: string;
  input: string;
  powder: string;
  capsules: string;
  rejected: string;
  gap: string;
  phase: Record<string, string>;
  roles: Record<string, string>;
  ipc: string;
  finished: string;
  intermediate: string;
};

const ru: SimCopy = {
  sessionOnly: "Данные только в текущей сессии. Не GMP-запись.",
  modelData: "МОДЕЛЬНЫЕ ДАННЫЕ",
  routeA: "Прямое смешивание",
  routeB: "Влажная грануляция",
  routeAHint: "Сушка не требуется. Эксикатор не является стадией процесса.",
  routeBHint: "Гранулят сушат в сушильном шкафу до целевой влажности.",
  process: "Маршрут",
  recipe: "Рецептура",
  materials: "Материалы",
  equipment: "Аппарат",
  log: "Журнал",
  available: "Доступно",
  done: "Выполнено",
  blocked: "Заблокировано",
  optional: "По необходимости",
  startOp: "Запустить",
  pause: "Пауза",
  resume: "Продолжить",
  stop: "Стоп",
  identify: "Идентифицировать",
  release: "Разрешить к использованию",
  weigh: "Зафиксировать массу",
  split: "Отделить навеску",
  load: "Загрузить в аппарат",
  reject: "Отбраковать капсулы",
  unload: "Выгрузить на стол",
  merge: "Объединить с порцией",
  tools: "Инструменты",
  loaded: "Загружено",
  noneLoaded: "нет",
  rpm: "Обороты, об/мин",
  temperature: "Заданная температура",
  minutes: "Время процесса, мин",
  timeScale: "Учебный масштаб: 1 мин процесса ≈ 5 с на экране. Досрочный стоп не засчитывает операцию.",
  runQc: "Выполнить испытание",
  grabHint:
    "Перетащите контейнер мышью на чашку весов или в аппарат. На телефоне: выберите объект, затем зону загрузки. Стрелки — сдвиг, Enter — положить.",
  quality: "Графика",
  qualityHigh: "Обычная",
  qualityLow: "Упрощённая",
  balance: "Материальный баланс",
  input: "По рецептуре",
  powder: "Порошки / смеси",
  capsules: "Капсулы",
  rejected: "Брак",
  gap: "Расхождение",
  phase: {
    idle: "Остановлен",
    ready: "Готов",
    running: "В работе",
    paused: "Пауза",
    completed: "Цикл выдержан",
    error: "Ошибка",
  },
  roles: {
    api: "АФС",
    filler: "Наполнитель",
    binder: "Связующее",
    disintegrant: "Разрыхлитель",
    glidant: "Скользящее",
    lubricant: "Смазка",
    wetting: "Растворитель",
    capsule_shell: "Оболочки",
    other: "Другое",
  },
  ipc: "IPC",
  finished: "Готовый продукт",
  intermediate: "Промежуточный",
};

const en: SimCopy = {
  ...ru,
  sessionOnly: "Session-only data. Not a GMP record.",
  modelData: "MODEL DATA",
  routeA: "Direct blend",
  routeB: "Wet granulation",
  routeAHint: "No drying step. A desiccator is not a process stage.",
  routeBHint: "Dry granules in the drying cabinet to the target LOD.",
  process: "Route",
  recipe: "Formula",
  materials: "Materials",
  equipment: "Equipment",
  log: "Log",
  available: "Available",
  done: "Done",
  blocked: "Blocked",
  optional: "If needed",
  startOp: "Start",
  pause: "Pause",
  resume: "Resume",
  stop: "Stop",
  identify: "Identify",
  release: "Release for use",
  weigh: "Confirm mass",
  split: "Split aliquot",
  load: "Load equipment",
  reject: "Reject capsules",
  unload: "Unload to bench",
  merge: "Merge with lot",
  tools: "Tools",
  loaded: "Loaded",
  noneLoaded: "none",
  rpm: "Speed, rpm",
  temperature: "Set temperature",
  minutes: "Process time, min",
  timeScale: "Training time scale: 1 process min ≈ 5 s on screen. Stopping early does not complete the operation.",
  runQc: "Run test",
  grabHint:
    "Drag a container onto the balance pan or machine. On a phone, select the object then a drop zone. Arrow keys move, Enter drops.",
  quality: "Graphics",
  qualityHigh: "Full",
  qualityLow: "Reduced",
  balance: "Mass balance",
  input: "Formula input",
  powder: "Powders / blends",
  capsules: "Capsules",
  rejected: "Rejected",
  gap: "Gap",
  phase: {
    idle: "Idle",
    ready: "Ready",
    running: "Running",
    paused: "Paused",
    completed: "Cycle complete",
    error: "Error",
  },
  roles: {
    api: "API",
    filler: "Filler",
    binder: "Binder",
    disintegrant: "Disintegrant",
    glidant: "Glidant",
    lubricant: "Lubricant",
    wetting: "Vehicle",
    capsule_shell: "Shells",
    other: "Other",
  },
  ipc: "IPC",
  finished: "Finished product",
  intermediate: "Intermediate",
};

const kk: SimCopy = {
  ...ru,
  sessionOnly: "Тек осы сессия деректері. GMP жазбасы емес.",
  modelData: "МОДЕЛЬДІК ДЕРЕКТЕР",
  routeA: "Тікелей араластыру",
  routeB: "Ылғал түйіршіктеу",
  routeAHint: "Кептіру міндетті емес. Эксикатор процесс сатысы емес.",
  routeBHint: "Түйіршікті кептіргіш шкафта кептіреді.",
  process: "Маршрут",
  recipe: "Рецептура",
  materials: "Материалдар",
  equipment: "Аппарат",
  log: "Журнал",
  available: "Қолжетімді",
  done: "Орындалды",
  blocked: "Бұғатталған",
  optional: "Қажет болса",
  startOp: "Іске қосу",
  pause: "Кідіріс",
  resume: "Жалғастыру",
  stop: "Тоқтату",
  identify: "Сәйкестендіру",
  release: "Пайдалануға рұқсат",
  weigh: "Массаны тіркеу",
  split: "Навеска бөлу",
  load: "Аппаратқа жүктеу",
  reject: "Капсуланы шығару",
  unload: "Үстелге шығару",
  merge: "Порциямен біріктіру",
  tools: "Құралдар",
  loaded: "Жүктелген",
  noneLoaded: "жоқ",
  rpm: "Айналым, айн/мин",
  temperature: "Берілген температура",
  minutes: "Процесс уақыты, мин",
  timeScale: "Оқу масштабы: 1 мин ≈ 5 с. Ерте тоқтату операцияны есептемейді.",
  runQc: "Сынақ",
  grabHint: "Контейнерді таразыға немесе аппаратқа сүйреңіз.",
  quality: "Графика",
  qualityHigh: "Толық",
  qualityLow: "Жеңіл",
  balance: "Материалдық баланс",
  input: "Рецептура",
  powder: "Ұнтақтар",
  capsules: "Капсулалар",
  rejected: "Жарамсыз",
  gap: "Айырма",
  ipc: "IPC",
  finished: "Дайын өнім",
  intermediate: "Аралық",
};

const all: Record<Locale, SimCopy> = { ru, en, kk };

export function getSimCopy(locale: Locale) {
  return all[locale];
}
