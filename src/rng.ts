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

export function shuffle<T>(items: readonly T[], rng: () => number = Math.random): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

