import type { RandomSource } from "../core/random.js";
import { normalizeWeights } from "../core/weights.js";
import type { AttackEvent, AttackTargetKind, City } from "../domain/models.js";

const TARGET_WEIGHTS: ReadonlyArray<{ targetKind: AttackTargetKind; weight: number }> = [
  { targetKind: "shop", weight: 30 },
  { targetKind: "house", weight: 40 },
  { targetKind: "school", weight: 15 },
  { targetKind: "storage", weight: 15 }
];

export function resolveDailyAttack(day: number, city: City, rng: RandomSource): AttackEvent {
  const pool = normalizeWeights(TARGET_WEIGHTS);
  const target = rng.pickWeighted(pool, (entry) => entry.normalizedWeight);
  const villainCount = rng.nextInt(2, 6);
  const severity = rng.nextInt(6, 14);
  city.damage += severity;

  return {
    day,
    villainCount,
    targetKind: target.targetKind,
    severity,
    helicopterEscaped: true
  };
}
