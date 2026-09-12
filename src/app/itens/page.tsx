import { ItemCatalog } from "@/components/item-catalog";
import { getItemsCatalog } from "@/lib/items";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Itens | Aniimo Brasil",
  description: "Catálogo de itens do Aniimo Brasil com dados organizados a partir de fontes oficiais.",
};

export default async function ItemsPage() {
  const items = await getItemsCatalog();

  return (
    <main className="min-h-[70vh]">
      <section className="border-b border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-6 py-14 sm:py-16">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--accent)]">
              Base de dados
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Itens</h1>
            <p className="mt-5 text-lg leading-8 text-[var(--muted)]">
              Consulte itens confirmados em fontes oficiais. O catálogo separa o nome canônico em inglês da tradução oficial em português quando ambas estiverem disponíveis.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12 sm:py-16">
        <ItemCatalog items={items} />
      </section>
    </main>
  );
}
