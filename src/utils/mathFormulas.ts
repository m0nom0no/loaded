/**
 * LOADED Mathematical Engine
 * Strict Rule: Deterministic formulas only, no external AI calls.
 */

/**
 * Calculates Estimated 1RM using Brzycki Formula:
 * 1RM = Weight / (1.0278 - 0.0278 * Reps)
 */
export function calculate1RMBrzycki(weight: number, reps: number): number {
  if (weight <= 0 || reps <= 0) return 0;
  if (reps === 1) return weight;
  if (reps >= 37) return Math.round(weight * 1.5 * 10) / 10;
  
  const estimate = weight / (1.0278 - 0.0278 * reps);
  return Math.round(estimate * 10) / 10;
}

/**
 * Calculates Estimated 1RM using Epley Formula:
 * 1RM = Weight * (1 + 0.0333 * Reps)
 */
export function calculate1RMEpley(weight: number, reps: number): number {
  if (weight <= 0 || reps <= 0) return 0;
  if (reps === 1) return weight;
  
  const estimate = weight * (1 + 0.0333 * reps);
  return Math.round(estimate * 10) / 10;
}

/**
 * Smart Swap Weight Converter:
 * Converts 1RM from an original exercise to an alternative exercise using
 * biomechanical conversion ratios and Brzycki inverse math.
 */
export function calculateSuggestedWeight(
  original1RM: number,
  targetReps: number = 8,
  alternativeFactor: number = 1.0,
  originalFactor: number = 1.0
): number {
  if (original1RM <= 0) return 20;

  // Transfer 1RM based on biomechanical mechanical advantage ratio
  const ratio = alternativeFactor / originalFactor;
  const target1RM = original1RM * ratio;

  // Inverse Brzycki to solve for target weight at desired reps: Weight = 1RM * (1.0278 - 0.0278 * reps)
  const rawWeight = target1RM * (1.0278 - 0.0278 * targetReps);

  // Round to nearest 0.5 kg for gym realism
  const roundedWeight = Math.max(2.5, Math.round(rawWeight * 2) / 2);
  return roundedWeight;
}

/**
 * Calculates total working volume for a list of set records:
 * Volume = Sum(Weight * Reps) for non-warmup sets
 */
export function calculateTotalVolume(sets: Array<{ peso_kg: number; repeticiones: number; es_calentamiento?: boolean }>): number {
  return sets
    .filter(s => !s.es_calentamiento)
    .reduce((acc, curr) => acc + (curr.peso_kg * curr.repeticiones), 0);
}

/**
 * Calculates RPE from RIR:
 * RPE = 10 - RIR
 */
export function rirToRpe(rir: number): number {
  return Math.max(5, Math.min(10, 10 - rir));
}
