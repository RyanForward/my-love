import { describe, expect, it, vi } from "vitest";

function chain(result: { data: unknown; error: { message: string } | null }) {
  return {
    ...result,
    select: vi.fn(() => chain(result)),
    eq: vi.fn(() => chain(result)),
    single: vi.fn(() => result),
    insert: vi.fn(() => chain(result)),
    delete: vi.fn(() => chain(result)),
  };
}

const mockFrom = vi.fn();
vi.mock("./supabase_client", () => ({
  getSupabase: () => ({ from: (...args: unknown[]) => mockFrom(...args) }),
}));

const row = {
  id: "a",
  titulo: "Seed",
  descricao: "",
  data: "2026-01-01",
  horario: null,
  imagem_url: null,
  latitude: null,
  longitude: null,
  tzone: null,
  criado_em: "2026-01-01T00:00:00.000Z",
};

describe("loadEventos", () => {
  it("mapeia as colunas do banco para o tipo Evento", async () => {
    mockFrom.mockReturnValue(chain({ data: [row], error: null }));
    const { loadEventos } = await import("./eventos_storage");
    const eventos = await loadEventos();
    expect(eventos).toEqual([
      {
        id: "a",
        titulo: "Seed",
        descricao: "",
        data: "2026-01-01",
        horario: null,
        imagemUrl: null,
        latitude: null,
        longitude: null,
        tzone: null,
        criadoEm: "2026-01-01T00:00:00.000Z",
      },
    ]);
  });

  it("lança erro quando a consulta falha", async () => {
    mockFrom.mockReturnValue(chain({ data: null, error: { message: "boom" } }));
    const { loadEventos } = await import("./eventos_storage");
    await expect(loadEventos()).rejects.toThrow("boom");
  });
});

describe("removeEventoById", () => {
  it("retorna true quando alguma linha foi removida", async () => {
    mockFrom.mockReturnValue(chain({ data: [row], error: null }));
    const { removeEventoById } = await import("./eventos_storage");
    expect(await removeEventoById("a")).toBe(true);
  });

  it("retorna false quando nenhuma linha foi removida", async () => {
    mockFrom.mockReturnValue(chain({ data: [], error: null }));
    const { removeEventoById } = await import("./eventos_storage");
    expect(await removeEventoById("x")).toBe(false);
  });
});
