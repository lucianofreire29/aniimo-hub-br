"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export const TIER_ORDER = ["S", "A", "B", "C", "D"] as const;
export type TierKey = (typeof TIER_ORDER)[number];

const STORAGE_KEY = "aniimo-brasil:tier-list:v1";
const TIER_LIST_EVENT = "aniimo-brasil:tier-list-alterada";

export type LocalTierList = {
  name: string;
  placements: Record<string, TierKey>;
};

const DEFAULT_TIER_LIST: LocalTierList = {
  name: "Minha Tier List",
  placements: {},
};

function isTier(value: unknown): value is TierKey {
  return typeof value === "string" && TIER_ORDER.includes(value as TierKey);
}

function sanitizeTierList(value: unknown): LocalTierList {
  if (!value || typeof value !== "object") return DEFAULT_TIER_LIST;

  const source = value as { name?: unknown; placements?: unknown };
  const placements: Record<string, TierKey> = {};

  if (source.placements && typeof source.placements === "object") {
    Object.entries(source.placements as Record<string, unknown>).forEach(([key, tier]) => {
      const id = Number(key);
      if (Number.isInteger(id) && id > 0 && isTier(tier)) {
        placements[String(id)] = tier;
      }
    });
  }

  return {
    name:
      typeof source.name === "string" && source.name.trim()
        ? source.name.slice(0, 80)
        : DEFAULT_TIER_LIST.name,
    placements,
  };
}

export function readTierList(): LocalTierList {
  if (typeof window === "undefined") return DEFAULT_TIER_LIST;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_TIER_LIST;
    return sanitizeTierList(JSON.parse(raw));
  } catch {
    return DEFAULT_TIER_LIST;
  }
}

function persistTierList(value: LocalTierList) {
  if (typeof window === "undefined") return;

  const safeValue = sanitizeTierList(value);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(safeValue));
  window.dispatchEvent(new Event(TIER_LIST_EVENT));
}

export function useLocalTierList() {
  const [tierList, setTierList] = useState<LocalTierList>(DEFAULT_TIER_LIST);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const sync = () => {
      setTierList(readTierList());
      setIsReady(true);
    };

    sync();
    window.addEventListener("storage", sync);
    window.addEventListener(TIER_LIST_EVENT, sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(TIER_LIST_EVENT, sync);
    };
  }, []);

  const rankedIds = useMemo(
    () => new Set(Object.keys(tierList.placements).map((key) => Number(key))),
    [tierList.placements],
  );

  const setName = useCallback((name: string) => {
    setTierList((current) => {
      const next = { ...current, name: name.slice(0, 80) };
      persistTierList(next);
      return next;
    });
  }, []);

  const setTier = useCallback((formaId: number, tier: TierKey | null) => {
    setTierList((current) => {
      const placements = { ...current.placements };
      const key = String(formaId);

      if (tier) placements[key] = tier;
      else delete placements[key];

      const next = { ...current, placements };
      persistTierList(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    const next = { ...DEFAULT_TIER_LIST, placements: {} };
    persistTierList(next);
    setTierList(next);
  }, []);

  return { tierList, rankedIds, isReady, setName, setTier, clear };
}
