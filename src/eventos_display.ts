import type { Evento } from "./eventos_types";

export function formatEventDate(isoDate: string): string {
  const raw = isoDate.includes("T") ? isoDate : `${isoDate}T12:00:00`;
  const d = new Date(raw);
  return Number.isFinite(d.getTime()) ? d.toLocaleDateString("pt-BR") : isoDate;
}

export function formatEventDateTime(ev: Pick<Evento, "data" | "horario">): string {
  const datePart = formatEventDate(ev.data);
  if (!ev.horario?.trim()) return datePart;
  return `${datePart} · ${ev.horario.trim()}`;
}

export function eventDatetimeAttr(ev: Pick<Evento, "data" | "horario">): string {
  const h = ev.horario?.trim() || "12:00";
  const base = ev.data.includes("T") ? ev.data.split("T")[0]! : ev.data;
  return `${base}T${h}:00`;
}
