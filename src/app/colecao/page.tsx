import { CollectionCatalog } from "@/components/collection-catalog";
import { SiteShell } from "@/components/site-shell";
import { getCollectionCatalog } from "@/lib/collection";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Minha coleção | Aniimo Brasil",
  description:
    "Marque os Aniimos e formas que você já possui e acompanhe o progresso da sua coleção.",
};

export default async function CollectionPage() {
  const items = await getCollectionCatalog();

  return (
    <SiteShell>
      <main className="min-h-screen">
        <section className="mx-auto max-w-7xl px-6 py-14">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-[var(--accent)]">
              Ferramenta pessoal
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Minha coleção</h1>
            <p className="mt-5 text-lg leading-8 text-[var(--muted)]">
              Marque as formas que você já possui, acompanhe o total de Aniimos encontrados e veja rapidamente o que ainda falta na sua coleção.
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              Nesta primeira versão, o progresso fica salvo somente neste navegador. A sincronização com uma conta será adicionada quando o sistema de autenticação estiver pronto.
            </p>
          </div>

          <div className="mt-10">
            <CollectionCatalog items={items} />
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
