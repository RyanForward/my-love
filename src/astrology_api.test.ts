import { describe, expect, it } from "vitest";
import {
  WESTERN_HOROSCOPE_ACCEPT_LANGUAGE,
  eventoToWesternHoroscopePayload,
  parseEventDateParts,
  parseHorarioParts,
  westernHoroscopeAuthHeader,
} from "./astrology_api";
import type { Evento } from "./eventos_types";

const baseEv = (): Evento => ({
  id: "1",
  titulo: "Teste",
  descricao: "",
  data: "1993-03-12",
  horario: "14:15",
  imagemUrl: null,
  latitude: 19.076,
  longitude: 72.8777,
  tzone: 5.5,
  criadoEm: "",
});

describe("westernHoroscopeAuthHeader", () => {
  it("gera Basic Auth", () => {
    const h = westernHoroscopeAuthHeader("600123", "ak-test");
    expect(h.startsWith("Basic ")).toBe(true);
    expect(atob(h.slice(6))).toBe("600123:ak-test");
  });
});

describe("WESTERN_HOROSCOPE_ACCEPT_LANGUAGE", () => {
  it("fixo em en (servidor não inclui locale pt-BR)", () => {
    expect(WESTERN_HOROSCOPE_ACCEPT_LANGUAGE).toBe("en");
  });
});

describe("parseEventDateParts", () => {
  it("parse YYYY-MM-DD", () => {
    expect(parseEventDateParts("1993-03-12")).toEqual({ year: 1993, month: 3, day: 12 });
    expect(parseEventDateParts("oops")).toBeNull();
  });
});

describe("parseHorarioParts", () => {
  it("defaults noon", () => {
    expect(parseHorarioParts(null)).toEqual({ hour: 12, min: 0 });
  });
  it("parse HH:mm", () => {
    expect(parseHorarioParts("14:15")).toEqual({ hour: 14, min: 15 });
  });
});

describe("eventoToWesternHoroscopePayload", () => {
  it("null sem coords", () => {
    const ev = { ...baseEv(), latitude: null };
    expect(eventoToWesternHoroscopePayload(ev)).toBeNull();
  });

  it("monta body da API", () => {
    const p = eventoToWesternHoroscopePayload(baseEv());
    expect(p).toMatchObject({
      day: 12,
      month: 3,
      year: 1993,
      hour: 14,
      min: 15,
      lat: 19.076,
      lon: 72.8777,
      tzone: 5.5,
      house_type: "placidus",
      is_asteroids: "false",
    });
  });
});
