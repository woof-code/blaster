import type { RandomSource } from "../core/random.js";
import { normalizeWeights } from "../core/weights.js";
import type { Building, BuildingSpec, City } from "../domain/models.js";

const BUILDING_SPECS: ReadonlyArray<BuildingSpec> = [
  { type: "school", footprintPlots: 4, weight: 16 },
  { type: "skyscraper", footprintPlots: 1, weight: 18 },
  { type: "house", footprintPlots: 1, weight: 34 },
  { type: "storage", footprintPlots: 3, weight: 20 },
  { type: "amusement_park", footprintPlots: 4, weight: 12 }
];

export function generateCity(seed: string, maxPlots: number, rng: RandomSource): City {
  const buildingPool = normalizeWeights(BUILDING_SPECS);
  const buildings: Building[] = [];
  let usedPlots = 0;
  let idCounter = 0;

  const requiredFootprint = BUILDING_SPECS.reduce(
    (acc, spec) => acc + spec.footprintPlots,
    0
  );
  if (maxPlots < requiredFootprint) {
    throw new Error(`maxPlots must be at least ${requiredFootprint}`);
  }

  // Place one of each required category first.
  for (const spec of BUILDING_SPECS) {
    buildings.push({
      id: `bld-${idCounter}`,
      type: spec.type,
      footprintPlots: spec.footprintPlots
    });
    idCounter += 1;
    usedPlots += spec.footprintPlots;
  }

  while (usedPlots < maxPlots) {
    const options = buildingPool.filter(
      (entry) => entry.footprintPlots + usedPlots <= maxPlots
    );
    if (options.length === 0) {
      break;
    }

    const next = rng.pickWeighted(options, (entry) => entry.normalizedWeight);
    buildings.push({
      id: `bld-${idCounter}`,
      type: next.type,
      footprintPlots: next.footprintPlots
    });
    idCounter += 1;
    usedPlots += next.footprintPlots;
  }

  return {
    seed,
    maxPlots,
    usedPlots,
    buildings,
    shops: [],
    damage: 0
  };
}
