import Link from "next/link";

import { SiteShell } from "@/components/site-shell";

export type ModuleFeature = {
  title: string;
  description: string;
};

type ModulePlaceholderProps = {
  eyebrow: string;
  title: string;
  description: string;
  status?: string;
  features: ModuleFeature[];
  primaryAction?: { href: string; label: string };
};

export function ModulePlaceholder({
  eyebrow,
  title,
  description,
  status = "Estrutura inicial",
  features,
  primaryAction,
}: ModulePlaceholderProps) {
  return (
    <SiteShell>
      <main className="min-h-[70vh]">
        <section className="border-b border-white/10 bg-white/[0.02]">
          <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--accent)]">
                  {eyebrow}
                </p>
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-[var(--muted)]">
                  {status}
                </span>
              </div>
              <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">{title}</h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]">{description}</p>

              {primaryAction && (
                <Link
                  href={primaryAction.href}
                  className="mt-8 inline-flex rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-black text-[#0b1020] transition hover:bg-[var(--accent-strong)]"
                >
                  {primaryAction.label}
                </Link>
              )}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-12 sm:py-16">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--accent)]">
              Planejamento do módulo
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Estrutura prevista</h2>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature) => (
              <article key={feature.title} className="rounded-2xl border border-white/10 bg-[var(--surface)] p-6">
                <h3 className="font-black">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{feature.description}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
