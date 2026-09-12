import { RegionExplorer } from "@/components/region-explorer";
import { SiteShell } from "@/components/site-shell";
import { getMapRegions } from "@/lib/mapa";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Mapa",
  description:
    "Explore regiões oficiais, habitats e Aniimos relacionados no mundo de Aniimo.",
};

export default async function MapPage() {
  const regions = await getMapRegions();
  const totalAniimoRelations = regions.reduce((sum, region) => sum + region.totalAniimos, 0);
  const totalFormRelations = regions.reduce((sum, region) => sum + region.totalFormas, 0);

  return (
    <SiteShell>
      <main className="min-h-[70vh]">
        <section className="border-b border-white/10 bg-white/[0.02]">
          <div className="mx-auto max-w-7xl px-6 py-14 sm:py-16">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--accent)]">
                Exploração
              </p>
              <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
                Mapa e regiões
              </h1>
              <p className="mt-5 text-lg leading-8 text-[var(--muted)]">
                Explore as regiões cadastradas e veja quais Aniimos e formas possuem habitat oficial relacionado a cada área. Nesta etapa, usamos apenas relações confirmadas no banco, sem inventar coordenadas ou pontos do mapa.
              </p>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <SummaryCard label="Regiões oficiais" value={regions.length} />
              <SummaryCard label="Relações com Aniimos" value={totalAniimoRelations} />
              <SummaryCard label="Relações com formas" value={totalFormRelations} />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-12 sm:py-16">
          <RegionExplorer regions={regions} />
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-14 sm:pb-16">
          <div className="rounded-3xl border border-white/10 bg-[var(--surface)] p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent)]">
              Próxima camada
            </p>
            <h2 className="mt-2 text-2xl font-black">Mapa visual interativo</h2>
            <p className="mt-4 max-w-3xl leading-7 text-[var(--muted)]">
              A estrutura de dados de regiões e habitats já está funcional. A camada cartográfica visual será adicionada quando tivermos um mapa ou coordenadas oficiais confiáveis, para evitar posicionamentos estimados apresentados como dados do jogo.
            </p>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[var(--surface)] p-5">
      <p className="text-2xl font-black">{value}</p>
      <p className="mt-1 text-sm font-semibold text-[var(--muted)]">{label}</p>
    </div>
  );
}
