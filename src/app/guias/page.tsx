import { BuildPlanner } from "@/components/build-planner";
import { SiteShell } from "@/components/site-shell";
import { getBuildPlannerData } from "@/lib/builds";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Builds e guias | Aniimo Brasil",
  description:
    "Consulte dados cadastrados de cada forma, equipe Carried Items e acompanhe os efeitos calculáveis por nível do Aniimo.",
};

export default async function GuidesPage() {
  const { forms, carriedItems } = await getBuildPlannerData();

  return (
    <SiteShell>
      <main className="min-h-screen">
        <section className="mx-auto max-w-7xl px-6 py-14">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-[var(--accent)]">
              Builds e guias por Aniimo
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
              Planejador de builds
            </h1>
            <p className="mt-5 text-lg leading-8 text-[var(--muted)]">
              Escolha uma forma, consulte atributos, traits e habilidades e equipe um Carried Item para visualizar seus efeitos e os bônus que podem ser calculados pelo nível do Aniimo.
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              Consumíveis, itens de captura e materiais não entram nesta ferramenta. Os efeitos numéricos de Carried Items que ainda não aparecem em uma fonte oficial pública são identificados como dados do jogo reproduzidos por fontes comunitárias e mantidos separados dos dados oficiais do catálogo.
            </p>
          </div>

          <div className="mt-10">
            <BuildPlanner forms={forms} carriedItems={carriedItems} />
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
