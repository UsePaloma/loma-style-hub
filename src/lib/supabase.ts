import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  (import.meta.env["VITE_SUPABASE_URL"] as string | undefined) ??
  "https://ctvobtxsvxchhxbaffgx.supabase.co";
const supabaseKey =
  (import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] as string | undefined) ??
  (import.meta.env["VITE_SUPABASE_ANON_KEY"] as string | undefined) ??
  "sb_publishable_WKvSIWP9bt8_aG4d52utpA_CQkOKHjF";

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    flowType: "pkce",
    detectSessionInUrl: true,
  },
});

export const isSupabaseConfigured = Boolean(supabase);
