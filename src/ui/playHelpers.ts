import type { GameState } from "../domain/models.js";

export type ActiveCommand = "advance_day" | "mission_step" | "status" | "quit";
export type VictoryCommand = "continue_sandbox" | "restart_run" | "quit";
export type FailedCommand = "restart_run" | "quit";

export function formatStateLines(state: GameState): string[] {
  return [
    `Day: ${state.day}`,
    `Resources: $${state.resources.money}, food=${state.resources.food}, water=${state.resources.water}`,
    `City damage: ${state.city.damage}`,
    `Plane phase: ${state.plane.phase} (part points=${state.plane.partPoints})`,
    `Run status: ${state.status}${state.failReason ? ` (${state.failReason})` : ""}`
  ];
}

export function canAttemptFinalMission(state: GameState): boolean {
  return (
    state.status === "active" &&
    (state.plane.phase === "ready_to_launch" ||
      state.plane.phase === "tracking_villains" ||
      state.plane.phase === "at_base")
  );
}

export function parseActiveCommand(input: string): ActiveCommand | undefined {
  const normalized = input.trim().toLowerCase();
  switch (normalized) {
    case "a":
    case "advance":
    case "advance_day":
    case "day":
      return "advance_day";
    case "m":
    case "mission":
    case "mission_step":
      return "mission_step";
    case "s":
    case "status":
      return "status";
    case "q":
    case "quit":
    case "exit":
      return "quit";
    default:
      return undefined;
  }
}

export function parseVictoryCommand(input: string): VictoryCommand | undefined {
  const normalized = input.trim().toLowerCase();
  switch (normalized) {
    case "c":
    case "continue":
    case "continue_sandbox":
      return "continue_sandbox";
    case "r":
    case "restart":
    case "restart_run":
      return "restart_run";
    case "q":
    case "quit":
    case "exit":
      return "quit";
    default:
      return undefined;
  }
}

export function parseFailedCommand(input: string): FailedCommand | undefined {
  const normalized = input.trim().toLowerCase();
  switch (normalized) {
    case "r":
    case "restart":
    case "restart_run":
      return "restart_run";
    case "q":
    case "quit":
    case "exit":
      return "quit";
    default:
      return undefined;
  }
}
