"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { BuildPotential, BuildStatKey } from "@/types/build";

type LocalBuildRecord = {
  carriedItemId: string | null;
  aniimoLevel: number;
  enhancement: 0 | 10 | 20;
  potential: BuildPotential;
  notes: string;
};

type LocalBuildState = Record<string, LocalBuildRecord>;

const STORAGE_KEY = "aniimo-brasil:builds:v2";
const BUILD_EVENT = "aniimo-brasil:builds-alteradas";
const EMPTY_POTENTIAL: BuildPotential = {
  hp: 0,
  ataque: 0,
  pDef: 0,
  mDef: 0,
  break: 0,
  regen: 0,
};
const EMPTY_BUILD: LocalBuildRecord = {
  carriedItemId: null,
  aniimoLevel: 70,
  enhancement: 0,
  potential: EMPTY_POTENTIAL,
  notes: "",
};

function sanitizeLevel(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) return 70;
  return Math.min(100, Math.max(1, Math.round(value)));
}

function sanitizeEnhancement(value: unknown): 0 | 10 | 20 {
  return value === 20 ? 20 : value === 10 ? 10 : 0;
}

function sanitizePotentialValue(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0;
  return Math.min(20, Math.max(0, Math.round(value)));
}

function sanitizePotential(value: unknown): BuildPotential {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { ...EMPTY_POTENTIAL };
  const raw = value as Partial<Record<BuildStatKey, unknown>>;

  return {
    hp: sanitizePotentialValue(raw.hp),
    ataque: sanitizePotentialValue(raw.ataque),
    pDef: sanitizePotentialValue(raw.pDef),
    mDef: sanitizePotentialValue(raw.mDef),
    break: sanitizePotentialValue(raw.break),
    regen: sanitizePotentialValue(raw.regen),
  };
}

function sanitizeState(value: unknown): LocalBuildState {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  const next: LocalBuildState = {};

  for (const [key, raw] of Object.entries(value)) {
    if (!/^\d+$/.test(key) || !raw || typeof raw !== "object" || Array.isArray(raw)) continue;

    const record = raw as {
      carriedItemId?: unknown;
      aniimoLevel?: unknown;
      enhancement?: unknown;
      potential?: unknown;
      notes?: unknown;
    };

    next[key] = {
      carriedItemId: typeof record.carriedItemId === "string" ? record.carriedItemId : null,
      aniimoLevel: sanitizeLevel(record.aniimoLevel),
      enhancement: sanitizeEnhancement(record.enhancement),
      potential: sanitizePotential(record.potential),
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

  const updateRecord = useCallback(
    (formaId: number, updater: (current: LocalBuildRecord) => LocalBuildRecord) => {
      const currentState = readState();
      const key = String(formaId);
      const current = currentState[key] ?? { ...EMPTY_BUILD, potential: { ...EMPTY_POTENTIAL } };
      const next = { ...currentState, [key]: updater(current) };
      persistState(next);
      setState(next);
    },
    [],
  );

  const setCarriedItem = useCallback(
    (formaId: number, carriedItemId: string | null) => {
      updateRecord(formaId, (current) => ({ ...current, carriedItemId }));
    },
    [updateRecord],
  );

  const setAniimoLevel = useCallback(
    (formaId: number, aniimoLevel: number) => {
      updateRecord(formaId, (current) => ({ ...current, aniimoLevel: sanitizeLevel(aniimoLevel) }));
    },
    [updateRecord],
  );

  const setEnhancement = useCallback(
    (formaId: number, enhancement: 0 | 10 | 20) => {
      updateRecord(formaId, (current) => ({ ...current, enhancement }));
    },
    [updateRecord],
  );

  const setPotential = useCallback(
    (formaId: number, stat: BuildStatKey, value: number) => {
      updateRecord(formaId, (current) => ({
        ...current,
        potential: {
          ...current.potential,
          [stat]: sanitizePotentialValue(value),
        },
      }));
    },
    [updateRecord],
  );

  const setNotes = useCallback(
    (formaId: number, notes: string) => {
      updateRecord(formaId, (current) => ({ ...current, notes: notes.slice(0, 5000) }));
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
    (formaId: number): LocalBuildRecord => {
      const record = state[String(formaId)];
      return record ?? { ...EMPTY_BUILD, potential: { ...EMPTY_POTENTIAL } };
    },
    [state],
  );

  const savedCount = useMemo(
    () =>
      Object.values(state).filter(
        (record) =>
          record.carriedItemId ||
          record.notes.trim().length > 0 ||
          Object.values(record.potential).some((value) => value > 0),
      ).length,
    [state],
  );

  return {
    isReady,
    getBuild,
    setCarriedItem,
    setAniimoLevel,
    setEnhancement,
    setPotential,
    setNotes,
    clearBuild,
    savedCount,
  };
}
