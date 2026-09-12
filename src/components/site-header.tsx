"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { accountNavigation, primaryNavigation, toolsNavigation } from "@/lib/navigation";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[var(--background)]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-5 px-6 py-4">
        <Link href="/" className="shrink-0 text-lg font-black tracking-tight sm:text-xl">
          Aniimo Brasil
        </Link>

        <nav className="hidden flex-1 items-center gap-1 lg:flex" aria-label="Navegação principal">
          {primaryNavigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                isActive(pathname, item.href)
                  ? "bg-white/[0.07] text-white"
                  : "text-[var(--muted)] hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}

          <details className="group relative">
            <summary className="cursor-pointer list-none rounded-lg px-3 py-2 text-sm font-semibold text-[var(--muted)] transition hover:bg-white/[0.04] hover:text-white">
              Ferramentas
            </summary>
            <div className="absolute left-0 top-full mt-2 w-72 rounded-2xl border border-white/10 bg-[var(--surface)] p-2 shadow-2xl shadow-black/30">
              {toolsNavigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-xl p-3 transition hover:bg-white/[0.05]"
                >
                  <span className="block text-sm font-bold">{item.label}</span>
                  {item.description && (
                    <span className="mt-1 block text-xs leading-5 text-[var(--muted)]">
                      {item.description}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </details>
        </nav>

        <div className="ml-auto hidden items-center gap-2 lg:flex">
          {accountNavigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                isActive(pathname, item.href)
                  ? "border-[var(--accent)]/40 text-[var(--accent)]"
                  : "border-white/10 text-[var(--muted)] hover:border-white/20 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <details className="relative ml-auto lg:hidden">
          <summary className="cursor-pointer list-none rounded-xl border border-white/10 px-4 py-2 text-sm font-bold">
            Menu
          </summary>
          <div className="absolute right-0 top-full mt-2 max-h-[75vh] w-72 overflow-y-auto rounded-2xl border border-white/10 bg-[var(--surface)] p-2 shadow-2xl shadow-black/30">
            {[...primaryNavigation, ...toolsNavigation, ...accountNavigation].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-xl px-3 py-3 text-sm font-semibold transition ${
                  isActive(pathname, item.href)
                    ? "bg-white/[0.07] text-white"
                    : "text-[var(--muted)] hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </details>
      </div>
    </header>
  );
}
