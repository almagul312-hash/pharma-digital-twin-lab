import type {
  AuditAction,
  BandId,
  EquipmentId,
  PeakId,
  QcMethod,
  ProcessMark,
  SampleLocation,
  SampleStatus,
  SampleType,
  ZoneId,
} from "@/types/lab";

export type ProjectCopy = {
  title: string;
  description: string;
  stages: string[];
};

export type LabCopy = {
  start: string;
  startTitle: string;
  startText: string;
  structureTitle: string;
  structureText: string;
  stagesNote: string;
  backToMenu: string;
  workspaceEyebrow: string;
  workspaceTitle: string;
  workspaceNote: string;
  inventory: string;
  inventoryTitle: string;
  close: string;
  sceneHint: string;
  canvasLoading: string;
  canvasError: string;
  lastRecord: string;
  noSample: string;
  mass: string;
  moisture: string;
  api: string;
  location: string;
  status: string;
  history: string;
  sample: string;
  sampleName: string;
  rename: string;
  marksTitle: string;
  loaded: string;
  noneLoaded: string;
  openZone: string;
  pipelineHint: string;
  move: string;
  target: string;
  running: string;
  idle: string;
  units: {
    g: string;
    mg: string;
    mbar: string;
    min: string;
    sec: string;
    perMin: string;
    percent: string;
    newton: string;
  };
  zones: Record<ZoneId, { tab: string; title: string; subtitle: string }>;
  locations: Record<SampleLocation, string>;
  statuses: Record<SampleStatus, string>;
  marks: Record<ProcessMark, string>;
  sampleTypes: Record<SampleType, string>;
  equipment: Record<EquipmentId, string>;
  actions: Record<AuditAction, string>;
  warehouse: {
    scaleTitle: string;
    scaleText: string;
    weigh: string;
    debagTitle: string;
    debagText: string;
    debag: string;
    millTitle: string;
    millText: string;
    mill: string;
    mixerTitle: string;
    mixerText: string;
    blendMinutes: string;
    startMix: string;
    stopMix: string;
  };
  encapsulation: {
    machineTitle: string;
    machineText: string;
    speed: string;
    fillMass: string;
    start: string;
    stop: string;
    dedustTitle: string;
    dedustText: string;
    dedustOn: string;
    dedustOff: string;
    reject: string;
    produced: string;
    rejected: string;
  };
  binder: {
    ovenTitle: string;
    ovenText: string;
    desiccatorTitle: string;
    desiccatorText: string;
    temperature: string;
    actualTemperature: string;
    vacuum: string;
    actualVacuum: string;
    timer: string;
    elapsed: string;
    start: string;
    stop: string;
    loadHint: string;
  };
  qc: {
    intro: string;
    run: string;
    simulated: string;
    empty: string;
    retentionAxis: string;
    signalAxis: string;
    waveAxis: string;
    transmittanceAxis: string;
    wavelengthAxis: string;
    absorbanceAxis: string;
    disintegration: string;
    hardness: string;
    residualMoisture: string;
    methods: Record<QcMethod, string>;
    peakNames: Record<PeakId, string>;
    bandNames: Record<BandId, string>;
  };
  audit: {
    intro: string;
    time: string;
    zone: string;
    equipment: string;
    action: string;
    sample: string;
    details: string;
    empty: string;
  };
};

export type Dictionary = {
  meta: {
    siteTitle: string;
    titleSuffix: string;
    description: string;
  };
  brand: {
    line1: string;
    line2: string;
    footer: string;
  };
  language: {
    label: string;
    ru: string;
    kk: string;
    en: string;
  };
  nav: {
    main: string;
    mobile: string;
    openMenu: string;
    closeMenu: string;
    home: string;
    about: string;
    digitalTwins: string;
    materials: string;
    login: string;
  };
  common: {
    comingSoon: string;
  };
  home: {
    eyebrow: string;
    title: string;
    lead: string;
    cta: string;
    capabilitiesTitle: string;
    capabilities: {
      processes: { title: string; description: string };
      parameters: { title: string; description: string };
      results: { title: string; description: string };
      experiment: { title: string; description: string };
    };
    projectsTitle: string;
    projectDetails: string;
    tabletsTitle: string;
    capsulesTitle: string;
  };
  about: {
    title: string;
    description: string;
    lead: string;
    purposeTitle: string;
    purposeText: string;
    availableTitle: string;
    available: string[];
    nextTitle: string;
    nextText: string;
  };
  digitalTwins: {
    title: string;
    description: string;
    lead: string;
  };
  projects: {
    status: string;
    open: string;
    back: string;
    structureTitle: string;
    structureText: string;
    stagesTitle: string;
    tablets: ProjectCopy;
    capsules: ProjectCopy;
  };
  materials: {
    title: string;
    description: string;
    lead: string;
    items: string[];
  };
  login: {
    title: string;
    description: string;
    text: string;
  };
  notFound: {
    title: string;
    text: string;
    action: string;
  };
  lab: LabCopy;
};
