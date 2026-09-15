import { supabase } from "@/lib/supabase";

const STORE_KEY = "useloma-store-v1";
const SESSION_KEY = "useloma-customer-session";
let initialized = false;
let syncing = false;
let pendingRaw: string | null = null;
let lastServerUpdatedAt = 0;
let suppressStorageSync = false;

async function readRemote() {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("site_data")
    .select("data, updated_at")
    .eq("id", 1)
    .maybeSingle();
  if (error) {
    console.error("Supabase persistence load failed", error);
    return null;
  }
  if (data?.updated_at) lastServerUpdatedAt = Date.parse(data.updated_at);
  return data?.data && typeof data.data === "object" ? data.data as Record<string, unknown> : null;
}

async function flushPending() {
  if (!supabase || syncing || !pendingRaw) return;
  syncing = true;
  const raw = pendingRaw;
  pendingRaw = null;
  try {
    const data = JSON.parse(raw) as Record<string, unknown>;
    const remote = await readRemote();
    const remoteIsNewer = Boolean(remote) && lastServerUpdatedAt > Date.now() - 1000;
    if (remoteIsNewer && JSON.stringify(remote) !== JSON.stringify(data)) {
      suppressStorageSync = true;
      window.localStorage.setItem(STORE_KEY, JSON.stringify(remote));
      suppressStorageSync = false;
    } else {
      const { data: saved, error } = await supabase
        .from("site_data")
        .upsert({ id: 1, data, updated_at: new Date().toISOString() }, { onConflict: "id" })
        .select("updated_at")
        .single();
      if (error) throw error;
      if (saved?.updated_at) lastServerUpdatedAt = Date.parse(saved.updated_at);
    }
  } catch (error) {
    console.error("Supabase persistence save failed", error);
    pendingRaw = raw;
  } finally {
    syncing = false;
    if (pendingRaw) void flushPending();
  }
}

export function persistStoreSnapshot(raw: string) {
  if (!supabase) return;
  pendingRaw = raw;
  void flushPending();
}

export async function initializeSupabasePersistence() {
  if (initialized || typeof window === "undefined" || !supabase) return;
  initialized = true;
  const nativeSetItem = window.localStorage.setItem.bind(window.localStorage);
  const remote = await readRemote();

  if (remote) {
    suppressStorageSync = true;
    nativeSetItem(STORE_KEY, JSON.stringify(remote));
    suppressStorageSync = false;
  } else {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (raw) persistStoreSnapshot(raw);
  }

  const storage = window.localStorage;
  const setItem = storage.setItem.bind(storage);
  storage.setItem = ((key: string, value: string) => {
    setItem(key, value);
    if (key === STORE_KEY && !suppressStorageSync) persistStoreSnapshot(value);
  }) as Storage["setItem"];

  window.addEventListener("storage", (event) => {
    if (event.key === STORE_KEY && event.newValue && !suppressStorageSync) persistStoreSnapshot(event.newValue);
  });
}

export function getPersistedSessionId() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(SESSION_KEY);
}
