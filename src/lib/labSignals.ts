import type { BandId, PeakId } from "@/types/lab";

export type TracePoint = {
  x: number;
  y: number;
};

export type NamedPeak = {
  id: PeakId;
  x: number;
  height: number;
};

export type NamedBand = {
  id: BandId;
  x: number;
};

function createRng(seed: number) {
  let state = seed >>> 0 || 1;

  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function gaussian(x: number, mean: number, sigma: number, amplitude: number) {
  const z = (x - mean) / sigma;
  return amplitude * Math.exp(-0.5 * z * z);
}

export function buildChromatogram(
  kind: "hplc" | "gc",
  seed: number,
  apiConcentration: number,
) {
  const random = createRng(seed);
  const jitter = () => (random() - 0.5) * 0.12;
  const peaks: NamedPeak[] =
    kind === "hplc"
      ? [
          { id: "solvent", x: round(1.15 + jitter(), 2), height: 16 + random() * 5 },
          { id: "related", x: round(2.55 + jitter(), 2), height: 7 + random() * 3 },
          {
            id: "main",
            x: round(4.05 + jitter(), 2),
            height: 36 + apiConcentration * 0.42,
          },
          { id: "late", x: round(6.15 + jitter(), 2), height: 5 + random() * 3 },
        ]
      : [
          { id: "solvent", x: round(0.75 + jitter(), 2), height: 20 + random() * 4 },
          { id: "related", x: round(1.95 + jitter(), 2), height: 9 + random() * 3 },
          {
            id: "main",
            x: round(3.35 + jitter(), 2),
            height: 32 + apiConcentration * 0.38,
          },
          { id: "late", x: round(5.05 + jitter(), 2), height: 6 + random() * 2 },
        ];

  const end = kind === "hplc" ? 8 : 6.5;
  const points: TracePoint[] = [];

  for (let index = 0; index <= 220; index += 1) {
    const x = round((end * index) / 220, 2);
    let y = 1.1;

    for (const peak of peaks) {
      y += gaussian(x, peak.x, 0.075, peak.height);
    }

    y += (random() - 0.5) * 0.35;
    points.push({ x, y: round(Math.max(0, y), 2) });
  }

  return { points, peaks, domain: [0, end] as [number, number], modelData: true as const };
}

export function buildFtir(seed: number) {
  const bands: NamedBand[] = [
    { id: "oh", x: 3320 },
    { id: "ch", x: 2924 },
    { id: "co", x: 1716 },
    { id: "cc", x: 1512 },
  ];
  const depths: Record<BandId, number> = {
    oh: 26,
    ch: 16,
    co: 40,
    cc: 14,
  };
  const widths: Record<BandId, number> = {
    oh: 90,
    ch: 32,
    co: 24,
    cc: 22,
  };
  const points: TracePoint[] = [];

  for (let x = 4000; x >= 600; x -= 10) {
    let y = 97;

    for (const band of bands) {
      y -= gaussian(x, band.x, widths[band.id], depths[band.id]);
    }

    if (x < 1500) {
      y -= 3.5 * Math.abs(Math.sin(x / 38 + seed));
    }

    points.push({ x, y: round(Math.max(8, y), 1) });
  }

  return { points, bands, domain: [4000, 600] as [number, number], modelData: true as const };
}

export function buildUv(seed: number, apiConcentration: number) {
  const peak = 254 + ((seed % 9) - 4);
  const points: TracePoint[] = [];

  for (let x = 200; x <= 400; x += 2) {
    const y =
      gaussian(x, peak, 16, 0.55 + apiConcentration / 220) +
      gaussian(x, 214, 9, 0.22);
    points.push({ x, y: round(y, 3) });
  }

  return { points, peak, domain: [200, 400] as [number, number], modelData: true as const };
}

export function simulatePhyschem(sample: {
  moisture: number;
  mass: number;
  apiConcentration: number;
}) {
  return {
    disintegrationMin: round(6.5 + sample.moisture * 0.75, 1),
    hardnessN: round(88 - sample.moisture * 5.5 + sample.mass / 200, 1),
    residualMoisture: round(sample.moisture, 2),
    modelData: true as const,
  };
}

function round(value: number, digits: number) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
