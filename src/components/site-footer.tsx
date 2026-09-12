import Link from "next/link";

import { primaryNavigation, toolsNavigation } from "@/lib/navigation";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-white/10">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div>
          <p className="font-black">Aniimo Brasil</p>
          <p className="mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">
            Portal independente em português com informações, ferramentas e recursos para a comunidade de Aniimo.
          </p>
        </div>

        <div>
          <p className="text-sm font-bold">Explorar</p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-[var(--muted)]">
            {primaryNavigation.slice(1).map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-white">
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-bold">Ferramentas</p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-[var(--muted)]">
            {toolsNavigation.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-white">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-6 py-5 text-center text-xs text-[var(--muted)]">
        Aniimo Brasil • Projeto independente em desenvolvimento
      </div>
    </footer>
  );
}
