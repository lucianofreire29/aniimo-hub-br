"use client";

import { useMemo, useState } from "react";

import {
  ELEMENT_EFFECTIVENESS,
  ELEMENT_SOURCE,
  ELEMENTS,
  getEffectivenessLabel,
  getElement,
  type EffectivenessMultiplier,
  type ElementInfo,
  type ElementKey,
} from "@/lib/element-effectiveness";

function formatMultiplier(value: EffectivenessMultiplier) {
  return String(value).replace(".", ",") + "×";
}

function multiplierClass(value: EffectivenessMultiplier) {
  if (value === 1.6) return "border-emerald-400/35 bg-emerald-400/10 text-emerald-300";
  if (value === 0.625) return "border-rose-400/35 bg-rose-400/10 text-rose-300";
  return "border-white/10 bg-white/[0.025] text-[var(--muted)]";
}

function relation(elements: ElementInfo[], selected: ElementKey, multiplier: EffectivenessMultiplier) {
  return elements.filter((defender) => ELEMENT_EFFECTIVENESS[selected][defender.key] === multiplier);
}

function incoming(elements: ElementInfo[], selected: ElementKey, multiplier: EffectivenessMultiplier) {
  return elements.filter((attacker) => ELEMENT_EFFECTIVENESS[attacker.key][selected] === multiplier);
}

function ElementIcon({ element, className = "h-7 w-7" }: { element: ElementInfo; className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <use href={`/elementos/icones.svg#${element.key}`} />
    </svg>
  );
}

export function ElementEffectivenessExplorer() {
  const [selectedKey, setSelectedKey] = useState<ElementKey>("fire");
  const selected = getElement(selectedKey);

  const relationships = useMemo(
    () => ({
      strongAgainst: relation(ELEMENTS, selectedKey, 1.6),
      weakAgainst: relation(ELEMENTS, selectedKey, 0.625),
      neutralAgainst: relation(ELEMENTS, selectedKey, 1),
      takesMoreFrom: incoming(ELEMENTS, selectedKey, 1.6),
      resists: incoming(ELEMENTS, selectedKey, 0.625),
    }),
    [selectedKey],
  );

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-white/10 bg-[var(--surface)] p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent)]">
              Explorar elemento
            </p>
            <h2 className="mt-2 text-2xl font-black">Escolha um elemento</h2>
          </div>
          <p className="text-sm text-[var(--muted)]">Ataque excelente 1,6× · normal 1× · ruim 0,625×</p>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-9">
          {ELEMENTS.map((element) => {
            const active = selectedKey === element.key;
            return (
              <button
                key={element.key}
                type="button"
                onClick={() => setSelectedKey(element.key)}
                className={`rounded-2xl border px-3 py-3 text-center transition ${
                  active
                    ? "border-[var(--accent)]/45 bg-[var(--accent)]/10 text-[var(--accent)]"
                    : "border-white/10 hover:border-white/20 hover:bg-white/[0.03]"
                }`}
              >
                <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
                  <ElementIcon element={element} className="h-7 w-7" />
                </span>
                <span className="mt-2 block text-xs font-black">{element.nome}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-3xl border border-[var(--accent)]/25 bg-[var(--surface)] p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent)]/10 text-[var(--accent)]">
            <ElementIcon element={selected} className="h-10 w-10" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Elemento selecionado</p>
            <h2 className="mt-1 text-3xl font-black">{selected.nome}</h2>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Fonte comunitária: {selected.nomeFonte} · glossário do projeto: {selected.nomeBanco}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <RelationCard
            title={`Quando ${selected.nome} ataca`}
            rows={[
              { label: "Forte contra", multiplier: 1.6 as const, elements: relationships.strongAgainst },
              { label: "Neutro contra", multiplier: 1 as const, elements: relationships.neutralAgainst },
              { label: "Fraco contra", multiplier: 0.625 as const, elements: relationships.weakAgainst },
            ]}
          />
          <RelationCard
            title={`Quando ${selected.nome} defende`}
            rows={[
              { label: "Recebe mais dano de", multiplier: 1.6 as const, elements: relationships.takesMoreFrom },
              { label: "Resiste a", multiplier: 0.625 as const, elements: relationships.resists },
            ]}
          />
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-[var(--surface)] p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent)]">Tabela completa</p>
            <h2 className="mt-2 text-2xl font-black">Atacante × defensor</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">Linhas atacam; colunas defendem. Clique no nome de uma linha para analisar aquele elemento.</p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-bold">
            <Legend value={1.6} />
            <Legend value={1} />
            <Legend value={0.625} />
          </div>
        </div>

        <div className="mt-5 overflow-x-auto rounded-2xl border border-white/10">
          <table className="min-w-[900px] w-full border-collapse text-center text-xs">
            <thead className="bg-white/[0.03]">
              <tr>
                <th className="sticky left-0 z-10 border-b border-r border-white/10 bg-[var(--surface)] px-3 py-4 text-left">Atacante</th>
                {ELEMENTS.map((defender) => (
                  <th
                    key={defender.key}
                    className={`border-b border-white/10 px-2 py-3 font-black ${
                      defender.key === selectedKey ? "bg-[var(--accent)]/10 text-[var(--accent)]" : ""
                    }`}
                  >
                    <span className="flex flex-col items-center gap-1.5">
                      <ElementIcon element={defender} className="h-6 w-6" />
                      <span>{defender.nome}</span>
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ELEMENTS.map((attacker) => (
                <tr key={attacker.key} className={attacker.key === selectedKey ? "bg-[var(--accent)]/[0.035]" : ""}>
                  <th className="sticky left-0 z-10 border-r border-t border-white/10 bg-[var(--surface)] p-2 text-left">
                    <button
                      type="button"
                      onClick={() => setSelectedKey(attacker.key)}
                      className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left font-black transition hover:bg-white/[0.05] ${
                        attacker.key === selectedKey ? "text-[var(--accent)]" : ""
                      }`}
                    >
                      <ElementIcon element={attacker} className="h-6 w-6 shrink-0" />
                      <span>{attacker.nome}</span>
                    </button>
                  </th>
                  {ELEMENTS.map((defender) => {
                    const value = ELEMENT_EFFECTIVENESS[attacker.key][defender.key];
                    return (
                      <td key={defender.key} className="border-t border-white/10 p-2">
                        <span className={`inline-flex min-w-16 justify-center rounded-lg border px-2 py-2 font-black ${multiplierClass(value)}`}>
                          {formatMultiplier(value)}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-3xl border border-dashed border-white/15 p-5 text-sm leading-6 text-[var(--muted)]">
        <strong className="text-white">Rastreabilidade:</strong> a matriz desta primeira versão vem do Aniidex, uma base comunitária não oficial, verificada em {ELEMENT_SOURCE.verificadoEm}. Os multiplicadores podem mudar com patches; por isso a fonte e a data ficam registradas e serão substituídas por dados oficiais quando disponíveis.
      </section>
    </div>
  );
}

function RelationCard({
  title,
  rows,
}: {
  title: string;
  rows: Array<{ label: string; multiplier: EffectivenessMultiplier; elements: ElementInfo[] }>;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <h3 className="font-black">{title}</h3>
      <div className="mt-4 space-y-4">
        {rows.map((row) => (
          <div key={row.label}>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">{row.label}</span>
              <span className={`rounded-md border px-2 py-0.5 text-[10px] font-black ${multiplierClass(row.multiplier)}`}>
                {formatMultiplier(row.multiplier)}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {row.elements.length ? (
                row.elements.map((element) => (
                  <span key={element.key} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[var(--surface)] px-3 py-1.5 text-xs font-bold">
                    <ElementIcon element={element} className="h-4 w-4" />
                    {element.nome}
                  </span>
                ))
              ) : (
                <span className="text-xs text-[var(--muted)]">Nenhum</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Legend({ value }: { value: EffectivenessMultiplier }) {
  return (
    <span className={`rounded-lg border px-2.5 py-1.5 ${multiplierClass(value)}`}>
      {getEffectivenessLabel(value)} {formatMultiplier(value)}
    </span>
  );
}
