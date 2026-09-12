import { SiteShell } from "@/components/site-shell";
import { TierListBuilder } from "@/components/tier-list-builder";
import { getCollectionCatalog } from "@/lib/collection";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Tier List | Aniimo Brasil",
  description:
    "Crie uma Tier List pessoal com Aniimos e formas cadastradas e salve sua classificação neste navegador.",
};

export default async function TierListPage() {
  const items = await getCollectionCatalog();

  return (
    <SiteShell>
      <main className="min-h-screen">
        <section className="mx-auto max-w-7xl px-6 py-14">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-[var(--accent)]">
              Ferramenta de classificação
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Tier List</h1>
            <p className="mt-5 text-lg leading-8 text-[var(--muted)]">
              Organize Aniimos e formas nos tiers S, A, B, C e D de acordo com a sua própria avaliação.
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              Esta versão é totalmente pessoal e não representa um ranking oficial do Aniimo Brasil nem do jogo. A classificação fica salva somente neste navegador.
            </p>
          </div>

          <div className="mt-10">
            <TierListBuilder items={items} />
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
