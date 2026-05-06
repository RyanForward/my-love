import { describe, expect, it } from "vitest";
import { pickDifferentIndex, shuffle } from "./rng";

describe("pickDifferentIndex", () => {
  it("returns a valid index and avoids the last index when possible", () => {
    const rng = () => 0;
    expect(pickDifferentIndex(0, 5, rng)).toBe(1);
    expect(pickDifferentIndex(3, 5, rng)).toBe(0);
  });
});

describe("shuffle", () => {
  it("is deterministic with a fixed rng and preserves multiset", () => {
    expect(shuffle([1, 2, 3], () => 0)).toEqual([2, 3, 1]);
    const original = [1, 2, 3, 4, 5];
    const s = shuffle(original);
    expect([...s].sort((x, y) => x - y)).toEqual(original);
    expect(original).toEqual([1, 2, 3, 4, 5]);
  });
});

