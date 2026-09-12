"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import type { ItemCatalogItem, TranslationOrigin } from "@/types/item";

type ItemCatalogProps = {
  items: ItemCatalogItem[];
};

function getTranslationLabel(origin: TranslationOrigin | null) {
  if (origin === "OFICIAL") return "PT-BR oficial";
  if (origin === "ANIIMO_BRASIL") return "Tradução Aniimo Brasil";
  return "PT-BR em revisão";
}

export function ItemCatalog({ items }: ItemCatalogProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [rarity, setRarity] = useState("all");

  const categories = useMemo(() => {
    const map = new Map<string, string>();

    for (const item of items) {
      if (!item.categoria) continue;
      map.set(item.categoria.slug, item.categoria.nomePtBr ?? item.categoria.nome);
    }

    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1], "pt-BR"));
  }, [items]);

  const rarities = useMemo(
    () =>
      Array.from(new Set(items.map((item) => item.raridade).filter((value): value is string => Boolean(value))))
        .sort((a, b) => a.localeCompare(b, "pt-BR")),
    [items],
  );

  const filteredItems = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");

    return items.filter((item) => {
      const searchable = [
        item.nome,
        item.nomePtBr,
        item.descricao,
        item.descricaoPtBr,
        item.categoria?.nome,
        item.categoria?.nomePtBr,
        item.raridade,
        item.qualidade,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("pt-BR");

      const matchesSearch = !normalizedSearch || searchable.includes(normalizedSearch);
      const matchesCategory = category === "all" || item.categoria?.slug === category;
      const matchesRarity = rarity === "all" || item.raridade === rarity;

      return matchesSearch && matchesCategory && matchesRarity;
    });
  }, [category, items, rarity, search]);

  if (!items.length) {
    return (
      <div className="rounded-3xl border border-white/10 bg-[var(--surface)] p-8 sm:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--accent)]">Banco preparado</p>
        <h2 className="mt-3 text-2xl font-black">Nenhum item cadastrado ainda</h2>
        <p className="mt-4 max-w-2xl leading-7 text-[var(--muted)]">
          A estrutura do catálogo está pronta para combinar fontes oficiais e comunitárias com rastreabilidade.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid gap-3 rounded-2xl border border-white/10 bg-[var(--surface)] p-4 md:grid-cols-2 xl:grid-cols-[1fr_220px_180px_auto]">
        <label className="grid gap-2 text-sm font-semibold">
          <span className="text-[var(--muted)]">Buscar item</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Nome, descrição, categoria ou raridade"
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

        <label className="grid gap-2 text-sm font-semibold">
          <span className="text-[var(--muted)]">Raridade</span>
          <select
            value={rarity}
            onChange={(event) => setRarity(event.target.value)}
            className="rounded-xl border border-white/10 bg-[var(--surface-soft)] px-4 py-3 outline-none"
          >
            <option value="all">Todas</option>
            {rarities.map((value) => (
              <option key={value} value={value}>
                {value}
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
              setRarity("all");
            }}
            className="w-full rounded-xl border border-white/10 px-4 py-3 text-sm font-bold text-[var(--muted)] transition hover:border-white/20 hover:text-white xl:w-auto"
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
          const translationLabel = getTranslationLabel(item.nomePtBrOrigem);

          return (
            <article
              key={item.id}
              className="flex min-h-[30rem] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[var(--surface)] transition hover:border-[var(--accent)]/30"
            >
              <Link
                href={`/itens/${item.slug}`}
                className="relative flex h-48 items-center justify-center border-b border-white/10 bg-white/[0.025] p-5"
                aria-label={`Ver ${displayName}`}
              >
                {item.imagemUrl ? (
                  <Image
                    src={item.imagemUrl}
                    alt={displayName}
                    width={220}
                    height={220}
                    className="h-40 w-40 object-contain transition duration-200 hover:scale-105"
                  />
                ) : (
                  <div className="flex h-28 w-28 items-center justify-center rounded-full border border-dashed border-white/15 px-4 text-center text-xs font-semibold text-[var(--muted)]">
                    Imagem em breve
                  </div>
                )}
              </Link>

              <div className="flex flex-1 flex-col p-6">
                <div className="flex flex-wrap items-center gap-2">
                  {categoryLabel ? (
                    <span className="rounded-full bg-[var(--accent)]/10 px-3 py-1 text-xs font-bold text-[var(--accent)]">
                      {categoryLabel}
                    </span>
                  ) : (
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-[var(--muted)]">
                      Categoria não informada
                    </span>
                  )}
                  {item.raridade && (
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-bold">
                      {item.raridade}
                    </span>
                  )}
                  {item.temDadosComunitarios && (
                    <span className="rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1 text-xs font-bold text-amber-200">
                      Dados comunitários
                    </span>
                  )}
                </div>

                <h2 className="mt-5 text-2xl font-black tracking-tight">{displayName}</h2>
                {item.nomePtBr && item.nomePtBr !== item.nome && (
                  <p className="mt-1 text-sm text-[var(--muted)]">Nome original: {item.nome}</p>
                )}

                <p className="mt-4 flex-1 text-sm leading-7 text-[var(--muted)]">
                  {description ?? "Descrição ainda não disponível na fonte cadastrada."}
                </p>

                <div className="mt-5 flex flex-wrap gap-2 text-xs text-[var(--muted)]">
                  <span className="rounded-lg border border-white/10 px-2.5 py-1.5">{translationLabel}</span>
                  {item.cp !== null && (
                    <span className="rounded-lg border border-white/10 px-2.5 py-1.5">CP {item.cp}</span>
                  )}
                  {item.qualidade && item.qualidade !== item.raridade && (
                    <span className="rounded-lg border border-white/10 px-2.5 py-1.5">{item.qualidade}</span>
                  )}
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 text-xs">
                  <Link
                    href={`/itens/${item.slug}`}
                    className="rounded-lg bg-[var(--accent)]/10 px-3 py-2 font-black text-[var(--accent)] transition hover:bg-[var(--accent)]/15"
                  >
                    Ver detalhes →
                  </Link>
                  {item.fonteUrl && (
                    <a
                      href={item.fonteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-[var(--muted)] hover:text-[var(--accent)] hover:underline"
                    >
                      Abrir referência ↗
                    </a>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {!filteredItems.length && (
        <div className="mt-6 rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-[var(--muted)]">
          Nenhum item corresponde aos filtros atuais.
        </div>
      )}
    </div>
  );
}
