import type { BuildingType, GameState, ShopItemKind } from "../domain/models.js";

export type ActiveCommand =
  | "advance_day"
  | "mission_step"
  | "status"
  | "city_view"
  | "shop_view"
  | "shop_buy"
  | "quit";
export type VictoryCommand = "continue_sandbox" | "restart_run" | "quit";
export type FailedCommand = "restart_run" | "quit";

export function formatStateLines(state: GameState): string[] {
  return [
    `Day: ${state.day}`,
    `Resources: $${state.resources.money}, food=${state.resources.food}, water=${state.resources.water}`,
    `Inventory: spare weapons=${state.inventory.spareWeapons}`,
    `City damage: ${state.city.damage}`,
    `Plane phase: ${state.plane.phase} (part points=${state.plane.partPoints})`,
    `Run status: ${state.status}${state.failReason ? ` (${state.failReason})` : ""}`
  ];
}

export function formatCitySummaryLines(state: GameState): string[] {
  const counts = new Map<BuildingType, number>();
  for (const building of state.city.buildings) {
    counts.set(building.type, (counts.get(building.type) ?? 0) + 1);
  }
  const orderedTypes: BuildingType[] = [
    "house",
    "skyscraper",
    "storage",
    "school",
    "amusement_park"
  ];
  const countLabel = orderedTypes
    .map((type) => `${type}=${counts.get(type) ?? 0}`)
    .join(", ");
  return [
    `City plots used: ${state.city.usedPlots}/${state.city.maxPlots}`,
    `Buildings: ${countLabel}`,
    `Shop count: ${state.city.shops.length}`
  ];
}

export function formatShopLines(state: GameState): string[] {
  const shop = state.city.shops[0];
  if (!shop) {
    return ["No shop available."];
  }
  const sorted = [...shop.inventory].sort((a, b) => a.kind.localeCompare(b.kind));
  return sorted.map(
    (item) => `- ${item.kind}: stock=${item.stock}, price=$${item.price} each`
  );
}

export interface BuyCommand {
  kind: ShopItemKind;
  quantity: number;
}

export function parseBuyCommand(input: string): BuyCommand | undefined {
  const normalized = input.trim().toLowerCase();
  const parts = normalized.split(/\s+/);
  if (parts[0] !== "buy" || parts.length < 2) {
    return undefined;
  }
  const kind = parts[1];
  if (kind !== "food" && kind !== "water" && kind !== "weapon") {
    return undefined;
  }
  const quantityText = parts[2] ?? "1";
  const quantity = Number.parseInt(quantityText, 10);
  if (!Number.isFinite(quantity) || quantity <= 0) {
    return undefined;
  }
  return { kind, quantity };
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
    case "c":
    case "city":
    case "map":
      return "city_view";
    case "shop":
      return "shop_view";
    case "b":
    case "buy":
      return "shop_buy";
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
