import Link from "next/link";

import { SiteShell } from "@/components/site-shell";

const recursos = [
  {
    titulo: "Catálogo de Aniimos",
    descricao:
      "Consulte formas, atributos, elementos, habilidades, funções e habitats em um só lugar.",
    href: "/aniimos",
  },
  {
    titulo: "Mapa e exploração",
    descricao:
      "Explore a estrutura preparada para regiões, habitats e futuros pontos de interesse.",
    href: "/mapa",
  },
  {
    titulo: "Montador de times",
    descricao:
      "Organize composições e prepare comparações usando os dados do catálogo.",
    href: "/times",
  },
  {
    titulo: "Guias e atualizações",
    descricao:
      "Conteúdo em português, patch notes e histórico de mudanças com fontes oficiais.",
    href: "/guias",
  },
];

export default function Home() {
  return (
    <SiteShell>
      <main>
        <section className="mx-auto grid max-w-6xl gap-12 px-6 py-24 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.22em] text-[var(--accent)]">
              Sua base de conhecimento em português
            </p>
            <h1 className="max-w-3xl text-5xl font-black leading-tight tracking-tight sm:text-6xl">
              Tudo sobre Aniimo em um só lugar.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
              O Aniimo Brasil reúne informações oficiais, ferramentas úteis e uma estrutura preparada para a comunidade brasileira.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/aniimos"
                className="rounded-xl bg-[var(--accent)] px-5 py-3 font-bold text-[#0b1020] transition hover:bg-[var(--accent-strong)]"
              >
                Explorar Aniimos
              </Link>
              <Link
                href="/mapa"
                className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-[var(--muted)] transition hover:border-white/20 hover:text-white"
              >
                Ver estrutura do mapa
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 shadow-2xl shadow-black/20">
            <div className="rounded-2xl border border-white/10 bg-[var(--surface)] p-6">
              <p className="text-sm font-semibold text-[var(--accent)]">Base de dados</p>
              <h2 className="mt-2 text-2xl font-bold">Catálogo conectado ao Neon</h2>
              <p className="mt-3 leading-7 text-[var(--muted)]">
                Aniimos, formas, atributos, elementos, funções e estágios já são consultados diretamente da base organizada do projeto.
              </p>
            </div>
          </div>
        </section>

        <section id="recursos" className="border-y border-white/10 bg-white/[0.02]">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-[var(--accent)]">
                Estrutura
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                Módulos do Aniimo Brasil
              </h2>
              <p className="mt-4 leading-7 text-[var(--muted)]">
                Estamos construindo primeiro a base de cada área para depois aprofundar dados, ferramentas e interação.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {recursos.map((recurso) => (
                <Link
                  key={recurso.titulo}
                  href={recurso.href}
                  className="rounded-2xl border border-white/10 bg-[var(--surface)] p-6 transition hover:border-[var(--accent)]/35"
                >
                  <h3 className="text-xl font-bold">{recurso.titulo}</h3>
                  <p className="mt-3 leading-7 text-[var(--muted)]">{recurso.descricao}</p>
                  <span className="mt-5 inline-block text-sm font-bold text-[var(--accent)]">
                    Abrir módulo →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section id="sobre" className="mx-auto max-w-6xl px-6 py-20">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-black tracking-tight">Sobre o projeto</h2>
            <p className="mt-5 leading-8 text-[var(--muted)]">
              O Aniimo Brasil é um projeto independente voltado à comunidade brasileira. As informações são organizadas com referência às fontes oficiais do jogo e histórico de verificação no banco de dados.
            </p>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
