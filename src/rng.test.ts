import { describe, expect, it } from "vitest";
import { pickDifferentIndex } from "./rng";

describe("pickDifferentIndex", () => {
  it("returns a valid index and avoids the last index when possible", () => {
    const rng = () => 0;
    expect(pickDifferentIndex(0, 5, rng)).toBe(1);
    expect(pickDifferentIndex(3, 5, rng)).toBe(0);
  });
});

