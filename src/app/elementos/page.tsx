import { ElementEffectivenessExplorer } from "@/components/element-effectiveness-explorer";
import { SiteShell } from "@/components/site-shell";

export const metadata = {
  title: "Elementos | Aniimo Brasil",
  description:
    "Consulte forças, fraquezas e multiplicadores de efetividade entre os elementos de Aniimo.",
};

export default function ElementsPage() {
  return (
    <SiteShell>
      <main className="min-h-screen">
        <section className="mx-auto max-w-7xl px-6 py-14">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-[var(--accent)]">
              Afinidades de combate
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
              Elementos
            </h1>
            <p className="mt-5 text-lg leading-8 text-[var(--muted)]">
              Compare os nove elementos, descubra contra quais eles são fortes ou fracos e consulte a tabela completa de multiplicadores de dano.
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              Esta primeira versão usa uma matriz comunitária do Aniidex como base. O Aniimo Brasil mantém a origem e a data de verificação visíveis para podermos corrigir os dados quando surgirem mudanças ou confirmação oficial.
            </p>
          </div>

          <div className="mt-10">
            <ElementEffectivenessExplorer />
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
