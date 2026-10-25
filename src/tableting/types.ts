export type TabletRouteId = "direct" | "wet_granulation";

export type StageId =
  | "intake"
  | "weighing"
  | "sieving"
  | "premix"
  | "granulating_liquid"
  | "granulation"
  | "wet_screening"
  | "drying"
  | "moisture_check"
  | "sizing"
  | "final_blend"
  | "lubrication"
  | "compression"
  | "dedusting"
  | "qc"
  | "packaging";

export type StageStatus =
  | "unavailable"
  | "awaiting"
  | "ready"
  | "running"
  | "done"
  | "done_warning"
  | "blocked"
  | "skipped";

export type StageMark = "done" | "skipped" | "warning";

export type LocationId =
  | "warehouse"
  | "scale"
  | "sieve"
  | "mixer"
  | "liquid"
  | "granulator"
  | "dryer"
  | "calibrator"
  | "press"
  | "deduster"
  | "qc"
  | "pack"
  | "waste";

export type MaterialRole =
  | "api"
  | "filler"
  | "binder"
  | "disintegrant"
  | "glidant"
  | "lubricant"
  | "solvent"
  | "blend"
  | "granulating_liquid"
  | "wet_granules"
  | "granules"
  | "press_mass"
  | "tablets"
  | "dust"
  | "fines"
  | "retained";

export type Phase = "internal" | "external" | "lubricant" | "liquid_solid" | "solvent";

export type LotKind = "stock" | "portion" | "intermediate" | "product" | "waste";

export type IdentityState = "quarantine" | "identified" | "released";

export type PressKind = "single_punch" | "rotary";

export type ViewMode = "floor" | "classic";

export type GuidanceMode = "guided" | "independent";

export type BalanceMode = "lab" | "analytical";

export type PackKind = "bottle" | "blister";

export type QcMethodId =
  | "appearance"
  | "average_mass"
  | "mass_uniformity"
  | "content_uniformity"
  | "dimensions"
  | "hardness"
  | "friability"
  | "disintegration"
  | "dissolution"
  | "assay";

export type NoticeTone = "success" | "warning" | "error" | "info";

export type Params = Record<string, string | number>;

export type TabletQuality = {
  count: number;
  meanMassMg: number;
  hardnessN: number;
  thicknessMm: number;
  diameterMm: number;
  friabilityPercent: number;
  disintegrationMin: number;
  dissolution30Percent: number;
  assayPercent: number;
  massRsdPercent: number;
  capping: boolean;
  overLubricated: boolean;
  hasDisintegrant: boolean;
  referenceThicknessMm: number;
  simulated: true;
};

export type Lot = {
  id: string;
  materialId: string;
  nameKey: string;
  role: MaterialRole;
  kind: LotKind;
  batch: string;
  massG: number;
  moistureFraction: number;
  apiFraction: number;
  location: LocationId;
  identity: IdentityState;
  parentIds: string[];
  seriesId: string;
  lineId: string | null;
  d50Mm: number;
  bulkDensityGPerMl: number;
  granuleQuality: number | null;
  lubricantMinutes: number;
  rsdPercent: number | null;
  volumeMl: number | null;
  densityGPerMl: number | null;
  consumed: boolean;
  dedusted: boolean;
  quality: TabletQuality | null;
};

export type WeighState = {
  lineId: string | null;
  tareG: number | null;
  zeroed: boolean;
  draftNetG: number | null;
  mode: BalanceMode;
};

export type PressState = {
  kind: PressKind;
  forceKn: number;
  speedPerMin: number;
  precompressionKn: number;
  fillDepthMm: number;
  punchDiameterMm: 8 | 10 | 12;
  setupConfirmed: boolean;
};

export type DryerState = {
  temperatureC: number;
  minutes: number;
};

export type MixerState = {
  minutes: number;
  rpm: number;
};

export type SieveState = {
  meshMm: number;
};

export type GranulatorState = {
  minutes: number;
  impellerRpm: number;
};

export type Job = {
  id: string;
  stage: StageId;
  elapsedMs: number;
  durationMs: number;
  techMinutes: number;
  payload: Params;
};

export type JournalEntry = {
  id: string;
  at: string;
  stage: StageId;
  code: string;
  params: Params;
  massInG: number | null;
  massOutG: number | null;
  lossG: number | null;
};

export type Notice = {
  id: string;
  at: string;
  tone: NoticeTone;
  code: string;
  params: Params;
};

export type LossEntry = {
  id: string;
  stage: StageId;
  code: string;
  grams: number;
};

export type QcRun = {
  id: string;
  method: QcMethodId;
  seriesId: string;
  lotId: string;
  at: string;
  status: "pass" | "fail" | "not_applicable";
  value: number | null;
  unit: string;
  sampleCount: number;
  consumedCount: number;
  simulated: true;
  detailCode: string;
  params: Params;
};

export type PackedUnit = {
  id: string;
  kind: PackKind;
  count: number;
  massG: number;
  label: string;
  lotId: string;
};

export type SeriesReport = {
  seriesId: string;
  route: TabletRouteId;
  createdAt: string;
  batchTablets: number;
  composition: { lineId: string; materialId: string; targetG: number; actualG: number }[];
  losses: { code: string; grams: number }[];
  tabletCount: number;
  packedCount: number;
  remainderG: number;
  qc: { method: QcMethodId; status: QcRun["status"] }[];
  status: "complete" | "complete_with_deviations";
  simulation: true;
};

export type TabletSession = {
  seq: number;
  seriesId: string | null;
  route: TabletRouteId | null;
  batchTablets: number;
  view: ViewMode;
  guidance: GuidanceMode;
  reducedMotion: boolean;
  selectedStage: StageId;
  selectedLotId: string | null;
  selectedEquipmentId: string | null;
  marks: Partial<Record<StageId, StageMark>>;
  lots: Lot[];
  weigh: WeighState;
  press: PressState;
  dryer: DryerState;
  mixer: MixerState;
  sieve: SieveState;
  granulator: GranulatorState;
  job: Job | null;
  journal: JournalEntry[];
  notices: Notice[];
  losses: LossEntry[];
  inputsG: number;
  weighedByLine: Record<string, number>;
  qcRuns: QcRun[];
  packed: PackedUnit[];
  report: SeriesReport | null;
  closed: boolean;
  moistureAcknowledged: boolean;
  floor: { x: number; y: number; scale: number };
};

export type ActionResult = {
  ok: boolean;
  session: TabletSession;
  tone: NoticeTone;
  code: string;
  params: Params;
};

export type StageView = {
  id: StageId;
  status: StageStatus;
  reason: string;
  optional: boolean;
};
