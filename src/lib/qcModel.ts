import { apiPercent, lotMass } from "@/lib/materials";
import { fillMassMg } from "@/lib/capsuleFill";
import { roundTo } from "@/lib/formatLab";
import type { CapsuleSize, MaterialLot, QcMethod, QcRun, QcStage } from "@/types/process";

function rng(seed: number) {
  let state = seed >>> 0 || 1;
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function modelQc(input: {
  method: QcMethod;
  stage: QcStage;
  lot: MaterialLot;
  seed: number;
  capsuleSize: CapsuleSize;
  targetLod?: number;
}): Omit<QcRun, "id"> {
  const random = rng(input.seed);
  const jitter = (scale: number) => (random() - 0.5) * scale;
  const mass = lotMass(input.lot);
  const api = apiPercent(input.lot);
  const fill = fillMassMg(input.lot.bulkDensityGCm3, input.capsuleSize);

  const base = {
    method: input.method,
    stage: input.stage,
    lotId: input.lot.id,
    at: new Date().toISOString(),
    seed: input.seed,
    modelDisclaimer: true as const,
  };

  switch (input.method) {
    case "appearance": {
      const defects = Math.max(0, Math.round(2 + jitter(4)));
      return {
        ...base,
        summary: `defects ${defects} / 100 (model)`,
        measured: { visual_defects_per_100: defects },
        criterion: "Training: no major defects in the inspected model sample.",
        conclusion: "informational",
      };
    }
    case "average_mass": {
      const avg = roundTo(fill + jitter(8), 1);
      return {
        ...base,
        summary: `${avg} mg (model)`,
        measured: { average_mg: avg, theoretical_fill_mg: fill },
        criterion: "Model average mass versus density×volume fill. No conformity decision: the monograph limit is not loaded.",
        conclusion: "informational",
      };
    }
    case "mass_variation": {
      const rsd = roundTo(2.2 + Math.abs(jitter(2)), 2);
      return {
        ...base,
        summary: `RSD ${rsd}% (model)`,
        measured: { rsd_percent: rsd },
        criterion: "Model RSD. No conformity decision without the applicable pharmacopoeial method.",
        conclusion: "informational",
      };
    }
    case "uniformity": {
      const av = roundTo(4 + Math.abs(jitter(3)), 1);
      return {
        ...base,
        summary: `AV ${av} (model)`,
        measured: { acceptance_value: av, api_percent: api },
        criterion: "Model acceptance value. Not a Ph. Eur. 2.9.40 decision.",
        conclusion: "informational",
      };
    }
    case "disintegration": {
      const min = roundTo(8 + jitter(4), 1);
      return {
        ...base,
        summary: `${min} min (model)`,
        measured: { disintegration_min: min },
        criterion: "Model disintegration time. Not a pharmacopoeial pass/fail; hardness is not reported for capsules.",
        conclusion: "informational",
      };
    }
    case "dissolution": {
      const pct = roundTo(82 + jitter(12), 1);
      return {
        ...base,
        summary: `${pct}% @ 45 min (model)`,
        measured: { dissolved_percent: pct },
        criterion: "Model dissolution value. Not a specification result.",
        conclusion: "informational",
      };
    }
    case "assay": {
      const assay = roundTo(api + jitter(3), 1);
      return {
        ...base,
        summary: `${assay}% (model)`,
        measured: { assay_percent: assay },
        criterion: "Model assay from lot composition. Not a validated HPLC assay and not a release decision.",
        conclusion: "informational",
      };
    }
    case "identity_ir": {
      return {
        ...base,
        summary: "IR bands matched to the training library (model)",
        measured: { match: "model_library" },
        criterion: "Training identity. Not a pharmacopoeial IR identification.",
        conclusion: "informational",
      };
    }
    case "lod": {
      const lod = roundTo(input.lot.moisturePercent + jitter(0.4), 2);
      const target = input.targetLod ?? 2;
      return {
        ...base,
        summary: `${lod}% (model)`,
        measured: { lod_percent: lod, target_percent: target, lot_mass_g: mass },
        criterion: "Model LOD versus formula target. Official loss-on-drying follows the monograph.",
        conclusion: lod <= target + 0.5 ? "pass" : "fail",
      };
    }
    default: {
      return {
        ...base,
        summary: "model chromatogram / spectrum",
        measured: { api_percent: api },
        criterion: "Deterministic training signal. Not a real chromatogram.",
        conclusion: "informational",
      };
    }
  }
}

export const qcApplicable: Record<QcStage, QcMethod[]> = {
  ipc: ["appearance", "average_mass", "lod"],
  intermediate: ["lod", "appearance"],
  finished: [
    "appearance",
    "average_mass",
    "mass_variation",
    "uniformity",
    "disintegration",
    "dissolution",
    "assay",
    "identity_ir",
    "hplc",
    "uv",
  ],
};
