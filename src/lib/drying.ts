import { roundTo } from "@/lib/formatLab";

/**
 * Training drying model for wet granules.
 *
 * Lewis / exponential approach to a target free-solvent level:
 *   S(t) = S∞ + (S0 − S∞) · exp(−k · t)
 * Moisture reported here is free granulation solvent / (solids + free solvent),
 * not a loss-on-drying measurement from a real oven.
 *
 * k is a training constant (1/min) at 50 °C, adjusted with a simple temperature
 * factor exp(0.03 · (T − 50)). It is not an identified mass-transfer coefficient.
 * Vacuum cabinets use a higher training k. That factor is an assumption.
 *
 * The step is the exact solution of the Lewis model over a short interval of
 * constant temperature, so a cold chamber dries more slowly than the setpoint.
 */
export const DRYING_MODEL = {
  id: "lewis-training-v1",
  kCabinetPerMinAt50C: 0.3,
  kVacuumPerMinAt50C: 0.42,
  temperatureFactorPerC: 0.03,
  disclaimer:
    "Учебная эмпирическая модель. Не измерение сушильного шкафа и не универсальный закон сушки.",
} as const;

export type DryerMode = "cabinet" | "vacuum";

export function dryingRatePerMin(temperatureC: number, mode: DryerMode) {
  const base = mode === "vacuum" ? DRYING_MODEL.kVacuumPerMinAt50C : DRYING_MODEL.kCabinetPerMinAt50C;
  const temperature = Number.isFinite(temperatureC) ? temperatureC : 25;
  return base * Math.exp(DRYING_MODEL.temperatureFactorPerC * (temperature - 50));
}

export function moistureFromSolvent(solventG: number, solidsG: number) {
  const total = solventG + solidsG;
  if (total <= 0) {
    return 0;
  }
  return roundTo((solventG / total) * 100, 3);
}

export function solventForMoisture(moisturePercent: number, solidsG: number) {
  const fraction = Math.min(0.85, Math.max(0, moisturePercent / 100));
  if (fraction >= 0.85 || solidsG <= 0) {
    return 0;
  }
  return (solidsG * fraction) / (1 - fraction);
}

export function stepDrying(input: {
  solventG: number;
  solidsG: number;
  processMinutes: number;
  temperatureC: number;
  targetMoisturePercent: number;
  mode: DryerMode;
}) {
  const dt = Math.max(0, input.processMinutes);
  const targetSolvent = solventForMoisture(input.targetMoisturePercent, input.solidsG);
  const k = dryingRatePerMin(input.temperatureC, input.mode);
  const solventG = roundTo(targetSolvent + (input.solventG - targetSolvent) * Math.exp(-k * dt), 4);
  return {
    solventG: Math.max(0, solventG),
    moisturePercent: moistureFromSolvent(Math.max(0, solventG), input.solidsG),
    ratePerMin: roundTo(k, 4),
    modelId: DRYING_MODEL.id,
  };
}
