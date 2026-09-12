import { useEffect, useState } from "react";

export type MediaRef = {
  id: string;
  kind: "image" | "video";
  name: string;
};

const DB_NAME = "useloma-media";
const STORE = "files";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const request = run(db.transaction(STORE, mode).objectStore(STORE));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      }),
  );
}

export async function saveMedia(file: File): Promise<MediaRef> {
  const id = `md${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
  await tx("readwrite", (s) => s.put(file, id));
  return {
    id,
    kind: file.type.startsWith("video") ? "video" : "image",
    name: file.name,
  };
}

export async function getMedia(id: string): Promise<Blob | undefined> {
  try {
    return await tx<Blob | undefined>("readonly", (s) => s.get(id));
  } catch {
    return undefined;
  }
}

export async function deleteMedia(id: string): Promise<void> {
  try {
    await tx("readwrite", (s) => s.delete(id));
  } catch {
    /* ignore */
  }
}

/** Resolves stored media ids into temporary object URLs for rendering. */
export function useMediaUrls(media: MediaRef[] | undefined): Record<string, string> {
  const key = (media ?? []).map((m) => m.id).join(",");
  const [urls, setUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    if (typeof window === "undefined" || !key) {
      setUrls({});
      return;
    }
    let alive = true;
    const created: string[] = [];
    Promise.all(
      key.split(",").map(async (id) => {
        const blob = await getMedia(id);
        return [id, blob] as const;
      }),
    ).then((entries) => {
      if (!alive) return;
      const map: Record<string, string> = {};
      for (const [id, blob] of entries) {
        if (!blob) continue;
        const url = URL.createObjectURL(blob);
        created.push(url);
        map[id] = url;
      }
      setUrls(map);
    });

    return () => {
      alive = false;
      created.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [key]);

  return urls;
}
