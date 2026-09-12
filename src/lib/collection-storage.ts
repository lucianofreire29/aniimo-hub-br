"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "aniimo-brasil:colecao:v1";
const COLLECTION_EVENT = "aniimo-brasil:colecao-alterada";

function sanitizeCollection(value: unknown): number[] {
  if (!Array.isArray(value)) return [];

  return Array.from(
    new Set(
      value.filter(
        (item): item is number => typeof item === "number" && Number.isInteger(item) && item > 0,
      ),
    ),
  );
}

export function readCollection(): number[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return sanitizeCollection(JSON.parse(raw));
  } catch {
    return [];
  }
}

function persistCollection(ids: number[]) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitizeCollection(ids)));
  window.dispatchEvent(new Event(COLLECTION_EVENT));
}

export function useCollection() {
  const [ids, setIds] = useState<number[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const sync = () => {
      setIds(readCollection());
      setIsReady(true);
    };

    sync();
    window.addEventListener("storage", sync);
    window.addEventListener(COLLECTION_EVENT, sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(COLLECTION_EVENT, sync);
    };
  }, []);

  const idSet = useMemo(() => new Set(ids), [ids]);

  const has = useCallback((formaId: number) => idSet.has(formaId), [idSet]);

  const toggle = useCallback((formaId: number) => {
    const current = readCollection();
    const exists = current.includes(formaId);
    const next = exists ? current.filter((id) => id !== formaId) : [...current, formaId];

    persistCollection(next);
    setIds(next);

    return !exists;
  }, []);

  return { ids, isReady, has, toggle };
}
