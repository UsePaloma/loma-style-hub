import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

export type MediaRef = {
  id: string;
  kind: "image" | "video";
  name: string;
};

const BUCKET = "product-media";

export async function saveMedia(file: File): Promise<MediaRef> {
  if (!supabase) throw new Error("Supabase não está configurado.");
  const id = `md${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
  const path = `products/${id}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  return { id: path, kind: file.type.startsWith("video") ? "video" : "image", name: file.name };
}

export async function getMedia(id: string): Promise<Blob | undefined> {
  if (!supabase) return undefined;
  try {
    const { data, error } = await supabase.storage.from(BUCKET).download(id);
    return error ? undefined : data ?? undefined;
  } catch {
    return undefined;
  }
}

export async function deleteMedia(id: string): Promise<void> {
  if (!supabase) return;
  try { await supabase.storage.from(BUCKET).remove([id]); } catch { /* ignore */ }
}

export function getMediaUrl(id: string): string {
  if (!supabase) return "";
  return supabase.storage.from(BUCKET).getPublicUrl(id).data.publicUrl;
}

export async function getSharableMediaUrl(id: string): Promise<string> {
  if (!supabase) return "";
  const { data } = await supabase.storage.from(BUCKET).createSignedUrl(id, 60 * 60 * 24 * 365 * 5);
  return data?.signedUrl ?? getMediaUrl(id);
}

export function useMediaUrls(media: MediaRef[] | undefined): Record<string, string> {
  const key = (media ?? []).map((m) => m.id).join(",");
  const [urls, setUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!key) { setUrls({}); return; }
    const map: Record<string, string> = {};
    key.split(",").forEach((id) => {
      const url = getMediaUrl(id);
      if (url) map[id] = url;
    });
    setUrls(map);
  }, [key]);

  return urls;
}
