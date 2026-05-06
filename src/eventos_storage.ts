import seedFile from "./eventos_store.json";
import type { Evento } from "./eventos_types";

const STORAGE_KEY = "love:eventos:v1";
const seedEventos = (seedFile as { eventos: Evento[] }).eventos;

export function parseStoredEventos(raw: string | null, seed: Evento[]): Evento[] {
  if (!raw) return [...seed];
  try {
    const parsed = JSON.parse(raw) as { eventos?: unknown };
    if (!Array.isArray(parsed.eventos)) return [...seed];
    return parsed.eventos as Evento[];
  } catch {
    return [...seed];
  }
}

export function loadEventos(): Evento[] {
  return parseStoredEventos(localStorage.getItem(STORAGE_KEY), seedEventos).map((e) => {
    const ex = e as Evento & { horario?: unknown; tzone?: unknown };
    const horario =
      typeof ex.horario === "string" && ex.horario.trim() !== ""
        ? ex.horario.trim()
        : null;
    const tz = ex.tzone;
    const tzone =
      typeof tz === "number" && Number.isFinite(tz) ? tz : null;
    return { ...(e as Evento), horario, tzone };
  });
}

export function persistEventos(eventos: Evento[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ eventos }));
}

export function appendEvento(input: Omit<Evento, "id" | "criadoEm">): Evento {
  const novo: Evento = {
    ...input,
    id: crypto.randomUUID(),
    criadoEm: new Date().toISOString(),
  };
  persistEventos([...loadEventos(), novo]);
  return novo;
}

export function removeEventoById(id: string): boolean {
  const list = loadEventos();
  const next = list.filter((e) => e.id !== id);
  if (next.length === list.length) return false;
  persistEventos(next);
  return true;
}
