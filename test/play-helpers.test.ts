import { describe, expect, it } from "vitest";

import type { GameState } from "../src/domain/models.js";
import {
  canAttemptFinalMission,
  formatStateLines,
  parseActiveCommand,
  parseFailedCommand,
  parseVictoryCommand
} from "../src/ui/playHelpers.js";

function buildState(partial?: Partial<GameState>): GameState {
  return {
    day: 4,
    city: {
      seed: "seed",
      maxPlots: 40,
      usedPlots: 30,
      buildings: [],
      shops: [],
      damage: 22
    },
    resources: {
      money: 88,
      food: 2,
      water: 3
    },
    loadout: {
      combatBlaster: { kind: "combat", durability: 100 },
      utilityBlaster: { kind: "utility", durability: 100 }
    },
    plane: {
      phase: "collecting_parts",
      partPoints: 6
    },
    status: "active",
    ...partial
  };
}

describe("play helpers", () => {
  it("formats core turn state lines", () => {
    const lines = formatStateLines(buildState());
    expect(lines).toContain("Day: 4");
    expect(lines).toContain("Resources: $88, food=2, water=3");
    expect(lines).toContain("City damage: 22");
    expect(lines).toContain("Plane phase: collecting_parts (part points=6)");
    expect(lines).toContain("Run status: active");
  });

  it("detects final mission eligibility from plane phase", () => {
    expect(canAttemptFinalMission(buildState())).toBe(false);
    expect(
      canAttemptFinalMission(buildState({ plane: { phase: "ready_to_launch", partPoints: 20 } }))
    ).toBe(true);
    expect(
      canAttemptFinalMission(buildState({ plane: { phase: "tracking_villains", partPoints: 20 } }))
    ).toBe(true);
    expect(
      canAttemptFinalMission(buildState({ status: "failed", plane: { phase: "at_base", partPoints: 20 } }))
    ).toBe(false);
  });

  it("parses active mode commands", () => {
    expect(parseActiveCommand("a")).toBe("advance_day");
    expect(parseActiveCommand("mission")).toBe("mission_step");
    expect(parseActiveCommand("status")).toBe("status");
    expect(parseActiveCommand("exit")).toBe("quit");
    expect(parseActiveCommand("???")).toBeUndefined();
  });

  it("parses victory and failure commands", () => {
    expect(parseVictoryCommand("c")).toBe("continue_sandbox");
    expect(parseVictoryCommand("restart")).toBe("restart_run");
    expect(parseVictoryCommand("q")).toBe("quit");
    expect(parseVictoryCommand("invalid")).toBeUndefined();

    expect(parseFailedCommand("r")).toBe("restart_run");
    expect(parseFailedCommand("quit")).toBe("quit");
    expect(parseFailedCommand("invalid")).toBeUndefined();
  });
});
