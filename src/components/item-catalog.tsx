"use client";

import { useMemo, useState } from "react";

import type { ItemCatalogItem } from "@/types/item";

type ItemCatalogProps = {
  items: ItemCatalogItem[];
};

export function ItemCatalog({ items }: ItemCatalogProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const categories = useMemo(() => {
    const map = new Map<string, string>();

    for (const item of items) {
      if (!item.categoria) continue;
      map.set(item.categoria.slug, item.categoria.nomePtBr ?? item.categoria.nome);
    }

    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1], "pt-BR"));
  }, [items]);

  const filteredItems = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");

    return items.filter((item) => {
      const searchable = [item.nome, item.nomePtBr, item.descricao, item.descricaoPtBr]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("pt-BR");

      const matchesSearch = !normalizedSearch || searchable.includes(normalizedSearch);
      const matchesCategory = category === "all" || item.categoria?.slug === category;

      return matchesSearch && matchesCategory;
    });
  }, [category, items, search]);

  if (!items.length) {
    return (
      <div className="rounded-3xl border border-white/10 bg-[var(--surface)] p-8 sm:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--accent)]">
          Banco preparado
        </p>
        <h2 className="mt-3 text-2xl font-black">Nenhum item cadastrado ainda</h2>
        <p className="mt-4 max-w-2xl leading-7 text-[var(--muted)]">
          A estrutura do catálogo está pronta. Os itens serão adicionados em lotes usando fontes oficiais do Aniimo, sem preencher informações que ainda não estejam confirmadas.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid gap-3 rounded-2xl border border-white/10 bg-[var(--surface)] p-4 md:grid-cols-[1fr_260px_auto]">
        <label className="grid gap-2 text-sm font-semibold">
          <span className="text-[var(--muted)]">Buscar item</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Nome ou descrição"
            className="rounded-xl border border-white/10 bg-black/10 px-4 py-3 outline-none transition focus:border-[var(--accent)]/50"
          />
        </label>

        <label className="grid gap-2 text-sm font-semibold">
          <span className="text-[var(--muted)]">Categoria</span>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="rounded-xl border border-white/10 bg-[var(--surface-soft)] px-4 py-3 outline-none"
          >
            <option value="all">Todas</option>
            {categories.map(([slug, label]) => (
              <option key={slug} value={slug}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-end">
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setCategory("all");
            }}
            className="w-full rounded-xl border border-white/10 px-4 py-3 text-sm font-bold text-[var(--muted)] transition hover:border-white/20 hover:text-white md:w-auto"
          >
            Limpar
          </button>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 text-sm text-[var(--muted)]">
        <span>{filteredItems.length} item(ns) encontrado(s)</span>
        <span>{items.length} cadastrado(s)</span>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredItems.map((item) => {
          const displayName = item.nomePtBr ?? item.nome;
          const description = item.descricaoPtBr ?? item.descricao;
          const categoryLabel = item.categoria?.nomePtBr ?? item.categoria?.nome;

          return (
            <article
              key={item.id}
              className="flex min-h-64 flex-col rounded-2xl border border-white/10 bg-[var(--surface)] p-6"
            >
              <div className="flex flex-wrap items-center gap-2">
                {categoryLabel && (
                  <span className="rounded-full bg-[var(--accent)]/10 px-3 py-1 text-xs font-bold text-[var(--accent)]">
                    {categoryLabel}
                  </span>
                )}
                {!item.categoria && (
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-[var(--muted)]">
                    Categoria não informada
                  </span>
                )}
              </div>

              <h2 className="mt-5 text-2xl font-black tracking-tight">{displayName}</h2>
              {item.nomePtBr && item.nomePtBr !== item.nome && (
                <p className="mt-1 text-sm text-[var(--muted)]">Nome oficial EN: {item.nome}</p>
              )}

              <p className="mt-4 flex-1 text-sm leading-7 text-[var(--muted)]">
                {description ?? "Descrição oficial ainda não cadastrada."}
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 text-xs">
                <span className="text-[var(--muted)]">{item.slug}</span>
                {item.fonteUrl && (
                  <a
                    href={item.fonteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-[var(--accent)] hover:underline"
                  >
                    Fonte oficial ↗
                  </a>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
