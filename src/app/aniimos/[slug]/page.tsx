import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getAniimoBySlug } from "@/lib/aniimo-detail";
import type { AniimoFormaDetail, EvolucaoDetail } from "@/types/aniimo-detail";

export const dynamic = "force-dynamic";

type AniimoPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: AniimoPageProps): Promise<Metadata> {
  const { slug } = await params;
  const aniimo = await getAniimoBySlug(slug);

  if (!aniimo) {
    return { title: "Aniimo não encontrado | Aniimo Brasil" };
  }

  return {
    title: `${aniimo.nome} | Aniimo Brasil`,
    description: aniimo.descricao ?? `Informações, formas e habilidades de ${aniimo.nome}.`,
  };
}

export default async function AniimoPage({ params }: AniimoPageProps) {
  const { slug } = await params;
  const aniimo = await getAniimoBySlug(slug);

  if (!aniimo) {
    notFound();
  }

  const imagemPrincipal =
    aniimo.formas.find((forma) => forma.nome === "Basic Form")?.imagemUrl ??
    aniimo.formas[0]?.imagemUrl ??
    aniimo.imagemUrl;

  return (
    <main className="min-h-screen">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5">
          <Link href="/" className="text-xl font-black tracking-tight">
            Aniimo Brasil
          </Link>
          <Link
            href="/aniimos"
            className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-[var(--muted)] transition hover:border-white/20 hover:text-white"
          >
            ← Voltar ao catálogo
          </Link>
        </div>
      </header>

      <section className="border-b border-white/10 bg-white/[0.02]">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 lg:grid-cols-[360px_1fr] lg:items-center">
          <div className="relative flex min-h-80 items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-[var(--surface)]">
            {imagemPrincipal ? (
              <Image
                src={imagemPrincipal}
                alt={aniimo.nome}
                width={420}
                height={420}
                priority
                className="h-80 w-full object-contain p-6"
              />
            ) : (
              <div className="flex h-32 w-32 items-center justify-center rounded-full border border-dashed border-white/15 px-4 text-center text-sm font-semibold text-[var(--muted)]">
                Imagem em breve
              </div>
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-bold text-[var(--muted)]">
                {numeroFormatado(aniimo.numero)}
              </span>
              <span className="rounded-full bg-[var(--accent)]/10 px-3 py-1 text-xs font-bold text-[var(--accent)]">
                {aniimo.funcao}
              </span>
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-bold text-slate-300">
                {aniimo.estagio ?? "Estágio não informado"}
              </span>
            </div>

            <h1 className="mt-5 text-5xl font-black tracking-tight sm:text-6xl">{aniimo.nome}</h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-[var(--muted)]">
              {aniimo.descricao ?? "Descrição oficial ainda não cadastrada."}
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <span className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm">
                <strong>{aniimo.formas.length}</strong>{" "}
                {aniimo.formas.length === 1 ? "forma cadastrada" : "formas cadastradas"}
              </span>
              {aniimo.fonteUrl && (
                <a
                  href={aniimo.fonteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-[var(--accent)] transition hover:border-[var(--accent)]/40"
                >
                  Ver fonte oficial ↗
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-12">
        <Evolucoes evoluiDe={aniimo.evoluiDe} evoluiPara={aniimo.evoluiPara} />

        {aniimo.formas.length > 1 && (
          <nav className="mt-10 flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-white/[0.025] p-4">
            {aniimo.formas.map((forma) => (
              <a
                key={forma.slug}
                href={`#${forma.slug}`}
                className="rounded-lg border border-white/10 px-3 py-2 text-sm font-semibold text-slate-300 transition hover:border-[var(--accent)]/40 hover:text-[var(--accent)]"
              >
                {forma.nome}
              </a>
            ))}
          </nav>
        )}

        <div className="mt-10 space-y-10">
          {aniimo.formas.map((forma) => (
            <FormaSection key={forma.slug} forma={forma} aniimoNome={aniimo.nome} />
          ))}
        </div>
      </div>
    </main>
  );
}

function FormaSection({ forma, aniimoNome }: { forma: AniimoFormaDetail; aniimoNome: string }) {
  return (
    <section
      id={forma.slug}
      className="scroll-mt-6 overflow-hidden rounded-3xl border border-white/10 bg-[var(--surface)]"
    >
      <div className="grid border-b border-white/10 lg:grid-cols-[280px_1fr]">
        <div className="flex min-h-64 items-center justify-center bg-white/[0.025] p-5">
          {forma.imagemUrl ? (
            <Image
              src={forma.imagemUrl}
              alt={`${aniimoNome} - ${forma.nome}`}
              width={320}
              height={320}
              className="h-64 w-full object-contain"
            />
          ) : (
            <div className="flex h-28 w-28 items-center justify-center rounded-full border border-dashed border-white/15 px-3 text-center text-xs font-semibold text-[var(--muted)]">
              Imagem em breve
            </div>
          )}
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent)]">Forma</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight">{forma.nome}</h2>
            </div>
            {forma.fonteUrl && (
              <a
                href={forma.fonteUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-semibold text-[var(--accent)] hover:underline"
              >
                Fonte oficial ↗
              </a>
            )}
          </div>

          <p className="mt-4 max-w-3xl leading-7 text-[var(--muted)]">
            {forma.descricao ?? "Descrição oficial ainda não cadastrada para esta forma."}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {forma.elementos.map((elemento) => (
              <span
                key={elemento.slug}
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  elemento.principal
                    ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                    : "border border-white/10 text-slate-300"
                }`}
              >
                {elemento.nome}{elemento.principal ? " • principal" : ""}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <Atributo label="HP" valor={forma.atributos?.hp} />
          <Atributo label="ATK" valor={forma.atributos?.ataque} />
          <Atributo label="BREAK" valor={forma.atributos?.break} />
          <Atributo label="REGEN" valor={forma.atributos?.regen} />
          <Atributo label="M.DEF" valor={forma.atributos?.mDef} />
          <Atributo label="P.DEF" valor={forma.atributos?.pDef} />
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
          <InfoCard titulo="Trait">
            {forma.traits.length ? (
              forma.traits.map((trait) => (
                <InfoItem key={trait.slug} titulo={trait.nome} descricao={trait.descricao} />
              ))
            ) : (
              <Vazio />
            )}
          </InfoCard>

          <InfoCard titulo="Mobilidade">
            {forma.mobilidades.length ? (
              forma.mobilidades.map((mobilidade) => (
                <InfoItem
                  key={mobilidade.slug}
                  titulo={mobilidade.nome}
                  descricao={mobilidade.descricao}
                />
              ))
            ) : (
              <Vazio />
            )}
          </InfoCard>

          <InfoCard titulo="Pathfinding">
            {forma.pathfindings.length ? (
              forma.pathfindings.map((pathfinding) => (
                <InfoItem
                  key={`${pathfinding.slug}-${pathfinding.nivel}`}
                  titulo={`${pathfinding.nome} Lv.${pathfinding.nivel}`}
                  descricao={pathfinding.descricao}
                />
              ))
            ) : (
              <Vazio />
            )}
          </InfoCard>

          <InfoCard titulo="Homeland Ability">
            {forma.homeland.length ? (
              <div className="flex flex-wrap gap-2">
                {forma.homeland.map((valor, index) => (
                  <span
                    key={`${index}-${valor}`}
                    className="flex h-10 min-w-10 items-center justify-center rounded-xl bg-white/[0.05] px-3 font-black"
                  >
                    {valor}
                  </span>
                ))}
              </div>
            ) : (
              <Vazio />
            )}
          </InfoCard>
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-[0.7fr_1.3fr]">
          <div>
            <h3 className="text-xl font-black">Habitats</h3>
            {forma.regioes.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {forma.regioes.map((regiao) => (
                  <span
                    key={regiao.slug}
                    className="rounded-xl border border-white/10 bg-white/[0.025] px-3 py-2 text-sm text-slate-300"
                  >
                    {regiao.nome}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-[var(--muted)]">Habitat não informado na fonte oficial.</p>
            )}
          </div>

          <div>
            <h3 className="text-xl font-black">Habilidades</h3>
            <div className="mt-4 space-y-3">
              {forma.habilidades.map((habilidade) => (
                <article
                  key={`${habilidade.slug}-${habilidade.ordem ?? "x"}`}
                  className="rounded-2xl border border-white/10 bg-white/[0.025] p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h4 className="font-black">{habilidade.nome}</h4>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-[var(--muted)]">
                        {habilidade.categoria && <span>{habilidade.categoria}</span>}
                        {habilidade.tipoAtaque && <span>• {habilidade.tipoAtaque}</span>}
                        {habilidade.elemento && <span>• {habilidade.elemento}</span>}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <ValorSkill label="Poder" valor={habilidade.poder} />
                      <ValorSkill label="Custo" valor={habilidade.custo} />
                      {habilidade.cooldown !== null && (
                        <ValorSkill label="CD" valor={habilidade.cooldown} />
                      )}
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
                    {habilidade.descricao ?? "Descrição ainda não disponível na fonte cadastrada."}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Evolucoes({
  evoluiDe,
  evoluiPara,
}: {
  evoluiDe: EvolucaoDetail[];
  evoluiPara: EvolucaoDetail[];
}) {
  if (!evoluiDe.length && !evoluiPara.length) {
    return null;
  }

  return (
    <section>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent)]">Evolução</p>
      <h2 className="mt-2 text-3xl font-black tracking-tight">Linha evolutiva</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <EvolutionGroup titulo="Evolui de" itens={evoluiDe} />
        <EvolutionGroup titulo="Evolui para" itens={evoluiPara} />
      </div>
    </section>
  );
}

function EvolutionGroup({ titulo, itens }: { titulo: string; itens: EvolucaoDetail[] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
      <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--muted)]">{titulo}</h3>
      {itens.length ? (
        <div className="mt-4 space-y-3">
          {itens.map((item) => (
            <Link
              key={item.slug}
              href={`/aniimos/${item.slug}`}
              className="block rounded-xl border border-white/10 bg-[var(--surface)] p-4 transition hover:border-[var(--accent)]/40"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-black">{item.nome}</span>
                <span className="text-xs font-bold text-[var(--accent)]">{numeroFormatado(item.numero)}</span>
              </div>
              {(item.nivel || item.requisito) && (
                <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
                  {item.nivel ? `Nível ${item.nivel}` : ""}
                  {item.nivel && item.requisito ? " • " : ""}
                  {item.requisito}
                </p>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-[var(--muted)]">Nenhum registro.</p>
      )}
    </div>
  );
}

function InfoCard({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
      <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--muted)]">{titulo}</h3>
      <div className="mt-4 space-y-4">{children}</div>
    </div>
  );
}

function InfoItem({ titulo, descricao }: { titulo: string; descricao: string | null }) {
  return (
    <div>
      <p className="font-black">{titulo}</p>
      {descricao && <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{descricao}</p>}
    </div>
  );
}

function Atributo({ label, valor }: { label: string; valor: number | null | undefined }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-center">
      <p className="text-xs font-bold text-[var(--muted)]">{label}</p>
      <p className="mt-2 text-2xl font-black">{valor ?? "—"}</p>
    </div>
  );
}

function ValorSkill({ label, valor }: { label: string; valor: number | null }) {
  return (
    <span className="rounded-lg bg-white/[0.06] px-2.5 py-1.5 text-slate-300">
      {label}: <strong className="text-white">{valor ?? "—"}</strong>
    </span>
  );
}

function Vazio() {
  return <p className="text-sm text-[var(--muted)]">Não informado.</p>;
}

function numeroFormatado(numero: number) {
  return numero >= 1000 ? `#${numero}` : `#${String(numero).padStart(3, "0")}`;
}
