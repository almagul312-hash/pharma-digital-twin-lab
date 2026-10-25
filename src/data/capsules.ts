import { sources } from "@/data/sources";
import type { CapsuleSpec } from "@/types/process";

/** Typical empty hard-capsule geometric volumes from manufacturer catalogs. */
export const capsuleSpecs: CapsuleSpec[] = [
  { size: "000", volumeMl: 1.37, source: sources.capsuleVolumes },
  { size: "00", volumeMl: 0.95, source: sources.capsuleVolumes },
  { size: "0", volumeMl: 0.68, source: sources.capsuleVolumes },
  { size: "1", volumeMl: 0.5, source: sources.capsuleVolumes },
  { size: "2", volumeMl: 0.37, source: sources.capsuleVolumes },
  { size: "3", volumeMl: 0.3, source: sources.capsuleVolumes },
  { size: "4", volumeMl: 0.21, source: sources.capsuleVolumes },
  { size: "5", volumeMl: 0.13, source: sources.capsuleVolumes },
];

export function capsuleVolumeMl(size: CapsuleSpec["size"]) {
  return capsuleSpecs.find((item) => item.size === size)?.volumeMl ?? 0.5;
}
