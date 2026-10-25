import type { Locale } from "@/i18n/config";
import { materials, type MaterialId } from "@/tableting/catalog";
import type { LocationId, Params, StageId } from "@/tableting/types";

export type L = { ru: string; en: string; kk: string };

export function tx(locale: Locale, text: L) {
  return text[locale];
}

export const stageLabel: Record<StageId, L> = {
  intake: { ru: "Приёмка и идентификация", en: "Receipt and identification", kk: "Қабылдау және сәйкестендіру" },
  weighing: { ru: "Взвешивание", en: "Weighing", kk: "Өлшеу" },
  sieving: { ru: "Просеивание порошков", en: "Powder sieving", kk: "Ұнтақты елеу" },
  premix: { ru: "Смешивание", en: "Mixing", kk: "Араластыру" },
  granulating_liquid: { ru: "Гранулирующая жидкость", en: "Granulating liquid", kk: "Түйіршіктеу сұйықтығы" },
  granulation: { ru: "Гранулирование", en: "Granulation", kk: "Түйіршіктеу" },
  wet_screening: { ru: "Влажное просеивание", en: "Wet screening", kk: "Ылғалды елеу" },
  drying: { ru: "Сушка", en: "Drying", kk: "Кептіру" },
  moisture_check: { ru: "Контроль влажности", en: "Moisture check", kk: "Ылғалдылықты бақылау" },
  sizing: { ru: "Калибровка гранул", en: "Granule sizing", kk: "Түйіршікті калибрлеу" },
  final_blend: { ru: "Внешняя фаза", en: "External phase", kk: "Сыртқы фаза" },
  lubrication: { ru: "Смазывание", en: "Lubrication", kk: "Майлау" },
  compression: { ru: "Прессование", en: "Compression", kk: "Престеу" },
  dedusting: { ru: "Обеспыливание", en: "Dedusting", kk: "Шаңсыздандыру" },
  qc: { ru: "Контроль качества", en: "Quality control", kk: "Сапаны бақылау" },
  packaging: { ru: "Упаковка серии", en: "Series packaging", kk: "Серияны қаптау" },
};

export const locationLabel: Record<LocationId, L> = {
  warehouse: { ru: "Склад", en: "Warehouse", kk: "Қойма" },
  scale: { ru: "Весы", en: "Balances", kk: "Таразы" },
  sieve: { ru: "Сита", en: "Sieves", kk: "Електер" },
  mixer: { ru: "Смеситель", en: "Mixer", kk: "Араластырғыш" },
  liquid: { ru: "Ёмкость жидкости", en: "Liquid vessel", kk: "Сұйықтық ыдысы" },
  granulator: { ru: "Гранулятор", en: "Granulator", kk: "Түйіршіктегіш" },
  dryer: { ru: "Сушильный шкаф", en: "Drying oven", kk: "Кептіргіш шкаф" },
  calibrator: { ru: "Калибратор", en: "Calibrator", kk: "Калибратор" },
  press: { ru: "Таблеточный пресс", en: "Tablet press", kk: "Таблетка пресі" },
  deduster: { ru: "Обеспыливатель", en: "Deduster", kk: "Шаңсыздандырғыш" },
  qc: { ru: "Контроль качества", en: "Quality control", kk: "Сапаны бақылау" },
  pack: { ru: "Упаковка", en: "Packaging", kk: "Қаптау" },
  waste: { ru: "Потери и отсев", en: "Waste and rejects", kk: "Шығын және іріктеу" },
};

export const routeLabel: Record<string, L> = {
  direct: { ru: "Прямое прессование", en: "Direct compression", kk: "Тікелей престеу" },
  wet_granulation: { ru: "Влажная грануляция", en: "Wet granulation", kk: "Ылғалды түйіршіктеу" },
};

export const roleLabel: Record<string, L> = {
  api: { ru: "действующее вещество", en: "active substance", kk: "әсер етуші зат" },
  filler: { ru: "наполнитель", en: "filler", kk: "толтырғыш" },
  binder: { ru: "связующее", en: "binder", kk: "байланыстырғыш" },
  disintegrant: { ru: "дезинтегрант", en: "disintegrant", kk: "ыдыратушы" },
  glidant: { ru: "скользящее", en: "glidant", kk: "сырғытқыш" },
  lubricant: { ru: "смазывающее", en: "lubricant", kk: "майлаушы" },
  solvent: { ru: "растворитель", en: "solvent", kk: "еріткіш" },
  blend: { ru: "смесь", en: "blend", kk: "қоспа" },
  granulating_liquid: { ru: "гранулирующая жидкость", en: "granulating liquid", kk: "түйіршіктеу сұйықтығы" },
  wet_granules: { ru: "влажные гранулы", en: "wet granules", kk: "ылғал түйіршік" },
  granules: { ru: "гранулы", en: "granules", kk: "түйіршік" },
  press_mass: { ru: "прессуемая масса", en: "compression blend", kk: "престелетін масса" },
  tablets: { ru: "таблетки", en: "tablets", kk: "таблеткалар" },
  dust: { ru: "пыль", en: "dust", kk: "шаң" },
  fines: { ru: "мелочь", en: "fines", kk: "ұсақ фракция" },
  retained: { ru: "сход", en: "retained fraction", kk: "електе қалған фракция" },
};

export const methodLabel: Record<string, L> = {
  appearance: { ru: "Описание", en: "Appearance", kk: "Сипаттама" },
  average_mass: { ru: "Средняя масса", en: "Average mass", kk: "Орташа масса" },
  mass_uniformity: { ru: "Однородность массы", en: "Uniformity of mass", kk: "Масса біркелкілігі" },
  content_uniformity: { ru: "Однородность дозирования", en: "Uniformity of dosage units", kk: "Доза біркелкілігі" },
  dimensions: { ru: "Толщина и диаметр", en: "Thickness and diameter", kk: "Қалыңдық және диаметр" },
  hardness: { ru: "Прочность на раздавливание", en: "Resistance to crushing", kk: "Езуге беріктік" },
  friability: { ru: "Истираемость", en: "Friability", kk: "Үйкеліп тозу" },
  disintegration: { ru: "Распадаемость", en: "Disintegration", kk: "Ыдырағыштық" },
  dissolution: { ru: "Растворение", en: "Dissolution", kk: "Еру" },
  assay: { ru: "Количественное определение", en: "Assay", kk: "Сандық анықтау" },
};

export const statusLabel: Record<string, L> = {
  unavailable: { ru: "Не входит в маршрут", en: "Not in this route", kk: "Маршрутқа кірмейді" },
  awaiting: { ru: "Нужно загрузить", en: "Load material", kk: "Жүктеу керек" },
  ready: { ru: "Можно выполнять", en: "Ready", kk: "Орындауға болады" },
  running: { ru: "Выполняется", en: "Running", kk: "Орындалуда" },
  done: { ru: "Завершено", en: "Completed", kk: "Аяқталды" },
  done_warning: { ru: "Завершено с предупреждением", en: "Completed with a warning", kk: "Ескертумен аяқталды" },
  blocked: { ru: "Пока недоступно", en: "Not available yet", kk: "Әзірге қолжетімсіз" },
  skipped: { ru: "Пропущено", en: "Skipped", kk: "Өткізілді" },
};

const messages: Record<string, L> = {
  route_set: { ru: "Маршрут выбран. Серия {seriesId} — учебный номер, не регистрационное удостоверение.", en: "Route selected. Series {seriesId} is a teaching number, not a marketing authorisation.", kk: "Маршрут таңдалды. {seriesId} сериясы — оқу нөмірі, тіркеу куәлігі емес." },
  route_same: { ru: "Этот маршрут уже выбран.", en: "This route is already selected.", kk: "Бұл маршрут бұрын таңдалған." },
  route_busy: { ru: "В серии уже есть операции. Смена маршрута начнёт новую серию.", en: "This series already has operations. Changing the route starts a new series.", kk: "Серияда операциялар бар. Маршрутты ауыстыру жаңа серияны бастайды." },
  batch_set: { ru: "Размер серии: {batch} таблеток.", en: "Series size: {batch} tablets.", kk: "Серия мөлшері: {batch} таблетка." },
  batch_locked: { ru: "Размер серии фиксируется до первого взвешивания.", en: "Series size is fixed before the first weighing.", kk: "Серия мөлшері алғашқы өлшеуге дейін бекітіледі." },
  batch_range: { ru: "Доступны учебные серии 80, 120 или 200 таблеток.", en: "Teaching series of 80, 120 or 200 tablets are available.", kk: "80, 120 немесе 200 таблеткалық оқу сериясы қолжетімді." },
  identity_ok: { ru: "Идентификация {material} сверена с учебным паспортом. Для работы нужен отдельный допуск.", en: "Identity of {material} was checked against the teaching passport. Release is a separate step.", kk: "{material} сәйкестендіруі оқу паспортымен салыстырылды. Жұмыс үшін бөлек рұқсат керек." },
  identity_state: { ru: "Повторять идентификацию не нужно: статус уже «{state}».", en: "Identification does not need to be repeated: the status is already “{state}”.", kk: "Сәйкестендіруді қайталау қажет емес: күйі «{state}»." },
  release_need_identity: { ru: "{material} ещё в карантине. Сначала откройте паспорт и подтвердите идентификацию.", en: "{material} is still in quarantine. Open the passport and confirm identity first.", kk: "{material} әлі карантинде. Алдымен паспортты ашып, сәйкестендіруді растаңыз." },
  release_ok: { ru: "{material} допущен к учебному производству.", en: "{material} is released for the teaching batch.", kk: "{material} оқу өндірісіне жіберілді." },
  already_released: { ru: "{material} уже допущен.", en: "{material} is already released.", kk: "{material} бұрын жіберілген." },
  weigh_selected: { ru: "Выбрана позиция {line}. Установите тару, обнулите весы и введите массу нетто.", en: "Line {line} is selected. Set the tare, zero the balance and enter the net mass.", kk: "{line} позициясы таңдалды. Тараны қойып, таразыны нөлдеңіз және нетто массасын енгізіңіз." },
  weigh_need_zero: { ru: "Сначала выберите компонент, зафиксируйте тару и введите массу нетто.", en: "Select a component, record the tare and enter the net mass first.", kk: "Алдымен құрамдасты таңдап, тараны бекітіп, нетто массасын енгізіңіз." },
  weigh_need_analytical: { ru: "Допуск {tolerance} г меньше шага лабораторных весов ({step} г). Переключитесь на аналитические весы.", en: "The tolerance {tolerance} g is smaller than the laboratory balance increment ({step} g). Switch to the analytical balance.", kk: "{tolerance} г рұқсат зертханалық таразы қадамынан ({step} г) кіші. Аналитикалық таразыға ауысыңыз." },
  weigh_outside: { ru: "Нетто {net} г вне допуска. Цель {target} г ± {tolerance} г. Измените навеску, не подтверждайте её.", en: "Net {net} g is outside the tolerance. Target {target} g ± {tolerance} g. Adjust the weight instead of confirming it.", kk: "Нетто {net} г рұқсаттан тыс. Мақсат {target} г ± {tolerance} г. Растамай, өлшендіні түзетіңіз." },
  water_window: { ru: "Вода {net} г вне учебного окна {min}–{max} г. Рекомендуемая навеска {target} г (18 % массы внутренней фазы).", en: "Water {net} g is outside the teaching window {min}–{max} g. The recommended charge is {target} g (18 % of the inner-phase mass).", kk: "Су {net} г оқу терезесінен {min}–{max} г тыс. Ұсынылатын өлшенді {target} г (ішкі фаза массасының 18 %)." },
  weigh_duplicate: { ru: "Позиция {line} уже взвешена. Повтор создал бы вторую навеску.", en: "Line {line} is already weighed. Repeating it would create a second portion.", kk: "{line} позициясы өлшенген. Қайталау екінші өлшендіні жасайды." },
  weigh_not_released: { ru: "Материал не допущен со склада. Завершите идентификацию и отдельный допуск.", en: "The material is not released from the warehouse. Finish identification and the separate release.", kk: "Материал қоймадан жіберілмеген. Сәйкестендіруді және бөлек рұқсатты аяқтаңыз." },
  weigh_stock: { ru: "На складе {have} г, нужно {need} г.", en: "The warehouse has {have} g, but {need} g is required.", kk: "Қоймада {have} г бар, {need} г керек." },
  weigh_ok: { ru: "Взвешено {net} г (цель {target} г). Брутто {gross} г. Со склада списана та же масса.", en: "Weighed {net} g (target {target} g). Gross {gross} g. The same mass was issued from stock.", kk: "{net} г өлшенді (мақсат {target} г). Брутто {gross} г. Қоймадан дәл осы масса есептен шығарылды." },
  weigh_returned: { ru: "Навеска {mass} г возвращена на склад.", en: "The {mass} g portion was returned to stock.", kk: "{mass} г өлшенді қоймаға қайтарылды." },
  weigh_locked: { ru: "После смешивания навеску уже нельзя вернуть: она вошла в полупродукт.", en: "After mixing, the portion cannot be returned: it has entered an intermediate.", kk: "Араластырғаннан кейін өлшендіні қайтаруға болмайды: ол жартылай өнімге кірді." },
  weigh_return_state: { ru: "Вернуть можно только целую навеску, которая ещё стоит на весах.", en: "Only an intact portion that is still on the balance can be returned.", kk: "Тек таразыда тұрған бүтін өлшендіні қайтаруға болады." },
  tare_set: { ru: "Тара {tare} г зафиксирована, показание обнулено. Вводите массу нетто.", en: "Tare {tare} g is recorded and the display is zeroed. Enter the net mass.", kk: "Тара {tare} г бекітілді, көрсеткіш нөлденді. Нетто массасын енгізіңіз." },
  tare_range: { ru: "Масса тары должна быть от 0,1 до 500 г.", en: "Tare mass must be from 0.1 to 500 g.", kk: "Тара массасы 0,1–500 г аралығында болуы керек." },
  mass_invalid: { ru: "Масса должна быть конечным неотрицательным числом.", en: "Mass must be a finite, non-negative number.", kk: "Масса теріс емес ақырлы сан болуы керек." },
  move_ok: { ru: "{material}, {mass} г → {location}. Новая порция не создавалась.", en: "{material}, {mass} g → {location}. No new portion was created.", kk: "{material}, {mass} г → {location}. Жаңа үлес жасалмады." },
  move_same: { ru: "Материал уже находится здесь: {location}.", en: "The material is already here: {location}.", kk: "Материал осында: {location}." },
  move_rejected: { ru: "{material} нельзя перенести в зону «{location}». Выберите следующую допустимую стадию или верните навеску.", en: "{material} cannot be moved to “{location}”. Choose the next allowed station or return the portion.", kk: "{material} материалын «{location}» аймағына көшіруге болмайды. Келесі рұқсат етілген станцияны таңдаңыз." },
  move_lubricant_early: { ru: "Смазывающее уже в смесителе, но основная смесь ещё не готова. Не запускайте смешивание, пока не завершите предыдущую стадию: стеарат магния вносят последним.", en: "The lubricant is in the mixer before the main blend is ready. Do not start mixing yet: magnesium stearate is added last.", kk: "Майлаушы араластырғышта, бірақ негізгі қоспа әлі дайын емес. Магний стеараты соңында енгізіледі." },
  load_ok: { ru: "На стадию «{stage}» перенесено объектов: {count}.", en: "{count} items were moved to “{stage}”.", kk: "«{stage}» сатысына {count} нысан көшірілді." },
  load_missing: { ru: "Для стадии «{stage}» не хватает нужного материала. Проверьте взвешивание и предыдущий продукт.", en: "Stage “{stage}” is missing a required material. Check weighing and the previous product.", kk: "«{stage}» сатысына қажетті материал жетіспейді. Өлшеуді және алдыңғы өнімді тексеріңіз." },
  skip_ok: { ru: "Стадия «{stage}» пропущена: для этого маршрута она не обязательна. Причина записана в журнал.", en: "Stage “{stage}” was skipped: it is not mandatory for this route. The reason is in the journal.", kk: "«{stage}» сатысы өткізілді: бұл маршрут үшін ол міндетті емес. Себебі журналға жазылды." },
  skip_not_optional: { ru: "Стадию «{stage}» нельзя пропустить: без неё выбранный маршрут не получает нужный полупродукт.", en: "Stage “{stage}” cannot be skipped: the selected route needs its intermediate.", kk: "«{stage}» сатысын өткізуге болмайды: таңдалған маршрутқа оның жартылай өнімі керек." },
  already_done: { ru: "Стадия «{stage}» уже выполнена. Повтор создал бы вторую порцию материала.", en: "Stage “{stage}” is already complete. Repeating it would create a second portion.", kk: "«{stage}» сатысы орындалған. Қайталау материалдың екінші үлесін жасайды." },
  job_busy: { ru: "Уже выполняется операция «{stage}». Дождитесь окончания или остановите её.", en: "“{stage}” is already running. Wait for it to finish or stop it.", kk: "«{stage}» операциясы орындалуда. Аяқталуын күтіңіз немесе тоқтатыңыз." },
  job_cancelled: { ru: "Операция «{stage}» остановлена до результата. Материалы не разделены и не скопированы.", en: "“{stage}” was stopped before a result. Materials were not split or copied.", kk: "«{stage}» операциясы нәтижеге дейін тоқтатылды. Материалдар бөлінбеді және көшірілмеді." },
  job_missing: { ru: "Нет запущенной операции.", en: "There is no running operation.", kk: "Іске қосылған операция жоқ." },
  series_closed: { ru: "Учебная серия закрыта отчётом. Начните новую серию, чтобы изменить процесс.", en: "The teaching series is closed by the report. Start a new series to change the process.", kk: "Оқу сериясы есеппен жабылды. Процесті өзгерту үшін жаңа серия бастаңыз." },
  sieve_started: { ru: "Просеивание запущено. Доля фракций считается учебной моделью, а не измерением.", en: "Sieving has started. Fraction sizes come from the teaching model, not from a measurement.", kk: "Елеу басталды. Фракция үлесі өлшеу емес, оқу моделімен есептеледі." },
  sieve_done: { ru: "Сито {mesh} мм: проход {passed} г, сход {retained} г. Сумма равна загрузке. Модель: 1 − exp(−(сито/d50)^1,4).", en: "Sieve {mesh} mm: passed {passed} g, retained {retained} g. The sum equals the charge. Model: 1 − exp(−(mesh/d50)^1.4).", kk: "Елек {mesh} мм: өткені {passed} г, қалғаны {retained} г. Қосынды жүктемеге тең. Модель: 1 − exp(−(елек/d50)^1,4)." },
  sieve_lot: { ru: "Положите на сито одну взвешенную навеску порошка.", en: "Place one weighed powder portion on the sieve.", kk: "Елекке бір өлшенген ұнтақ үлесін салыңыз." },
  mesh_range: { ru: "Для этой операции доступен другой набор сит. Выберите размер из списка стадии.", en: "This operation uses a different sieve set. Choose a size from the stage list.", kk: "Бұл операцияға басқа електер жиыны керек. Саты тізімінен өлшемді таңдаңыз." },
  premix_started: { ru: "Смешивание запущено. Показатель однородности будет расчётным, не результатом пробоотбора.", en: "Mixing has started. The uniformity figure will be calculated, not sampled.", kk: "Араластыру басталды. Біркелкілік көрсеткіші сынама емес, есептеледі." },
  premix_done: { ru: "Смесь {mass} г. Учебные потери на стенках {loss} г. Расчётный RSD {rsd} % — не измеренная однородность.", en: "Blend {mass} g. Teaching wall loss {loss} g. Calculated RSD {rsd} % is not a measured uniformity.", kk: "Қоспа {mass} г. Қабырғадағы оқу шығыны {loss} г. Есептік RSD {rsd} % — өлшенген біркелкілік емес." },
  premix_missing: { ru: "В смесителе нет всех компонентов внутренней фазы. Не добавляйте смазывающее на этой стадии.", en: "The mixer does not contain every inner-phase component. Do not add the lubricant at this stage.", kk: "Араластырғышта ішкі фазаның барлық құрамдасы жоқ. Бұл сатыда майлаушыны қоспаңыз." },
  premix_lubricant: { ru: "Смазывающее уже в чаше. Уберите его: стеарат магния вносят после основной смеси и смешивают коротко.", en: "The lubricant is already in the bowl. Remove it: magnesium stearate is added after the main blend and mixed briefly.", kk: "Майлаушы ыдыста. Оны алыңыз: магний стеараты негізгі қоспадан кейін енгізіліп, қысқа араластырылады." },
  liquid_started: { ru: "Приготовление раствора начато. Объём будет пересчитан по учебной плотности, граммы не заменяют миллилитры.", en: "Solution preparation has started. Volume is calculated from the teaching density; grams do not replace millilitres.", kk: "Ерітінді дайындау басталды. Көлем оқу тығыздығымен есептеледі; грамм миллилитрді алмастырмайды." },
  liquid_done: { ru: "Гранулирующая жидкость {mass} г, учебный объём {volume} мл, плотность {density} г/мл.", en: "Granulating liquid {mass} g, teaching volume {volume} mL, density {density} g/mL.", kk: "Түйіршіктеу сұйықтығы {mass} г, оқу көлемі {volume} мл, тығыздығы {density} г/мл." },
  liquid_missing: { ru: "В ёмкость нужно перенести и повидон, и воду очищенную.", en: "Both povidone and purified water must be in the vessel.", kk: "Ыдысқа повидонды да, тазартылған суды да көшіру керек." },
  granulation_started: { ru: "Гранулирование запущено. Качество гранул зависит от доли жидкости и времени, а не от одной общей формулы.", en: "Granulation has started. Granule quality depends on the liquid ratio and time, not on one universal formula.", kk: "Түйіршіктеу басталды. Түйіршік сапасы бір жалпы формулаға емес, сұйықтық үлесі мен уақытқа байланысты." },
  granulation_done: { ru: "Влажные гранулы {mass} г. Доля жидкости к порошку {ratio}. Учебный показатель качества {quality}. Влажность модели {moisture}.", en: "Wet granules {mass} g. Liquid-to-powder ratio {ratio}. Teaching quality index {quality}. Model moisture {moisture}.", kk: "Ылғал түйіршік {mass} г. Сұйықтықтың ұнтаққа үлесі {ratio}. Оқу сапа көрсеткіші {quality}. Модель ылғалдылығы {moisture}." },
  granulation_missing: { ru: "В гранулятор нужно загрузить и смесь, и гранулирующую жидкость.", en: "Load both the blend and the granulating liquid into the granulator.", kk: "Түйіршіктегішке қоспаны да, түйіршіктеу сұйықтығын да жүктеңіз." },
  screen_started: { ru: "Влажное просеивание запущено.", en: "Wet screening has started.", kk: "Ылғалды елеу басталды." },
  screen_done: { ru: "Проход {passed} г, влажный сход {retained} г. Сумма равна загрузке.", en: "Passed {passed} g, wet retained {retained} g. The sum equals the charge.", kk: "Өткені {passed} г, ылғал қалдық {retained} г. Қосынды жүктемеге тең." },
  screen_missing: { ru: "Перенесите влажные гранулы на сито.", en: "Move the wet granules onto the sieve.", kk: "Ылғал түйіршікті елекке көшіріңіз." },
  dry_started: { ru: "Сушка запущена. Окончание времени само по себе не означает нужную влажность: она считается моделью сушки.", en: "Drying has started. Reaching the set time does not by itself prove the moisture: it is calculated by the drying model.", kk: "Кептіру басталды. Уақыттың бітуі ылғалдылықты дәлелдемейді: ол кептіру моделімен есептеледі." },
  dry_done: { ru: "Расчётная влажность {moisture} %. Удалено воды {removed} г. Это не показание влагомера.", en: "Calculated moisture {moisture} %. Water removed {removed} g. This is not a moisture-analyser reading.", kk: "Есептік ылғалдылық {moisture} %. Шыққан су {removed} г. Бұл ылғал өлшегіштің көрсеткіші емес." },
  dry_out_of_window: { ru: "Расчётная влажность {moisture} % вне учебного окна. Масса уменьшилась на {removed} г. Прессовать такую массу нельзя, сушку можно повторить.", en: "Calculated moisture {moisture} % is outside the teaching window. Mass fell by {removed} g. This mass cannot be compressed; drying can be repeated.", kk: "Есептік ылғалдылық {moisture} % оқу терезесінен тыс. Масса {removed} г азайды. Мұндай массаны престеуге болмайды, кептіруді қайталауға болады." },
  dry_missing: { ru: "В сушильном шкафу нет влажных гранул. Для прямого прессования сушка не требуется.", en: "There are no wet granules in the oven. Direct compression does not need drying.", kk: "Кептіргіш шкафта ылғал түйіршік жоқ. Тікелей престеуге кептіру керек емес." },
  dry_temp_range: { ru: "Учебный диапазон шкафа {min}–{max} °C. Вне его модель сушки не запускается.", en: "The teaching oven range is {min}–{max} °C. Outside it, the drying model does not start.", kk: "Шкафтың оқу ауқымы {min}–{max} °C. Одан тыс кептіру моделі іске қосылмайды." },
  dry_time_range: { ru: "Задайте время сушки от 5 до 180 минут.", en: "Set a drying time from 5 to 180 minutes.", kk: "Кептіру уақытын 5–180 минут аралығында беріңіз." },
  moisture_ack: { ru: "Зафиксирована расчётная влажность {moisture} %. Это результат модели сушки, не отдельный анализ влагомером.", en: "Calculated moisture {moisture} % is recorded. It comes from the drying model, not from a separate moisture test.", kk: "Есептік ылғалдылық {moisture} % тіркелді. Бұл кептіру моделінің нәтижесі, бөлек ылғал талдауы емес." },
  moisture_missing: { ru: "Нет высушенных гранул, для которых можно записать влажность.", en: "There are no dried granules whose moisture can be recorded.", kk: "Ылғалдылығын жазуға болатын кептірілген түйіршік жоқ." },
  size_started: { ru: "Калибровка запущена. Доля мелочи связана с показателем гранулирования.", en: "Sizing has started. The fines fraction is linked to the granulation index.", kk: "Калибрлеу басталды. Ұсақ фракция үлесі түйіршіктеу көрсеткішімен байланысты." },
  size_done: { ru: "Калиброванные гранулы {sized} г, мелочь {fines} г. Сумма равна загрузке. Мелочь можно добавить во внешнюю фазу или оставить как остаток.", en: "Sized granules {sized} g, fines {fines} g. The sum equals the charge. Fines can join the external phase or stay as a remainder.", kk: "Калибрленген түйіршік {sized} г, ұсақ фракция {fines} г. Қосынды жүктемеге тең. Ұсақ фракцияны сыртқы фазаға қосуға немесе қалдық ретінде қалдыруға болады." },
  size_missing: { ru: "Перенесите высушенные гранулы в калибратор.", en: "Move the dried granules to the calibrator.", kk: "Кептірілген түйіршікті калибраторға көшіріңіз." },
  final_started: { ru: "Смешивание с внешней фазой запущено. Смазывающее на этой стадии не добавляется.", en: "External-phase mixing has started. The lubricant is not added at this stage.", kk: "Сыртқы фазамен араластыру басталды. Майлаушы бұл сатыда қосылмайды." },
  final_done: { ru: "Смесь перед смазыванием {mass} г. Потери {loss} г. Расчётный RSD {rsd} %.", en: "Blend before lubrication {mass} g. Loss {loss} g. Calculated RSD {rsd} %.", kk: "Майлау алдындағы қоспа {mass} г. Шығын {loss} г. Есептік RSD {rsd} %." },
  final_missing: { ru: "В смеситель нужны гранулы и компоненты внешней фазы, но не стеарат магния.", en: "The mixer needs the granules and the external-phase components, but not magnesium stearate.", kk: "Араластырғышқа түйіршік және сыртқы фаза құрамдастары керек, магний стеараты емес." },
  lube_started: { ru: "Короткое смешивание со смазывающим запущено.", en: "The short lubrication mix has started.", kk: "Майлаушымен қысқа араластыру басталды." },
  lube_done: { ru: "Прессуемая масса {mass} г. Потери {loss} г. Расчётный RSD {rsd} %.", en: "Compression blend {mass} g. Loss {loss} g. Calculated RSD {rsd} %.", kk: "Престелетін масса {mass} г. Шығын {loss} г. Есептік RSD {rsd} %." },
  lube_long: { ru: "Смазывающее смешивали {minutes} мин. Для учебной модели это избыточно: твёрдость, распадаемость и растворение будут хуже. Масса {mass} г.", en: "The lubricant was mixed for {minutes} min. In this teaching model that is too long: hardness, disintegration and dissolution will be worse. Mass {mass} g.", kk: "Майлаушы {minutes} мин араластырылды. Оқу моделі үшін бұл ұзақ: беріктік, ыдырау және еру нашарлайды. Масса {mass} г." },
  lube_short: { ru: "Для распределения стеарата магния задайте не меньше 1 минуты. Сейчас {minutes} мин.", en: "Set at least 1 minute to distribute magnesium stearate. It is now {minutes} min.", kk: "Магний стеаратын тарату үшін кемінде 1 минут беріңіз. Қазір {minutes} мин." },
  lube_missing: { ru: "В смесителе должны быть готовая смесь и навеска стеарата магния.", en: "The mixer must hold the finished blend and the magnesium stearate portion.", kk: "Араластырғышта дайын қоспа және магний стеаратының өлшендісі болуы керек." },
  lube_extra: { ru: "В чаше есть лишний материал. Оставьте только смесь и смазывающее.", en: "There is extra material in the bowl. Leave only the blend and the lubricant.", kk: "Ыдыста артық материал бар. Тек қоспа мен майлаушыны қалдырыңыз." },
  mixer_range: { ru: "Учебный смеситель: 0,5–40 мин и 10–80 об/мин.", en: "Teaching mixer: 0.5–40 min and 10–80 rpm.", kk: "Оқу араластырғышы: 0,5–40 мин және 10–80 айн/мин." },
  granulator_range: { ru: "Учебный гранулятор: 1–20 мин и 50–400 об/мин мешалки.", en: "Teaching granulator: 1–20 min and impeller 50–400 rpm.", kk: "Оқу түйіршіктегіші: 1–20 мин және араластырғыш 50–400 айн/мин." },
  param_set: { ru: "Параметр обновлён.", en: "Parameter updated.", kk: "Параметр жаңартылды." },
  press_setup_ok: { ru: "Настройка пресса подтверждена. Параметры относятся к выбранному типу: {kind}.", en: "Press setup is confirmed. The parameters belong to the selected type: {kind}.", kk: "Пресс баптауы расталды. Параметрлер таңдалған түрге жатады: {kind}." },
  press_force_range: { ru: "Учебное усилие прессования 5–25 кН. Вне диапазона пуск блокируется.", en: "Teaching compression force is 5–25 kN. Outside that range the start is blocked.", kk: "Оқу престеу күші 5–25 кН. Ауқымнан тыс іске қосу бұғатталады." },
  press_speed_range: { ru: "Скорость вне учебного диапазона выбранного пресса.", en: "Speed is outside the teaching range of the selected press.", kk: "Жылдамдық таңдалған престің оқу ауқымынан тыс." },
  press_fill_range: { ru: "Глубина заполнения 4–14 мм, диаметр пуансона 8, 10 или 12 мм.", en: "Fill depth is 4–14 mm and punch diameter is 8, 10 or 12 mm.", kk: "Толтыру тереңдігі 4–14 мм, пуансон диаметрі 8, 10 немесе 12 мм." },
  press_precomp_range: { ru: "Предварительное усилие роторного пресса 0,5–5 кН и ниже основного. У однопуансонного пресса этого параметра нет.", en: "Rotary precompression is 0.5–5 kN and below the main force. A single-punch press does not have this parameter.", kk: "Роторлы престің алдын ала күші 0,5–5 кН және негізгі күштен төмен. Бір пуансонды престе бұл параметр жоқ." },
  press_setup_required: { ru: "Сначала подтвердите настройку пресса. Пуск без проверки параметров заблокирован.", en: "Confirm the press setup first. Starting without checking the parameters is blocked.", kk: "Алдымен пресс баптауын растаңыз. Параметрлерді тексермей іске қосу бұғатталған." },
  press_missing: { ru: "В бункере нет прессуемой массы. Сначала завершите смешивание со смазывающим и перенесите массу.", en: "There is no compression blend in the hopper. Finish lubrication and move the blend first.", kk: "Бункерде престелетін масса жоқ. Алдымен майлауды аяқтап, массаны көшіріңіз." },
  press_moisture: { ru: "Расчётная влажность {moisture} % вне окна для прессования. Повторите сушку; время предыдущей сушки влажность не заменяет.", en: "Calculated moisture {moisture} % is outside the compression window. Repeat drying; the earlier drying time does not replace moisture.", kk: "Есептік ылғалдылық {moisture} % престеу терезесінен тыс. Кептіруді қайталаңыз; алдыңғы уақыт ылғалдылықты алмастырмайды." },
  press_not_enough: { ru: "Массы {mass} г не хватает даже на одну таблетку заданной массы.", en: "{mass} g is not enough for even one tablet of the set mass.", kk: "{mass} г белгіленген массадағы бір таблеткаға да жетпейді." },
  press_started: { ru: "Прессование запущено. Число таблеток ограничено массой смеси, массой таблетки и учебными потерями 2 %.", en: "Compression has started. Tablet count is limited by blend mass, tablet mass and the 2 % teaching loss.", kk: "Престеу басталды. Таблетка саны қоспа массасымен, таблетка массасымен және 2 % оқу шығынымен шектеледі." },
  press_done: { ru: "Получено {count} таблеток, {mass} г. Потери и пыль {loss} г, остаток в бункере {remainder} г. Средняя масса модели {mean} мг.", en: "Produced {count} tablets, {mass} g. Loss and dust {loss} g, hopper remainder {remainder} g. Model mean mass {mean} mg.", kk: "{count} таблетка алынды, {mass} г. Шығын мен шаң {loss} г, бункердегі қалдық {remainder} г. Модельдің орташа массасы {mean} мг." },
  press_partial: { ru: "Пресс остановлен. Уже получено {count} таблеток, остаток смеси {remainder} г сохранён.", en: "The press was stopped. {count} tablets were produced and the remaining blend {remainder} g was kept.", kk: "Пресс тоқтатылды. {count} таблетка алынды, қалған қоспа {remainder} г сақталды." },
  dedust_started: { ru: "Обеспыливание запущено. Твёрдость таблеток эта операция не повышает.", en: "Dedusting has started. This operation does not increase tablet hardness.", kk: "Шаңсыздандыру басталды. Бұл операция таблетка беріктігін арттырмайды." },
  dedust_done: { ru: "После обеспыливания {mass} г, снятая пыль {dust} г. Твёрдость осталась {hardness} Н.", en: "After dedusting {mass} g, dust removed {dust} g. Hardness stayed {hardness} N.", kk: "Шаңсыздандырудан кейін {mass} г, алынған шаң {dust} г. Беріктік {hardness} Н болып қалды." },
  dedust_missing: { ru: "Перенесите ещё не обеспыленные таблетки в обеспыливатель.", en: "Move tablets that have not yet been dedusted into the deduster.", kk: "Әлі шаңсызданбаған таблеткаларды шаңсыздандырғышқа көшіріңіз." },
  qc_need_tablets: { ru: "Перенесите таблетки этой серии в зону контроля.", en: "Move this series’ tablets to the quality-control area.", kk: "Осы серияның таблеткаларын бақылау аймағына көшіріңіз." },
  qc_select_lot: { ru: "В зоне несколько партий таблеток. Выберите ту, которую испытываете.", en: "Several tablet lots are in the area. Select the one being tested.", kk: "Аймақта бірнеше таблетка партиясы бар. Сыналатынын таңдаңыз." },
  qc_need_sample: { ru: "Для выборки нужно {need} таблеток, доступно {have}.", en: "The sample needs {need} tablets, but {have} are available.", kk: "Іріктемеге {need} таблетка керек, қолжетімдісі {have}." },
  qc_sample: { ru: "На испытание «{method}» израсходовано {count} таблеток, {mass} г. Они вычтены из серии.", en: "{count} tablets, {mass} g, were used for “{method}” and removed from the series.", kk: "«{method}» сынағына {count} таблетка, {mass} г жұмсалды. Олар сериядан шегерілді." },
  qc_content_na: { ru: "Однородность дозированных единиц в этом профиле не применяется: доза 500 мг и доля действующего вещества около {fraction} %. Для реального препарата решение зависит от монографии.", en: "Uniformity of dosage units is not applied in this profile: the dose is 500 mg and the active fraction is about {fraction} %. For a real product the decision depends on the monograph.", kk: "Доза біркелкілігі бұл профильде қолданылмайды: доза 500 мг, әсер етуші зат үлесі шамамен {fraction} %. Нақты препарат үшін шешім монографияға байланысты." },
  qc_appearance_pass: { ru: "Описание соответствует учебному профилю: без моделируемого скола.", en: "Appearance meets the teaching profile: no modelled capping.", kk: "Сипаттама оқу профиліне сәйкес: модельденген жарықшақ жоқ." },
  qc_appearance_fail: { ru: "Модель показывает скол или слишком мягкую таблетку. Описание не соответствует учебному профилю.", en: "The model shows capping or a tablet that is too soft. Appearance does not meet the teaching profile.", kk: "Модель жарықшақты немесе тым жұмсақ таблетканы көрсетеді. Сипаттама оқу профиліне сәйкес емес." },
  qc_mass_pass: { ru: "Средняя масса {value} мг в пределах ±5 % от {target} мг. Учебный профиль PAR-500-EDU.", en: "Mean mass {value} mg is within ±5 % of {target} mg. Teaching profile PAR-500-EDU.", kk: "Орташа масса {value} мг, {target} мг-нан ±5 % ішінде. Оқу профилі PAR-500-EDU." },
  qc_mass_fail: { ru: "Средняя масса {value} мг вне ±5 % от {target} мг.", en: "Mean mass {value} mg is outside ±5 % of {target} mg.", kk: "Орташа масса {value} мг, {target} мг-нан ±5 % тыс." },
  qc_uniform_pass: { ru: "За пределами ±5 % — {outside} таблеток из 20, за ±10 % — {outer}. Учебное правило профиля выполнено.", en: "{outside} of 20 tablets are outside ±5 %, and {outer} are outside ±10 %. The profile rule is met.", kk: "±5 % тыс 20 таблетканың {outside}-і, ±10 % тыс {outer}. Профиль ережесі орындалды." },
  qc_uniform_fail: { ru: "За пределами ±5 % — {outside} таблеток, за ±10 % — {outer}. Учебное правило не выполнено.", en: "{outside} tablets are outside ±5 % and {outer} are outside ±10 %. The teaching rule is not met.", kk: "±5 % тыс {outside} таблетка, ±10 % тыс {outer}. Оқу ережесі орындалмады." },
  qc_size_pass: { ru: "Толщина {thickness} мм при учебной цели {reference} мм, диаметр {diameter} мм.", en: "Thickness {thickness} mm against the teaching target {reference} mm, diameter {diameter} mm.", kk: "Қалыңдық {thickness} мм, оқу мақсаты {reference} мм, диаметр {diameter} мм." },
  qc_size_fail: { ru: "Толщина {thickness} мм отличается от учебной цели {reference} мм сильнее, чем на 5 %, или диаметр {diameter} мм вне допуска.", en: "Thickness {thickness} mm differs from the teaching target {reference} mm by more than 5 %, or diameter {diameter} mm is out of tolerance.", kk: "Қалыңдық {thickness} мм оқу мақсаты {reference} мм-ден 5 %-дан артық ауытқиды немесе диаметр {diameter} мм рұқсаттан тыс." },
  qc_hardness_pass: { ru: "Прочность {value} Н внутри учебного окна 60–140 Н.", en: "Crushing strength {value} N is inside the teaching window 60–140 N.", kk: "Беріктік {value} Н, 60–140 Н оқу терезесінің ішінде." },
  qc_hardness_fail: { ru: "Прочность {value} Н вне учебного окна 60–140 Н.", en: "Crushing strength {value} N is outside the teaching window 60–140 N.", kk: "Беріктік {value} Н, 60–140 Н оқу терезесінен тыс." },
  qc_friability_pass: { ru: "Истираемость {value} % не выше учебного предела 1,0 %.", en: "Friability {value} % is not above the teaching limit of 1.0 %.", kk: "Үйкеліп тозу {value} %, 1,0 % оқу шегінен жоғары емес." },
  qc_friability_fail: { ru: "Истираемость {value} % выше учебного предела 1,0 %.", en: "Friability {value} % is above the teaching limit of 1.0 %.", kk: "Үйкеліп тозу {value} %, 1,0 % оқу шегінен жоғары." },
  qc_disint_pass: { ru: "Распадаемость {value} мин не выше учебного предела 15 мин для этой модели непокрытых таблеток.", en: "Disintegration {value} min is not above the 15 min teaching limit for this uncoated-tablet model.", kk: "Ыдырағыштық {value} мин, бұл қапталмаған таблетка моделінің 15 мин оқу шегінен жоғары емес." },
  qc_disint_fail: { ru: "Распадаемость {value} мин выше учебного предела 15 мин.", en: "Disintegration {value} min is above the 15 min teaching limit.", kk: "Ыдырағыштық {value} мин, 15 мин оқу шегінен жоғары." },
  qc_dissolution_pass: { ru: "За 30 мин высвободилось {value} % при учебном пороге 80 %. Это симуляция, не испытание растворения.", en: "{value} % was released at 30 min against the teaching threshold of 80 %. This is a simulation, not a dissolution test.", kk: "30 минутта {value} % бөлінді, оқу шегі 80 %. Бұл еру сынағы емес, симуляция." },
  qc_dissolution_fail: { ru: "За 30 мин высвободилось {value} %, учебный порог 80 % не достигнут.", en: "{value} % was released at 30 min; the teaching threshold of 80 % was not reached.", kk: "30 минутта {value} % бөлінді, 80 % оқу шегіне жетпеді." },
  qc_assay_pass: { ru: "Расчётное содержание {value} % от заявленных 500 мг, учебное окно 95–105 %.", en: "Calculated content {value} % of the 500 mg claim, teaching window 95–105 %.", kk: "Есептік мөлшер 500 мг декларациядан {value} %, оқу терезесі 95–105 %." },
  qc_assay_fail: { ru: "Расчётное содержание {value} % вне учебного окна 95–105 %.", en: "Calculated content {value} % is outside the teaching window 95–105 %.", kk: "Есептік мөлшер {value} %, 95–105 % оқу терезесінен тыс." },
  pack_done: { ru: "Упаковано {count} таблеток. Учебная маркировка {label}. Это не разрешение на выпуск.", en: "Packed {count} tablets. Teaching label {label}. This is not a release authorisation.", kk: "{count} таблетка қапталды. Оқу таңбасы {label}. Бұл шығаруға рұқсат емес." },
  pack_count: { ru: "Укажите целое число таблеток не больше доступного: {have}.", en: "Enter a whole number of tablets no greater than the available {have}.", kk: "Қолжетімді {have} санынан аспайтын бүтін таблетка санын көрсетіңіз." },
  pack_missing: { ru: "Перенесите таблетки в зону упаковки.", en: "Move the tablets to the packaging area.", kk: "Таблеткаларды қаптау аймағына көшіріңіз." },
  report_incomplete: { ru: "Серию рано закрывать: {reason}.", en: "The series cannot be closed yet: {reason}.", kk: "Серияны жабу ерте: {reason}." },
  report_ready: { ru: "Учебный отчёт серии {seriesId} сформирован. Статус: {status}. Это не сертификат GMP и не выпуск в обращение.", en: "Teaching report for series {seriesId} is ready. Status: {status}. This is not a GMP certificate or a market release.", kk: "{seriesId} сериясының оқу есебі дайын. Күйі: {status}. Бұл GMP сертификаты немесе айналымға шығару емес." },
  gate_no_route: { ru: "Сначала выберите маршрут.", en: "Choose a route first.", kk: "Алдымен маршрутты таңдаңыз." },
  gate_not_in_route: { ru: "Эта стадия не входит в выбранный маршрут и не нужна для его полупродукта.", en: "This stage is not part of the selected route and is not needed for its intermediate.", kk: "Бұл саты таңдалған маршрутқа кірмейді және оның жартылай өніміне керек емес." },
  gate_need_intake: { ru: "Сначала идентифицируйте и отдельно допустите всё сырьё.", en: "Identify and separately release every material first.", kk: "Алдымен барлық шикізатты сәйкестендіріп, бөлек жіберіңіз." },
  gate_need_weighing: { ru: "Сначала взвесьте все позиции рецептуры в допуске.", en: "Weigh every recipe line within tolerance first.", kk: "Алдымен рецептураның барлық позициясын рұқсат ішінде өлшеңіз." },
  gate_need_premix: { ru: "Сначала смешайте компоненты без смазывающего.", en: "Mix the components without the lubricant first.", kk: "Алдымен құрамдастарды майлаушысыз араластырыңыз." },
  gate_need_liquid: { ru: "Сначала приготовьте гранулирующую жидкость.", en: "Prepare the granulating liquid first.", kk: "Алдымен түйіршіктеу сұйықтығын дайындаңыз." },
  gate_need_granulation: { ru: "Сначала получите влажные гранулы.", en: "Produce the wet granules first.", kk: "Алдымен ылғал түйіршік алыңыз." },
  gate_need_screen: { ru: "Выполните влажное просеивание или явно пропустите его.", en: "Run wet screening or explicitly skip it.", kk: "Ылғалды елеуді орындаңыз немесе оны анық өткізіңіз." },
  gate_need_drying: { ru: "Сначала высушите гранулы. Для прямого прессования эта стадия не используется.", en: "Dry the granules first. Direct compression does not use this stage.", kk: "Алдымен түйіршікті кептіріңіз. Тікелей престеу бұл сатыны қолданбайды." },
  gate_need_moisture: { ru: "Зафиксируйте расчётную влажность после сушки.", en: "Record the calculated moisture after drying.", kk: "Кептіруден кейін есептік ылғалдылықты тіркеңіз." },
  gate_need_sizing: { ru: "Откалибруйте гранулы или явно пропустите калибровку.", en: "Size the granules or explicitly skip sizing.", kk: "Түйіршікті калибрлеңіз немесе калибрлеуді анық өткізіңіз." },
  gate_need_final: { ru: "Сначала смешайте гранулы с внешней фазой.", en: "Blend the granules with the external phase first.", kk: "Алдымен түйіршікті сыртқы фазамен араластырыңыз." },
  gate_need_lubrication: { ru: "Сначала добавьте стеарат магния и завершите короткое смешивание.", en: "Add magnesium stearate and finish the short mix first.", kk: "Алдымен магний стеаратын қосып, қысқа араластыруды аяқтаңыз." },
  gate_moisture: { ru: "Влажность гранул вне учебного окна. Прессование заблокировано, пока сушка не даст расчётную влажность 0,8–2,5 %.", en: "Granule moisture is outside the teaching window. Compression stays blocked until drying gives a calculated moisture of 0.8–2.5 %.", kk: "Түйіршік ылғалдылығы оқу терезесінен тыс. Кептіру 0,8–2,5 % есептік ылғалдылық бермейінше престеу бұғатталған." },
  gate_need_compression: { ru: "Сначала получите таблетки на прессе.", en: "Produce tablets on the press first.", kk: "Алдымен престе таблетка алыңыз." },
  gate_need_place: { ru: "Перенесите нужный материал в зону операции. Это можно сделать на схеме или кнопкой загрузки.", en: "Move the required material into the operation area. Use the floor plan or the load button.", kk: "Қажетті материалды операция аймағына көшіріңіз. Схеманы немесе жүктеу батырмасын пайдаланыңыз." },
  gate_optional_open: { ru: "Необязательная стадия ещё не выполнена и не пропущена.", en: "An optional stage is neither completed nor skipped.", kk: "Міндетті емес саты орындалмаған және өткізілмеген." },
  gate_need_qc: { ru: "Не записаны все учебные испытания, включая объяснение, почему однородность дозирования здесь не применяется.", en: "Not every teaching test is recorded, including the explanation of why dosage-unit uniformity is not applied here.", kk: "Доза біркелкілігі неге қолданылмайтынын түсіндіруді қоса, барлық оқу сынағы жазылмаған." },
  gate_running: { ru: "Операция выполняется. Анимация ускорена, в журнале остаётся заданное технологическое время.", en: "The operation is running. The animation is accelerated; the journal keeps the set process time.", kk: "Операция орындалуда. Анимация жеделдетілген; журналда берілген технологиялық уақыт қалады." },
  gate_done: { ru: "Стадия завершена.", en: "Stage completed.", kk: "Саты аяқталды." },
  gate_warning: { ru: "Стадия завершена с предупреждением. Откройте журнал и properties результата.", en: "The stage finished with a warning. Open the journal and the result.", kk: "Саты ескертумен аяқталды. Журналды және нәтижені ашыңыз." },
  gate_skipped: { ru: "Стадия осознанно пропущена.", en: "The stage was deliberately skipped.", kk: "Саты әдейі өткізілді." },
  gate_ready: { ru: "Можно запускать операцию.", en: "The operation can be started.", kk: "Операцияны іске қосуға болады." },
  hint_route: { ru: "Выберите прямое прессование или влажную грануляцию. Сушка обязательна только для второго маршрута.", en: "Choose direct compression or wet granulation. Drying is required only for the second route.", kk: "Тікелей престеуді немесе ылғалды түйіршіктеуді таңдаңыз. Кептіру тек екінші маршрутқа міндетті." },
  hint_running: { ru: "Идёт операция «{stage}». Результат появится после её завершения.", en: "“{stage}” is running. The result appears when it finishes.", kk: "«{stage}» операциясы жүріп жатыр. Нәтиже ол аяқталғанда шығады." },
  hint_place: { ru: "Перенесите материалы для стадии «{stage}» или нажмите «Загрузить в зону».", en: "Move the materials for “{stage}” or press “Load into the station”.", kk: "«{stage}» сатысының материалдарын көшіріңіз немесе «Аймаққа жүктеу» батырмасын басыңыз." },
  hint_close: { ru: "Основные стадии пройдены. Завершите контроль, упаковку и сформируйте отчёт.", en: "The main stages are done. Finish testing, packaging and the report.", kk: "Негізгі сатылар өтті. Бақылауды, қаптауды және есепті аяқтаңыз." },
  hint_report: { ru: "Отчёт серии уже сформирован. Его можно просмотреть внизу; процесс закрыт.", en: "The series report is ready. Read it below; the process is closed.", kk: "Серия есебі дайын. Оны төменде оқуға болады; процесс жабылған." },
  hint_intake: { ru: "Откройте паспорт каждого вещества, подтвердите идентификацию и отдельно допустите его в работу.", en: "Open each material passport, confirm identity and release it in a separate step.", kk: "Әр заттың паспортын ашып, сәйкестендіруді растаңыз және оны жұмысқа бөлек жіберіңіз." },
  hint_weighing: { ru: "Взвесьте каждую позицию: тара, обнуление, нетто в допуске.", en: "Weigh each line: tare, zero, and a net mass inside tolerance.", kk: "Әр позицияны өлшеңіз: тара, нөлдеу, рұқсат ішіндегі нетто." },
  hint_sieving: { ru: "Просеивание необязательно. Выполните его или пропустите с записью в журнале.", en: "Sieving is optional. Run it or skip it with a journal entry.", kk: "Елеу міндетті емес. Оны орындаңыз немесе журналға жазып өткізіңіз." },
  hint_premix: { ru: "Загрузите внутреннюю фазу без стеарата магния и запустите смеситель.", en: "Load the inner phase without magnesium stearate and start the mixer.", kk: "Ішкі фазаны магний стеаратынсыз жүктеп, араластырғышты іске қосыңыз." },
  hint_granulating_liquid: { ru: "Смешайте повидон и воду. Объём считается по плотности, а не равным массе.", en: "Mix povidone and water. Volume is calculated from density, not taken as equal to mass.", kk: "Повидон мен суды араластырыңыз. Көлем массаға тең емес, тығыздықпен есептеледі." },
  hint_granulation: { ru: "Загрузите смесь и жидкость. Результат зависит от их соотношения и времени.", en: "Load the blend and the liquid. The result depends on their ratio and the time.", kk: "Қоспа мен сұйықтықты жүктеңіз. Нәтиже олардың арақатынасы мен уақытқа байланысты." },
  hint_wet_screening: { ru: "Влажное просеивание можно выполнить или пропустить.", en: "Wet screening can be run or skipped.", kk: "Ылғалды елеуді орындауға немесе өткізуге болады." },
  hint_drying: { ru: "Сушите, пока расчётная влажность не войдёт в 0,8–2,5 %. Время само по себе влажность не доказывает.", en: "Dry until the calculated moisture is within 0.8–2.5 %. Time alone does not prove the moisture.", kk: "Есептік ылғалдылық 0,8–2,5 % ішіне кіргенше кептіріңіз. Уақыттың өзі ылғалдылықты дәлелдемейді." },
  hint_moisture_check: { ru: "Запишите расчётную влажность. Это не показание отдельного прибора.", en: "Record the calculated moisture. It is not a separate instrument reading.", kk: "Есептік ылғалдылықты жазыңыз. Бұл бөлек аспаптың көрсеткіші емес." },
  hint_sizing: { ru: "Калибровка необязательна. Мелочь можно вернуть в смесь или оставить в остатке.", en: "Sizing is optional. Fines can return to the blend or stay as a remainder.", kk: "Калибрлеу міндетті емес. Ұсақ фракцияны қоспаға қайтаруға немесе қалдықта қалдыруға болады." },
  hint_final_blend: { ru: "Смешайте гранулы с внешней фазой. Стеарат магния пока не добавляйте.", en: "Blend the granules with the external phase. Do not add magnesium stearate yet.", kk: "Түйіршікті сыртқы фазамен араластырыңыз. Магний стеаратын әлі қоспаңыз." },
  hint_lubrication: { ru: "Добавьте стеарат магния последним и смешивайте 1–5 минут.", en: "Add magnesium stearate last and mix for 1–5 minutes.", kk: "Магний стеаратын соңында қосып, 1–5 минут араластырыңыз." },
  hint_compression: { ru: "Подтвердите настройку выбранного пресса и только потом запускайте цикл.", en: "Confirm the selected press setup and only then start the cycle.", kk: "Таңдалған престің баптауын растап, содан кейін ғана циклді іске қосыңыз." },
  hint_dedusting: { ru: "Обеспыливание необязательно и не повышает твёрдость.", en: "Dedusting is optional and does not increase hardness.", kk: "Шаңсыздандыру міндетті емес және беріктікті арттырмайды." },
  hint_qc: { ru: "Проведите учебные испытания. Каждый результат подписан как симуляция.", en: "Run the teaching tests. Every result is marked as a simulation.", kk: "Оқу сынақтарын өткізіңіз. Әр нәтиже симуляция деп белгіленген." },
  hint_packaging: { ru: "Упакуйте таблетки и получите учебную маркировку без регистрационного номера.", en: "Pack the tablets and get a teaching label without a marketing-authorisation number.", kk: "Таблеткаларды қаптап, тіркеу нөмірінсіз оқу таңбасын алыңыз." },
  complete: { ru: "учебная серия без критических отклонений модели", en: "teaching series without critical model deviations", kk: "модельдің сыни ауытқуынсыз оқу сериясы" },
  complete_with_deviations: { ru: "учебная серия с отклонениями модели", en: "teaching series with model deviations", kk: "модель ауытқулары бар оқу сериясы" },
  single_punch: { ru: "однопуансонный пресс", en: "single-punch press", kk: "бір пуансонды пресс" },
  rotary: { ru: "роторный пресс", en: "rotary press", kk: "роторлы пресс" },
  bottle: { ru: "учебный флакон", en: "teaching bottle", kk: "оқу құтысы" },
  blister: { ru: "учебный блистер", en: "teaching blister", kk: "оқу блистері" },
  lab: { ru: "лабораторные, шаг 0,01 г", en: "laboratory, 0.01 g increment", kk: "зертханалық, қадам 0,01 г" },
  analytical: { ru: "аналитические, шаг 0,001 г", en: "analytical, 0.001 g increment", kk: "аналитикалық, қадам 0,001 г" },
  identified: { ru: "идентифицировано", en: "identified", kk: "сәйкестендірілді" },
  quarantine: { ru: "карантин", en: "quarantine", kk: "карантин" },
  released: { ru: "допущено", en: "released", kk: "жіберілді" },
};

export function token(locale: Locale, value: string) {
  if (stageLabel[value as StageId]) {
    return tx(locale, stageLabel[value as StageId]);
  }
  if (locationLabel[value as LocationId]) {
    return tx(locale, locationLabel[value as LocationId]);
  }
  if (routeLabel[value]) {
    return tx(locale, routeLabel[value]);
  }
  if (roleLabel[value]) {
    return tx(locale, roleLabel[value]);
  }
  if (methodLabel[value]) {
    return tx(locale, methodLabel[value]);
  }
  if (messages[value]) {
    return tx(locale, messages[value]);
  }
  const material = materials[value as MaterialId];
  if (material) {
    return material.name[locale];
  }
  return value;
}

export function say(locale: Locale, code: string, params: Params = {}) {
  const template = messages[code]?.[locale] ?? code;
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = params[key];
    if (value === undefined) {
      return "";
    }
    const text = String(value);
    if (["stage", "location", "route", "materialId", "material", "lineId", "role", "method", "kind", "state", "reason", "status", "mode"].includes(key)) {
      return token(locale, text);
    }
    return text;
  });
}

export const theory: Record<StageId, L> = {
  intake: { ru: "Цель — не перепутать вещество и не пустить в работу карантин. Идентификация и допуск разделены: паспорт сверяют, затем отдельно разрешают использование.", en: "The aim is to avoid mix-ups and to keep quarantined material out of the batch. Identity and release are separate: the passport is checked, then use is allowed.", kk: "Мақсат — затты шатастырмау және карантинді жұмысқа жібермеу. Сәйкестендіру мен рұқсат бөлек." },
  weighing: { ru: "Масса ведётся в граммах, мелкие навески показываются и в миллиграммах. Брутто = тара + нетто. Подтверждение возможно только внутри допуска сценария.", en: "Mass is kept in grams, and small portions are also shown in milligrams. Gross = tare + net. Confirmation is possible only inside the scenario tolerance.", kk: "Масса граммен жүргізіледі, шағын өлшенді миллиграммен де көрсетіледі. Брутто = тара + нетто." },
  sieving: { ru: "Просеивание отделяет сход. Для марок прямого прессования его можно пропустить. Доли фракций даёт учебная функция размера частиц, это не ситовой анализ.", en: "Sieving separates the retained fraction. Direct-compression grades may skip it. Fraction sizes come from a teaching particle-size function, not from a sieve analysis.", kk: "Елеу қалдық фракцияны бөледі. Тікелей престеу маркаларын өткізуге болады. Бұл елек талдауы емес." },
  premix: { ru: "Смешивают все компоненты, кроме стеарата магния. Расчётный RSD падает с временем и скоростью, но это не измеренная однородность.", en: "Everything except magnesium stearate is mixed. The calculated RSD falls with time and speed, but it is not a measured uniformity.", kk: "Магний стеаратынан басқа құрамдастар араластырылады. Есептік RSD өлшенген біркелкілік емес." },
  granulating_liquid: { ru: "Повидон растворяют в воде. Плотность учебной модели ρ = 0,997 + 0,25·w. Объём = масса / плотность.", en: "Povidone is dissolved in water. The teaching density is ρ = 0.997 + 0.25·w. Volume = mass / density.", kk: "Повидон суда ерітіледі. Оқу тығыздығы ρ = 0,997 + 0,25·w. Көлем = масса / тығыздық." },
  granulation: { ru: "Жидкость связывает порошок. Слишком мало жидкости даёт слабые гранулы и много мелочи, избыток удлиняет сушку. Показатель качества учебный.", en: "The liquid binds the powder. Too little liquid gives weak granules and more fines; too much prolongs drying. The quality index is educational.", kk: "Сұйықтық ұнтақты байланыстырады. Сұйықтық аз болса, түйіршік әлсіз, көп болса, кептіру ұзарады." },
  wet_screening: { ru: "Крупные влажные комки можно отделить. Операция необязательна: её пропускают, если технология серии этого не требует.", en: "Large wet lumps can be separated. The operation is optional when the series technology does not require it.", kk: "Ірі ылғал кесектерді бөлуге болады. Серия технологиясы талап етпесе, операция міндетті емес." },
  drying: { ru: "Удаляется вода гранулирующей жидкости, повидон остаётся. Влажность считается по температуре и времени и может остаться высокой при короткой сушке.", en: "Water from the granulating liquid is removed; povidone remains. Moisture is calculated from temperature and time and can stay high after a short cycle.", kk: "Түйіршіктеу сұйықтығының суы шығады, повидон қалады. Қысқа кептіруде ылғалдылық жоғары қалуы мүмкін." },
  moisture_check: { ru: "Записывают расчётную потерю при сушке. Отдельного влагомера в модели нет, и достижение таймера влажность не доказывает.", en: "The calculated loss on drying is recorded. The model has no separate moisture analyser, and the timer does not prove the moisture.", kk: "Кептірудегі есептік шығын жазылады. Модельде бөлек ылғал өлшегіш жоқ." },
  sizing: { ru: "Сухие гранулы калибруют. Мелочь зависит от качества гранулирования. Её можно вернуть в смесь; масса при этом не удваивается.", en: "Dry granules are sized. Fines depend on granulation quality. They can return to the blend without doubling the mass.", kk: "Құрғақ түйіршік калибрленеді. Ұсақ фракция түйіршіктеу сапасына байланысты және массаны екі еселемейді." },
  final_blend: { ru: "После сушки добавляют внешнюю фазу. Смазывающее всё ещё ждут следующей короткой операции.", en: "The external phase is added after drying. The lubricant still waits for the next short operation.", kk: "Кептіруден кейін сыртқы фаза қосылады. Майлаушы келесі қысқа операцияны күтеді." },
  lubrication: { ru: "Стеарат магния снижает трение, но при долгом смешивании покрывает частицы и замедляет распадаемость и растворение.", en: "Magnesium stearate reduces friction, but a long mix coats particles and slows disintegration and dissolution.", kk: "Магний стеараты үйкелісті азайтады, бірақ ұзақ араластыру бөлшектерді қаптап, ыдырау мен еруді баяулатады." },
  compression: { ru: "Цикл пресса: заполнение матрицы, прессование, выталкивание. Число таблеток = целая часть доступной массы после 2 % потерь, делённой на массу одной таблетки.", en: "The press cycle is fill, compress, eject. Tablet count is the integer part of the mass left after a 2 % loss, divided by one tablet mass.", kk: "Пресс циклі: матрицаны толтыру, престеу, шығару. Таблетка саны 2 % шығыннан кейінгі массаның бір таблетка массасына бүтін бөлігі." },
  dedusting: { ru: "Снимается поверхностная пыль и немного уменьшается масса. Прочность, распадаемость и количественное содержание модель не улучшает.", en: "Surface dust is removed and the mass falls slightly. The model does not improve strength, disintegration or assay.", kk: "Беткі шаң алынып, масса сәл азаяды. Модель беріктікті, ыдырауды және мөлшерді жақсартпайды." },
  qc: { ru: "Испытания относятся к выбранной партии таблеток. Пределы заданы учебным профилем PAR-500-EDU. Номер фармакопейной статьи зависит от издания и здесь не подставляется.", en: "Tests apply to the selected tablet lot. Limits belong to teaching profile PAR-500-EDU. A pharmacopoeial chapter number depends on the edition and is not inserted here.", kk: "Сынақтар таңдалған таблетка партиясына қатысты. Шектеулер PAR-500-EDU оқу профилінде. Фармакопея бабының нөмірі басылымға байланысты." },
  packaging: { ru: "Учебная упаковка получает внутреннюю маркировку серии. Регистрационных удостоверений и разрешения на выпуск модель не создаёт.", en: "Teaching packaging receives an internal series label. The model creates neither a marketing authorisation nor a release permission.", kk: "Оқу қаптамасы серияның ішкі таңбасын алады. Модель тіркеу куәлігін немесе шығару рұқсатын жасамайды." },
};
