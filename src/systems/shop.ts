import type { RandomSource } from "../core/random.js";
import { normalizeWeights } from "../core/weights.js";
import type { Shop, ShopItem, ShopItemSpec } from "../domain/models.js";

const SHOP_ITEM_SPECS: ReadonlyArray<ShopItemSpec> = [
  { kind: "food", weight: 38, minPrice: 7, maxPrice: 13 },
  { kind: "water", weight: 37, minPrice: 4, maxPrice: 9 },
  { kind: "weapon", weight: 25, minPrice: 35, maxPrice: 85 }
];

export function generateGuaranteedShop(seedTag: string, rng: RandomSource): Shop {
  const pool = normalizeWeights(SHOP_ITEM_SPECS);
  const inventoryByKind = new Map<ShopItem["kind"], ShopItem>();

  for (let i = 0; i < 9; i += 1) {
    const spec = rng.pickWeighted(pool, (item) => item.normalizedWeight);
    const stockIncrease = rng.nextInt(1, 4);
    const price = rng.nextInt(spec.minPrice, spec.maxPrice);
    const existing = inventoryByKind.get(spec.kind);
    if (existing) {
      existing.stock += stockIncrease;
    } else {
      inventoryByKind.set(spec.kind, {
        kind: spec.kind,
        stock: stockIncrease,
        price
      });
    }
  }

  // Always ensure required consumables/weapons categories exist.
  for (const spec of SHOP_ITEM_SPECS) {
    if (!inventoryByKind.has(spec.kind)) {
      inventoryByKind.set(spec.kind, {
        kind: spec.kind,
        stock: 1,
        price: rng.nextInt(spec.minPrice, spec.maxPrice)
      });
    }
  }

  return {
    id: `shop-${seedTag}`,
    inventory: [...inventoryByKind.values()]
  };
}
