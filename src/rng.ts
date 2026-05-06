export function pickDifferentIndex(
  lastIndex: number | null,
  length: number,
  rng: () => number = Math.random,
): number {
  if (length <= 0) throw new Error("length must be > 0");
  if (length === 1) return 0;

  const base = Math.floor(rng() * (length - 1));
  const candidate = lastIndex == null ? base : base + (base >= lastIndex ? 1 : 0);
  return candidate;
}

