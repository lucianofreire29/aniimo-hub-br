"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { useLocalBuilds } from "@/lib/build-storage";
import type { BuildFormItem } from "@/types/build";
import type { ItemCatalogItem } from "@/types/item";

type BuildPlannerProps = {
  forms: BuildFormItem[];
  items: ItemCatalogItem[];
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

function itemName(item: ItemCatalogItem) {
  return item.nomePtBr ?? item.nome;
}

function itemDescription(item: ItemCatalogItem) {
  return item.descricaoPtBr ?? item.descricao;
}

export function BuildPlanner({ forms, items }: BuildPlannerProps) {
  const { isReady, getBuild, setNotes, toggleItem, clearBuild, savedCount } = useLocalBuilds();
  const [activeFormaId, setActiveFormaId] = useState<number | null>(forms[0]?.formaId ?? null);
  const [formSearch, setFormSearch] = useState("");
  const [itemSearch, setItemSearch] = useState("");

  const activeForm = useMemo(
    () => forms.find((form) => form.formaId === activeFormaId) ?? forms[0] ?? null,
    [activeFormaId, forms],
  );

  const visibleForms = useMemo(() => {
    const query = normalize(formSearch.trim());
    if (!query) return forms;

    return forms.filter((form) =>
      normalize(
        [
          form.aniimoNome,
          form.formaNome,
          form.funcao,
          form.estagio ?? "",
          ...form.elementos.map((elemento) => elemento.nome),
        ].join(" "),
      ).includes(query),
    );
  }, [formSearch, forms]);

  const visibleItems = useMemo(() => {
    const query = normalize(itemSearch.trim());
    if (!query) return items;

    return items.filter((item) =>
      normalize(
        [
          itemName(item),
          item.nome,
          item.categoria?.nomePtBr ?? "",
          item.categoria?.nome ?? "",
          itemDescription(item) ?? "",
        ].join(" "),
      ).includes(query),
    );
  }, [itemSearch, items]);

  if (!activeForm) {
    return (
      <div className="rounded-3xl border border-dashed border-white/10 p-10 text-center">
        <h2 className="text-xl font-black">Nenhuma forma disponível</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          O planejador será liberado assim que houver formas cadastradas no banco.
        </p>
      </div>
    );
  }

  const build = getBuild(activeForm.formaId);
  const selectedItemSet = new Set(build.itemIds);
  const selectedItems = build.itemIds
    .map((itemId) => items.find((item) => item.id === itemId) ?? null)
    .filter((item): item is ItemCatalogItem => item !== null);

  return (
    <div className="grid gap-6 xl:grid-cols-[19rem_minmax(0,1fr)]">
      <aside className="self-start rounded-3xl border border-white/10 bg-[var(--surface)] p-4 xl:sticky xl:top-24">
        <div className="flex items-center justify-between gap-3 px-1">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Aniimos e formas</p>
            <p className="mt-1 text-sm font-semibold text-[var(--accent)]">
              {isReady ? `${savedCount} build${savedCount === 1 ? "" : "s"} salva${savedCount === 1 ? "" : "s"}` : "Carregando..."}
            </p>
          </div>
        </div>

        <input
          type="search"
          value={formSearch}
          onChange={(event) => setFormSearch(event.target.value)}
          placeholder="Buscar Aniimo ou forma..."
          className="mt-4 w-full rounded-xl border border-white/10 bg-white/[0.025] px-3 py-2.5 text-sm outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)]/50"
        />

        <div className="mt-4 max-h-[68vh] space-y-2 overflow-y-auto pr-1">
          {visibleForms.map((form) => {
            const selected = form.formaId === activeForm.formaId;
            const saved = getBuild(form.formaId);
            const hasSavedBuild = saved.itemIds.length > 0 || saved.notes.trim().length > 0;

            return (
              <button
                key={form.formaId}
                type="button"
                onClick={() => {
                  setActiveFormaId(form.formaId);
                  setItemSearch("");
                }}
                className={`flex w-full items-center gap-3 rounded-2xl border p-2.5 text-left transition ${
                  selected
                    ? "border-[var(--accent)]/40 bg-[var(--accent)]/10"
                    : "border-white/10 hover:border-white/20 hover:bg-white/[0.03]"
                }`}
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/[0.03] p-1">
                  {form.imagemUrl ? (
                    <Image
                      src={form.imagemUrl}
                      alt={form.aniimoNome}
                      width={72}
                      height={72}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <span className="text-[9px] text-[var(--muted)]">Sem imagem</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-black text-[var(--accent)]">
                      {numeroFormatado(form.aniimoNumero)}
                    </span>
                    {hasSavedBuild && <span className="text-xs text-[var(--accent)]" title="Build salva">●</span>}
                  </div>
                  <p className="truncate text-sm font-black">{form.aniimoNome}</p>
                  <p className="truncate text-xs text-[var(--muted)]">{form.formaNome}</p>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      <div className="min-w-0 space-y-6">
        <section className="overflow-hidden rounded-3xl border border-white/10 bg-[var(--surface)]">
          <div className="grid gap-6 p-6 md:grid-cols-[15rem_minmax(0,1fr)] md:items-center">
            <div className="flex h-60 items-center justify-center rounded-2xl bg-white/[0.025] p-4">
              {activeForm.imagemUrl ? (
                <Image
                  src={activeForm.imagemUrl}
                  alt={`${activeForm.aniimoNome} - ${activeForm.formaNome}`}
                  width={320}
                  height={320}
                  className="h-full w-full object-contain"
                />
              ) : (
                <span className="text-sm font-semibold text-[var(--muted)]">Imagem em breve</span>
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                <span className="text-[var(--accent)]">{numeroFormatado(activeForm.aniimoNumero)}</span>
                <span className="rounded-full border border-white/10 px-2.5 py-1 text-[var(--muted)]">{activeForm.funcao}</span>
                {activeForm.estagio && (
                  <span className="rounded-full border border-white/10 px-2.5 py-1 text-[var(--muted)]">{activeForm.estagio}</span>
                )}
              </div>
              <h2 className="mt-3 text-3xl font-black tracking-tight">{activeForm.aniimoNome}</h2>
              <p className="mt-1 text-base font-semibold text-[var(--muted)]">{activeForm.formaNome}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {activeForm.elementos.map((elemento) => (
                  <span
                    key={`${elemento.nome}-${elemento.principal}`}
                    className={`rounded-full border px-3 py-1.5 text-xs font-bold ${
                      elemento.principal
                        ? "border-[var(--accent)]/35 bg-[var(--accent)]/10 text-[var(--accent)]"
                        : "border-white/10 text-[var(--muted)]"
                    }`}
                  >
                    {elemento.nome}{elemento.principal ? " • principal" : ""}
                  </span>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href={`/aniimos/${activeForm.aniimoSlug}#${activeForm.formaSlug}`}
                  className="rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-black text-black transition hover:brightness-110"
                >
                  Ver detalhes completos
                </Link>
                <button
                  type="button"
                  onClick={() => clearBuild(activeForm.formaId)}
                  className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-bold text-[var(--muted)] transition hover:border-white/20 hover:text-white"
                >
                  Limpar build pessoal
                </button>
              </div>
            </div>
          </div>
        </section>

        {activeForm.atributos && (
          <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-6">
            <h2 className="text-xl font-black">Atributos cadastrados</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
              <Stat label="HP" value={activeForm.atributos.hp} />
              <Stat label="Ataque" value={activeForm.atributos.ataque} />
              <Stat label="BREAK" value={activeForm.atributos.break} />
              <Stat label="REGEN" value={activeForm.atributos.regen} />
              <Stat label="M. DEF" value={activeForm.atributos.mDef} />
              <Stat label="P. DEF" value={activeForm.atributos.pDef} />
            </div>
          </section>
        )}

        <section className="grid gap-6 lg:grid-cols-2">
          <InfoSection title="Traits" emptyText="Nenhuma trait cadastrada para esta forma.">
            {activeForm.traits.map((trait) => (
              <div key={trait.nome} className="rounded-2xl border border-white/10 bg-[var(--surface)] p-4">
                <h3 className="font-black">{trait.nome}</h3>
                {trait.descricao && <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{trait.descricao}</p>}
              </div>
            ))}
          </InfoSection>

          <InfoSection title="Habilidades" emptyText="Nenhuma habilidade cadastrada para esta forma.">
            {activeForm.habilidades.map((habilidade) => (
              <div key={`${habilidade.ordem ?? "x"}-${habilidade.nome}`} className="rounded-2xl border border-white/10 bg-[var(--surface)] p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="font-black">{habilidade.nome}</h3>
                  {habilidade.elemento && (
                    <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-bold text-[var(--muted)]">
                      {habilidade.elemento}
                    </span>
                  )}
                </div>
                {habilidade.descricao && <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{habilidade.descricao}</p>}
                <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold text-[var(--muted)]">
                  {habilidade.categoria && <span>{habilidade.categoria}</span>}
                  {habilidade.tipoAtaque && <span>• {habilidade.tipoAtaque}</span>}
                  {habilidade.poder !== null && <span>• Poder {habilidade.poder}</span>}
                  {habilidade.custo !== null && <span>• Custo {habilidade.custo}</span>}
                  {habilidade.cooldown !== null && <span>• Cooldown {habilidade.cooldown}</span>}
                </div>
              </div>
            ))}
          </InfoSection>
        </section>

        <section className="rounded-3xl border border-[var(--accent)]/20 bg-[var(--surface)] p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent)]">Build pessoal</p>
              <h2 className="mt-2 text-2xl font-black">Itens de referência</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                Selecione itens que você quer considerar nesta build. A seleção é pessoal e não representa recomendação oficial ou ranking de meta.
              </p>
            </div>
            <span className="text-sm font-semibold text-[var(--muted)]">{selectedItems.length} selecionado{selectedItems.length === 1 ? "" : "s"}</span>
          </div>

          {selectedItems.length > 0 && (
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {selectedItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3 rounded-2xl border border-[var(--accent)]/25 bg-[var(--accent)]/5 p-3">
                  <ItemImage item={item} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black">{itemName(item)}</p>
                    <p className="truncate text-xs text-[var(--muted)]">{item.categoria?.nomePtBr ?? item.categoria?.nome ?? "Sem categoria"}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleItem(activeForm.formaId, item.id)}
                    className="rounded-lg px-2 py-1 text-xs font-black text-[var(--muted)] transition hover:text-white"
                    aria-label={`Remover ${itemName(item)}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <input
            type="search"
            value={itemSearch}
            onChange={(event) => setItemSearch(event.target.value)}
            placeholder="Buscar item ou categoria..."
            className="mt-6 w-full rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3 text-sm outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)]/50"
          />

          <div className="mt-4 max-h-[30rem] overflow-y-auto pr-1">
            {visibleItems.length ? (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {visibleItems.map((item) => {
                  const selected = selectedItemSet.has(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleItem(activeForm.formaId, item.id)}
                      className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition ${
                        selected
                          ? "border-[var(--accent)]/35 bg-[var(--accent)]/10"
                          : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                      }`}
                    >
                      <ItemImage item={item} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-black">{itemName(item)}</p>
                          {selected && <span className="text-xs font-black text-[var(--accent)]">✓</span>}
                        </div>
                        <p className="truncate text-xs text-[var(--muted)]">{item.categoria?.nomePtBr ?? item.categoria?.nome ?? "Sem categoria"}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-[var(--muted)]">
                Nenhum item encontrado para esta busca.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black">Notas da build</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">Estratégia, combinações, testes ou lembretes pessoais.</p>
            </div>
            <span className="text-xs font-semibold text-[var(--muted)]">{build.notes.length}/5000</span>
          </div>
          <textarea
            value={build.notes}
            onChange={(event) => setNotes(activeForm.formaId, event.target.value)}
            maxLength={5000}
            rows={7}
            placeholder="Ex.: testar foco em BREAK, comparar item X com Y, combinar com determinado time..."
            className="mt-4 w-full resize-y rounded-2xl border border-white/10 bg-[var(--surface)] px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)]/50"
          />
          <p className="mt-3 text-xs text-[var(--muted)]">
            {isReady ? "Itens e notas são salvos automaticamente neste navegador." : "Carregando dados locais..."}
          </p>
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[var(--surface)] p-4 text-center">
      <p className="text-xs font-bold text-[var(--muted)]">{label}</p>
      <p className="mt-1 text-xl font-black">{value ?? "—"}</p>
    </div>
  );
}

function InfoSection({
  title,
  emptyText,
  children,
}: {
  title: string;
  emptyText: string;
  children: React.ReactNode;
}) {
  const list = Array.isArray(children) ? children : [children];
  const hasContent = list.length > 0 && list.some(Boolean);

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-6">
      <h2 className="text-xl font-black">{title}</h2>
      {hasContent ? <div className="mt-4 space-y-3">{children}</div> : <p className="mt-3 text-sm text-[var(--muted)]">{emptyText}</p>}
    </section>
  );
}

function ItemImage({ item }: { item: ItemCatalogItem }) {
  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/[0.03] p-1">
      {item.imagemUrl ? (
        <Image
          src={item.imagemUrl}
          alt={itemName(item)}
          width={72}
          height={72}
          className="h-full w-full object-contain"
        />
      ) : (
        <span className="text-[9px] text-[var(--muted)]">Sem imagem</span>
      )}
    </div>
  );
}
