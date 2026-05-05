export interface WeightedEntry {
  weight: number;
}

export function normalizeWeights<T extends WeightedEntry>(
  input: ReadonlyArray<T>
): Array<T & { normalizedWeight: number }> {
  const total = input.reduce((acc, item) => acc + item.weight, 0);
  if (total <= 0) {
    throw new Error("Weights must sum to more than zero");
  }
  return input.map((item) => ({
    ...item,
    normalizedWeight: item.weight / total
  }));
}
