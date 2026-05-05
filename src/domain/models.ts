export type BuildingType =
  | "school"
  | "skyscraper"
  | "house"
  | "storage"
  | "amusement_park";

export interface BuildingSpec {
  type: BuildingType;
  footprintPlots: number;
  weight: number;
}

export interface Building {
  id: string;
  type: BuildingType;
  footprintPlots: number;
}

export type ShopItemKind = "food" | "water" | "weapon";

export interface ShopItemSpec {
  kind: ShopItemKind;
  weight: number;
  minPrice: number;
  maxPrice: number;
}

export interface ShopItem {
  kind: ShopItemKind;
  stock: number;
  price: number;
}

export interface Shop {
  id: string;
  inventory: ShopItem[];
}

export interface City {
  seed: string;
  maxPlots: number;
  usedPlots: number;
  buildings: Building[];
  shops: Shop[];
  damage: number;
}

export interface ResourceState {
  money: number;
  food: number;
  water: number;
}

export type BlasterKind = "combat" | "utility";

export interface Blaster {
  kind: BlasterKind;
  durability: number;
}

export type AttackTargetKind = "house" | "shop" | "school" | "storage";

export interface AttackEvent {
  day: number;
  villainCount: number;
  targetKind: AttackTargetKind;
  severity: number;
  helicopterEscaped: boolean;
}

export type PlanePhase =
  | "collecting_parts"
  | "assembling"
  | "ready_to_launch"
  | "tracking_villains"
  | "at_base"
  | "base_destroyed";

export interface PlaneProgress {
  phase: PlanePhase;
  partPoints: number;
}

export type RunStatus = "active" | "failed" | "city_saved";
export type FailReason = "resource_collapse" | "city_destroyed";

export interface DifficultyTuning {
  cityDamageFailThreshold: number;
  minFoodWaterCritical: number;
  dailyLivingCost: number;
  dailyIncome: number;
  dailyPartPointsGain: number;
}

export interface GameState {
  day: number;
  city: City;
  resources: ResourceState;
  loadout: {
    combatBlaster: Blaster;
    utilityBlaster: Blaster;
  };
  plane: PlaneProgress;
  latestAttack?: AttackEvent;
  status: RunStatus;
  failReason?: FailReason;
}
