import type { ZoneId } from "@/types/process";

export type ScreenMode = "menu" | "workspace";

export type { ZoneId };

export type SampleLocation =
  | "warehouse"
  | "dosing"
  | "blending"
  | "encapsulation"
  | "binder_oven"
  | "desiccator"
  | "qc_lab";

export type SampleStatus =
  | "quarantine"
  | "in_process"
  | "drying"
  | "conditioning"
  | "qc";

export type ProcessMark =
  | "weighed"
  | "debagged"
  | "milled"
  | "blended"
  | "dried"
  | "desiccated"
  | "encapsulated"
  | "dedusted"
  | "rejected"
  | "analyzed";

export type SampleType = "raw" | "blend" | "capsules";

export type EquipmentId =
  | "scale"
  | "debagger"
  | "miller"
  | "mixer"
  | "encapsulator"
  | "deduster"
  | "binder"
  | "desiccator"
  | "hplc"
  | "gc"
  | "ftir"
  | "uv"
  | "physchem"
  | "archive";

export type AuditAction =
  | "weigh"
  | "debag"
  | "mill"
  | "rename"
  | "blend_start"
  | "blend_stop"
  | "blend_done"
  | "move"
  | "set_temperature"
  | "set_vacuum"
  | "set_timer"
  | "start"
  | "stop"
  | "cycle_complete"
  | "set_speed"
  | "set_fill"
  | "dedust_on"
  | "dedust_off"
  | "reject"
  | "analyze";

export type QcMethod = "hplc" | "gc" | "ftir" | "uv" | "physchem";

export type PeakId = "solvent" | "related" | "main" | "late";

export type BandId = "oh" | "ch" | "co" | "cc";

export type SampleHistoryEntry = {
  at: string;
  action: AuditAction;
  location: SampleLocation;
};

export type LabSample = {
  id: string;
  name: string;
  type: SampleType;
  mass: number;
  moisture: number;
  apiConcentration: number;
  location: SampleLocation;
  status: SampleStatus;
  marks: ProcessMark[];
  createdAt: string;
  history: SampleHistoryEntry[];
};

export type BinderState = {
  temperature: number;
  vacuum: number;
  actualTemperature: number;
  actualVacuum: number;
  timerMinutes: number;
  running: boolean;
  elapsedSeconds: number;
  loadedSampleId: string | null;
};

export type DesiccatorState = {
  vacuum: number;
  actualVacuum: number;
  running: boolean;
  loadedSampleId: string | null;
};

export type EncapsulatorState = {
  speed: number;
  fillMass: number;
  running: boolean;
  dedusting: boolean;
  rejected: number;
  produced: number;
  loadedSampleId: string | null;
};

export type MixerState = {
  minutes: number;
  running: boolean;
  elapsedSeconds: number;
  loadedSampleId: string | null;
};

export type AuditRecord = {
  id: string;
  at: string;
  zone: ZoneId;
  equipment: EquipmentId;
  action: AuditAction;
  sampleId?: string;
  summary: string;
  from?: SampleLocation;
  to?: SampleLocation;
};

export type QcRun = {
  id: string;
  method: QcMethod;
  sampleId: string;
  at: string;
  seed: number;
  summary: string;
  physchem?: {
    disintegrationMin: number;
    hardnessN: number;
    residualMoisture: number;
  };
};
