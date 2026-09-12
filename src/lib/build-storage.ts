"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type LocalBuildRecord = {
  itemIds: number[];
  notes: string;
};

type LocalBuildState = Record<string, LocalBuildRecord>;

const STORAGE_KEY = "aniimo-brasil:builds:v1";
const BUILD_EVENT = "aniimo-brasil:builds-alteradas";

function sanitizeIds(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return Array.from(
    new Set(
      value.filter(
        (item): item is number => typeof item === "number" && Number.isInteger(item) && item > 0,
      ),
    ),
  );
}

function sanitizeState(value: unknown): LocalBuildState {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  const next: LocalBuildState = {};

  for (const [key, raw] of Object.entries(value)) {
    if (!/^\d+$/.test(key) || !raw || typeof raw !== "object" || Array.isArray(raw)) continue;

    const record = raw as { itemIds?: unknown; notes?: unknown };
    next[key] = {
      itemIds: sanitizeIds(record.itemIds),
      notes: typeof record.notes === "string" ? record.notes.slice(0, 5000) : "",
    };
  }

  return next;
}

function readState(): LocalBuildState {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? sanitizeState(JSON.parse(raw)) : {};
  } catch {
    return {};
  }
}

function persistState(state: LocalBuildState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitizeState(state)));
  window.dispatchEvent(new Event(BUILD_EVENT));
}

export function useLocalBuilds() {
  const [state, setState] = useState<LocalBuildState>({});
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const sync = () => {
      setState(readState());
      setIsReady(true);
    };

    sync();
    window.addEventListener("storage", sync);
    window.addEventListener(BUILD_EVENT, sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(BUILD_EVENT, sync);
    };
  }, []);

  const updateRecord = useCallback((formaId: number, updater: (current: LocalBuildRecord) => LocalBuildRecord) => {
    const currentState = readState();
    const key = String(formaId);
    const current = currentState[key] ?? { itemIds: [], notes: "" };
    const next = { ...currentState, [key]: updater(current) };
    persistState(next);
    setState(next);
  }, []);

  const setNotes = useCallback(
    (formaId: number, notes: string) => {
      updateRecord(formaId, (current) => ({ ...current, notes: notes.slice(0, 5000) }));
    },
    [updateRecord],
  );

  const toggleItem = useCallback(
    (formaId: number, itemId: number) => {
      updateRecord(formaId, (current) => ({
        ...current,
        itemIds: current.itemIds.includes(itemId)
          ? current.itemIds.filter((id) => id !== itemId)
          : [...current.itemIds, itemId],
      }));
    },
    [updateRecord],
  );

  const clearBuild = useCallback((formaId: number) => {
    const currentState = readState();
    const next = { ...currentState };
    delete next[String(formaId)];
    persistState(next);
    setState(next);
  }, []);

  const getBuild = useCallback(
    (formaId: number): LocalBuildRecord => state[String(formaId)] ?? { itemIds: [], notes: "" },
    [state],
  );

  const savedCount = useMemo(
    () =>
      Object.values(state).filter((record) => record.itemIds.length > 0 || record.notes.trim().length > 0).length,
    [state],
  );

  return { isReady, getBuild, setNotes, toggleItem, clearBuild, savedCount };
}
