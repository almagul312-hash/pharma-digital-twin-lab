import { create } from "zustand";
import { simulatePhyschem, buildChromatogram, buildFtir, buildUv } from "@/lib/labSignals";
import { roundTo } from "@/lib/formatLab";
import {
  equipmentFor,
  statusFor,
  withMark,
  zoneFor,
} from "@/lib/labFlow";
import type {
  AuditAction,
  AuditRecord,
  BinderState,
  DesiccatorState,
  EncapsulatorState,
  EquipmentId,
  LabSample,
  MixerState,
  ProcessMark,
  QcMethod,
  QcRun,
  SampleLocation,
  ZoneId,
} from "@/types/lab";

type LogInput = {
  zone: ZoneId;
  equipment: EquipmentId;
  action: AuditAction;
  summary?: string;
  sampleId?: string;
  from?: SampleLocation;
  to?: SampleLocation;
};

type LabState = {
  zone: ZoneId;
  inventoryOpen: boolean;
  samples: LabSample[];
  selectedSampleId: string;
  binder: BinderState;
  desiccator: DesiccatorState;
  encapsulator: EncapsulatorState;
  mixer: MixerState;
  auditLog: AuditRecord[];
  qcRuns: QcRun[];
  setZone: (zone: ZoneId) => void;
  setInventoryOpen: (open: boolean) => void;
  toggleInventory: () => void;
  selectSample: (id: string) => void;
  openSampleZone: (id: string) => void;
  renameSample: (id: string, name: string) => void;
  addLogRecord: (entry: LogInput) => void;
  moveSample: (id: string, location: SampleLocation) => void;
  weighSample: (id: string) => void;
  debagSample: (id: string) => void;
  millSample: (id: string) => void;
  setMixerMinutes: (minutes: number) => void;
  startMixer: (sampleId?: string) => void;
  stopMixer: () => void;
  setBinderTemperature: (temperature: number) => void;
  setBinderVacuum: (vacuum: number) => void;
  setBinderTimer: (minutes: number) => void;
  startBinder: (sampleId?: string) => void;
  stopBinder: () => void;
  setDesiccatorVacuum: (vacuum: number) => void;
  startDesiccator: (sampleId?: string) => void;
  stopDesiccator: () => void;
  setEncapsulatorSpeed: (speed: number) => void;
  setEncapsulatorFill: (fillMass: number) => void;
  startEncapsulator: (sampleId?: string) => void;
  stopEncapsulator: () => void;
  setDedusting: (enabled: boolean, sampleId?: string) => void;
  rejectCapsule: (sampleId?: string) => void;
  runAnalysis: (method: QcMethod, sampleId: string) => void;
  tick: () => void;
};

let sequence = 1;

function nextId(prefix: string) {
  sequence += 1;
  return `${prefix}-${sequence}`;
}

function nowIso() {
  return new Date().toISOString();
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function approach(current: number, target: number, factor: number) {
  const next = current + (target - current) * factor;
  if (Math.abs(target - next) < 0.08) {
    return target;
  }
  return roundTo(next, 1);
}

function appendHistory(
  sample: LabSample,
  action: AuditAction,
  location: SampleLocation,
): LabSample {
  return {
    ...sample,
    history: [...sample.history, { at: nowIso(), action, location }],
  };
}

function createSeed(): LabSample[] {
  return [
    {
      id: "CAP-24-001",
      name: "Ибупрофен, партия 001",
      type: "raw",
      mass: 500,
      moisture: 3.4,
      apiConcentration: 98.2,
      location: "warehouse",
      status: "quarantine",
      marks: ["weighed"],
      createdAt: "2026-10-20T08:30:00.000Z",
      history: [
        {
          at: "2026-10-20T08:30:00.000Z",
          action: "weigh",
          location: "warehouse",
        },
      ],
    },
    {
      id: "CAP-24-002",
      name: "Смесь API / лактоза 002",
      type: "blend",
      mass: 250,
      moisture: 2.6,
      apiConcentration: 99.1,
      location: "dosing",
      status: "in_process",
      marks: ["weighed", "debagged", "milled"],
      createdAt: "2026-10-21T09:10:00.000Z",
      history: [
        {
          at: "2026-10-21T09:10:00.000Z",
          action: "mill",
          location: "dosing",
        },
      ],
    },
    {
      id: "CAP-24-003",
      name: "Капсулы 200 мг, серия 003",
      type: "capsules",
      mass: 180,
      moisture: 2.2,
      apiConcentration: 97.8,
      location: "blending",
      status: "in_process",
      marks: ["weighed", "debagged", "milled", "blended"],
      createdAt: "2026-10-22T11:00:00.000Z",
      history: [
        {
          at: "2026-10-22T11:00:00.000Z",
          action: "blend_done",
          location: "blending",
        },
      ],
    },
  ];
}

export const useLabStore = create<LabState>((set, get) => {
  const pushLog = (entry: LogInput) => {
    const record: AuditRecord = {
      id: nextId("log"),
      at: nowIso(),
      zone: entry.zone,
      equipment: entry.equipment,
      action: entry.action,
      summary: entry.summary ?? "",
      sampleId: entry.sampleId,
      from: entry.from,
      to: entry.to,
    };

    set((state) => ({
      auditLog: [record, ...state.auditLog].slice(0, 300),
    }));
  };

  const patchSample = (
    id: string,
    updater: (sample: LabSample) => LabSample,
  ) => {
    set((state) => ({
      samples: state.samples.map((sample) =>
        sample.id === id ? updater(sample) : sample,
      ),
    }));
  };

  const loadSample = (id: string, location: SampleLocation) => {
    const sample = get().samples.find((item) => item.id === id);
    if (!sample) {
      return null;
    }
    if (sample.location !== location) {
      get().moveSample(id, location);
    }
    return get().samples.find((item) => item.id === id) ?? null;
  };

  const applyProcess = (
    samples: LabSample[],
    loadedId: string | null,
    location: SampleLocation,
    mark: ProcessMark,
    extras?: (sample: LabSample) => Partial<LabSample>,
    action?: AuditAction,
  ) =>
    samples.map((sample) => {
      const match = loadedId
        ? sample.id === loadedId
        : sample.location === location;
      if (!match) {
        return sample;
      }
      const next = { ...withMark(sample, mark), ...extras?.(sample) };
      if (!action || sample.marks.includes(mark)) {
        return next;
      }
      return appendHistory(next, action, location);
    });

  const finishProcess = (
    location: SampleLocation,
    loadedId: string | null,
    mark: ProcessMark,
    extras?: (sample: LabSample) => Partial<LabSample>,
    action?: AuditAction,
  ) => {
    set((state) => ({
      samples: applyProcess(
        state.samples,
        loadedId,
        location,
        mark,
        extras,
        action,
      ),
    }));
  };

  return {
    zone: "warehouse",
    inventoryOpen: false,
    samples: createSeed(),
    selectedSampleId: "CAP-24-001",
    binder: {
      temperature: 40,
      vacuum: 100,
      actualTemperature: 25,
      actualVacuum: 1013,
      timerMinutes: 15,
      running: false,
      elapsedSeconds: 0,
      loadedSampleId: null,
    },
    desiccator: {
      vacuum: 50,
      actualVacuum: 1013,
      running: false,
      loadedSampleId: null,
    },
    encapsulator: {
      speed: 40,
      fillMass: 200,
      running: false,
      dedusting: false,
      rejected: 0,
      produced: 0,
      loadedSampleId: null,
    },
    mixer: {
      minutes: 10,
      running: false,
      elapsedSeconds: 0,
      loadedSampleId: null,
    },
    auditLog: [],
    qcRuns: [],
    setZone: (zone) => set({ zone }),
    setInventoryOpen: (inventoryOpen) => set({ inventoryOpen }),
    toggleInventory: () =>
      set((state) => ({ inventoryOpen: !state.inventoryOpen })),
    selectSample: (selectedSampleId) => set({ selectedSampleId }),
    openSampleZone: (id) => {
      const sample = get().samples.find((item) => item.id === id);
      if (!sample) {
        return;
      }
      set({ selectedSampleId: id, zone: zoneFor(sample.location) });
    },
    renameSample: (id, name) => {
      const next = name.trim();
      const sample = get().samples.find((item) => item.id === id);
      if (!sample || !next || next === sample.name) {
        return;
      }
      patchSample(id, (item) =>
        appendHistory({ ...item, name: next }, "rename", item.location),
      );
      pushLog({
        zone: zoneFor(sample.location),
        equipment: "archive",
        action: "rename",
        sampleId: id,
        summary: `${sample.name} → ${next}`,
      });
    },
    addLogRecord: pushLog,
    moveSample: (id, location) => {
      const sample = get().samples.find((item) => item.id === id);
      if (!sample || sample.location === location) {
        return;
      }

      const from = sample.location;
      const at = nowIso();
      set((state) => ({
        samples: state.samples.map((item) =>
          item.id === id
            ? {
                ...item,
                location,
                status: statusFor(location),
                history: [...item.history, { at, action: "move", location }],
              }
            : item,
        ),
      }));
      pushLog({
        zone: zoneFor(location),
        equipment: equipmentFor(location),
        action: "move",
        sampleId: id,
        from,
        to: location,
      });
    },
    weighSample: (id) => {
      const existing = get().samples.find((item) => item.id === id);
      if (!existing) {
        return;
      }
      const location =
        existing.location === "dosing" ? "dosing" : "warehouse";
      loadSample(id, location);
      const current = get().samples.find((item) => item.id === id);
      if (!current) {
        return;
      }
      patchSample(id, (item) =>
        appendHistory(withMark(item, "weighed"), "weigh", item.location),
      );
      pushLog({
        zone: "warehouse",
        equipment: "scale",
        action: "weigh",
        sampleId: id,
        summary: `${current.mass} g`,
      });
    },
    debagSample: (id) => {
      const sample = loadSample(id, "warehouse");
      if (!sample) {
        return;
      }
      patchSample(id, (item) =>
        appendHistory(withMark(item, "debagged"), "debag", item.location),
      );
      pushLog({
        zone: "warehouse",
        equipment: "debagger",
        action: "debag",
        sampleId: id,
        summary: sample.name,
      });
    },
    millSample: (id) => {
      const sample = loadSample(id, "dosing");
      if (!sample) {
        return;
      }
      patchSample(id, (item) =>
        appendHistory(
          withMark(withMark(item, "debagged"), "milled"),
          "mill",
          "dosing",
        ),
      );
      pushLog({
        zone: "warehouse",
        equipment: "miller",
        action: "mill",
        sampleId: id,
        summary: sample.name,
      });
    },
    setMixerMinutes: (minutes) => {
      const next = clamp(Math.round(minutes), 1, 120);
      if (next === get().mixer.minutes) {
        return;
      }
      set((state) => ({ mixer: { ...state.mixer, minutes: next } }));
      pushLog({
        zone: "warehouse",
        equipment: "mixer",
        action: "set_timer",
        summary: `${next} min`,
      });
    },
    startMixer: (sampleId) => {
      if (get().mixer.running) {
        return;
      }
      if (sampleId) {
        loadSample(sampleId, "blending");
      }
      set((state) => ({
        mixer: {
          ...state.mixer,
          running: true,
          elapsedSeconds: 0,
          loadedSampleId: sampleId ?? state.mixer.loadedSampleId,
        },
      }));
      if (sampleId) {
        patchSample(sampleId, (item) =>
          appendHistory(item, "blend_start", "blending"),
        );
      }
      pushLog({
        zone: "warehouse",
        equipment: "mixer",
        action: "blend_start",
        sampleId,
        summary: `${get().mixer.minutes} min`,
      });
    },
    stopMixer: () => {
      if (!get().mixer.running) {
        return;
      }
      const { elapsedSeconds, loadedSampleId, minutes } = get().mixer;
      set((state) => ({ mixer: { ...state.mixer, running: false } }));
      if (elapsedSeconds > 0) {
        finishProcess(
          "blending",
          loadedSampleId,
          "blended",
          () => ({ type: "blend" }),
          "blend_done",
        );
      }
      pushLog({
        zone: "warehouse",
        equipment: "mixer",
        action: elapsedSeconds > 0 ? "blend_done" : "blend_stop",
        sampleId: loadedSampleId ?? undefined,
        summary: `${elapsedSeconds} s / ${minutes} min`,
      });
    },
    setBinderTemperature: (temperature) => {
      const next = clamp(Math.round(temperature), 20, 200);
      const previous = get().binder.temperature;
      if (next === previous) {
        return;
      }
      set((state) => ({ binder: { ...state.binder, temperature: next } }));
      pushLog({
        zone: "binder",
        equipment: "binder",
        action: "set_temperature",
        sampleId: get().binder.loadedSampleId ?? undefined,
        summary: `${previous} → ${next} °C`,
      });
    },
    setBinderVacuum: (vacuum) => {
      const next = clamp(Math.round(vacuum), 1, 1013);
      const previous = get().binder.vacuum;
      if (next === previous) {
        return;
      }
      set((state) => ({ binder: { ...state.binder, vacuum: next } }));
      pushLog({
        zone: "binder",
        equipment: "binder",
        action: "set_vacuum",
        sampleId: get().binder.loadedSampleId ?? undefined,
        summary: `${previous} → ${next} mbar`,
      });
    },
    setBinderTimer: (minutes) => {
      const next = clamp(Math.round(minutes), 1, 240);
      if (next === get().binder.timerMinutes) {
        return;
      }
      set((state) => ({ binder: { ...state.binder, timerMinutes: next } }));
      pushLog({
        zone: "binder",
        equipment: "binder",
        action: "set_timer",
        sampleId: get().binder.loadedSampleId ?? undefined,
        summary: `${next} min`,
      });
    },
    startBinder: (sampleId) => {
      if (get().binder.running) {
        return;
      }
      if (sampleId) {
        loadSample(sampleId, "binder_oven");
      }
      set((state) => ({
        binder: {
          ...state.binder,
          running: true,
          elapsedSeconds: 0,
          loadedSampleId: sampleId ?? state.binder.loadedSampleId,
        },
      }));
      const { temperature, vacuum, timerMinutes } = get().binder;
      pushLog({
        zone: "binder",
        equipment: "binder",
        action: "start",
        sampleId,
        summary: `${temperature} °C, ${vacuum} mbar, ${timerMinutes} min`,
      });
    },
    stopBinder: () => {
      if (!get().binder.running) {
        return;
      }
      const { elapsedSeconds, loadedSampleId } = get().binder;
      set((state) => ({ binder: { ...state.binder, running: false } }));
      if (elapsedSeconds > 0) {
        finishProcess("binder_oven", loadedSampleId, "dried", undefined, "cycle_complete");
      }
      pushLog({
        zone: "binder",
        equipment: "binder",
        action: elapsedSeconds > 0 ? "cycle_complete" : "stop",
        sampleId: loadedSampleId ?? undefined,
        summary: `${elapsedSeconds} s`,
      });
    },
    setDesiccatorVacuum: (vacuum) => {
      const next = clamp(Math.round(vacuum), 1, 1013);
      const previous = get().desiccator.vacuum;
      if (next === previous) {
        return;
      }
      set((state) => ({
        desiccator: { ...state.desiccator, vacuum: next },
      }));
      pushLog({
        zone: "binder",
        equipment: "desiccator",
        action: "set_vacuum",
        sampleId: get().desiccator.loadedSampleId ?? undefined,
        summary: `${previous} → ${next} mbar`,
      });
    },
    startDesiccator: (sampleId) => {
      if (get().desiccator.running) {
        return;
      }
      if (sampleId) {
        loadSample(sampleId, "desiccator");
      }
      set((state) => ({
        desiccator: {
          ...state.desiccator,
          running: true,
          loadedSampleId: sampleId ?? state.desiccator.loadedSampleId,
        },
      }));
      pushLog({
        zone: "binder",
        equipment: "desiccator",
        action: "start",
        sampleId,
        summary: `${get().desiccator.vacuum} mbar`,
      });
    },
    stopDesiccator: () => {
      if (!get().desiccator.running) {
        return;
      }
      const { loadedSampleId, actualVacuum } = get().desiccator;
      set((state) => ({
        desiccator: { ...state.desiccator, running: false },
      }));
      finishProcess("desiccator", loadedSampleId, "desiccated", undefined, "stop");
      pushLog({
        zone: "binder",
        equipment: "desiccator",
        action: "stop",
        sampleId: loadedSampleId ?? undefined,
        summary: `${actualVacuum} mbar`,
      });
    },
    setEncapsulatorSpeed: (speed) => {
      const next = clamp(Math.round(speed), 10, 120);
      const previous = get().encapsulator.speed;
      if (next === previous) {
        return;
      }
      set((state) => ({
        encapsulator: { ...state.encapsulator, speed: next },
      }));
      pushLog({
        zone: "encapsulation",
        equipment: "encapsulator",
        action: "set_speed",
        sampleId: get().encapsulator.loadedSampleId ?? undefined,
        summary: `${previous} → ${next} cap/min`,
      });
    },
    setEncapsulatorFill: (fillMass) => {
      const next = clamp(Math.round(fillMass), 50, 800);
      const previous = get().encapsulator.fillMass;
      if (next === previous) {
        return;
      }
      set((state) => ({
        encapsulator: { ...state.encapsulator, fillMass: next },
      }));
      pushLog({
        zone: "encapsulation",
        equipment: "encapsulator",
        action: "set_fill",
        sampleId: get().encapsulator.loadedSampleId ?? undefined,
        summary: `${previous} → ${next} mg`,
      });
    },
    startEncapsulator: (sampleId) => {
      if (get().encapsulator.running) {
        return;
      }
      if (sampleId) {
        loadSample(sampleId, "encapsulation");
      }
      set((state) => ({
        encapsulator: {
          ...state.encapsulator,
          running: true,
          loadedSampleId: sampleId ?? state.encapsulator.loadedSampleId,
        },
      }));
      const { speed, fillMass } = get().encapsulator;
      if (sampleId) {
        patchSample(sampleId, (item) =>
          appendHistory(item, "start", "encapsulation"),
        );
      }
      pushLog({
        zone: "encapsulation",
        equipment: "encapsulator",
        action: "start",
        sampleId,
        summary: `${speed} cap/min, ${fillMass} mg`,
      });
    },
    stopEncapsulator: () => {
      if (!get().encapsulator.running) {
        return;
      }
      const produced = get().encapsulator.produced;
      const loadedSampleId = get().encapsulator.loadedSampleId;
      set((state) => ({
        encapsulator: { ...state.encapsulator, running: false },
      }));
      if (produced > 0) {
        finishProcess(
          "encapsulation",
          loadedSampleId,
          "encapsulated",
          () => ({ type: "capsules" }),
          "stop",
        );
      }
      pushLog({
        zone: "encapsulation",
        equipment: "encapsulator",
        action: "stop",
        sampleId: loadedSampleId ?? undefined,
        summary: `${Math.floor(produced)}`,
      });
    },
    setDedusting: (enabled, sampleId) => {
      if (enabled === get().encapsulator.dedusting) {
        return;
      }
      if (enabled && sampleId) {
        loadSample(sampleId, "encapsulation");
        patchSample(sampleId, (item) =>
          appendHistory(withMark(item, "dedusted"), "dedust_on", "encapsulation"),
        );
      }
      set((state) => ({
        encapsulator: { ...state.encapsulator, dedusting: enabled },
      }));
      pushLog({
        zone: "encapsulation",
        equipment: "deduster",
        action: enabled ? "dedust_on" : "dedust_off",
        sampleId,
      });
    },
    rejectCapsule: (sampleId) => {
      if (sampleId) {
        loadSample(sampleId, "encapsulation");
        patchSample(sampleId, (item) =>
          appendHistory(withMark(item, "rejected"), "reject", "encapsulation"),
        );
      }
      set((state) => ({
        encapsulator: {
          ...state.encapsulator,
          rejected: state.encapsulator.rejected + 1,
        },
      }));
      pushLog({
        zone: "encapsulation",
        equipment: "deduster",
        action: "reject",
        sampleId,
        summary: `${get().encapsulator.rejected}`,
      });
    },
    runAnalysis: (method, sampleId) => {
      const sample = loadSample(sampleId, "qc_lab");
      if (!sample) {
        return;
      }

      const current = get().samples.find((item) => item.id === sampleId);
      if (!current) {
        return;
      }

      const seed = sequence + Math.round(current.apiConcentration * 10);
      let summary = "";
      let physchem: QcRun["physchem"];

      if (method === "hplc" || method === "gc") {
        const trace = buildChromatogram(method, seed, current.apiConcentration);
        summary = `${trace.peaks.map((peak) => peak.x.toFixed(2)).join(" · ")} min`;
      } else if (method === "ftir") {
        const trace = buildFtir(seed);
        summary = `${trace.bands.map((band) => band.x).join(" · ")} cm⁻¹`;
      } else if (method === "uv") {
        const trace = buildUv(seed, current.apiConcentration);
        summary = `λ ${trace.peak} nm`;
      } else {
        physchem = simulatePhyschem(current);
        summary = `${physchem.disintegrationMin} min, ${physchem.hardnessN} N, ${physchem.residualMoisture}%`;
      }

      const equipment: EquipmentId =
        method === "physchem" ? "physchem" : method;
      const run: QcRun = {
        id: nextId("qc"),
        method,
        sampleId,
        at: nowIso(),
        seed,
        summary,
        physchem,
      };

      set((state) => ({ qcRuns: [run, ...state.qcRuns] }));
      patchSample(sampleId, (item) =>
        appendHistory(withMark(item, "analyzed"), "analyze", "qc_lab"),
      );
      pushLog({
        zone: "qc",
        equipment,
        action: "analyze",
        sampleId,
        summary,
      });
    },
    tick: () => {
      const state = get();
      let binder = state.binder;
      let desiccator = state.desiccator;
      let encapsulator = state.encapsulator;
      let mixer = state.mixer;
      let samples = state.samples;
      let changed = false;
      const logs: LogInput[] = [];

      const ambientTemperature = 25;
      const ambientVacuum = 1013;
      const binderTargetTemperature = binder.running
        ? binder.temperature
        : ambientTemperature;
      const binderTargetVacuum = binder.running ? binder.vacuum : ambientVacuum;
      const nextBinderTemperature = approach(
        binder.actualTemperature,
        binderTargetTemperature,
        binder.running ? 0.18 : 0.05,
      );
      const nextBinderVacuum = approach(
        binder.actualVacuum,
        binderTargetVacuum,
        binder.running ? 0.2 : 0.05,
      );

      if (
        nextBinderTemperature !== binder.actualTemperature ||
        nextBinderVacuum !== binder.actualVacuum
      ) {
        binder = {
          ...binder,
          actualTemperature: nextBinderTemperature,
          actualVacuum: nextBinderVacuum,
        };
        changed = true;
      }

      if (binder.running) {
        const elapsed = binder.elapsedSeconds + 1;
        const done = elapsed >= binder.timerMinutes * 60;
        binder = {
          ...binder,
          elapsedSeconds: done ? binder.timerMinutes * 60 : elapsed,
          running: !done,
        };
        samples = samples.map((sample) => {
          if (sample.location !== "binder_oven") {
            return sample;
          }
          const drop = 0.008 + binder.temperature / 5000;
          return {
            ...sample,
            moisture: roundTo(Math.max(0.2, sample.moisture - drop), 2),
          };
        });
        if (done) {
          samples = applyProcess(
            samples,
            binder.loadedSampleId,
            "binder_oven",
            "dried",
            undefined,
            "cycle_complete",
          );
          logs.push({
            zone: "binder",
            equipment: "binder",
            action: "cycle_complete",
            sampleId: binder.loadedSampleId ?? undefined,
            summary: `${binder.temperature} °C, ${binder.vacuum} mbar`,
          });
        }
        changed = true;
      }

      const desiccatorTarget = desiccator.running
        ? desiccator.vacuum
        : ambientVacuum;
      const nextDesiccatorVacuum = approach(
        desiccator.actualVacuum,
        desiccatorTarget,
        desiccator.running ? 0.16 : 0.05,
      );

      if (nextDesiccatorVacuum !== desiccator.actualVacuum) {
        desiccator = { ...desiccator, actualVacuum: nextDesiccatorVacuum };
        changed = true;
      }

      if (desiccator.running) {
        samples = samples.map((sample) => {
          if (sample.location !== "desiccator") {
            return sample;
          }
          return {
            ...sample,
            moisture: roundTo(Math.max(0.2, sample.moisture - 0.004), 2),
          };
        });
        changed = true;
      }

      if (encapsulator.running) {
        encapsulator = {
          ...encapsulator,
          produced: encapsulator.produced + encapsulator.speed / 60,
        };
        if (encapsulator.produced > 0) {
          samples = applyProcess(
            samples,
            encapsulator.loadedSampleId,
            "encapsulation",
            "encapsulated",
            () => ({ type: "capsules" }),
          );
        }
        changed = true;
      }

      if (mixer.running) {
        const elapsed = mixer.elapsedSeconds + 1;
        const done = elapsed >= mixer.minutes * 60;
        mixer = {
          ...mixer,
          elapsedSeconds: done ? mixer.minutes * 60 : elapsed,
          running: !done,
        };
        changed = true;
        if (done) {
          samples = applyProcess(
            samples,
            mixer.loadedSampleId,
            "blending",
            "blended",
            () => ({ type: "blend" }),
            "blend_done",
          );
          logs.push({
            zone: "warehouse",
            equipment: "mixer",
            action: "blend_done",
            sampleId: mixer.loadedSampleId ?? undefined,
            summary: `${mixer.minutes} min`,
          });
        }
      }

      if (!changed) {
        return;
      }

      set({ binder, desiccator, encapsulator, mixer, samples });
      logs.forEach(pushLog);
    },
  };
});
