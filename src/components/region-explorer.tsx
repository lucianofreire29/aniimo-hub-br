"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type { RegionMapRegion } from "@/types/mapa";

type RegionExplorerProps = {
  regions: RegionMapRegion[];
};

function formatAniimoNumber(numero: number) {
  if (numero >= 1000) return `#${numero}`;
  return `#${String(numero).padStart(3, "0")}`;
}

export function RegionExplorer({ regions }: RegionExplorerProps) {
  const [search, setSearch] = useState("");
  const [selectedSlug, setSelectedSlug] = useState(regions[0]?.slug ?? "");

  const filteredRegions = useMemo(() => {
    const normalized = search.trim().toLocaleLowerCase("pt-BR");
    if (!normalized) return regions;

    return regions.filter((region) => {
      if (region.nome.toLocaleLowerCase("pt-BR").includes(normalized)) return true;

      return region.aniimos.some((aniimo) =>
        [aniimo.nome, ...aniimo.formas]
          .join(" ")
          .toLocaleLowerCase("pt-BR")
          .includes(normalized),
      );
    });
  }, [regions, search]);

  const activeRegion =
    filteredRegions.find((region) => region.slug === selectedSlug) ?? filteredRegions[0] ?? null;

  if (!regions.length) {
    return (
      <div className="rounded-3xl border border-white/10 bg-[var(--surface)] p-8">
        <h2 className="text-2xl font-black">Nenhuma região cadastrada</h2>
        <p className="mt-3 text-[var(--muted)]">
          O explorador será preenchido quando as regiões oficiais estiverem disponíveis no banco.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <aside className="lg:sticky lg:top-6 lg:self-start">
        <div className="rounded-2xl border border-white/10 bg-[var(--surface)] p-4">
          <label className="grid gap-2 text-sm font-semibold">
            <span className="text-[var(--muted)]">Buscar região ou Aniimo</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Ex.: Campos de Nimbus, Emberpup"
              className="rounded-xl border border-white/10 bg-black/10 px-4 py-3 outline-none transition focus:border-[var(--accent)]/50"
            />
          </label>

          <div className="mt-4 max-h-[620px] space-y-2 overflow-y-auto pr-1">
            {filteredRegions.map((region) => {
              const active = activeRegion?.slug === region.slug;

              return (
                <button
                  key={region.id}
                  type="button"
                  onClick={() => setSelectedSlug(region.slug)}
                  className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                    active
                      ? "border-[var(--accent)]/40 bg-[var(--accent)]/10"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  <span className="block font-black">{region.nome}</span>
                  <span className="mt-1 block text-xs text-[var(--muted)]">
                    {region.totalAniimos} Aniimo(s) • {region.totalFormas} forma(s)
                  </span>
                </button>
              );
            })}
          </div>

          {!filteredRegions.length && (
            <p className="mt-4 rounded-xl border border-dashed border-white/10 p-4 text-sm text-[var(--muted)]">
              Nenhuma região ou Aniimo corresponde à busca.
            </p>
          )}
        </div>
      </aside>

      <div>
        {activeRegion ? (
          <section className="rounded-3xl border border-white/10 bg-[var(--surface)] p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent)]">
                  Região oficial
                </p>
                <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                  {activeRegion.nome}
                </h2>
                {activeRegion.descricao && (
                  <p className="mt-4 max-w-3xl leading-7 text-[var(--muted)]">
                    {activeRegion.descricao}
                  </p>
                )}
              </div>

              <div className="flex gap-2 text-xs font-bold">
                <span className="rounded-full border border-white/10 px-3 py-2 text-[var(--muted)]">
                  {activeRegion.totalAniimos} Aniimo(s)
                </span>
                <span className="rounded-full border border-white/10 px-3 py-2 text-[var(--muted)]">
                  {activeRegion.totalFormas} forma(s)
                </span>
              </div>
            </div>

            <div className="mt-7">
              <h3 className="text-xl font-black">Habitats registrados</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Aniimos e formas relacionados oficialmente a esta região no banco do Aniimo Brasil.
              </p>

              {activeRegion.aniimos.length ? (
                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {activeRegion.aniimos.map((aniimo) => (
                    <Link
                      key={aniimo.id}
                      href={`/aniimos/${aniimo.slug}`}
                      className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition hover:border-[var(--accent)]/35"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-black">{aniimo.nome}</p>
                          <p className="mt-1 text-xs font-bold text-[var(--accent)]">
                            {formatAniimoNumber(aniimo.numero)}
                          </p>
                        </div>
                        <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] font-bold text-[var(--muted)]">
                          {aniimo.formas.length} forma(s)
                        </span>
                      </div>

                      <p className="mt-4 text-xs leading-5 text-[var(--muted)]">
                        {aniimo.formas.join(" • ")}
                      </p>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="mt-5 rounded-xl border border-dashed border-white/10 p-5 text-sm text-[var(--muted)]">
                  Nenhum habitat de Aniimo está relacionado a esta região no banco atual.
                </p>
              )}
            </div>
          </section>
        ) : (
          <div className="rounded-3xl border border-white/10 bg-[var(--surface)] p-8 text-[var(--muted)]">
            Selecione uma região para visualizar os habitats cadastrados.
          </div>
        )}
      </div>
    </div>
  );
}
