import { describe, expect, it } from "vitest";

import type { GameState } from "../src/domain/models.js";
import {
  canAttemptFinalMission,
  formatCitySummaryLines,
  formatShopLines,
  formatStateLines,
  parseActiveCommand,
  parseBuyCommand,
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
      buildings: [
        { id: "b-1", type: "house", footprintPlots: 1 },
        { id: "b-2", type: "house", footprintPlots: 1 },
        { id: "b-3", type: "school", footprintPlots: 4 }
      ],
      shops: [
        {
          id: "shop-1",
          inventory: [
            { kind: "food", stock: 3, price: 9 },
            { kind: "water", stock: 2, price: 5 },
            { kind: "weapon", stock: 1, price: 60 }
          ]
        }
      ],
      damage: 22
    },
    resources: {
      money: 88,
      food: 2,
      water: 3
    },
    inventory: {
      spareWeapons: 1
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
    expect(lines).toContain("Inventory: spare weapons=1");
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
    expect(parseActiveCommand("city")).toBe("city_view");
    expect(parseActiveCommand("shop")).toBe("shop_view");
    expect(parseActiveCommand("b")).toBe("shop_buy");
    expect(parseActiveCommand("exit")).toBe("quit");
    expect(parseActiveCommand("???")).toBeUndefined();
  });

  it("formats city and shop summary lines", () => {
    const cityLines = formatCitySummaryLines(buildState());
    expect(cityLines).toContain("City plots used: 30/40");
    expect(cityLines.join(" ")).toContain("house=2");
    expect(cityLines.join(" ")).toContain("school=1");

    const shopLines = formatShopLines(buildState());
    expect(shopLines).toContain("- food: stock=3, price=$9 each");
    expect(shopLines).toContain("- water: stock=2, price=$5 each");
    expect(shopLines).toContain("- weapon: stock=1, price=$60 each");
  });

  it("parses buy commands", () => {
    expect(parseBuyCommand("buy food")).toEqual({ kind: "food", quantity: 1 });
    expect(parseBuyCommand("buy water 3")).toEqual({ kind: "water", quantity: 3 });
    expect(parseBuyCommand("buy weapon 2")).toEqual({ kind: "weapon", quantity: 2 });
    expect(parseBuyCommand("buy gem")).toBeUndefined();
    expect(parseBuyCommand("buy food 0")).toBeUndefined();
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
