export type RouteId = "direct_blend" | "wet_granulation";

export type ZoneId =
  | "warehouse"
  | "process"
  | "drying"
  | "encapsulation"
  | "qc"
  | "audit";

export type IngredientRole =
  | "api"
  | "filler"
  | "binder"
  | "disintegrant"
  | "glidant"
  | "lubricant"
  | "wetting"
  | "capsule_shell"
  | "other";

export type LotKind =
  | "raw"
  | "weighed"
  | "sieved"
  | "milled"
  | "preblend"
  | "blend"
  | "binder_solution"
  | "wet_mass"
  | "granules_wet"
  | "granules_dry"
  | "granules_sized"
  | "final_blend"
  | "capsules"
  | "rejected";

export type MachinePhase =
  | "idle"
  | "ready"
  | "running"
  | "paused"
  | "completed"
  | "error";

export type EquipmentCategory =
  | "scale"
  | "mixer"
  | "mill"
  | "sieve"
  | "granulator"
  | "dryer"
  | "encapsulator"
  | "deduster"
  | "desiccator"
  | "qc";

export type EquipmentScale = "lab" | "pilot" | "industrial";

export type SpecStatus = "verified" | "typical_class" | "training_stub";

export type NoticeKind = "success" | "warning" | "error" | "info";

export type SourceNote = {
  text: string;
  url?: string;
};

export type Substance = {
  id: string;
  name: Record<"ru" | "en" | "kk", string>;
  inn?: string;
  role: IngredientRole;
  categoryLabel: Record<"ru" | "en" | "kk", string>;
  trainingRangePercent?: { min: number; max: number };
  bulkDensityGCm3: number;
  moisturePercent: number;
  notes: Record<"ru" | "en" | "kk", string>;
  sources: SourceNote[];
};

export type RecipeLine = {
  id: string;
  substanceId: string;
  role: IngredientRole;
  mgPerCapsule: number;
  unit: "mg" | "g" | "ml";
};

export type Recipe = {
  id: string;
  name: Record<"ru" | "en" | "kk", string>;
  route: RouteId;
  modelDisclaimer: Record<"ru" | "en" | "kk", string>;
  capsuleSize: CapsuleSize;
  targetCapsules: number;
  targetLodPercent?: number;
  lines: RecipeLine[];
  sources: SourceNote[];
};

export type CapsuleSize = "000" | "00" | "0" | "1" | "2" | "3" | "4" | "5";

export type CapsuleSpec = {
  size: CapsuleSize;
  volumeMl: number;
  source: SourceNote;
};

export type LotPlace =
  | { kind: "table"; zone: ZoneId; x: number; z: number }
  | { kind: "equipment"; equipmentId: string }
  | { kind: "inventory" };

export type LotComponent = {
  substanceId: string;
  role: IngredientRole;
  massG: number;
};

export type MaterialLot = {
  id: string;
  name: string;
  kind: LotKind;
  massG: number;
  moisturePercent: number;
  bulkDensityGCm3: number;
  components: LotComponent[];
  batchNo: string;
  releaseStatus: "quarantine" | "released" | "rejected";
  place: LotPlace;
  history: LotHistoryEntry[];
};

export type LotHistoryEntry = {
  at: string;
  operationId?: string;
  action: string;
  detail: string;
};

export type OperationId =
  | "receive"
  | "identity_release"
  | "weigh"
  | "sieve"
  | "mill"
  | "preblend"
  | "blend_main"
  | "add_glidant_lubricant"
  | "ipc_blend"
  | "binder_solution"
  | "wet_granulate"
  | "wet_screen"
  | "dry"
  | "lod"
  | "size_granules"
  | "extragranular_blend"
  | "ipc_intermediate"
  | "encapsulate"
  | "dedust_inspect"
  | "ipc_capsules"
  | "qc_finished"
  | "pack";

export type OperationDef = {
  id: OperationId;
  routes: RouteId[];
  zone: ZoneId;
  optional?: boolean;
  title: Record<"ru" | "en" | "kk", string>;
  purpose: Record<"ru" | "en" | "kk", string>;
  equipment: EquipmentCategory[];
  requires: OperationId[];
  outputKind: LotKind;
  durationHintSec: number;
  sources: SourceNote[];
};

export type EquipmentModel = {
  id: string;
  category: EquipmentCategory;
  manufacturer: string;
  modelName: string;
  scale: EquipmentScale;
  specStatus: SpecStatus;
  capacityG?: number;
  capacityL?: number;
  workingLoadPercent?: { min: number; max: number };
  readabilityG?: number;
  maxLoadG?: number;
  minLoadG?: number;
  speedRpm?: { min: number; max: number };
  temperatureC?: { min: number; max: number };
  outputPerMin?: { min: number; max: number };
  capsuleSizes?: CapsuleSize[];
  sources: SourceNote[];
  notes: Record<"ru" | "en" | "kk", string>;
};

export type ToolId =
  | "spatula"
  | "scoop"
  | "pestle_mortar"
  | "glass_rod"
  | "tweezers"
  | "weigh_boat"
  | "watch_glass"
  | "beaker_100"
  | "beaker_250"
  | "cylinder_50"
  | "funnel"
  | "sieve_hand"
  | "tray"
  | "powder_jar"
  | "brush";

export type ToolDef = {
  id: ToolId;
  title: Record<"ru" | "en" | "kk", string>;
  zone: ZoneId;
};

export type MachineRuntime = {
  catalogId: string;
  phase: MachinePhase;
  progress: number;
  elapsedSec: number;
  durationSec: number;
  loadedLotIds: string[];
  message?: string;
  params: Record<string, number>;
  actual: Record<string, number>;
};

export type AuditRecord = {
  id: string;
  at: string;
  zone: ZoneId;
  operationId?: OperationId;
  equipmentId?: string;
  lotId?: string;
  action: string;
  fromState: string;
  toState: string;
  params?: string;
  result?: string;
  warning?: string;
  summary: string;
};

export type Notice = {
  id: string;
  kind: NoticeKind;
  title: string;
  detail: string;
  at: string;
};

export type QcMethod =
  | "appearance"
  | "average_mass"
  | "mass_variation"
  | "uniformity"
  | "disintegration"
  | "dissolution"
  | "assay"
  | "identity_ir"
  | "hplc"
  | "gc"
  | "uv"
  | "lod";

export type QcStage = "ipc" | "intermediate" | "finished";

export type QcRun = {
  id: string;
  method: QcMethod;
  stage: QcStage;
  lotId: string;
  at: string;
  seed: number;
  summary: string;
  measured: Record<string, number | string>;
  criterion: string;
  conclusion: "pass" | "fail" | "informational";
  modelDisclaimer: true;
};

export type ActionResult = {
  ok: boolean;
  notice: Omit<Notice, "id" | "at">;
};

export type GraphicsQuality = "high" | "low";
