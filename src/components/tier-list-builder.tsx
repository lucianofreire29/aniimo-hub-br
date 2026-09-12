"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { useCollection } from "@/lib/collection-storage";
import { TIER_ORDER, type TierKey, useLocalTierList } from "@/lib/tier-list-storage";
import type { CollectionCatalogItem } from "@/types/collection";

type TierListBuilderProps = {
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

export function TierListBuilder({ items }: TierListBuilderProps) {
  const { tierList, isReady, setName, setTier, clear } = useLocalTierList();
  const { ids: collectionIds, isReady: collectionReady } = useCollection();
  const [search, setSearch] = useState("");
  const [onlyCollection, setOnlyCollection] = useState(false);

  const collectionSet = useMemo(() => new Set(collectionIds), [collectionIds]);
  const itemIds = useMemo(() => new Set(items.map((item) => item.formaId)), [items]);

  const validPlacements = useMemo(() => {
    const result = new Map<number, TierKey>();

    Object.entries(tierList.placements).forEach(([key, tier]) => {
      const id = Number(key);
      if (itemIds.has(id)) result.set(id, tier);
    });

    return result;
  }, [itemIds, tierList.placements]);

  const rows = useMemo(
    () =>
      TIER_ORDER.map((tier) => ({
        tier,
        items: items.filter((item) => validPlacements.get(item.formaId) === tier),
      })),
    [items, validPlacements],
  );

  const poolItems = useMemo(() => {
    const query = normalize(search.trim());

    return items.filter((item) => {
      if (validPlacements.has(item.formaId)) return false;
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
  }, [collectionSet, items, onlyCollection, search, validPlacements]);

  return (
    <div>
      <section className="rounded-3xl border border-white/10 bg-[var(--surface)] p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <label className="block w-full max-w-xl">
            <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
              Nome da Tier List
            </span>
            <input
              value={tierList.name}
              onChange={(event) => setName(event.target.value)}
              maxLength={80}
              className="w-full rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3 text-lg font-black outline-none transition focus:border-[var(--accent)]/50"
            />
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-[var(--muted)]">
              {isReady ? `${validPlacements.size}/${items.length} formas classificadas` : "Carregando Tier List..."}
            </span>
            <button
              type="button"
              onClick={clear}
              className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-bold text-[var(--muted)] transition hover:border-white/20 hover:text-white"
            >
              Limpar Tier List
            </button>
          </div>
        </div>
        <p className="mt-3 text-sm text-[var(--muted)]">
          Esta é uma classificação pessoal. As alterações são salvas automaticamente neste navegador.
        </p>
      </section>

      <section className="mt-8 space-y-4">
        {rows.map(({ tier, items: tierItems }) => (
          <div
            key={tier}
            className="grid overflow-hidden rounded-2xl border border-white/10 bg-[var(--surface)] sm:grid-cols-[96px_1fr]"
          >
            <div className="flex min-h-28 items-center justify-center border-b border-white/10 bg-white/[0.04] sm:border-b-0 sm:border-r">
              <div className="text-center">
                <span className="block text-4xl font-black text-[var(--accent)]">{tier}</span>
                <span className="mt-1 block text-xs font-bold text-[var(--muted)]">
                  {tierItems.length} {tierItems.length === 1 ? "forma" : "formas"}
                </span>
              </div>
            </div>

            <div className="min-h-28 p-3">
              {tierItems.length ? (
                <div className="flex flex-wrap gap-3">
                  {tierItems.map((item) => (
                    <TierCard
                      key={item.formaId}
                      item={item}
                      tier={tier}
                      onChangeTier={(nextTier) => setTier(item.formaId, nextTier)}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex min-h-24 items-center justify-center rounded-xl border border-dashed border-white/10 px-4 text-center text-sm text-[var(--muted)]">
                  Nenhuma forma classificada no tier {tier}.
                </div>
              )}
            </div>
          </div>
        ))}
      </section>

      <section className="mt-10 rounded-3xl border border-white/10 bg-[var(--surface)] p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent)]">
              Não classificados
            </p>
            <h2 className="mt-2 text-2xl font-black">Escolha uma forma para classificar</h2>
          </div>
          <span className="text-sm font-semibold text-[var(--muted)]">
            {poolItems.length} disponíveis com os filtros atuais
          </span>
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

        <div className="mt-5 max-h-[42rem] overflow-y-auto pr-1">
          {poolItems.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {poolItems.map((item) => (
                <PoolCard
                  key={item.formaId}
                  item={item}
                  inCollection={collectionSet.has(item.formaId)}
                  onChooseTier={(tier) => setTier(item.formaId, tier)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center">
              <h3 className="font-black">Nenhuma forma disponível</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Ajuste a busca, desative o filtro da coleção ou remova alguma forma de um tier.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function TierCard({
  item,
  tier,
  onChangeTier,
}: {
  item: CollectionCatalogItem;
  tier: TierKey;
  onChangeTier: (tier: TierKey | null) => void;
}) {
  return (
    <article className="w-40 overflow-hidden rounded-xl border border-white/10 bg-white/[0.025]">
      <Link href={`/aniimos/${item.aniimoSlug}#${item.formaSlug}`} className="block">
        <div className="flex h-28 items-center justify-center p-2">
          {item.imagemUrl ? (
            <Image
              src={item.imagemUrl}
              alt={`${item.aniimoNome} - ${item.formaNome}`}
              width={130}
              height={130}
              className="h-full w-full object-contain"
            />
          ) : (
            <span className="text-[10px] text-[var(--muted)]">Sem imagem</span>
          )}
        </div>
        <div className="px-3 pb-2">
          <p className="truncate text-sm font-black">{item.aniimoNome}</p>
          <p className="truncate text-xs text-[var(--muted)]">{item.formaNome}</p>
        </div>
      </Link>

      <div className="border-t border-white/10 p-2">
        <select
          value={tier}
          onChange={(event) => {
            const value = event.target.value;
            onChangeTier(value === "" ? null : (value as TierKey));
          }}
          className="w-full rounded-lg border border-white/10 bg-[var(--background)] px-2 py-2 text-xs font-bold outline-none"
          aria-label={`Alterar tier de ${item.aniimoNome} ${item.formaNome}`}
        >
          {TIER_ORDER.map((option) => (
            <option key={option} value={option}>
              Tier {option}
            </option>
          ))}
          <option value="">Sem tier</option>
        </select>
      </div>
    </article>
  );
}

function PoolCard({
  item,
  inCollection,
  onChooseTier,
}: {
  item: CollectionCatalogItem;
  inCollection: boolean;
  onChooseTier: (tier: TierKey) => void;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">
      <Link href={`/aniimos/${item.aniimoSlug}#${item.formaSlug}`} className="block">
        <div className="relative flex h-44 items-center justify-center p-4">
          {item.imagemUrl ? (
            <Image
              src={item.imagemUrl}
              alt={`${item.aniimoNome} - ${item.formaNome}`}
              width={220}
              height={220}
              className="h-full w-full object-contain"
            />
          ) : (
            <span className="text-sm text-[var(--muted)]">Imagem em breve</span>
          )}
          {inCollection && (
            <span className="absolute right-3 top-3 rounded-full bg-[var(--accent)] px-2.5 py-1 text-[10px] font-black text-black">
              ✓ Coleção
            </span>
          )}
        </div>

        <div className="px-4 pb-3">
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="font-black text-[var(--accent)]">{numeroFormatado(item.aniimoNumero)}</span>
            <span className="truncate font-semibold text-[var(--muted)]">{item.funcao}</span>
          </div>
          <h3 className="mt-2 truncate text-lg font-black">{item.aniimoNome}</h3>
          <p className="truncate text-sm text-[var(--muted)]">{item.formaNome}</p>
        </div>
      </Link>

      <div className="border-t border-white/10 p-3">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
          Classificar em
        </p>
        <div className="grid grid-cols-5 gap-1.5">
          {TIER_ORDER.map((tier) => (
            <button
              key={tier}
              type="button"
              onClick={() => onChooseTier(tier)}
              className="rounded-lg border border-white/10 py-2 text-xs font-black transition hover:border-[var(--accent)]/40 hover:text-[var(--accent)]"
            >
              {tier}
            </button>
          ))}
        </div>
      </div>
    </article>
  );
}
