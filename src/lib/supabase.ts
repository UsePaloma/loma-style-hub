import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  (import.meta.env["VITE_SUPABASE_URL"] as string | undefined) ??
  (typeof process !== "undefined" ? process.env?.["SUPABASE_URL"] : undefined);
const supabaseKey =
  (import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] as string | undefined) ??
  (import.meta.env["VITE_SUPABASE_ANON_KEY"] as string | undefined) ??
  (typeof process !== "undefined" ? process.env?.["SUPABASE_PUBLISHABLE_KEY"] : undefined);

if (!supabaseUrl || !supabaseKey) {
  const missing = [
    ...(!supabaseUrl ? ["VITE_SUPABASE_URL"] : []),
    ...(!supabaseKey ? ["VITE_SUPABASE_PUBLISHABLE_KEY"] : []),
  ];
  throw new Error(
    `Variáveis de ambiente do Supabase ausentes: ${missing.join(", ")}. Conecte o Supabase no Lovable Cloud.`,
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    flowType: "pkce",
    detectSessionInUrl: true,
  },
});

export const isSupabaseConfigured = Boolean(supabase);
