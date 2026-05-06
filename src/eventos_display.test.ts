import { describe, expect, it } from "vitest";
import { eventDatetimeAttr, formatEventDateTime } from "./eventos_display";

describe("formatEventDateTime", () => {
  it("mostra só data sem horário", () => {
    expect(formatEventDateTime({ data: "2026-03-15", horario: null })).toMatch(/15/);
    expect(formatEventDateTime({ data: "2026-03-15", horario: "" })).not.toContain("·");
  });

  it("concatena horário em HH:mm", () => {
    const s = formatEventDateTime({ data: "2026-03-15", horario: "18:45" });
    expect(s).toContain("18:45");
  });
});

describe("eventDatetimeAttr", () => {
  it("monta ISO local para time", () => {
    expect(eventDatetimeAttr({ data: "2026-01-02", horario: "09:05" })).toBe("2026-01-02T09:05:00");
  });
});
