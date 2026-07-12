import { getSupabase } from "./supabase_client";
import type { Evento } from "./eventos_types";

type EventoRow = {
  id: string;
  titulo: string;
  descricao: string;
  data: string;
  horario: string | null;
  imagem_url: string | null;
  latitude: number | null;
  longitude: number | null;
  tzone: number | null;
  criado_em: string;
};

export function rowToEvento(row: EventoRow): Evento {
  return {
    id: row.id,
    titulo: row.titulo,
    descricao: row.descricao,
    data: row.data,
    horario: row.horario,
    imagemUrl: row.imagem_url,
    latitude: row.latitude,
    longitude: row.longitude,
    tzone: row.tzone,
    criadoEm: row.criado_em,
  };
}

export async function loadEventos(): Promise<Evento[]> {
  const { data, error } = await getSupabase().from("eventos").select("*");
  if (error) throw new Error(error.message);
  return (data as EventoRow[]).map(rowToEvento);
}

export async function appendEvento(input: Omit<Evento, "id" | "criadoEm">): Promise<Evento> {
  const { data, error } = await getSupabase()
    .from("eventos")
    .insert({
      titulo: input.titulo,
      descricao: input.descricao,
      data: input.data,
      horario: input.horario,
      imagem_url: input.imagemUrl,
      latitude: input.latitude,
      longitude: input.longitude,
      tzone: input.tzone,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return rowToEvento(data as EventoRow);
}

export async function removeEventoById(id: string): Promise<boolean> {
  const { data, error } = await getSupabase().from("eventos").delete().eq("id", id).select();
  if (error) throw new Error(error.message);
  return (data as unknown[]).length > 0;
}
