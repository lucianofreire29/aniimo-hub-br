"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import type { AniimoCatalogItem } from "@/types/aniimo";

type AniimoCatalogProps = {
  aniimos: AniimoCatalogItem[];
};

const TODOS = "Todos";

function numeroFormatado(numero: number) {
  if (numero >= 1000) {
    return `#${numero}`;
  }

  return `#${String(numero).padStart(3, "0")}`;
}

export function AniimoCatalog({ aniimos }: AniimoCatalogProps) {
  const [busca, setBusca] = useState("");
  const [funcao, setFuncao] = useState(TODOS);
  const [elemento, setElemento] = useState(TODOS);
  const [estagio, setEstagio] = useState(TODOS);

  const funcoes = useMemo(
    () => [TODOS, ...Array.from(new Set(aniimos.map((item) => item.funcao))).sort()],
    [aniimos],
  );

  const elementos = useMemo(
    () => [
      TODOS,
      ...Array.from(new Set(aniimos.flatMap((item) => item.elementos))).sort(),
    ],
    [aniimos],
  );

  const estagios = useMemo(
    () => [
      TODOS,
      ...Array.from(
        new Set(aniimos.map((item) => item.estagio).filter(Boolean) as string[]),
      ).sort(),
      "Não informado",
    ],
    [aniimos],
  );

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");

    return aniimos.filter((item) => {
      const correspondeBusca =
        !termo ||
        item.nome.toLocaleLowerCase("pt-BR").includes(termo) ||
        String(item.numero).includes(termo);

      const correspondeFuncao = funcao === TODOS || item.funcao === funcao;
      const correspondeElemento =
        elemento === TODOS || item.elementos.includes(elemento);
      const correspondeEstagio =
        estagio === TODOS ||
        (estagio === "Não informado" ? !item.estagio : item.estagio === estagio);

      return (
        correspondeBusca &&
        correspondeFuncao &&
        correspondeElemento &&
        correspondeEstagio
      );
    });
  }, [aniimos, busca, elemento, estagio, funcao]);

  return (
    <>
      <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4 md:grid-cols-2 xl:grid-cols-4">
        <label className="md:col-span-2 xl:col-span-1">
          <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
            Buscar
          </span>
          <input
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            placeholder="Nome ou número"
            className="w-full rounded-xl border border-white/10 bg-[#0b1020] px-4 py-3 outline-none transition placeholder:text-slate-600 focus:border-[var(--accent)]"
          />
        </label>

        <Filtro label="Função" value={funcao} onChange={setFuncao} options={funcoes} />
        <Filtro
          label="Elemento"
          value={elemento}
          onChange={setElemento}
          options={elementos}
        />
        <Filtro
          label="Estágio"
          value={estagio}
          onChange={setEstagio}
          options={estagios}
        />
      </div>

      <div className="mt-5 flex items-center justify-between gap-4 text-sm text-[var(--muted)]">
        <p>
          <strong className="text-white">{filtrados.length}</strong> de {aniimos.length} Aniimos
        </p>
        <button
          type="button"
          onClick={() => {
            setBusca("");
            setFuncao(TODOS);
            setElemento(TODOS);
            setEstagio(TODOS);
          }}
          className="transition hover:text-white"
        >
          Limpar filtros
        </button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtrados.map((aniimo) => (
          <article
            key={aniimo.slug}
            className="overflow-hidden rounded-2xl border border-white/10 bg-[var(--surface)] transition hover:-translate-y-0.5 hover:border-white/20"
          >
            <div className="relative flex h-48 items-center justify-center overflow-hidden bg-white/[0.025]">
              {aniimo.imagemUrl ? (
                <Image
                  src={aniimo.imagemUrl}
                  alt={aniimo.nome}
                  width={260}
                  height={260}
                  className="h-full w-full object-contain p-4"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full border border-dashed border-white/15 text-center text-xs font-semibold text-[var(--muted)]">
                  Imagem em breve
                </div>
              )}

              <span className="absolute left-4 top-4 rounded-full bg-black/50 px-3 py-1 text-xs font-bold backdrop-blur">
                {numeroFormatado(aniimo.numero)}
              </span>
            </div>

            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black tracking-tight">{aniimo.nome}</h2>
                  <p className="mt-1 text-sm text-[var(--muted)]">{aniimo.formaNome}</p>
                </div>
                <span className="rounded-lg bg-[var(--accent)]/10 px-2.5 py-1 text-xs font-bold text-[var(--accent)]">
                  {aniimo.funcao}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {aniimo.elementos.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-slate-300"
                  >
                    {item}
                  </span>
                ))}
                <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-slate-300">
                  {aniimo.estagio ?? "Estágio não informado"}
                </span>
              </div>

              <dl className="mt-5 grid grid-cols-3 gap-2 text-center text-xs">
                <Atributo label="HP" valor={aniimo.hp} />
                <Atributo label="ATK" valor={aniimo.ataque} />
                <Atributo label="BREAK" valor={aniimo.break} />
              </dl>
            </div>
          </article>
        ))}
      </div>

      {filtrados.length === 0 && (
        <div className="mt-8 rounded-2xl border border-dashed border-white/10 p-10 text-center text-[var(--muted)]">
          Nenhum Aniimo encontrado com esses filtros.
        </div>
      )}
    </>
  );
}

type FiltroProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
};

function Filtro({ label, value, onChange, options }: FiltroProps) {
  return (
    <label>
      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-white/10 bg-[#0b1020] px-4 py-3 outline-none transition focus:border-[var(--accent)]"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function Atributo({ label, valor }: { label: string; valor: number | null }) {
  return (
    <div className="rounded-xl bg-white/[0.04] px-2 py-3">
      <dt className="font-semibold text-[var(--muted)]">{label}</dt>
      <dd className="mt-1 text-base font-black text-white">{valor ?? "—"}</dd>
    </div>
  );
}
