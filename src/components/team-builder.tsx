"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { useCollection } from "@/lib/collection-storage";
import { TEAM_SLOT_COUNT, useLocalTeam } from "@/lib/team-storage";
import type { CollectionCatalogItem } from "@/types/collection";

type TeamBuilderProps = {
  items: CollectionCatalogItem[];
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function numeroFormatado(numero: number) {
  return `#${String(numero).padStart(3, "0")}`;
}

export function TeamBuilder({ items }: TeamBuilderProps) {
  const { team, isReady, setName, setSlot, clear } = useLocalTeam();
  const { ids: collectionIds, isReady: collectionReady } = useCollection();
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [onlyCollection, setOnlyCollection] = useState(false);

  const byId = useMemo(() => new Map(items.map((item) => [item.formaId, item])), [items]);
  const collectionSet = useMemo(() => new Set(collectionIds), [collectionIds]);

  const selectedItems = useMemo(
    () => team.slots.map((formaId) => (formaId ? byId.get(formaId) ?? null : null)),
    [byId, team.slots],
  );

  const occupied = selectedItems.filter(Boolean).length;

  const roleCounts = useMemo(() => {
    const counts = new Map<string, number>();
    selectedItems.forEach((item) => {
      if (!item) return;
      counts.set(item.funcao, (counts.get(item.funcao) ?? 0) + 1);
    });
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [selectedItems]);

  const elementCounts = useMemo(() => {
    const counts = new Map<string, number>();
    selectedItems.forEach((item) => {
      if (!item) return;
      item.elementos.forEach((elemento) => {
        counts.set(elemento, (counts.get(elemento) ?? 0) + 1);
      });
    });
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [selectedItems]);

  const pickerItems = useMemo(() => {
    const query = normalize(search.trim());

    return items.filter((item) => {
      if (onlyCollection && !collectionSet.has(item.formaId)) return false;
      if (!query) return true;

      const searchable = normalize(
        [
          item.aniimoNome,
          item.formaNome,
          item.funcao,
          item.estagio ?? "",
          ...item.elementos,
        ].join(" "),
      );

      return searchable.includes(query);
    });
  }, [collectionSet, items, onlyCollection, search]);

  function chooseItem(item: CollectionCatalogItem) {
    if (activeSlot === null) return;
    setSlot(activeSlot, item.formaId);
    setActiveSlot(null);
    setSearch("");
  }

  return (
    <div>
      <section className="rounded-3xl border border-white/10 bg-[var(--surface)] p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <label className="block w-full max-w-xl">
            <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
              Nome do time
            </span>
            <input
              value={team.name}
              onChange={(event) => setName(event.target.value)}
              maxLength={60}
              className="w-full rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3 text-lg font-black outline-none transition focus:border-[var(--accent)]/50"
              aria-label="Nome do time"
            />
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-[var(--muted)]">
              {isReady ? `${occupied}/${TEAM_SLOT_COUNT} slots ocupados` : "Carregando time..."}
            </span>
            <button
              type="button"
              onClick={() => {
                clear();
                setActiveSlot(null);
              }}
              className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-bold text-[var(--muted)] transition hover:border-white/20 hover:text-white"
            >
              Limpar time
            </button>
          </div>
        </div>

        <p className="mt-3 text-sm text-[var(--muted)]">
          As alterações são salvas automaticamente neste navegador.
        </p>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: TEAM_SLOT_COUNT }, (_, index) => {
          const item = selectedItems[index];

          return (
            <article
              key={index}
              className={`min-h-[28rem] overflow-hidden rounded-3xl border bg-[var(--surface)] ${
                item ? "border-[var(--accent)]/30" : "border-dashed border-white/10"
              }`}
            >
              {item ? (
                <>
                  <div className="relative flex h-56 items-center justify-center bg-white/[0.025] p-5">
                    {item.imagemUrl ? (
                      <Image
                        src={item.imagemUrl}
                        alt={`${item.aniimoNome} - ${item.formaNome}`}
                        width={280}
                        height={280}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <span className="text-sm font-semibold text-[var(--muted)]">Imagem em breve</span>
                    )}
                    <span className="absolute left-3 top-3 rounded-full border border-white/10 bg-[var(--background)]/80 px-3 py-1 text-xs font-black backdrop-blur">
                      Slot {index + 1}
                    </span>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <span className="font-black text-[var(--accent)]">
                        {numeroFormatado(item.aniimoNumero)}
                      </span>
                      <span className="font-semibold text-[var(--muted)]">{item.funcao}</span>
                    </div>
                    <h2 className="mt-2 text-2xl font-black">{item.aniimoNome}</h2>
                    <p className="mt-1 text-sm font-semibold text-[var(--muted)]">{item.formaNome}</p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {item.elementos.map((elemento) => (
                        <span
                          key={elemento}
                          className="rounded-full border border-white/10 px-2.5 py-1 text-xs font-semibold text-slate-300"
                        >
                          {elemento}
                        </span>
                      ))}
                    </div>

                    <div className="mt-5 grid gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveSlot(index)}
                        className="rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-black text-black transition hover:brightness-110"
                      >
                        Trocar Aniimo
                      </button>
                      <Link
                        href={`/aniimos/${item.aniimoSlug}#${item.formaSlug}`}
                        className="rounded-xl border border-white/10 px-4 py-3 text-center text-sm font-bold text-[var(--muted)] transition hover:border-white/20 hover:text-white"
                      >
                        Ver detalhes
                      </Link>
                      <button
                        type="button"
                        onClick={() => setSlot(index, null)}
                        className="rounded-xl px-4 py-2 text-sm font-semibold text-[var(--muted)] transition hover:text-white"
                      >
                        Remover do slot
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex min-h-[28rem] flex-col items-center justify-center p-6 text-center">
                  <span className="text-xs font-black uppercase tracking-[0.18em] text-[var(--muted)]">
                    Slot {index + 1}
                  </span>
                  <div className="mt-5 flex h-24 w-24 items-center justify-center rounded-full border border-dashed border-white/15 text-4xl text-[var(--muted)]">
                    +
                  </div>
                  <h2 className="mt-5 text-xl font-black">Slot vazio</h2>
                  <p className="mt-2 max-w-xs text-sm leading-6 text-[var(--muted)]">
                    Escolha uma forma cadastrada para começar a montar sua composição.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveSlot(index)}
                    className="mt-6 rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-black text-black transition hover:brightness-110"
                  >
                    Escolher Aniimo
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-2">
        <SummaryCard title="Distribuição de funções" emptyText="Adicione Aniimos para visualizar as funções do time.">
          {roleCounts.map(([role, count]) => (
            <SummaryPill key={role} label={role} count={count} />
          ))}
        </SummaryCard>

        <SummaryCard title="Distribuição elemental" emptyText="Adicione Aniimos para visualizar os elementos do time.">
          {elementCounts.map(([element, count]) => (
            <SummaryPill key={element} label={element} count={count} />
          ))}
        </SummaryCard>
      </section>

      {activeSlot !== null && (
        <section className="mt-8 rounded-3xl border border-[var(--accent)]/25 bg-[var(--surface)] p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent)]">
                Selecionando para o slot {activeSlot + 1}
              </p>
              <h2 className="mt-2 text-2xl font-black">Escolha uma forma</h2>
            </div>
            <button
              type="button"
              onClick={() => {
                setActiveSlot(null);
                setSearch("");
              }}
              className="self-start rounded-xl border border-white/10 px-4 py-2.5 text-sm font-bold text-[var(--muted)] transition hover:border-white/20 hover:text-white"
            >
              Fechar seleção
            </button>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar Aniimo, forma, função ou elemento..."
              className="w-full rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3 text-sm outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)]/50"
            />

            <label className="flex items-center gap-3 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-[var(--muted)]">
              <input
                type="checkbox"
                checked={onlyCollection}
                onChange={(event) => setOnlyCollection(event.target.checked)}
                disabled={!collectionReady}
                className="h-4 w-4"
              />
              Somente minha coleção
            </label>
          </div>

          <div className="mt-5 max-h-[34rem] overflow-y-auto pr-1">
            {pickerItems.length ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {pickerItems.map((item) => (
                  <button
                    key={item.formaId}
                    type="button"
                    onClick={() => chooseItem(item)}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-3 text-left transition hover:border-[var(--accent)]/40 hover:bg-white/[0.04]"
                  >
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-white/[0.03] p-1">
                      {item.imagemUrl ? (
                        <Image
                          src={item.imagemUrl}
                          alt={item.aniimoNome}
                          width={80}
                          height={80}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <span className="text-[10px] text-[var(--muted)]">Sem imagem</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-black text-[var(--accent)]">
                          {numeroFormatado(item.aniimoNumero)}
                        </span>
                        {collectionSet.has(item.formaId) && <span title="Na sua coleção">✓</span>}
                      </div>
                      <p className="truncate font-black">{item.aniimoNome}</p>
                      <p className="truncate text-xs text-[var(--muted)]">{item.formaNome} • {item.funcao}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center">
                <h3 className="font-black">Nenhuma forma encontrada</h3>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  Ajuste a busca ou desative o filtro da coleção.
                </p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

function SummaryCard({
  title,
  emptyText,
  children,
}: {
  title: string;
  emptyText: string;
  children: React.ReactNode;
}) {
  const hasChildren = Array.isArray(children) ? children.length > 0 : Boolean(children);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
      <h2 className="text-lg font-black">{title}</h2>
      {hasChildren ? (
        <div className="mt-4 flex flex-wrap gap-2">{children}</div>
      ) : (
        <p className="mt-3 text-sm text-[var(--muted)]">{emptyText}</p>
      )}
    </div>
  );
}

function SummaryPill({ label, count }: { label: string; count: number }) {
  return (
    <span className="rounded-full border border-white/10 bg-[var(--surface)] px-3 py-2 text-sm font-semibold">
      {label} <strong className="ml-1 text-[var(--accent)]">×{count}</strong>
    </span>
  );
}
