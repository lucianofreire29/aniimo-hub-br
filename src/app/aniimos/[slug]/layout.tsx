import Link from "next/link";
import type { ReactNode } from "react";

import { CollectionToggle } from "@/components/collection-toggle";
import { getAniimoBySlug } from "@/lib/aniimo-detail";

type AniimoDetailLayoutProps = {
  children: ReactNode;
  params: Promise<{ slug: string }>;
};

export default async function AniimoDetailLayout({ children, params }: AniimoDetailLayoutProps) {
  const { slug } = await params;
  const aniimo = await getAniimoBySlug(slug);

  return (
    <>
      {children}

      {aniimo && aniimo.formas.length > 0 && (
        <aside className="fixed bottom-5 right-5 z-40 w-[min(22rem,calc(100vw-2.5rem))]">
          <details className="group rounded-2xl border border-white/10 bg-[var(--surface)]/95 shadow-2xl shadow-black/40 backdrop-blur-xl">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-2xl px-5 py-4 font-black transition hover:bg-white/[0.04]">
              <span>Minha coleção</span>
              <span className="text-sm font-bold text-[var(--accent)] group-open:hidden">+ Adicionar</span>
              <span className="hidden text-sm font-bold text-[var(--muted)] group-open:inline">Fechar</span>
            </summary>

            <div className="border-t border-white/10 p-4">
              <p className="mb-3 text-xs leading-5 text-[var(--muted)]">
                Marque as formas de {aniimo.nome} que você já possui.
              </p>
              <div className="space-y-2">
                {aniimo.formas.map((forma) => (
                  <CollectionToggle
                    key={forma.id}
                    formaId={forma.id}
                    formaNome={forma.nome}
                    className="w-full px-3 py-2.5"
                  />
                ))}
              </div>
              <Link
                href="/colecao"
                className="mt-3 block rounded-xl border border-white/10 px-4 py-2.5 text-center text-sm font-bold text-[var(--muted)] transition hover:border-white/20 hover:text-white"
              >
                Ver minha coleção
              </Link>
            </div>
          </details>
        </aside>
      )}
    </>
  );
}
