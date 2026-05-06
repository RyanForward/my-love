import { describe, expect, it } from "vitest";
import { routeFromHash } from "./route";

describe("routeFromHash", () => {
  it("maps hashes", () => {
    expect(routeFromHash("")).toBe("home");
    expect(routeFromHash("#/")).toBe("home");
    expect(routeFromHash("#eventos")).toBe("eventos");
    expect(routeFromHash("#/eventos/cadastro")).toBe("eventos_cadastro");
  });
});
