import { BuildPlanner } from "@/components/build-planner";
import { SiteShell } from "@/components/site-shell";
import { getBuildPlannerData } from "@/lib/builds";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Builds e guias | Aniimo Brasil",
  description:
    "Consulte dados cadastrados de cada forma, organize itens de referência e salve notas pessoais de build no navegador.",
};

export default async function GuidesPage() {
  const { forms, items } = await getBuildPlannerData();

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
              Escolha uma forma para consultar atributos, elementos, traits e habilidades já cadastrados e monte suas próprias referências de itens e estratégia.
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              Nesta primeira versão, itens e notas são escolhas pessoais salvas somente neste navegador. O módulo não apresenta essas escolhas como build oficial ou ranking de meta.
            </p>
          </div>

          <div className="mt-10">
            <BuildPlanner forms={forms} items={items} />
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
