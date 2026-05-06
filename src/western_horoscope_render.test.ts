import { describe, expect, it } from "vitest";
import { formatLongitudePt, isWesternHoroscopePayload } from "./western_horoscope_render";

describe("formatLongitudePt", () => {
  it("posição em Virgem para ascendente exemplo", () => {
    const s = formatLongitudePt(154.55883823616793);
    expect(s).toContain("Virgem");
    expect(s).toMatch(/4°/);
  });
});

describe("isWesternHoroscopePayload", () => {
  it("aceita planets e houses como arrays", () => {
    expect(isWesternHoroscopePayload({ planets: [], houses: [] })).toBe(true);
  });

  it("rejeita formato incompleto", () => {
    expect(isWesternHoroscopePayload({ planets: [] })).toBe(false);
    expect(isWesternHoroscopePayload(null)).toBe(false);
  });
});
