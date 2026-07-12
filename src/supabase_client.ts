import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | undefined;

export function getSupabase(): SupabaseClient {
  if (client) return client;

  const url = String(import.meta.env.VITE_SUPABASE_URL ?? "").trim();
  const anonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY ?? "").trim();
  if (!url || !anonKey) {
    throw new Error(
      "Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY (painel Supabase: Project Settings > API).",
    );
  }

  client = createClient(url, anonKey);
  return client;
}
