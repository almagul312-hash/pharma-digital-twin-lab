import type { ZoneId } from "@/types/lab";

export type SceneLabels = {
  scale: string;
  miller: string;
  mixer: string;
  encapsulator: string;
  deduster: string;
  binder: string;
  desiccator: string;
  hplc: string;
  spectrometer: string;
  archive: string;
};

export type ModelSources = Partial<Record<keyof SceneLabels, string>>;

export type LabSceneProps = {
  zone: ZoneId;
  labels: SceneLabels;
  models?: ModelSources;
};
