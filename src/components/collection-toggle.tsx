"use client";

import { useCollection } from "@/lib/collection-storage";

type CollectionToggleProps = {
  formaId: number;
  formaNome: string;
  className?: string;
};

export function CollectionToggle({ formaId, formaNome, className = "" }: CollectionToggleProps) {
  const { has, isReady, toggle } = useCollection();
  const collected = has(formaId);

  return (
    <button
      type="button"
      disabled={!isReady}
      onClick={() => toggle(formaId)}
      className={`rounded-xl border px-4 py-3 text-sm font-bold transition disabled:cursor-wait disabled:opacity-60 ${
        collected
          ? "border-[var(--accent)]/40 bg-[var(--accent)]/10 text-[var(--accent)]"
          : "border-white/10 bg-white/[0.03] text-slate-200 hover:border-[var(--accent)]/40 hover:text-[var(--accent)]"
      } ${className}`}
      aria-pressed={collected}
    >
      {!isReady
        ? "Carregando coleção..."
        : collected
          ? `✓ ${formaNome} na coleção`
          : `+ Adicionar ${formaNome}`}
    </button>
  );
}
