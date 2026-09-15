import { supabase } from "@/lib/supabase";

const STORE_KEY = "useloma-store-v1";
const SESSION_KEY = "useloma-customer-session";

let initialized = false;
let originalSetItem: Storage["setItem"] | null = null;

async function saveStore(raw: string) {
  if (!supabase) return;
  try {
    const data = JSON.parse(raw) as Record<string, unknown>;
    await supabase.from("site_data").upsert({ id: 1, data, updated_at: new Date().toISOString() });
  } catch (error) {
    console.error("Supabase persistence save failed", error);
  }
}

export async function initializeSupabasePersistence() {
  if (initialized || typeof window === "undefined" || !supabase) return;
  initialized = true;
  originalSetItem = window.localStorage.setItem.bind(window.localStorage);

  const { data, error } = await supabase
    .from("site_data")
    .select("data")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    console.error("Supabase persistence load failed", error);
  } else if (data?.data && typeof data.data === "object") {
    originalSetItem(STORE_KEY, JSON.stringify(data.data));
  }

  const raw = window.localStorage.getItem(STORE_KEY);
  if (!data?.data && raw) await saveStore(raw);

  const storage = window.localStorage;
  const setItem = storage.setItem.bind(storage);
  storage.setItem = ((key: string, value: string) => {
    setItem(key, value);
    if (key === STORE_KEY) void saveStore(value);
  }) as Storage["setItem"];

  window.addEventListener("storage", (event) => {
    if (event.key === STORE_KEY && event.newValue) void saveStore(event.newValue);
  });
}

export function getPersistedSessionId() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(SESSION_KEY);
}
