"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { useLocalBuilds } from "@/lib/build-storage";
import type { BuildFormItem, BuildStatKey, CarriedItem } from "@/types/build";

type BuildPlannerProps = {
  forms: BuildFormItem[];
  carriedItems: CarriedItem[];
};

type FlatGain = {
  atributo: BuildStatKey;
  rotulo: string;
  value: number;
} | null;

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function numeroFormatado(numero: number) {
  return `#${String(numero).padStart(3, "0")}`;
}

function formatNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1).replace(".", ",");
}

function getStatValue(form: BuildFormItem, stat: BuildStatKey) {
  return form.atributos?.[stat] ?? null;
}

function calculateFlatGain(item: CarriedItem | null, level: number, enhancement: 0 | 10 | 20): FlatGain {
  if (!item?.escalaPorNivel) return null;

  let value = item.escalaPorNivel.valor * level;

  if (
    enhancement >= 10 &&
    item.melhoria10?.atributo === item.escalaPorNivel.atributo &&
    typeof item.melhoria10.valor === "number"
  ) {
    value += item.melhoria10.valor;
  }

  return {
    atributo: item.escalaPorNivel.atributo,
    rotulo: item.escalaPorNivel.rotulo,
    value,
  };
}

function getBonusForStat(flatGain: FlatGain, stat: BuildStatKey) {
  return flatGain?.atributo === stat ? flatGain.value : 0;
}

export function BuildPlanner({ forms, carriedItems }: BuildPlannerProps) {
  const {
    isReady,
    getBuild,
    setCarriedItem,
    setAniimoLevel,
    setEnhancement,
    setNotes,
    clearBuild,
    savedCount,
  } = useLocalBuilds();

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
    if (!query) return carriedItems;

    return carriedItems.filter((item) =>
      normalize([item.nome, item.bonusBase, item.efeitoCore].join(" ")).includes(query),
    );
  }, [carriedItems, itemSearch]);

  if (!activeForm) {
    return (
      <div className="rounded-3xl border border-dashed border-white/10 p-10 text-center">
        <h2 className="text-xl font-black">Nenhuma forma disponível</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">Cadastre formas antes de usar o planejador.</p>
      </div>
    );
  }

  const build = getBuild(activeForm.formaId);
  const activeItem = carriedItems.find((item) => item.id === build.carriedItemId) ?? null;
  const flatGain = calculateFlatGain(activeItem, build.aniimoLevel, build.enhancement);
  const currentStat = flatGain ? getStatValue(activeForm, flatGain.atributo) : null;
  const finalStat = currentStat !== null && flatGain ? currentStat + flatGain.value : null;

  return (
    <div className="grid gap-6 xl:grid-cols-[19rem_minmax(0,1fr)]">
      <aside className="self-start rounded-3xl border border-white/10 bg-[var(--surface)] p-4 xl:sticky xl:top-24">
        <div className="px-1">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Aniimos e formas</p>
          <p className="mt-1 text-sm font-semibold text-[var(--accent)]">
            {isReady ? `${savedCount} build${savedCount === 1 ? "" : "s"} salva${savedCount === 1 ? "" : "s"}` : "Carregando..."}
          </p>
        </div>

        <input
          type="search"
          value={formSearch}
          onChange={(event) => setFormSearch(event.target.value)}
          placeholder="Buscar Aniimo ou forma..."
          className="mt-4 w-full rounded-xl border border-white/10 bg-white/[0.025] px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)]/50"
        />

        <div className="mt-4 max-h-[68vh] space-y-2 overflow-y-auto pr-1">
          {visibleForms.map((form) => {
            const selected = form.formaId === activeForm.formaId;
            const saved = getBuild(form.formaId);
            const hasSavedBuild = Boolean(saved.carriedItemId || saved.notes.trim());

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
                    <span className="text-[10px] font-black text-[var(--accent)]">{numeroFormatado(form.aniimoNumero)}</span>
                    {hasSavedBuild && <span className="text-xs text-[var(--accent)]">●</span>}
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
                <span className="text-sm text-[var(--muted)]">Imagem em breve</span>
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
              <h2 className="mt-3 text-3xl font-black">{activeForm.aniimoNome}</h2>
              <p className="mt-1 font-semibold text-[var(--muted)]">{activeForm.formaNome}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {activeForm.elementos.map((elemento) => (
                  <span
                    key={`${elemento.nome}-${elemento.principal}`}
                    className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-bold text-[var(--muted)]"
                  >
                    {elemento.nome}{elemento.principal ? " • principal" : ""}
                  </span>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href={`/aniimos/${activeForm.aniimoSlug}#${activeForm.formaSlug}`}
                  className="rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-black text-black"
                >
                  Ver detalhes completos
                </Link>
                <button
                  type="button"
                  onClick={() => clearBuild(activeForm.formaId)}
                  className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-bold text-[var(--muted)]"
                >
                  Limpar build
                </button>
              </div>
            </div>
          </div>
        </section>

        {activeForm.atributos && (
          <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-black">Atributos da build</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  O total inclui bônus planos confirmados do Carried Item equipado.
                </p>
              </div>
              {flatGain && (
                <span className="text-sm font-bold text-[var(--accent)]">
                  {activeItem?.nome}: +{formatNumber(flatGain.value)} {flatGain.rotulo}
                </span>
              )}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
              <Stat label="HP" value={activeForm.atributos.hp} />
              <Stat
                label="ATK"
                value={activeForm.atributos.ataque}
                bonus={getBonusForStat(flatGain, "ataque")}
              />
              <Stat
                label="BREAK"
                value={activeForm.atributos.break}
                bonus={getBonusForStat(flatGain, "break")}
              />
              <Stat
                label="REGEN"
                value={activeForm.atributos.regen}
                bonus={getBonusForStat(flatGain, "regen")}
              />
              <Stat label="M. DEF" value={activeForm.atributos.mDef} />
              <Stat label="P. DEF" value={activeForm.atributos.pDef} />
            </div>
          </section>
        )}

        <section className="rounded-3xl border border-[var(--accent)]/25 bg-[var(--surface)] p-5 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent)]">Equipamento do Aniimo</p>
          <h2 className="mt-2 text-2xl font-black">Carried Item</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
            Aqui entram apenas itens equipáveis no Aniimo. Consumíveis, itens de captura e materiais não aparecem nesta seleção.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label>
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Nível do Aniimo</span>
              <input
                type="number"
                min={1}
                max={100}
                value={build.aniimoLevel}
                onChange={(event) => setAniimoLevel(activeForm.formaId, Number(event.target.value))}
                className="w-full rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3 outline-none focus:border-[var(--accent)]/50"
              />
              <span className="mt-2 block text-xs leading-5 text-[var(--muted)]">
                O nível altera os bônus de equipamentos que escalam por nível. O crescimento natural dos atributos do Aniimo só será aplicado quando a fórmula correspondente estiver confirmada.
              </span>
            </label>

            <label>
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Melhoria do item</span>
              <select
                value={build.enhancement}
                onChange={(event) => setEnhancement(activeForm.formaId, Number(event.target.value) as 0 | 10 | 20)}
                className="w-full rounded-xl border border-white/10 bg-[var(--surface)] px-4 py-3 outline-none"
              >
                <option value={0}>Base</option>
                <option value={10}>+10</option>
                <option value={20}>+20</option>
              </select>
            </label>
          </div>

          <input
            type="search"
            value={itemSearch}
            onChange={(event) => setItemSearch(event.target.value)}
            placeholder="Buscar Carried Item ou efeito..."
            className="mt-5 w-full rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3 text-sm outline-none focus:border-[var(--accent)]/50"
          />

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {visibleItems.map((item) => {
              const selected = activeItem?.id === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCarriedItem(activeForm.formaId, selected ? null : item.id)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    selected
                      ? "border-[var(--accent)]/45 bg-[var(--accent)]/10"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-black">{item.nome}</h3>
                      <p className="mt-1 text-xs font-bold text-[var(--accent)]">{item.raridade} • CP {item.cp ?? "—"}</p>
                    </div>
                    <span className="text-lg">{selected ? "✓" : "+"}</span>
                  </div>
                  <p className="mt-3 text-sm font-bold">{item.bonusBase}</p>
                  <p className="mt-2 text-xs leading-5 text-[var(--muted)]">{item.efeitoCore}</p>
                </button>
              );
            })}
          </div>

          {activeItem && (
            <div className="mt-6 rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent)]/5 p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--accent)]">Equipado</p>
                  <h3 className="mt-1 text-2xl font-black">{activeItem.nome}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setCarriedItem(activeForm.formaId, null)}
                  className="text-sm font-bold text-[var(--muted)] hover:text-white"
                >
                  Remover
                </button>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <Effect title="Bônus-base" text={activeItem.bonusBase} />
                <Effect title="Efeito principal" text={activeItem.efeitoCore} />
                {build.enhancement >= 10 && activeItem.melhoria10 && (
                  <Effect title="Efeito +10" text={activeItem.melhoria10.descricao} />
                )}
                {build.enhancement >= 20 && activeItem.melhoria20 && (
                  <Effect title="Efeito +20" text={activeItem.melhoria20} />
                )}
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-[var(--surface)] p-4">
                <h4 className="font-black">Impacto calculável neste Aniimo</h4>
                {flatGain ? (
                  <>
                    <p className="mt-2 text-3xl font-black text-[var(--accent)]">
                      +{formatNumber(flatGain.value)} {flatGain.rotulo}
                    </p>
                    {currentStat !== null && finalStat !== null && (
                      <p className="mt-2 text-base font-bold">
                        {formatNumber(currentStat)} + {formatNumber(flatGain.value)} = <span className="text-[var(--accent)]">{formatNumber(finalStat)} {flatGain.rotulo}</span>
                      </p>
                    )}
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                      Calculado para Aniimo nível {build.aniimoLevel}
                      {build.enhancement >= 10 && activeItem.melhoria10?.valor ? ` e equipamento +${build.enhancement}` : ""}. O mesmo total já aparece no card de atributo acima.
                    </p>
                  </>
                ) : (
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    Este equipamento trabalha com bônus percentuais ou efeitos condicionais. Esses efeitos são mostrados acima, mas não alteramos um atributo bruto sem uma fórmula confirmada que permita calcular o valor final corretamente.
                  </p>
                )}
              </div>

              <p className="mt-4 text-xs leading-5 text-[var(--muted)]">
                Fonte dos valores: dados do jogo reproduzidos por fonte comunitária, verificados em {activeItem.fonte.verificadoEm}. Não são apresentados como publicação oficial do Aniimo Brasil.
              </p>
            </div>
          )}
        </section>

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
              <div
                key={`${habilidade.ordem ?? "x"}-${habilidade.nome}`}
                className="rounded-2xl border border-white/10 bg-[var(--surface)] p-4"
              >
                <h3 className="font-black">{habilidade.nome}</h3>
                {habilidade.descricao && (
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{habilidade.descricao}</p>
                )}
              </div>
            ))}
          </InfoSection>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-6">
          <h2 className="text-xl font-black">Notas pessoais da build</h2>
          <textarea
            value={build.notes}
            onChange={(event) => setNotes(activeForm.formaId, event.target.value)}
            rows={6}
            placeholder="Ex.: rotação, parceiro, situação em que pretende usar este Carried Item..."
            className="mt-4 w-full resize-y rounded-2xl border border-white/10 bg-[var(--surface)] px-4 py-3 text-sm leading-6 outline-none focus:border-[var(--accent)]/50"
          />
          <p className="mt-2 text-xs text-[var(--muted)]">Salvo automaticamente neste navegador.</p>
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value, bonus = 0 }: { label: string; value: number | null; bonus?: number }) {
  const total = value === null ? null : value + bonus;
  const changed = value !== null && bonus !== 0;

  return (
    <div
      className={`rounded-2xl border p-4 ${
        changed ? "border-[var(--accent)]/35 bg-[var(--accent)]/5" : "border-white/10 bg-[var(--surface)]"
      }`}
    >
      <p className="text-xs font-bold text-[var(--muted)]">{label}</p>
      <p className={`mt-1 text-xl font-black ${changed ? "text-[var(--accent)]" : ""}`}>
        {total === null ? "—" : formatNumber(total)}
      </p>
      {changed && (
        <p className="mt-1 text-[11px] font-semibold text-[var(--muted)]">
          Base {formatNumber(value)} + {formatNumber(bonus)}
        </p>
      )}
    </div>
  );
}

function Effect({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[var(--surface)] p-4">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">{title}</p>
      <p className="mt-2 text-sm leading-6">{text}</p>
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
  const count = Array.isArray(children) ? children.length : children ? 1 : 0;

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-6">
      <h2 className="text-xl font-black">{title}</h2>
      {count > 0 ? (
        <div className="mt-4 space-y-3">{children}</div>
      ) : (
        <p className="mt-3 text-sm text-[var(--muted)]">{emptyText}</p>
      )}
    </section>
  );
}
