export interface RandomSource {
  nextFloat(): number;
  nextInt(minInclusive: number, maxInclusive: number): number;
  pickWeighted<T>(items: ReadonlyArray<T>, getWeight: (item: T) => number): T;
}

function hashSeed(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export class SeededRandom implements RandomSource {
  private state: number;

  public constructor(seed: string) {
    this.state = hashSeed(seed) || 1;
  }

  public nextFloat(): number {
    this.state += 0x6d2b79f5;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  public nextInt(minInclusive: number, maxInclusive: number): number {
    if (maxInclusive < minInclusive) {
      throw new Error("Invalid integer range");
    }
    const span = maxInclusive - minInclusive + 1;
    return minInclusive + Math.floor(this.nextFloat() * span);
  }

  public pickWeighted<T>(
    items: ReadonlyArray<T>,
    getWeight: (item: T) => number
  ): T {
    if (items.length === 0) {
      throw new Error("Cannot pick from empty list");
    }
    const total = items.reduce((acc, item) => acc + getWeight(item), 0);
    if (total <= 0) {
      throw new Error("Weighted list requires a positive total");
    }
    const roll = this.nextFloat() * total;
    let running = 0;
    for (const item of items) {
      running += getWeight(item);
      if (roll <= running) {
        return item;
      }
    }
    return items[items.length - 1] as T;
  }
}
