import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { equipmentById } from "@/data/equipmentCatalog";
import { exampleRecipes } from "@/data/recipes";
import { operationById } from "@/data/operations";
import { defaultEquipment, defaultRecipe, idleMachine, seedLots, seedTools, type ToolPlace } from "@/data/seed";
import { massBalance, weighedLineCoverage } from "@/lib/balance";
import { capsuleYield, encapsulateBlend } from "@/lib/capsuleFill";
import { stepDrying } from "@/lib/drying";
import { canStartOperation, explainBlock, wallSecondsForProcess } from "@/lib/processGraph";
import {
  apiPercent,
  canMerge,
  lotMass,
  mergeLots,
  shellMass,
  solidsMass,
  solventMass,
  splitLot,
  weightedDensity,
  weightedMoisture,
} from "@/lib/materials";
import { placeWithoutOverlap } from "@/lib/placement";
import { modelQc, qcApplicable } from "@/lib/qcModel";
import { cloneRecipe, scaleRecipe } from "@/lib/recipeMath";
import { zoneSlots } from "@/lib/sceneSlots";
import { roundTo } from "@/lib/formatLab";
import { buildChromatogram, buildFtir, buildUv } from "@/lib/labSignals";
import { localRepository } from "@/lib/storage/localRepository";
import type {
  ActionResult,
  AuditRecord,
  EquipmentCategory,
  GraphicsQuality,
  LotKind,
  LotPlace,
  MachineRuntime,
  MaterialLot,
  Notice,
  OperationId,
  QcMethod,
  QcRun,
  QcStage,
  Recipe,
  RecipeLine,
  RouteId,
  ToolId,
  ZoneId,
} from "@/types/process";

type LabState = {
  route: RouteId;
  zone: ZoneId;
  graphics: GraphicsQuality;
  physicsDebug: boolean;
  recipe: Recipe;
  lots: MaterialLot[];
  selectedLotId: string | null;
  selectedToolId: ToolId | null;
  tools: ToolPlace[];
  selectedEquipmentId: string;
  equipmentChoice: Record<EquipmentCategory, string>;
  machines: Record<string, MachineRuntime>;
  completed: OperationId[];
  activeOpId: OperationId | null;
  heldId: string | null;
  auditLog: AuditRecord[];
  qcRuns: QcRun[];
  notices: Notice[];
  panel: "process" | "recipe" | "materials" | "equipment" | "log";
  setZone: (zone: ZoneId) => void;
  setPanel: (panel: LabState["panel"]) => void;
  setGraphics: (graphics: GraphicsQuality) => void;
  setPhysicsDebug: (enabled: boolean) => void;
  setRoute: (route: RouteId) => void;
  loadRecipe: (id: string) => void;
  setCapsuleCount: (count: number) => void;
  addLine: (line: RecipeLine) => void;
  removeLine: (id: string) => void;
  updateLine: (id: string, patch: Partial<RecipeLine>) => void;
  selectLot: (id: string | null) => void;
  selectTool: (id: ToolId | null) => void;
  selectEquipment: (id: string) => void;
  chooseEquipment: (category: EquipmentCategory, id: string) => void;
  grab: (id: string) => void;
  grabTool: (id: ToolId) => void;
  moveHeld: (x: number, z: number) => void;
  dropHeld: (place?: LotPlace) => void;
  splitSelected: (grams: number) => ActionResult;
  mergeSelected: (targetId: string) => ActionResult;
  unloadSelected: () => ActionResult;
  setMachineParam: (key: string, value: number) => ActionResult;
  identifyMaterials: () => ActionResult;
  releaseMaterials: () => ActionResult;
  confirmWeigh: () => ActionResult;
  loadOntoEquipment: (lotId: string, equipmentId: string) => ActionResult;
  startOperation: (id: OperationId) => ActionResult;
  pauseActive: () => ActionResult;
  resumeActive: () => ActionResult;
  stopActive: () => ActionResult;
  rejectCapsules: (count: number) => ActionResult;
  runQc: (method: QcMethod, stage: QcStage) => ActionResult;
  dismissNotice: (id: string) => void;
  tick: () => void;
};

let seq = 10;

function nid(prefix: string) {
  seq += 1;
  return `${prefix}-${seq}`;
}

function now() {
  return new Date().toISOString();
}

function notice(kind: Notice["kind"], title: string, detail: string): Notice {
  return { id: nid("n"), kind, title, detail, at: now() };
}

function fail(title: string, detail: string): ActionResult {
  return { ok: false, notice: { kind: "error", title, detail } };
}

function ok(title: string, detail: string, kind: Notice["kind"] = "success"): ActionResult {
  return { ok: true, notice: { kind, title, detail } };
}

function graphCtx(state: Pick<LabState, "route" | "recipe" | "completed" | "lots">) {
  const coverage = weighedLineCoverage(state.recipe, state.lots);
  return {
    route: state.route,
    recipe: state.recipe,
    completed: state.completed,
    weighedLineIds: coverage.weighedLineIds,
    hasReleasedMaterials: state.lots.every((lot) => lot.releaseStatus !== "quarantine"),
  };
}

function patchLot(lots: MaterialLot[], id: string, updater: (lot: MaterialLot) => MaterialLot) {
  return lots.map((lot) => (lot.id === id ? updater(lot) : lot));
}

function machineFor(state: LabState, catalogId: string) {
  return state.machines[catalogId] ?? idleMachine(catalogId);
}

const initialRecipe = defaultRecipe();
const initialAt = "2026-10-25T08:00:00.000Z";

export const useLabStore = create<LabState>()(
  persist(
    (set, get) => {
  const push = (entry: Omit<AuditRecord, "id" | "at">) => {
    const record: AuditRecord = { ...entry, id: nid("log"), at: now() };
    set((state) => ({ auditLog: [record, ...state.auditLog].slice(0, 400) }));
  };

  const applyResult = (result: ActionResult) => {
    set((state) => ({
      notices: [notice(result.notice.kind, result.notice.title, result.notice.detail), ...state.notices].slice(0, 8),
    }));
    return result;
  };

  const completeOp = (id: OperationId, lots: MaterialLot[], extra?: Partial<LabState>) => {
    set((state) => ({
      completed: state.completed.includes(id) ? state.completed : [...state.completed, id],
      lots,
      activeOpId: null,
      ...extra,
    }));
  };

  return {
    route: "direct_blend",
    zone: "warehouse",
    graphics: "high",
    physicsDebug: false,
    recipe: initialRecipe,
    lots: seedLots(initialRecipe, initialAt),
    selectedLotId: "lot-l1",
    selectedToolId: null,
    tools: seedTools(),
    selectedEquipmentId: defaultEquipment.scale,
    equipmentChoice: { ...defaultEquipment },
    machines: {
      [defaultEquipment.scale]: idleMachine(defaultEquipment.scale, { tare: 0 }),
      [defaultEquipment.mixer]: idleMachine(defaultEquipment.mixer, { rpm: 20, minutes: 8 }),
      [defaultEquipment.mill]: idleMachine(defaultEquipment.mill),
      [defaultEquipment.sieve]: idleMachine(defaultEquipment.sieve, { meshMm: 1 }),
      [defaultEquipment.granulator]: idleMachine(defaultEquipment.granulator, { rpm: 250 }),
      [defaultEquipment.dryer]: idleMachine(defaultEquipment.dryer, { temperature: 50, minutes: 10, door: 0 }),
      [defaultEquipment.encapsulator]: idleMachine(defaultEquipment.encapsulator, { speed: 6 }),
      [defaultEquipment.deduster]: idleMachine(defaultEquipment.deduster),
      [defaultEquipment.qc]: idleMachine(defaultEquipment.qc),
    },
    completed: [],
    activeOpId: null,
    heldId: null,
    auditLog: [],
    qcRuns: [],
    notices: [
      {
        id: "n-session",
        kind: "info",
        title: "Учебная сессия",
        detail:
          "Данные этой учебной партии сохраняются в localStorage браузера и восстанавливаются после перезагрузки. Это не облачная база и не GMP-запись.",
        at: initialAt,
      },
    ],
    panel: "process",
    setZone: (zone) => set({ zone }),
    setPanel: (panel) => set({ panel }),
    setGraphics: (graphics) => set({ graphics }),
    setPhysicsDebug: (physicsDebug) => set({ physicsDebug }),
    setRoute: (route) => {
      const recipe = structuredClone(exampleRecipes.find((item) => item.route === route) ?? exampleRecipes[0]);
      set({
        route,
        recipe,
        lots: seedLots(recipe, now()),
        completed: [],
        activeOpId: null,
        selectedLotId: `lot-${recipe.lines[0]?.id ?? "l1"}`,
        tools: seedTools(),
        zone: "warehouse",
      });
      applyResult(
        ok(
          "Маршрут изменён",
          route === "direct_blend"
            ? "Прямое смешивание: сушка гранулята не требуется."
            : "Влажная грануляция: сушка в шкафу обязательна. Эксикатор её не заменяет.",
          "info",
        ),
      );
    },
    loadRecipe: (id) => {
      const recipe = structuredClone(exampleRecipes.find((item) => item.id === id));
      if (!recipe) {
        applyResult(fail("Рецептура", "Учебный пример не найден."));
        return;
      }
      set({
        recipe,
        route: recipe.route,
        lots: seedLots(recipe, now()),
        completed: [],
        selectedLotId: `lot-${recipe.lines[0].id}`,
      });
      applyResult(ok("Загружена модельная рецептура", recipe.modelDisclaimer.ru, "info"));
    },
    setCapsuleCount: (count) => {
      const recipe = cloneRecipe(get().recipe, count);
      set({ recipe, lots: seedLots(recipe, now()), completed: [] });
      applyResult(ok("Размер серии пересчитан", `${recipe.targetCapsules} капсул.`));
    },
    addLine: (line) => {
      set((state) => ({ recipe: { ...state.recipe, lines: [...state.recipe.lines, line] } }));
    },
    removeLine: (id) => {
      set((state) => ({
        recipe: { ...state.recipe, lines: state.recipe.lines.filter((line) => line.id !== id) },
      }));
    },
    updateLine: (id, patch) => {
      set((state) => ({
        recipe: {
          ...state.recipe,
          lines: state.recipe.lines.map((line) => (line.id === id ? { ...line, role: patch.role ?? line.role, ...patch } : line)),
        },
      }));
    },
    selectLot: (selectedLotId) => set({ selectedLotId }),
    selectTool: (selectedToolId) => set({ selectedToolId, heldId: selectedToolId ? `tool:${selectedToolId}` : null }),
    grabTool: (id) => set({ selectedToolId: id, heldId: `tool:${id}` }),
    selectEquipment: (selectedEquipmentId) => set({ selectedEquipmentId }),
    chooseEquipment: (category, id) => {
      const model = equipmentById(id);
      if (!model || model.category !== category) {
        applyResult(fail("Оборудование", "Модель не относится к этой категории."));
        return;
      }
      set((state) => ({
        equipmentChoice: { ...state.equipmentChoice, [category]: id },
        selectedEquipmentId: id,
        machines: {
          ...state.machines,
          [id]: state.machines[id] ?? idleMachine(id, state.machines[state.equipmentChoice[category]]?.params),
        },
      }));
      applyResult(ok("Выбран аппарат", `${model.modelName} (${model.specStatus})`, "info"));
    },
    grab: (id) => set({ heldId: id, selectedLotId: id, selectedToolId: null }),
    moveHeld: (x, z) => {
      const state = get();
      const id = state.heldId;
      if (!id) {
        return;
      }
      if (id.startsWith("tool:")) {
        const toolId = id.slice(5) as ToolId;
        const blockers = tableBlockers(state, id);
        const next = placeWithoutOverlap(x, z, 0.1, blockers);
        set((current) => ({
          tools: current.tools.map((tool) =>
            tool.id === toolId ? { ...tool, zone: current.zone, x: next.x, z: next.z } : tool,
          ),
        }));
        return;
      }
      const lot = state.lots.find((item) => item.id === id);
      if (!lot || lot.place.kind === "equipment") {
        return;
      }
      const blockers = tableBlockers(state, id);
      const next = placeWithoutOverlap(x, z, 0.16, blockers);
      set((current) => ({
        lots: patchLot(current.lots, id, (item) => ({
          ...item,
          place: { kind: "table", zone: current.zone, x: next.x, z: next.z },
        })),
      }));
    },
    dropHeld: (place) => {
      const id = get().heldId;
      if (!id) {
        return;
      }
      const state = get();
      if (id.startsWith("tool:")) {
        const toolId = id.slice(5) as ToolId;
        if (place?.kind === "table") {
          const nearby = state.lots.find(
            (lot) =>
              lot.place.kind === "table" &&
              lot.place.zone === state.zone &&
              Math.hypot(lot.place.x - place.x, lot.place.z - place.z) < 0.28,
          );
          if (nearby && (toolId === "spatula" || toolId === "scoop")) {
            if (nearby.kind === "capsules" || nearby.kind === "rejected" || nearby.kind === "binder_solution") {
              set({ heldId: null, selectedToolId: toolId });
              applyResult(fail("Инструмент", "Шпатель и совок переносят сыпучий порошок, не капсулы и не раствор."));
              return;
            }
            set({ heldId: null, selectedLotId: nearby.id, selectedToolId: toolId });
            get().splitSelected(Math.min(0.5, lotMass(nearby) / 4));
            return;
          }
          set({
            heldId: null,
            tools: state.tools.map((tool) =>
              tool.id === toolId ? { ...tool, zone: place.zone, x: place.x, z: place.z } : tool,
            ),
          });
          return;
        }
        set({ heldId: null });
        return;
      }
      const lot = state.lots.find((item) => item.id === id);
      if (!lot) {
        set({ heldId: null });
        return;
      }
      if (place?.kind === "equipment") {
        get().loadOntoEquipment(id, place.equipmentId);
        set({ heldId: null });
        return;
      }
      if (place?.kind === "table") {
        const nearby = state.lots.find(
          (item) =>
            item.id !== id &&
            item.place.kind === "table" &&
            item.place.zone === state.zone &&
            Math.hypot(item.place.x - place.x, item.place.z - place.z) < 0.22,
        );
        if (nearby) {
          set({ heldId: null, selectedLotId: id });
          get().mergeSelected(nearby.id);
          return;
        }
      }
      set((current) => ({
        heldId: null,
        lots: patchLot(current.lots, id, (item) => ({
          ...item,
          place: place ?? { kind: "table", zone: current.zone, x: 0, z: 0 },
        })),
      }));
    },
    splitSelected: (grams) => {
      const state = get();
      const lot = state.lots.find((item) => item.id === state.selectedLotId);
      if (!lot) {
        return applyResult(fail("Навеска", "Выберите материал."));
      }
      const result = splitLot(lot, grams, nid("lot"), now());
      if (!result.ok) {
        return applyResult(fail("Навеска", "Масса должна быть меньше исходной порции и больше нуля. Материал не дублируется."));
      }
      set({
        lots: state.lots.map((item) => (item.id === lot.id ? result.remaining : item)).concat(result.taken),
        selectedLotId: result.taken.id,
      });
      push({
        zone: state.zone,
        action: "split",
        lotId: lot.id,
        fromState: `${lotMass(lot)} g`,
        toState: `${result.taken.massG} g + ${result.remaining.massG} g`,
        summary: "Деление навески",
      });
      return applyResult(ok("Навеска отделена", `${result.taken.massG} г. Исходная порция уменьшена.`));
    },
    mergeSelected: (targetId) => {
      const state = get();
      const a = state.lots.find((item) => item.id === state.selectedLotId);
      const b = state.lots.find((item) => item.id === targetId);
      if (!a || !b) {
        return applyResult(fail("Объединение", "Выберите две порции."));
      }
      const allowed = canMerge(a, b);
      if (!allowed.ok) {
        return applyResult(fail("Несовместимо", "Капсулы и брак не объединяются с порошками. Материал не дублируется."));
      }
      const merged = mergeLots(a, b, now());
      set({
        lots: state.lots.filter((item) => item.id !== a.id && item.id !== b.id).concat(merged),
        selectedLotId: merged.id,
      });
      push({
        zone: state.zone,
        action: "merge",
        lotId: merged.id,
        fromState: `${lotMass(a)} g + ${lotMass(b)} g`,
        toState: `${merged.massG} g`,
        summary: "Объединение порций",
      });
      return applyResult(ok("Порции объединены", `${merged.massG} г. Состав пересчитан.`));
    },
    unloadSelected: () => {
      const state = get();
      const lot = state.lots.find((item) => item.id === state.selectedLotId);
      if (!lot || lot.place.kind !== "equipment") {
        return applyResult(fail("Выгрузка", "Выберите материал, загруженный в аппарат."));
      }
      const equipmentId = lot.place.equipmentId;
      const machine = machineFor(state, equipmentId);
      if (machine.phase === "running") {
        return applyResult(fail("Выгрузка", "Дождитесь остановки аппарата."));
      }
      set({
        lots: patchLot(state.lots, lot.id, (item) => ({
          ...item,
          place: { kind: "table", zone: state.zone, x: 0.2, z: 0.8 },
        })),
        machines: {
          ...state.machines,
          [equipmentId]: {
            ...machine,
            loadedLotIds: machine.loadedLotIds.filter((id) => id !== lot.id),
            phase: machine.loadedLotIds.filter((id) => id !== lot.id).length ? machine.phase : "idle",
          },
        },
      });
      return applyResult(ok("Выгружено", `${lot.name} возвращён на стол.`));
    },
    setMachineParam: (key, value) => {
      const state = get();
      const id = state.selectedEquipmentId;
      const model = equipmentById(id);
      const machine = machineFor(state, id);
      if (machine.phase === "running") {
        return applyResult(fail("Параметр", "Нельзя менять параметр во время работы. Это не завершает процесс."));
      }
      let next = value;
      let warning = "";
      if (key === "temperature" && model?.temperatureC) {
        if (value < model.temperatureC.min || value > model.temperatureC.max) {
          next = Math.min(model.temperatureC.max, Math.max(model.temperatureC.min, value));
          warning = `Значение ограничено диапазоном ${model.temperatureC.min}–${model.temperatureC.max} °C.`;
        }
      }
      if (key === "rpm" && model?.speedRpm) {
        if (value < model.speedRpm.min || value > model.speedRpm.max) {
          next = Math.min(model.speedRpm.max, Math.max(model.speedRpm.min, value));
          warning = `Обороты ограничены ${model.speedRpm.min}–${model.speedRpm.max} об/мин.`;
        }
      }
      if (key === "door") {
        if (model?.category !== "dryer") {
          return applyResult(fail("Дверца", "У этого аппарата нет дверцы шкафа."));
        }
        next = value >= 0.5 ? 1 : 0;
      }
      if (key === "minutes") {
        next = Math.min(120, Math.max(1, value));
      }
      set({
        machines: {
          ...state.machines,
          [id]: { ...machine, params: { ...machine.params, [key]: next } },
        },
      });
      return applyResult(
        ok(
          "Параметр задан",
          `${key} = ${next}. Настройка не означает завершение операции.${warning ? ` ${warning}` : ""}`,
          warning ? "warning" : "info",
        ),
      );
    },
    identifyMaterials: () => {
      const check = canStartOperation("receive", graphCtx(get()));
      if (!check.ok) {
        return applyResult(fail("Приёмка недоступна", check.reason));
      }
      completeOp("receive", get().lots);
      push({
        zone: "warehouse",
        operationId: "receive",
        action: "receive",
        fromState: "unidentified",
        toState: "identified",
        summary: "Идентификация контейнеров",
      });
      return applyResult(ok("Материалы идентифицированы", "Серии сопоставлены с модельной рецептурой."));
    },
    releaseMaterials: () => {
      const check = canStartOperation("identity_release", graphCtx(get()));
      if (!check.ok) {
        return applyResult(fail("Разрешение недоступно", check.reason));
      }
      const lots = get().lots.map((lot) => ({ ...lot, releaseStatus: "released" as const }));
      completeOp("identity_release", lots);
      push({
        zone: "warehouse",
        operationId: "identity_release",
        action: "release",
        fromState: "quarantine",
        toState: "released",
        summary: "Учебное разрешение на использование",
      });
      return applyResult(ok("Разрешение выдано", "Это учебная отметка, не сертификат анализа."));
    },
    confirmWeigh: () => {
      const state = get();
      const check = canStartOperation("weigh", graphCtx(state));
      if (!check.ok) {
        return applyResult(fail("Взвешивание недоступно", check.reason));
      }
      const scaleId = state.equipmentChoice.scale;
      const scale = equipmentById(scaleId);
      const lot = state.lots.find((item) => item.id === state.selectedLotId);
      if (!lot || !scale) {
        return applyResult(fail("Взвешивание", "Выберите материал и весы."));
      }
      if (lot.place.kind !== "equipment" || lot.place.equipmentId !== scaleId) {
        return applyResult(fail("Нет на весах", "Перетащите контейнер на чашку весов или загрузите его в аппарат."));
      }
      const mass = lotMass(lot);
      if (scale.maxLoadG && mass > scale.maxLoadG) {
        return applyResult(fail("Перегруз", `Масса ${mass} г выше предела ${scale.maxLoadG} г.`));
      }
      if (scale.minLoadG && mass < scale.minLoadG) {
        return applyResult(fail("Ниже минимума", "Выберите аналитические весы для малых навесок."));
      }
      const scaled = scaleRecipe(state.recipe);
      const line = scaled.lines.find((item) => item.substanceId === lot.components[0]?.substanceId);
      const lots = patchLot(state.lots, lot.id, (item) => ({
        ...item,
        kind: "weighed",
        history: [...item.history, { at: now(), action: "weigh", detail: `${mass} g` }],
      }));
      const coverage = weighedLineCoverage(state.recipe, lots);
      const fillNeeded = scaled.lines.filter((item) => item.inFill || item.role === "capsule_shell");
      const done = coverage.weighedLineIds.length >= fillNeeded.length;
      set({ lots, completed: done ? [...new Set([...state.completed, "weigh" as OperationId])] : state.completed });
      push({
        zone: "warehouse",
        operationId: "weigh",
        equipmentId: scaleId,
        lotId: lot.id,
        action: "weigh",
        fromState: lot.kind,
        toState: "weighed",
        params: `${mass} g`,
        result: line ? `nominal ${roundTo(line.nominalG, 4)} g` : "",
        summary: `Взвешивание ${lot.name}`,
      });
      const delta = line ? Math.abs(mass - line.nominalG) / Math.max(line.nominalG, 0.0001) : 0;
      return applyResult(
        ok(
          "Масса зафиксирована",
          `${mass} г на ${scale.modelName}. ${done ? "Все компоненты отвешены." : "Продолжите остальные компоненты."}${delta > 0.02 ? " Отклонение от номинала > 2% (учебное предупреждение)." : ""}`,
          delta > 0.02 ? "warning" : "success",
        ),
      );
    },
    loadOntoEquipment: (lotId, equipmentId) => {
      const model = equipmentById(equipmentId);
      const lot = get().lots.find((item) => item.id === lotId);
      if (!model || !lot) {
        return applyResult(fail("Загрузка", "Нет материала или аппарата."));
      }
      const machine = machineFor(get(), equipmentId);
      if (machine.phase === "running" || machine.phase === "paused") {
        return applyResult(fail("Аппарат занят", "Нельзя загружать работающий или приостановленный аппарат."));
      }
      if (model.category === "dryer" && machine.params.door !== 1) {
        return applyResult(fail("Дверца закрыта", "Откройте дверцу сушильного шкафа. Закрытый шкаф не принимает загрузку."));
      }
      if (model.category === "deduster" && lot.kind !== "capsules") {
        return applyResult(fail("Обеспыливатель", "Принимает только наполненные капсулы."));
      }
      if (model.category === "dryer" && lot.kind !== "wet_mass" && lot.kind !== "granules_wet") {
        return applyResult(fail("Сушильный шкаф", "Загружается влажный гранулят. Для прямого смешивания сушка не нужна."));
      }
      set((state) => ({
        selectedEquipmentId: equipmentId,
        machines: {
          ...state.machines,
          [equipmentId]: {
            ...machineFor(state, equipmentId),
            loadedLotIds: [...new Set([...machineFor(state, equipmentId).loadedLotIds, lotId])],
            phase: machineFor(state, equipmentId).phase === "idle" ? "ready" : machineFor(state, equipmentId).phase,
          },
        },
        lots: patchLot(state.lots, lotId, (item) => ({
          ...item,
          place: { kind: "equipment", equipmentId },
        })),
      }));
      return applyResult(ok("Загружено", `${lot.name} → ${model.modelName}`));
    },
    startOperation: (id) => {
      if (id === "receive") {
        return get().identifyMaterials();
      }
      if (id === "identity_release") {
        return get().releaseMaterials();
      }
      if (id === "weigh") {
        return get().confirmWeigh();
      }
      if (id === "lod" || id === "ipc_blend" || id === "ipc_intermediate" || id === "ipc_capsules" || id === "qc_finished") {
        const method =
          id === "lod" ? "lod" : id === "qc_finished" ? "assay" : id === "ipc_capsules" ? "appearance" : id === "ipc_blend" ? "uniformity" : "average_mass";
        const stage = id === "qc_finished" ? "finished" : id === "ipc_intermediate" || id === "lod" ? "intermediate" : "ipc";
        return get().runQc(method, stage);
      }
      const state = get();
      const check = canStartOperation(id, graphCtx(state));
      if (!check.ok) {
        return applyResult(fail("Операция недоступна", explainBlock(check.reason)));
      }
      const op = check.operation;
      const category = op.equipment[0];
      const catalogId = category ? state.equipmentChoice[category] : state.selectedEquipmentId;
      const machine = machineFor(state, catalogId);
      if (machine.phase === "running") {
        return applyResult(fail("Аппарат занят", "Дождитесь завершения или поставьте на паузу. Повторный пуск не дублирует журнал."));
      }
      const processMinutes = id === "dry" ? (machine.params.minutes ?? 10) : machine.params.minutes;
      const duration = wallSecondsForProcess(processMinutes, op.durationHintSec);
      const loaded = machine.loadedLotIds.length > 0 ? machine.loadedLotIds : [];
      if (op.equipment.length > 0 && loaded.length === 0) {
        return applyResult(fail("Нет загрузки", "Поместите материал в аппарат (перетащите на зону загрузки)."));
      }
      const model = equipmentById(catalogId);
      const loadedMass = state.lots.filter((lot) => loaded.includes(lot.id)).reduce((sum, lot) => sum + lotMass(lot), 0);
      const capG = model?.capacityG ?? (model?.capacityL ? model.capacityL * 500 * ((model.workingLoadPercent?.max ?? 100) / 100) : undefined);
      if (capG && loadedMass > capG) {
        return applyResult(
          fail(
            "Перегруз аппарата",
            model?.capacityG
              ? `Загрузка ${loadedMass.toFixed(1)} г выше предела ${capG.toFixed(0)} г (${model.modelName}).`
              : `Загрузка ${loadedMass.toFixed(1)} г выше учебной оценки ${capG.toFixed(0)} г (объём × 0,5 г/см³ × доля загрузки). Это не паспортная масса загрузки.`,
          ),
        );
      }
      if (id === "encapsulate" && model?.capsuleSizes && !model.capsuleSizes.includes(state.recipe.capsuleSize)) {
        return applyResult(fail("Типоразмер", `Аппарат не заявлен для капсул размера ${state.recipe.capsuleSize}. Выберите другой капсулятор.`));
      }
      if (id === "dry" && model?.category === "desiccator") {
        return applyResult(fail("Сушка", "Эксикатор не заменяет сушильный шкаф."));
      }

      if (id === "pack") {
        completeOp(id, state.lots);
        push({
          zone: "warehouse",
          operationId: id,
          action: "pack",
          fromState: "qc_done",
          toState: "packed",
          summary: "Учебная упаковка серии",
        });
        return applyResult(ok("Серия закрыта", "Учебная маркировка. Не валидированная линия упаковки."));
      }

      set({
        activeOpId: id,
        zone: op.zone,
        selectedEquipmentId: catalogId,
        machines: {
          ...state.machines,
          [catalogId]: {
            ...machine,
            phase: "running",
            progress: 0,
            elapsedSec: 0,
            durationSec: duration,
            loadedLotIds: loaded,
            params: {
              ...machine.params,
              ...(id === "dry" ? { minutes: processMinutes, door: 0 } : {}),
            },
            actual: { ...machine.actual, temperature: machine.actual.temperature ?? 25 },
          },
        },
      });
      push({
        zone: op.zone,
        operationId: id,
        equipmentId: catalogId,
        action: "start",
        fromState: "ready",
        toState: "running",
        params: `${duration}s`,
        summary: `Пуск: ${op.title.ru}`,
      });
      return applyResult(ok("Процесс запущен", `${op.title.ru}. Таймер ${duration} с. Досрочное завершение не засчитывается как полная операция.`));
    },
    pauseActive: () => {
      const state = get();
      const id = state.selectedEquipmentId;
      const machine = machineFor(state, id);
      if (machine.phase !== "running") {
        return applyResult(fail("Пауза", "Нет выполняемого процесса."));
      }
      set({
        machines: { ...state.machines, [id]: { ...machine, phase: "paused" } },
      });
      return applyResult(ok("Пауза", "Время не идёт. Операция не завершена.", "warning"));
    },
    resumeActive: () => {
      const state = get();
      const id = state.selectedEquipmentId;
      const machine = machineFor(state, id);
      if (machine.phase !== "paused") {
        return applyResult(fail("Продолжение", "Процесс не на паузе."));
      }
      set({ machines: { ...state.machines, [id]: { ...machine, phase: "running" } } });
      return applyResult(ok("Продолжено", "Таймер снова идёт."));
    },
    stopActive: () => {
      const state = get();
      const id = state.selectedEquipmentId;
      const machine = machineFor(state, id);
      if (machine.phase !== "running" && machine.phase !== "paused") {
        return applyResult(fail("Стоп", "Аппарат не был запущен."));
      }
      const complete = machine.elapsedSec >= machine.durationSec && machine.durationSec > 0;
      set({
        machines: {
          ...state.machines,
          [id]: { ...machine, phase: complete ? "completed" : "idle", progress: complete ? 1 : machine.progress },
        },
        activeOpId: complete ? state.activeOpId : null,
      });
      if (!complete) {
        push({
          zone: state.zone,
          operationId: state.activeOpId ?? undefined,
          equipmentId: id,
          action: "stop_incomplete",
          fromState: "running",
          toState: "idle",
          result: `${machine.elapsedSec}/${machine.durationSec}s`,
          warning: "incomplete",
          summary: "Останов до завершения времени",
        });
        return applyResult(
          ok("Остановлено досрочно", "Операция не засчитана. Нужно выдержать заданное время.", "warning"),
        );
      }
      return applyResult(ok("Цикл выдержан", "Дождитесь автоматического завершения обработки материала."));
    },
    rejectCapsules: (count) => {
      const state = get();
      const lot = state.lots.find((item) => item.id === state.selectedLotId && item.kind === "capsules");
      if (!lot) {
        return applyResult(fail("Отбраковка", "Выберите партию капсул."));
      }
      const fillG = capsuleYield(lot, state.recipe.capsuleSize, 1e9).fillMg / 1000;
      const rejectG = roundTo(Math.min(lotMass(lot), Math.max(0, count) * fillG), 4);
      if (rejectG <= 0) {
        return applyResult(fail("Отбраковка", "Число капсул должно быть больше нуля."));
      }
      const split = splitLot(lot, rejectG, nid("lot"), now());
      if (!split.ok) {
        const rejected: MaterialLot = { ...lot, kind: "rejected", name: `${lot.name} · брак` };
        set({ lots: state.lots.map((item) => (item.id === lot.id ? rejected : item)) });
      } else {
        set({
          lots: state.lots
            .map((item) => (item.id === lot.id ? split.remaining : item))
            .concat({ ...split.taken, kind: "rejected", name: "Отбракованные капсулы" }),
        });
      }
      push({
        zone: "encapsulation",
        operationId: "dedust_inspect",
        action: "reject",
        lotId: lot.id,
        fromState: "capsules",
        toState: "rejected",
        params: `${count}`,
        summary: "Отбраковка капсул",
      });
      return applyResult(ok("Отбраковано", `${count} капс. Масса списана в брак, исходная партия уменьшена.`));
    },
    runQc: (method, stage) => {
      const state = get();
      const lot = state.lots.find((item) => item.id === state.selectedLotId);
      if (!lot) {
        return applyResult(fail("КК", "Выберите материал или капсулы."));
      }
      if (!qcApplicable[stage].includes(method) && !["hplc", "gc", "uv", "identity_ir"].includes(method)) {
        return applyResult(fail("Метод неприменим", "Испытание не относится к выбранной стадии контроля."));
      }
      const seed = seq + Math.round(apiPercent(lot) * 10);
      const run = {
        id: nid("qc"),
        ...modelQc({
          method,
          stage,
          lot,
          seed,
          capsuleSize: state.recipe.capsuleSize,
          targetLod: state.recipe.targetLodPercent,
        }),
      };
      if (method === "hplc" || method === "gc") {
        const trace = buildChromatogram(method, seed, apiPercent(lot) || 50);
        run.summary = `MODEL ${trace.peaks.map((peak) => peak.x.toFixed(2)).join(" · ")} min`;
      }
      if (method === "identity_ir") {
        const trace = buildFtir(seed);
        run.summary = `MODEL ${trace.bands.map((band) => band.x).join(" · ")} cm⁻¹`;
      }
      if (method === "uv") {
        const trace = buildUv(seed, apiPercent(lot) || 50);
        run.summary = `MODEL λ ${trace.peak} nm`;
      }
      const opId: OperationId =
        method === "lod"
          ? "lod"
          : stage === "finished"
            ? "qc_finished"
            : stage === "intermediate"
              ? "ipc_intermediate"
              : state.route === "direct_blend" && !state.completed.includes("ipc_blend")
                ? "ipc_blend"
                : "ipc_capsules";
      const check = canStartOperation(opId, graphCtx(state));
      if (!check.ok && !state.completed.includes(opId)) {
        return applyResult(fail("Контроль недоступен", explainBlock(check.reason)));
      }
      set((current) => ({
        qcRuns: [run, ...current.qcRuns],
        completed: [...new Set([...current.completed, opId])],
      }));
      push({
        zone: "qc",
        operationId: opId,
        lotId: lot.id,
        action: "qc",
        fromState: lot.kind,
        toState: run.conclusion,
        result: run.summary,
        summary: `КК ${method} (модельные данные)`,
      });
      return applyResult(
        ok("МОДЕЛЬНЫЕ ДАННЫЕ", `${run.summary}. ${run.criterion}`, run.conclusion === "fail" ? "warning" : "success"),
      );
    },
    dismissNotice: (id) => set((state) => ({ notices: state.notices.filter((item) => item.id !== id) })),
    tick: () => {
      const state = get();
      let changed = false;
      const machines = { ...state.machines };
      let lots = state.lots;
      let completed = state.completed;
      let activeOpId = state.activeOpId;

      for (const [id, machine] of Object.entries(machines)) {
        if (machine.phase === "running") {
          const elapsed = machine.elapsedSec + 1;
          const progress = machine.durationSec > 0 ? Math.min(1, elapsed / machine.durationSec) : 1;
          const actual = { ...machine.actual };
          const model = equipmentById(id);
          if (model?.category === "dryer" && state.activeOpId === "dry") {
            const target = machine.params.temperature ?? 50;
            actual.temperature = roundTo(
              (actual.temperature ?? 25) + (target - (actual.temperature ?? 25)) * 0.2,
              1,
            );
            const minutes = machine.params.minutes ?? 10;
            const dtMin = machine.durationSec > 0 ? minutes / machine.durationSec : 0;
            const mode = id.includes("vacuum") ? "vacuum" : "cabinet";
            lots = lots.map((lot) => {
              if (!machine.loadedLotIds.includes(lot.id)) {
                return lot;
              }
              const solids = solidsMass(lot.components);
              const solvent = solventMass(lot.components);
              if (solids <= 0 || solvent <= 0) {
                return lot;
              }
              const stepped = stepDrying({
                solventG: solvent,
                solidsG: solids,
                processMinutes: dtMin,
                temperatureC: actual.temperature,
                targetMoisturePercent: state.recipe.targetLodPercent ?? 2,
                mode,
              });
              const scale = solvent > 0 ? stepped.solventG / solvent : 1;
              const components = lot.components.map((part) =>
                part.substanceId === "water" || part.role === "wetting"
                  ? { ...part, massG: roundTo(part.massG * scale, 4) }
                  : part,
              );
              const massG = roundTo(components.reduce((sum, part) => sum + part.massG, 0), 4);
              return { ...lot, components, massG, moisturePercent: stepped.moisturePercent };
            });
          }
          machines[id] = { ...machine, elapsedSec: elapsed, progress, actual };
          changed = true;
          if (progress >= 1) {
            const finished = finishMachine(id, { ...state, lots, machines, completed, activeOpId });
            lots = finished.lots;
            completed = finished.completed;
            activeOpId = finished.activeOpId;
            machines[id] = finished.machine;
            if (finished.summary) {
              push({
                zone: state.zone,
                operationId: state.activeOpId ?? undefined,
                equipmentId: id,
                action: "complete",
                fromState: "running",
                toState: finished.machine.phase,
                result: finished.summary,
                warning: finished.machine.phase === "error" ? finished.summary : undefined,
                summary: finished.summary,
              });
            }
          }
        } else if (machine.phase !== "idle" && machine.actual.temperature && machine.actual.temperature > 26) {
          machines[id] = {
            ...machine,
            actual: {
              ...machine.actual,
              temperature: roundTo(machine.actual.temperature + (25 - machine.actual.temperature) * 0.08, 1),
            },
          };
          changed = true;
        }
      }

      if (changed) {
        set({ machines, lots, completed, activeOpId });
      }
    },
  };
    },
    {
      name: "pharma-lab-session",
      version: 1,
      skipHydration: true,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        route: state.route,
        zone: state.zone,
        graphics: state.graphics,
        physicsDebug: state.physicsDebug,
        recipe: state.recipe,
        lots: state.lots,
        selectedLotId: state.selectedLotId,
        equipmentChoice: state.equipmentChoice,
        machines: state.machines,
        completed: state.completed,
        auditLog: state.auditLog,
        qcRuns: state.qcRuns,
      }),
    },
  ),
);

function tableBlockers(state: LabState, ignoreId: string) {
  const blockers: { x: number; z: number; radius: number }[] = zoneSlots[state.zone].map((slot) => ({
    x: slot.x,
    z: slot.z,
    radius: slot.category === "dryer" ? 0.55 : slot.category === "qc" ? 0.32 : 0.38,
  }));
  for (const lot of state.lots) {
    if (lot.id === ignoreId || lot.place.kind !== "table" || lot.place.zone !== state.zone) {
      continue;
    }
    blockers.push({ x: lot.place.x, z: lot.place.z, radius: 0.16 });
  }
  for (const tool of state.tools) {
    if (ignoreId === `tool:${tool.id}` || tool.zone !== state.zone) {
      continue;
    }
    blockers.push({ x: tool.x, z: tool.z, radius: 0.1 });
  }
  return blockers;
}

export function saveTrainingSnapshot() {
  const state = useLabStore.getState();
  return localRepository.save({
    route: state.route,
    recipe: state.recipe,
    lots: state.lots,
    completed: state.completed,
    equipmentChoice: state.equipmentChoice,
    auditLog: state.auditLog,
    qcRuns: state.qcRuns,
  });
}

function finishMachine(
  catalogId: string,
  state: Pick<LabState, "lots" | "machines" | "completed" | "activeOpId" | "recipe" | "route" | "zone">,
) {
  const machine = state.machines[catalogId];
  const opId = state.activeOpId;
  const op = opId ? operationById(opId) : undefined;
  let lots = state.lots;
  const loaded = lots.filter((lot) => machine.loadedLotIds.includes(lot.id));
  const stamp = now();

  if (opId === "preblend" || opId === "blend_main" || opId === "add_glidant_lubricant" || opId === "extragranular_blend") {
    if (loaded.length > 0) {
      const merged = loaded.slice(1).reduce((acc, lot) => mergeLots(acc, lot, stamp), loaded[0]);
      const kind: LotKind =
        opId === "preblend"
          ? "preblend"
          : opId === "add_glidant_lubricant" || opId === "extragranular_blend"
            ? "final_blend"
            : "blend";
      const kept = lots.filter((lot) => !machine.loadedLotIds.includes(lot.id));
      lots = [
        ...kept,
        {
          ...merged,
          kind,
          moisturePercent: weightedMoisture(merged.components),
          bulkDensityGCm3: weightedDensity(merged.components),
          history: [...merged.history, { at: stamp, action: opId, detail: catalogId }],
        },
      ];
    }
  }

  if (opId === "sieve" || opId === "mill" || opId === "wet_screen") {
    const kind: LotKind = opId === "mill" ? "milled" : opId === "wet_screen" ? "granules_wet" : "sieved";
    lots = lots.map((lot) =>
      machine.loadedLotIds.includes(lot.id)
        ? { ...lot, kind, history: [...lot.history, { at: stamp, action: opId, detail: catalogId }] }
        : lot,
    );
  }

  if (opId === "binder_solution" && loaded[0]) {
    lots = patchLot(lots, loaded[0].id, (lot) => ({ ...lot, kind: "binder_solution" }));
  }

  if (opId === "wet_granulate" && loaded.length > 0) {
    const merged = loaded.slice(1).reduce((acc, lot) => mergeLots(acc, lot, stamp), loaded[0]);
    const kept = lots.filter((lot) => !machine.loadedLotIds.includes(lot.id));
    const solvent = solventMass(merged.components);
    const solids = solidsMass(merged.components);
    lots = [
      ...kept,
      {
        ...merged,
        kind: "wet_mass",
        moisturePercent: solvent > 0 ? roundTo((solvent / Math.max(solvent + solids, 0.0001)) * 100, 3) : merged.moisturePercent,
      },
    ];
  }

  if (opId === "dry") {
    lots = lots.map((lot) =>
      machine.loadedLotIds.includes(lot.id)
        ? {
            ...lot,
            kind: "granules_dry",
            history: [
              ...lot.history,
              {
                at: stamp,
                action: "dry",
                detail: `training Lewis model, moisture ${lot.moisturePercent}% (not an oven measurement)`,
              },
            ],
          }
        : lot,
    );
  }

  if (opId === "size_granules") {
    lots = lots.map((lot) =>
      machine.loadedLotIds.includes(lot.id) ? { ...lot, kind: "granules_sized" } : lot,
    );
  }

  let summary = op ? `Завершено: ${op.title.ru}` : "Цикл завершён";

  if (opId === "encapsulate") {
    const blend = loaded.find((lot) => lot.kind === "final_blend" || lot.kind === "blend") ?? loaded[0];
    const shells = lots.find((lot) => lot.components.some((part) => part.role === "capsule_shell") && lot.kind !== "capsules");
    const shellLine = state.recipe.lines.find((line) => line.role === "capsule_shell");
    if (!blend || !shells || !shellLine) {
      return {
        lots: state.lots,
        completed: state.completed,
        activeOpId: null,
        machine: { ...machine, phase: "error" as const, progress: 1, message: "Нет смеси или оболочек" },
        op,
        summary: "Наполнение не выполнено: нужны смесь и оболочки.",
      };
    }
    const filled = encapsulateBlend({
      blend,
      shells,
      shellUnitG: shellLine.mgPerCapsule / 1000,
      size: state.recipe.capsuleSize,
      newId: nid("lot"),
      at: stamp,
    });
    if (!filled.ok) {
      return {
        lots: state.lots,
        completed: state.completed,
        activeOpId: null,
        machine: { ...machine, phase: "error" as const, progress: 1, message: filled.reason },
        op,
        summary: filled.reason === "no_shells" ? "Недостаточно оболочек для наполнения." : "Недостаточно смеси для наполнения.",
      };
    }
    const kept = lots.filter((lot) => lot.id !== blend.id && lot.id !== shells.id);
    lots = [...kept, ...(filled.leftoverBlend ? [filled.leftoverBlend] : []), ...(filled.leftoverShells ? [filled.leftoverShells] : []), filled.capsules];
    summary = `Наполнено ${filled.yieldInfo.possible} капс. Масса наполнения ${filled.yieldInfo.usedBlendG} г, оболочки ${shellMass(filled.capsules.components)} г. Учебная модель плотности и объёма.`;
  }

  if (opId === "dedust_inspect") {
    lots = lots.map((lot) =>
      machine.loadedLotIds.includes(lot.id) && lot.kind === "capsules"
        ? { ...lot, history: [...lot.history, { at: stamp, action: "dedust", detail: catalogId }] }
        : lot,
    );
  }

  return {
    lots,
    completed: opId && !state.completed.includes(opId) ? [...state.completed, opId] : state.completed,
    activeOpId: null,
    machine: { ...machine, phase: "completed" as const, progress: 1, loadedLotIds: machine.loadedLotIds },
    op,
    summary,
  };
}

export function sessionBalance() {
  const state = useLabStore.getState();
  return massBalance(state.recipe, state.lots);
}

export function canMergeSelected(targetId: string) {
  const state = useLabStore.getState();
  const a = state.lots.find((lot) => lot.id === state.selectedLotId);
  const b = state.lots.find((lot) => lot.id === targetId);
  if (!a || !b) {
    return { ok: false as const, reason: "missing" };
  }
  return canMerge(a, b);
}

export type { LabState };
