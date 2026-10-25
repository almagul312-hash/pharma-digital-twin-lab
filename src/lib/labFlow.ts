import type {
  EquipmentId,
  LabSample,
  ProcessMark,
  SampleLocation,
  SampleStatus,
  ZoneId,
} from "@/types/lab";

export const SAMPLE_LOCATIONS: SampleLocation[] = [
  "warehouse",
  "dosing",
  "blending",
  "binder_oven",
  "desiccator",
  "encapsulation",
  "qc_lab",
];

export const PROCESS_MARKS: ProcessMark[] = [
  "weighed",
  "debagged",
  "milled",
  "blended",
  "dried",
  "desiccated",
  "encapsulated",
  "dedusted",
  "rejected",
  "analyzed",
];

export function zoneFor(location: SampleLocation): ZoneId {
  switch (location) {
    case "encapsulation":
      return "encapsulation";
    case "binder_oven":
    case "desiccator":
      return "drying";
    case "qc_lab":
      return "qc";
    default:
      return "warehouse";
  }
}

export function equipmentFor(location: SampleLocation): EquipmentId {
  switch (location) {
    case "encapsulation":
      return "encapsulator";
    case "binder_oven":
      return "binder";
    case "desiccator":
      return "desiccator";
    case "qc_lab":
      return "archive";
    case "blending":
      return "mixer";
    case "dosing":
      return "miller";
    default:
      return "scale";
  }
}

export function statusFor(location: SampleLocation): SampleStatus {
  switch (location) {
    case "warehouse":
      return "quarantine";
    case "binder_oven":
      return "drying";
    case "desiccator":
      return "conditioning";
    case "qc_lab":
      return "qc";
    default:
      return "in_process";
  }
}

export function withMark(sample: LabSample, mark: ProcessMark): LabSample {
  if (sample.marks.includes(mark)) {
    return sample;
  }

  return { ...sample, marks: [...sample.marks, mark] };
}

export function nextLocation(sample: LabSample): SampleLocation {
  if (!sample.marks.includes("weighed")) {
    return "warehouse";
  }
  if (!sample.marks.includes("debagged") && !sample.marks.includes("milled")) {
    return "warehouse";
  }
  if (!sample.marks.includes("milled")) {
    return "dosing";
  }
  if (!sample.marks.includes("blended")) {
    return "blending";
  }
  if (!sample.marks.includes("dried")) {
    return "binder_oven";
  }
  if (!sample.marks.includes("desiccated")) {
    return "desiccator";
  }
  if (!sample.marks.includes("encapsulated") || !sample.marks.includes("dedusted")) {
    return "encapsulation";
  }
  return "qc_lab";
}
