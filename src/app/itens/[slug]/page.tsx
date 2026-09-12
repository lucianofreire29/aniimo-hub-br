import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getItemBySlug } from "@/lib/items";
import type { TranslationOrigin } from "@/types/item";

export const dynamic = "force-dynamic";

type ItemPageProps = {
  params: Promise<{ slug: string }>;
};

function translationLabel(origin: TranslationOrigin | null) {
  if (origin === "OFICIAL") return "PT-BR oficial";
  if (origin === "ANIIMO_BRASIL") return "Tradução Aniimo Brasil";
  return "Tradução não classificada";
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

export async function generateMetadata({ params }: ItemPageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = await getItemBySlug(slug);

  if (!item) {
    return { title: "Item não encontrado | Aniimo Brasil" };
  }

  const displayName = item.nomePtBr ?? item.nome;
  const description = item.descricaoPtBr ?? item.descricao;

  return {
    title: `${displayName} | Itens | Aniimo Brasil`,
    description: description ?? `Informações e fonte oficial de ${displayName}.`,
  };
}

export default async function ItemPage({ params }: ItemPageProps) {
  const { slug } = await params;
  const item = await getItemBySlug(slug);

  if (!item) {
    notFound();
  }

  const displayName = item.nomePtBr ?? item.nome;
  const displayDescription = item.descricaoPtBr ?? item.descricao;
  const categoryLabel = item.categoria?.nomePtBr ?? item.categoria?.nome;
  const verificationDate = formatVerificationDate(item.ultimaVerificacao);

  return (
    <main className="min-h-[70vh]">
      <section className="border-b border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-6 py-12 sm:py-16">
          <Link
            href="/itens"
            className="text-sm font-bold text-[var(--accent)] transition hover:underline"
          >
            ← Voltar para Itens
          </Link>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px] lg:items-start">
            <div>
              <div className="flex flex-wrap gap-2">
                {categoryLabel ? (
                  <span className="rounded-full bg-[var(--accent)]/10 px-3 py-1 text-xs font-bold text-[var(--accent)]">
                    {categoryLabel}
                  </span>
                ) : (
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-[var(--muted)]">
                    Categoria não informada
                  </span>
                )}
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-[var(--muted)]">
                  {translationLabel(item.nomePtBrOrigem)}
                </span>
              </div>

              <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-6xl">{displayName}</h1>
              {item.nomePtBr && item.nomePtBr !== item.nome && (
                <p className="mt-2 text-base text-[var(--muted)]">Nome original: {item.nome}</p>
              )}

              <p className="mt-7 max-w-3xl text-base leading-8 text-[var(--muted)]">
                {displayDescription ?? "Descrição ainda não disponível na fonte cadastrada."}
              </p>

              {item.descricaoPtBr && (
                <p className="mt-3 text-xs font-semibold text-[var(--muted)]">
                  Descrição: {translationLabel(item.descricaoPtBrOrigem)}
                </p>
              )}
            </div>

            <aside className="rounded-3xl border border-white/10 bg-[var(--surface)] p-6">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent)]">
                Referência
              </p>

              <dl className="mt-5 space-y-5 text-sm">
                <div>
                  <dt className="font-semibold text-[var(--muted)]">Slug</dt>
                  <dd className="mt-1 font-bold">{item.slug}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-[var(--muted)]">Categoria</dt>
                  <dd className="mt-1 font-bold">{categoryLabel ?? "Não informada"}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-[var(--muted)]">Última verificação</dt>
                  <dd className="mt-1 font-bold">{verificationDate ?? "Não informada"}</dd>
                </div>
              </dl>

              {item.fonteUrl ? (
                <a
                  href={item.fonteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-7 block rounded-xl bg-[var(--accent)] px-4 py-3 text-center text-sm font-black text-black transition hover:opacity-90"
                >
                  Abrir fonte oficial ↗
                </a>
              ) : (
                <p className="mt-7 rounded-xl border border-white/10 p-4 text-sm leading-6 text-[var(--muted)]">
                  Fonte individual ainda não cadastrada para este item.
                </p>
              )}
            </aside>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12 sm:py-16">
        <div className="rounded-3xl border border-white/10 bg-[var(--surface)] p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent)]">
            Política de dados
          </p>
          <h2 className="mt-2 text-2xl font-black">Como esta informação é tratada</h2>
          <p className="mt-4 max-w-3xl leading-7 text-[var(--muted)]">
            O Aniimo Brasil preserva o nome e o conteúdo original em inglês. Quando existe localização oficial em português, ela é priorizada; nos demais casos, a tradução editorial do Aniimo Brasil é exibida com sua origem identificada.
          </p>
        </div>
      </section>
    </main>
  );
}
