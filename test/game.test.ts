import { describe, expect, it } from "vitest";

import {
  applyPostVictoryChoice,
  createNewRun,
  HARD_DIFFICULTY_DEFAULTS,
  runFinalMissionStep,
  simulateDay
} from "../src/systems/game.js";

describe("blaster sandbox adventure core simulation", () => {
  it("starts runs with required defaults", () => {
    const state = createNewRun("seed-alpha");
    expect(state.resources.money).toBe(100);
    expect(state.loadout.combatBlaster.kind).toBe("combat");
    expect(state.loadout.utilityBlaster.kind).toBe("utility");
    expect(state.city.shops).toHaveLength(1);
    expect(state.city.shops[0]?.inventory.map((item) => item.kind).sort()).toEqual([
      "food",
      "water",
      "weapon"
    ]);
  });

  it("creates deterministic seeded cities", () => {
    const first = createNewRun("same-seed");
    const second = createNewRun("same-seed");
    expect(first.city.buildings).toEqual(second.city.buildings);
    expect(first.city.usedPlots).toBeLessThanOrEqual(first.city.maxPlots);
  });

  it("simulates daily attacks with helicopter escape", () => {
    const state = createNewRun("attack-seed");
    const next = simulateDay(state);
    expect(next.latestAttack).toBeDefined();
    expect(next.latestAttack?.helicopterEscaped).toBe(true);
    expect(next.city.damage).toBeGreaterThan(0);
  });

  it("fails from resource collapse under hard defaults", () => {
    let state = createNewRun("hard-seed");
    for (let i = 0; i < 8; i += 1) {
      state = simulateDay(state, HARD_DIFFICULTY_DEFAULTS);
      if (state.status === "failed") {
        break;
      }
    }
    expect(state.status).toBe("failed");
    expect(state.failReason).toBe("resource_collapse");
  });

  it("fails when city damage reaches threshold", () => {
    const state = createNewRun("city-fail-seed");
    state.city.damage = HARD_DIFFICULTY_DEFAULTS.cityDamageFailThreshold;
    const next = simulateDay(state, HARD_DIFFICULTY_DEFAULTS);
    expect(next.status).toBe("failed");
    expect(next.failReason).toBe("city_destroyed");
  });

  it("reaches final mission and supports post-victory choices", () => {
    let state = createNewRun("mission-seed");
    state.plane.phase = "ready_to_launch";
    state = runFinalMissionStep(state);
    state = runFinalMissionStep(state);
    state = runFinalMissionStep(state);
    expect(state.status).toBe("city_saved");

    const continued = applyPostVictoryChoice(state, "continue_sandbox");
    expect(continued.status).toBe("active");

    const restarted = applyPostVictoryChoice(state, "restart_run");
    expect(restarted.status).toBe("active");
    expect(restarted.day).toBe(1);
  });
});
