import { TeamBuilder } from "@/components/team-builder";
import { SiteShell } from "@/components/site-shell";
import { getCollectionCatalog } from "@/lib/collection";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Montador de times | Aniimo Brasil",
  description:
    "Monte composições com Aniimos e formas cadastradas, visualize funções e elementos e salve seu time neste navegador.",
};

export default async function TeamsPage() {
  const items = await getCollectionCatalog();

  return (
    <SiteShell>
      <main className="min-h-screen">
        <section className="mx-auto max-w-7xl px-6 py-14">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-[var(--accent)]">
              Ferramenta de composição
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
              Montador de times
            </h1>
            <p className="mt-5 text-lg leading-8 text-[var(--muted)]">
              Selecione Aniimos e formas do catálogo, compare a distribuição de funções e elementos e monte uma composição para consultar durante o jogo.
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              Esta primeira versão usa quatro slots de planejamento e salva automaticamente o time neste navegador. A quantidade de slots poderá ser ajustada caso regras oficiais diferentes sejam confirmadas.
            </p>
          </div>

          <div className="mt-10">
            <TeamBuilder items={items} />
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
