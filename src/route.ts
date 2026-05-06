export type AppRoute = "home" | "eventos" | "eventos_cadastro";

export function routeFromHash(hash: string): AppRoute {
  const raw = hash.startsWith("#") ? hash.slice(1) : hash;
  const path = raw.replace(/^\/+|\/+$/g, "").toLowerCase();
  if (path === "eventos/cadastro") return "eventos_cadastro";
  if (path === "eventos") return "eventos";
  return "home";
}
