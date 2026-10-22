import Link from "next/link";
import { Logo } from "@/components/marca/Logo";

const ABAS = [
  { href: "/admin/cotacoes", rotulo: "Cotações" },
  { href: "/admin/metricas", rotulo: "Métricas" },
];

export function MolduraAdmin({ atual, children }: { atual?: string; children: React.ReactNode }) {
  return (
    <div className="min-h-svh bg-ceu">
      <header className="bg-superficie">
        <div className="mx-auto flex h-[76px] max-w-6xl items-center justify-between gap-6 px-4 sm:px-8">
          <Logo />
          {atual && (
            <nav aria-label="Painel" className="flex gap-1">
              {ABAS.map((a) => (
                <Link
                  key={a.href}
                  href={a.href}
                  aria-current={a.href === atual ? "page" : undefined}
                  className={`rounded-full px-4 py-2 text-[0.9375rem] font-semibold transition-colors ${
                    a.href === atual ? "bg-marca-escura text-white" : "hover:bg-ceu"
                  }`}
                >
                  {a.rotulo}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-8">{children}</main>
    </div>
  );
}
