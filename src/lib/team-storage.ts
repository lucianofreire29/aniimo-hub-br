"use client";

import { useCallback, useEffect, useState } from "react";

export const TEAM_SLOT_COUNT = 4;

const STORAGE_KEY = "aniimo-brasil:time:v1";
const TEAM_EVENT = "aniimo-brasil:time-alterado";

export type LocalTeam = {
  name: string;
  slots: Array<number | null>;
};

const EMPTY_TEAM: LocalTeam = {
  name: "Meu time",
  slots: Array.from({ length: TEAM_SLOT_COUNT }, () => null),
};

function sanitizeTeam(value: unknown): LocalTeam {
  if (!value || typeof value !== "object") return EMPTY_TEAM;

  const candidate = value as Partial<LocalTeam>;
  const name = typeof candidate.name === "string" && candidate.name.trim()
    ? candidate.name.slice(0, 60)
    : EMPTY_TEAM.name;

  const slots = Array.from({ length: TEAM_SLOT_COUNT }, (_, index) => {
    const valueAtIndex = Array.isArray(candidate.slots) ? candidate.slots[index] : null;
    return typeof valueAtIndex === "number" && Number.isInteger(valueAtIndex) && valueAtIndex > 0
      ? valueAtIndex
      : null;
  });

  return { name, slots };
}

export function readLocalTeam(): LocalTeam {
  if (typeof window === "undefined") return EMPTY_TEAM;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_TEAM;
    return sanitizeTeam(JSON.parse(raw));
  } catch {
    return EMPTY_TEAM;
  }
}

function persistLocalTeam(team: LocalTeam) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitizeTeam(team)));
  window.dispatchEvent(new Event(TEAM_EVENT));
}

export function useLocalTeam() {
  const [team, setTeam] = useState<LocalTeam>(EMPTY_TEAM);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const sync = () => {
      setTeam(readLocalTeam());
      setIsReady(true);
    };

    sync();
    window.addEventListener("storage", sync);
    window.addEventListener(TEAM_EVENT, sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(TEAM_EVENT, sync);
    };
  }, []);

  const updateTeam = useCallback((updater: (current: LocalTeam) => LocalTeam) => {
    const current = readLocalTeam();
    const next = sanitizeTeam(updater(current));
    persistLocalTeam(next);
    setTeam(next);
  }, []);

  const setName = useCallback((name: string) => {
    updateTeam((current) => ({ ...current, name }));
  }, [updateTeam]);

  const setSlot = useCallback((index: number, formaId: number | null) => {
    if (index < 0 || index >= TEAM_SLOT_COUNT) return;

    updateTeam((current) => ({
      ...current,
      slots: current.slots.map((slot, slotIndex) => slotIndex === index ? formaId : slot),
    }));
  }, [updateTeam]);

  const clear = useCallback(() => {
    persistLocalTeam(EMPTY_TEAM);
    setTeam(EMPTY_TEAM);
  }, []);

  return { team, isReady, setName, setSlot, clear };
}
