import type { Evento } from "./eventos_types";

export type WesternHoroscopeRequest = {
  day: number;
  month: number;
  year: number;
  hour: number;
  min: number;
  lat: number;
  lon: number;
  tzone: number;
  house_type: string;
  is_asteroids: string;
};

export function browserTimezoneOffsetHours(): number {
  return -new Date().getTimezoneOffset() / 60;
}

export function parseEventDateParts(data: string): { day: number; month: number; year: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(data.trim());
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (!month || month > 12 || !day || day > 31) return null;
  return { day, month, year };
}

export function parseHorarioParts(horario: string | null): { hour: number; min: number } {
  if (!horario?.trim()) return { hour: 12, min: 0 };
  const [h, mi] = horario.trim().split(":");
  const hour = Number(h);
  const min = Number(mi ?? 0);
  if (
    !Number.isFinite(hour) ||
    hour < 0 ||
    hour > 23 ||
    !Number.isFinite(min) ||
    min < 0 ||
    min > 59
  ) {
    return { hour: 12, min: 0 };
  }
  return { hour, min };
}

/** Auth da doc oficial: Basic base64(userId:apiKey) — não usar só x-astrologyapi-key neste endpoint. */
export function westernHoroscopeAuthHeader(userId: string, apiKey: string): string {
  const pair = `${userId}:${apiKey}`;
  return `Basic ${typeof btoa !== "undefined" ? btoa(pair) : Buffer.from(pair, "utf-8").toString("base64")}`;
}

/** Lambda AstrologyAPI só empacota `../locale/en/msg`; pt-BR e lista q= quebram o require. */
export const WESTERN_HOROSCOPE_ACCEPT_LANGUAGE = "en";

export function eventoToWesternHoroscopePayload(ev: Evento): WesternHoroscopeRequest | null {
  if (ev.latitude == null || ev.longitude == null) return null;
  const d = parseEventDateParts(ev.data);
  if (!d) return null;
  const { hour, min } = parseHorarioParts(ev.horario);
  const tzone = ev.tzone ?? browserTimezoneOffsetHours();
  return {
    ...d,
    hour,
    min,
    lat: ev.latitude,
    lon: ev.longitude,
    tzone,
    house_type: "placidus",
    is_asteroids: "false",
  };
}

export async function fetchWesternHoroscope(payload: WesternHoroscopeRequest): Promise<unknown> {
  const url = import.meta.env.DEV
    ? "/api/astrology/v1/western_horoscope"
    : "https://json.astrologyapi.com/v1/western_horoscope";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "Accept-Language": WESTERN_HOROSCOPE_ACCEPT_LANGUAGE,
  };

  if (!import.meta.env.DEV) {
    const uid = String(import.meta.env.VITE_ASTROLOGY_USER_ID ?? "").trim();
    const key = String(import.meta.env.VITE_ASTROLOGY_API_KEY ?? "").trim();
    if (!uid || !key) {
      throw new Error(
        "Defina VITE_ASTROLOGY_USER_ID e VITE_ASTROLOGY_API_KEY (painel AstrologyAPI: User Id + Api Key).",
      );
    }
    headers.Authorization = westernHoroscopeAuthHeader(uid, key);
  }

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(text || `AstrologyAPI HTTP ${res.status}`);
  }
  let data: unknown;
  try {
    data = JSON.parse(text) as unknown;
  } catch {
    throw new Error(text);
  }
  if (
    data &&
    typeof data === "object" &&
    "status" in data &&
    (data as { status: unknown }).status === false
  ) {
    const msg = (data as { msg?: string }).msg ?? "Erro da API";
    throw new Error(msg);
  }
  return data;
}
