import Link from "next/link";

import { AniimoCatalog } from "@/components/aniimo-catalog";
import { getAniimosCatalog } from "@/lib/aniimos";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Catálogo de Aniimos | Aniimo Brasil",
  description:
    "Consulte Aniimos, elementos, funções, estágios e atributos no catálogo do Aniimo Brasil.",
};

export default async function AniimosPage() {
  const aniimos = await getAniimosCatalog();

  return (
    <main className="min-h-screen">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5">
          <Link href="/" className="text-xl font-black tracking-tight">
            Aniimo Brasil
          </Link>
          <Link
            href="/"
            className="text-sm font-semibold text-[var(--muted)] transition hover:text-white"
          >
            Voltar para o início
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-[var(--accent)]">
            Base de dados Aniimo Brasil
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
            Catálogo de Aniimos
          </h1>
          <p className="mt-5 text-lg leading-8 text-[var(--muted)]">
            Explore os Aniimos cadastrados a partir das informações organizadas no nosso banco de dados, com referência às fontes oficiais.
          </p>
        </div>

        <div className="mt-10">
          <AniimoCatalog aniimos={aniimos} />
        </div>
      </section>
    </main>
  );
}
