import { SeededRandom } from "../core/random.js";
import type { DifficultyTuning, GameState } from "../domain/models.js";
import { resolveDailyAttack } from "./attack.js";
import { generateCity } from "./city.js";
import { advancePlaneProgress, progressFinalMission } from "./progression.js";
import { generateGuaranteedShop } from "./shop.js";

export const HARD_DIFFICULTY_DEFAULTS: DifficultyTuning = {
  cityDamageFailThreshold: 80,
  minFoodWaterCritical: 0,
  dailyLivingCost: 26,
  dailyIncome: 14,
  dailyPartPointsGain: 2
};

export function createNewRun(seed: string, cityMaxPlots = 40): GameState {
  const rng = new SeededRandom(seed);
  const city = generateCity(seed, cityMaxPlots, rng);
  city.shops.push(generateGuaranteedShop(seed, rng));

  return {
    day: 1,
    city,
    resources: {
      money: 100,
      food: 4,
      water: 4
    },
    loadout: {
      combatBlaster: {
        kind: "combat",
        durability: 100
      },
      utilityBlaster: {
        kind: "utility",
        durability: 100
      }
    },
    plane: {
      phase: "collecting_parts",
      partPoints: 0
    },
    status: "active"
  };
}

export function simulateDay(state: GameState, tuning = HARD_DIFFICULTY_DEFAULTS): GameState {
  if (state.status !== "active") {
    return state;
  }

  const rng = new SeededRandom(`${state.city.seed}-${state.day}`);
  const attack = resolveDailyAttack(state.day, state.city, rng);

  state.resources.money += tuning.dailyIncome - tuning.dailyLivingCost;
  state.resources.food -= 1;
  state.resources.water -= 1;
  state.latestAttack = attack;
  state.plane = advancePlaneProgress(state.plane, tuning.dailyPartPointsGain);

  if (
    state.resources.money < 0 ||
    state.resources.food <= tuning.minFoodWaterCritical ||
    state.resources.water <= tuning.minFoodWaterCritical
  ) {
    state.status = "failed";
    state.failReason = "resource_collapse";
  } else if (state.city.damage >= tuning.cityDamageFailThreshold) {
    state.status = "failed";
    state.failReason = "city_destroyed";
  }

  state.day += 1;
  return state;
}

export type PostVictoryChoice = "continue_sandbox" | "restart_run";

export function runFinalMissionStep(state: GameState): GameState {
  if (state.status !== "active") {
    return state;
  }
  state.plane = progressFinalMission(state.plane);
  if (state.plane.phase === "base_destroyed") {
    state.status = "city_saved";
  }
  return state;
}

export function applyPostVictoryChoice(
  state: GameState,
  choice: PostVictoryChoice
): GameState {
  if (state.status !== "city_saved") {
    return state;
  }
  if (choice === "continue_sandbox") {
    return {
      ...state,
      status: "active"
    };
  }
  return createNewRun(`${state.city.seed}-restart`);
}
