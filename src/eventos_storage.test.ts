import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Evento } from "./eventos_types";
import { parseStoredEventos, removeEventoById } from "./eventos_storage";

const seed: Evento[] = [
  {
    id: "a",
    titulo: "Seed",
    descricao: "",
    data: "2026-01-01",
    imagemUrl: null,
    latitude: null,
    longitude: null,
    criadoEm: "2026-01-01T00:00:00.000Z",
  },
];

describe("parseStoredEventos", () => {
  it("falls back when invalid", () => {
    expect(parseStoredEventos(null, seed)).toEqual(seed);
    expect(parseStoredEventos("x", seed)).toEqual(seed);
  });
});

describe("removeEventoById", () => {
  const store: Record<string, string> = {};

  beforeEach(() => {
    Object.keys(store).forEach((k) => delete store[k]);
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => {
        store[k] = v;
      },
    });
  });

  it("remove um id", () => {
    store["love:eventos:v1"] = JSON.stringify({
      eventos: [
        { ...seed[0], id: "x" },
        { ...seed[0], id: "y", titulo: "B" },
      ],
    });
    expect(removeEventoById("x")).toBe(true);
    expect(JSON.parse(store["love:eventos:v1"]).eventos).toHaveLength(1);
  });
});
