import { ItemCatalog } from "@/components/item-catalog";
import { SiteShell } from "@/components/site-shell";
import { getItemsCatalog } from "@/lib/items";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Itens | Aniimo Brasil",
  description:
    "Catálogo de itens do Aniimo Brasil com dados oficiais e comunitários rastreáveis, raridade, categorias e referências.",
};

export default async function ItemsPage() {
  const items = await getItemsCatalog();
  const categories = new Set(items.map((item) => item.categoria?.slug).filter(Boolean)).size;
  const officialTranslations = items.filter((item) => item.nomePtBrOrigem === "OFICIAL").length;
  const communityItems = items.filter((item) => item.temDadosComunitarios).length;

  return (
    <SiteShell>
      <main className="min-h-[70vh]">
        <section className="border-b border-white/10 bg-white/[0.02]">
          <div className="mx-auto max-w-7xl px-6 py-14 sm:py-16">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--accent)]">
                Base de dados
              </p>
              <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Itens</h1>
              <p className="mt-5 text-lg leading-8 text-[var(--muted)]">
                Consulte itens, categorias, raridades, efeitos e formas de obtenção. Dados oficiais continuam priorizados; quando uma informação vem de uma base comunitária, a origem e a data de verificação ficam identificadas para revisão futura.
              </p>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <SummaryCard label="Itens ativos" value={items.length} />
              <SummaryCard label="Categorias" value={categories} />
              <SummaryCard label="PT-BR oficial" value={officialTranslations} />
              <SummaryCard label="Com dados comunitários" value={communityItems} />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-12 sm:py-16">
          <ItemCatalog items={items} />
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
