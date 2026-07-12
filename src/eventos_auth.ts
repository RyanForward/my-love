const SENHA = String(import.meta.env.VITE_EVENTOS_PASSWORD ?? "").trim();
const UNLOCK_KEY = "love:eventosUnlocked:v1";

export function senhaConfigurada(): boolean {
  return SENHA !== "";
}

export function isUnlocked(): boolean {
  return sessionStorage.getItem(UNLOCK_KEY) === "1";
}

export function unlock(): void {
  sessionStorage.setItem(UNLOCK_KEY, "1");
}

export function checarSenha(valor: string): boolean {
  return valor === SENHA;
}
