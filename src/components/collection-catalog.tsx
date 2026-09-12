"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { useCollection } from "@/lib/collection-storage";
import type { CollectionCatalogItem } from "@/types/collection";

type CollectionFilter = "todos" | "obtidos" | "pendentes";

type CollectionCatalogProps = {
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

export function CollectionCatalog({ items }: CollectionCatalogProps) {
  const { ids, isReady, toggle } = useCollection();
  const [filter, setFilter] = useState<CollectionFilter>("todos");
  const [search, setSearch] = useState("");

  const collectedIds = useMemo(() => new Set(ids), [ids]);
  const validCollectedIds = useMemo(
    () => new Set(items.filter((item) => collectedIds.has(item.formaId)).map((item) => item.formaId)),
    [collectedIds, items],
  );

  const totalAniimos = useMemo(() => new Set(items.map((item) => item.aniimoSlug)).size, [items]);
  const obtainedAniimos = useMemo(
    () =>
      new Set(
        items
          .filter((item) => validCollectedIds.has(item.formaId))
          .map((item) => item.aniimoSlug),
      ).size,
    [items, validCollectedIds],
  );
  const progress = totalAniimos ? Math.round((obtainedAniimos / totalAniimos) * 100) : 0;

  const visibleItems = useMemo(() => {
    const query = normalize(search.trim());

    return items.filter((item) => {
      const obtained = validCollectedIds.has(item.formaId);
      if (filter === "obtidos" && !obtained) return false;
      if (filter === "pendentes" && obtained) return false;

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
  }, [filter, items, search, validCollectedIds]);

  return (
    <div>
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-[var(--surface)] p-5">
          <p className="text-sm font-semibold text-[var(--muted)]">Aniimos obtidos</p>
          <p className="mt-2 text-3xl font-black">
            {isReady ? obtainedAniimos : "—"} <span className="text-lg text-[var(--muted)]">/ {totalAniimos}</span>
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[var(--surface)] p-5">
          <p className="text-sm font-semibold text-[var(--muted)]">Formas obtidas</p>
          <p className="mt-2 text-3xl font-black">
            {isReady ? validCollectedIds.size : "—"} <span className="text-lg text-[var(--muted)]">/ {items.length}</span>
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[var(--surface)] p-5">
          <p className="text-sm font-semibold text-[var(--muted)]">Progresso dos Aniimos</p>
          <p className="mt-2 text-3xl font-black">{isReady ? `${progress}%` : "—"}</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-[var(--accent)] transition-[width]"
              style={{ width: isReady ? `${progress}%` : "0%" }}
            />
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.025] p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {(["todos", "obtidos", "pendentes"] as CollectionFilter[]).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setFilter(option)}
                className={`rounded-xl px-4 py-2 text-sm font-bold capitalize transition ${
                  filter === option
                    ? "bg-[var(--accent)] text-black"
                    : "border border-white/10 text-[var(--muted)] hover:border-white/20 hover:text-white"
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          <label className="w-full lg:max-w-sm">
            <span className="sr-only">Buscar na coleção</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar Aniimo, forma, elemento..."
              className="w-full rounded-xl border border-white/10 bg-[var(--surface)] px-4 py-3 text-sm outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)]/50"
            />
          </label>
        </div>
      </section>

      {!isReady ? (
        <div className="mt-8 rounded-2xl border border-white/10 p-8 text-center text-[var(--muted)]">
          Carregando sua coleção salva neste navegador...
        </div>
      ) : visibleItems.length ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleItems.map((item) => {
            const obtained = validCollectedIds.has(item.formaId);

            return (
              <article
                key={item.formaId}
                className={`overflow-hidden rounded-2xl border bg-[var(--surface)] transition ${
                  obtained ? "border-[var(--accent)]/35" : "border-white/10"
                }`}
              >
                <Link href={`/aniimos/${item.aniimoSlug}#${item.formaSlug}`} className="block">
                  <div className="relative flex h-52 items-center justify-center bg-white/[0.025] p-4">
                    {item.imagemUrl ? (
                      <Image
                        src={item.imagemUrl}
                        alt={`${item.aniimoNome} - ${item.formaNome}`}
                        width={260}
                        height={260}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <span className="text-sm font-semibold text-[var(--muted)]">Imagem em breve</span>
                    )}
                    {obtained && (
                      <span className="absolute right-3 top-3 rounded-full bg-[var(--accent)] px-3 py-1 text-xs font-black text-black">
                        ✓ Obtido
                      </span>
                    )}
                  </div>

                  <div className="p-5 pb-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-bold text-[var(--accent)]">
                        {numeroFormatado(item.aniimoNumero)}
                      </span>
                      <span className="text-xs font-semibold text-[var(--muted)]">{item.funcao}</span>
                    </div>
                    <h2 className="mt-2 text-xl font-black">{item.aniimoNome}</h2>
                    <p className="mt-1 text-sm font-semibold text-[var(--muted)]">{item.formaNome}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.elementos.map((elemento) => (
                        <span
                          key={elemento}
                          className="rounded-full border border-white/10 px-2.5 py-1 text-xs font-semibold text-slate-300"
                        >
                          {elemento}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>

                <div className="p-5 pt-2">
                  <button
                    type="button"
                    onClick={() => toggle(item.formaId)}
                    className={`w-full rounded-xl border px-4 py-3 text-sm font-bold transition ${
                      obtained
                        ? "border-[var(--accent)]/35 bg-[var(--accent)]/10 text-[var(--accent)] hover:bg-[var(--accent)]/15"
                        : "border-white/10 text-slate-200 hover:border-[var(--accent)]/40 hover:text-[var(--accent)]"
                    }`}
                  >
                    {obtained ? "Remover da coleção" : "Adicionar à coleção"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-white/10 p-10 text-center">
          <h2 className="font-black">Nenhum resultado encontrado</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Ajuste a busca ou troque o filtro da coleção.
          </p>
        </div>
      )}
    </div>
  );
}
