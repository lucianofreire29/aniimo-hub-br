import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteShell } from "@/components/site-shell";
import {
  localizeAcquisitionTitle,
  localizeAcquisitionType,
  localizeEffectAttribute,
  localizeItemQuality,
  localizeItemRarity,
  localizeLocation,
  localizeSourceScope,
} from "@/lib/item-localization";
import { getItemBySlug } from "@/lib/items";
import type { TranslationOrigin } from "@/types/item";

export const dynamic = "force-dynamic";

type ItemPageProps = {
  params: Promise<{ slug: string }>;
};

function translationLabel(origin: TranslationOrigin | null) {
  if (origin === "OFICIAL") return "PT-BR oficial";
  if (origin === "ANIIMO_BRASIL") return "Tradução Aniimo Brasil";
  return "PT-BR em revisão";
}

function formatVerificationDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function sourceLabel(tipo: string) {
  if (tipo === "COMUNIDADE_ANIIDEX") return "Aniidex · comunidade";
  if (tipo.includes("OFICIAL")) return "Fonte oficial";
  return tipo.replaceAll("_", " ");
}

function quantityLabel(min: number | null, max: number | null) {
  if (min === null && max === null) return null;
  if (min !== null && max !== null && min !== max) return `${min}–${max}`;
  return String(min ?? max);
}

export async function generateMetadata({ params }: ItemPageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = await getItemBySlug(slug);

  if (!item) return { title: "Item não encontrado | Aniimo Brasil" };

  const displayName = item.nomePtBr ?? item.nome;
  const description = item.descricaoPtBr ?? item.descricao;

  return {
    title: `${displayName} | Itens | Aniimo Brasil`,
    description: description ?? `Informações, obtenções, efeitos e fontes de ${displayName}.`,
  };
}

export default async function ItemPage({ params }: ItemPageProps) {
  const { slug } = await params;
  const item = await getItemBySlug(slug);

  if (!item) notFound();

  const displayName = item.nomePtBr ?? item.nome;
  const displayDescription = item.descricaoPtBr ?? item.descricao;
  const categoryLabel = item.categoria?.nomePtBr ?? item.categoria?.nome;
  const rarityLabel = localizeItemRarity(item.raridade);
  const qualityLabel = localizeItemQuality(item.qualidade);
  const verificationDate = formatVerificationDate(item.ultimaVerificacao);

  return (
    <SiteShell>
      <main className="min-h-[70vh]">
        <section className="border-b border-white/10 bg-white/[0.02]">
          <div className="mx-auto max-w-7xl px-6 py-12 sm:py-16">
            <Link href="/itens" className="text-sm font-bold text-[var(--accent)] transition hover:underline">
              ← Voltar para Itens
            </Link>

            <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr_340px] lg:items-start">
              <div className="flex min-h-72 items-center justify-center rounded-3xl border border-white/10 bg-[var(--surface)] p-6">
                {item.imagemUrl ? (
                  <Image
                    src={item.imagemUrl}
                    alt={displayName}
                    width={320}
                    height={320}
                    priority
                    className="h-64 w-64 object-contain"
                  />
                ) : (
                  <div className="flex h-36 w-36 items-center justify-center rounded-full border border-dashed border-white/15 px-5 text-center text-sm font-semibold text-[var(--muted)]">
                    Imagem em breve
                  </div>
                )}
              </div>

              <div>
                <div className="flex flex-wrap gap-2">
                  {categoryLabel && (
                    <span className="rounded-full bg-[var(--accent)]/10 px-3 py-1 text-xs font-bold text-[var(--accent)]">
                      {categoryLabel}
                    </span>
                  )}
                  {rarityLabel && (
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-bold">
                      {rarityLabel}
                    </span>
                  )}
                  {item.temDadosComunitarios && (
                    <span className="rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1 text-xs font-bold text-amber-200">
                      Dados comunitários
                    </span>
                  )}
                </div>

                <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-6xl">{displayName}</h1>
                {item.nomePtBr && item.nomePtBr !== item.nome && (
                  <p className="mt-2 text-base text-[var(--muted)]">Nome original: {item.nome}</p>
                )}

                <p className="mt-7 max-w-3xl text-base leading-8 text-[var(--muted)]">
                  {displayDescription ?? "Descrição ainda não disponível na fonte cadastrada."}
                </p>

                <div className="mt-5 flex flex-wrap gap-2 text-xs text-[var(--muted)]">
                  <span className="rounded-lg border border-white/10 px-2.5 py-1.5">
                    {translationLabel(item.nomePtBrOrigem)}
                  </span>
                  {item.cp !== null && (
                    <span className="rounded-lg border border-white/10 px-2.5 py-1.5">CP {item.cp}</span>
                  )}
                  {qualityLabel && (
                    <span className="rounded-lg border border-white/10 px-2.5 py-1.5">{qualityLabel}</span>
                  )}
                </div>
              </div>

              <aside className="rounded-3xl border border-white/10 bg-[var(--surface)] p-6">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent)]">Referência</p>
                <dl className="mt-5 space-y-5 text-sm">
                  <div>
                    <dt className="font-semibold text-[var(--muted)]">Categoria</dt>
                    <dd className="mt-1 font-bold">{categoryLabel ?? "Não informada"}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-[var(--muted)]">Raridade</dt>
                    <dd className="mt-1 font-bold">{rarityLabel ?? "Não informada"}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-[var(--muted)]">Última verificação</dt>
                    <dd className="mt-1 font-bold">{verificationDate ?? "Não informada"}</dd>
                  </div>
                </dl>

                <p className="mt-7 rounded-xl border border-white/10 p-4 text-sm leading-6 text-[var(--muted)]">
                  Informações oficiais e comunitárias são mantidas separadas. Veja todas as fontes usadas mais abaixo.
                </p>
              </aside>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-6 px-6 py-12 sm:py-16 lg:grid-cols-2">
          <InfoSection eyebrow="Aquisição" title="Como conseguir" empty="Nenhuma forma de obtenção cadastrada ainda.">
            {item.obtencoes.map((obtain) => {
              const quantity = quantityLabel(obtain.quantidadeMin, obtain.quantidadeMax);
              const obtainTitle = localizeAcquisitionTitle(obtain.titulo);
              const locationLabel = localizeLocation(obtain.localNome);
              return (
                <article key={obtain.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-[var(--accent)]/10 px-2.5 py-1 text-[10px] font-black text-[var(--accent)]">
                      {localizeAcquisitionType(obtain.tipo)}
                    </span>
                    {locationLabel && <span className="text-xs text-[var(--muted)]">{locationLabel}</span>}
                  </div>
                  <h3 className="mt-3 font-black">{obtainTitle ?? "Fonte de obtenção"}</h3>
                  {obtain.descricao && <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{obtain.descricao}</p>}
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-[var(--muted)]">
                    {quantity && <span>Quantidade: {quantity}</span>}
                    {obtain.npcNome && <span>NPC: {obtain.npcNome}</span>}
                    {obtain.custoQuantidade !== null && (
                      <span>Custo: {obtain.custoQuantidade}{obtain.moedaNome ? ` ${obtain.moedaNome}` : ""}</span>
                    )}
                    {obtain.chancePercentual !== null && <span>Chance: {obtain.chancePercentual}%</span>}
                  </div>
                  {obtain.requisito && <p className="mt-3 text-xs text-[var(--muted)]">Requisito: {obtain.requisito}</p>}
                </article>
              );
            })}
          </InfoSection>

          <InfoSection eyebrow="Mecânicas" title="Efeitos" empty="Nenhum efeito estruturado cadastrado para este item.">
            {item.efeitos.map((effect) => (
              <article key={effect.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-md border border-white/10 px-2.5 py-1 font-black">
                    {effect.nivelMelhoria === 0 ? "Base" : `+${effect.nivelMelhoria}`}
                  </span>
                  {effect.atributo && (
                    <span className="font-bold text-[var(--accent)]">
                      {localizeEffectAttribute(effect.atributo)}
                    </span>
                  )}
                  {effect.valorNumerico !== null && (
                    <span className="font-black">{effect.valorNumerico}{effect.unidade ?? ""}</span>
                  )}
                </div>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                  {effect.descricaoPtBr ?? effect.descricao}
                </p>
                {effect.condicao && <p className="mt-2 text-xs text-[var(--muted)]">Condição: {effect.condicao}</p>}
              </article>
            ))}
          </InfoSection>

          <InfoSection eyebrow="Conteúdo" title="O que vem nele" empty="Este item não possui conteúdo interno cadastrado.">
            {item.conteudos.map((content) => {
              const quantity = quantityLabel(content.quantidadeMin, content.quantidadeMax);
              return (
                <Link
                  key={content.id}
                  href={`/itens/${content.itemSlug}`}
                  className="block rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition hover:border-[var(--accent)]/30"
                >
                  <h3 className="font-black">{content.itemNomePtBr ?? content.itemNome}</h3>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-[var(--muted)]">
                    {quantity && <span>Quantidade: {quantity}</span>}
                    {content.chancePercentual !== null && <span>Chance: {content.chancePercentual}%</span>}
                  </div>
                  {content.condicao && <p className="mt-2 text-xs text-[var(--muted)]">{content.condicao}</p>}
                </Link>
              );
            })}
          </InfoSection>

          <InfoSection eyebrow="Rastreabilidade" title="Fontes" empty="Nenhuma fonte cadastrada para este item.">
            {item.fontes.map((source) => (
              <a
                key={`${source.url}-${source.escopo ?? "geral"}`}
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="block rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition hover:border-[var(--accent)]/30"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-md px-2.5 py-1 text-[10px] font-black ${
                    source.tipo === "COMUNIDADE_ANIIDEX"
                      ? "bg-amber-300/10 text-amber-200"
                      : "bg-[var(--accent)]/10 text-[var(--accent)]"
                  }`}>
                    {sourceLabel(source.tipo)}
                  </span>
                  {source.principal && <span className="text-xs text-[var(--muted)]">Principal</span>}
                </div>
                <h3 className="mt-3 font-black">{source.titulo ?? source.url}</h3>
                {source.escopo && (
                  <p className="mt-2 text-xs text-[var(--muted)]">
                    Escopo: {localizeSourceScope(source.escopo)}
                  </p>
                )}
                <p className="mt-2 text-xs text-[var(--muted)]">
                  Verificado em {formatVerificationDate(source.verificadoEm) ?? "data não informada"} ↗
                </p>
              </a>
            ))}
          </InfoSection>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-12 sm:pb-16">
          <div className="rounded-3xl border border-dashed border-white/15 p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent)]">Política de dados</p>
            <h2 className="mt-2 text-2xl font-black">Informações em PT-BR com fonte rastreável</h2>
            <p className="mt-4 max-w-4xl leading-7 text-[var(--muted)]">
              O Aniimo Brasil apresenta as informações ao público brasileiro em PT-BR. O nome original e os termos da fonte são preservados internamente para auditoria. Dados comunitários, como os reproduzidos do Aniidex, são identificados separadamente e podem mudar com patches até que uma fonte oficial permita confirmar ou substituir a informação.
            </p>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}

function InfoSection({
  eyebrow,
  title,
  empty,
  children,
}: {
  eyebrow: string;
  title: string;
  empty: string;
  children: React.ReactNode;
}) {
  const hasChildren = Array.isArray(children) ? children.length > 0 : Boolean(children);

  return (
    <section className="rounded-3xl border border-white/10 bg-[var(--surface)] p-6 sm:p-7">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent)]">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-black">{title}</h2>
      <div className="mt-5 space-y-3">
        {hasChildren ? children : <p className="text-sm leading-6 text-[var(--muted)]">{empty}</p>}
      </div>
    </section>
  );
}
