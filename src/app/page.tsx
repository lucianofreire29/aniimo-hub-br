const recursos = [
  {
    titulo: "Catálogo de Aniimos",
    descricao:
      "Consulte formas, atributos, elementos, habilidades, funções e habitats em um só lugar.",
  },
  {
    titulo: "Evoluções",
    descricao:
      "Visualize as linhas evolutivas e ramificações de cada família de Aniimo.",
  },
  {
    titulo: "Mapa e exploração",
    descricao:
      "Encontre regiões, habitats e recursos para facilitar sua exploração pelo mundo de Aniimo.",
  },
  {
    titulo: "Guias e ferramentas",
    descricao:
      "Conteúdo em português, comparações, times, tier lists e ferramentas para a comunidade.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <span className="text-xl font-black tracking-tight">Aniimo Brasil</span>
            <span className="ml-2 rounded-full bg-[var(--accent)]/10 px-2 py-1 text-xs font-semibold text-[var(--accent)]">
              Em desenvolvimento
            </span>
          </div>

          <nav className="hidden gap-6 text-sm text-[var(--muted)] md:flex">
            <a className="transition hover:text-white" href="#recursos">
              Recursos
            </a>
            <a className="transition hover:text-white" href="#sobre">
              Sobre
            </a>
          </nav>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-12 px-6 py-24 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div>
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.22em] text-[var(--accent)]">
            Sua base de conhecimento em português
          </p>
          <h1 className="max-w-3xl text-5xl font-black leading-tight tracking-tight sm:text-6xl">
            Tudo sobre Aniimo em um só lugar.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
            O Aniimo Brasil nasce para reunir informações oficiais, ferramentas úteis e conteúdo feito para a comunidade brasileira.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <a
              href="#recursos"
              className="rounded-xl bg-[var(--accent)] px-5 py-3 font-bold text-[#0b1020] transition hover:bg-[var(--accent-strong)]"
            >
              Conhecer o projeto
            </a>
            <span className="rounded-xl border border-white/10 px-5 py-3 text-sm text-[var(--muted)]">
              Catálogo conectado ao Neon em breve
            </span>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 shadow-2xl shadow-black/20">
          <div className="rounded-2xl border border-white/10 bg-[var(--surface)] p-6">
            <p className="text-sm font-semibold text-[var(--accent)]">Base de dados</p>
            <h2 className="mt-2 text-2xl font-bold">Estrutura pronta para o catálogo</h2>
            <p className="mt-3 leading-7 text-[var(--muted)]">
              Aniimos, formas, atributos, elementos, habilidades, traits, habitats, pathfinding e evoluções já possuem estrutura própria no banco.
            </p>
          </div>
        </div>
      </section>

      <section id="recursos" className="border-y border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-[var(--accent)]">
              Planejamento
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              O que o Aniimo Brasil vai oferecer
            </h2>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {recursos.map((recurso) => (
              <article
                key={recurso.titulo}
                className="rounded-2xl border border-white/10 bg-[var(--surface)] p-6"
              >
                <h3 className="text-xl font-bold">{recurso.titulo}</h3>
                <p className="mt-3 leading-7 text-[var(--muted)]">{recurso.descricao}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="sobre" className="mx-auto max-w-6xl px-6 py-20">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-black tracking-tight">Sobre o projeto</h2>
          <p className="mt-5 leading-8 text-[var(--muted)]">
            O Aniimo Brasil é um projeto independente voltado à comunidade brasileira. As informações do catálogo serão organizadas com referência às fontes oficiais do jogo e com histórico de verificação no banco de dados.
          </p>
        </div>
      </section>

      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-8 text-sm text-[var(--muted)]">
          Aniimo Brasil • Projeto independente em desenvolvimento
        </div>
      </footer>
    </main>
  );
}
