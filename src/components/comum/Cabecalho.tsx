import Link from "next/link";
import { Logo } from "@/components/marca/Logo";

const LINKS = [
  { href: "/#destinos", rotulo: "Destinos" },
  { href: "/#economia", rotulo: "Quanto se economiza" },
  { href: "/#como-funciona", rotulo: "Como funciona" },
];

export function Cabecalho() {
  return (
    <header className="relative z-30 bg-superficie">
      <div className="mx-auto flex h-[76px] max-w-[1400px] items-center justify-between gap-6 px-4 sm:px-8">
        <Logo />
        <nav aria-label="Principal" className="hidden items-center gap-8 text-[0.9375rem] font-semibold md:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="transition-colors hover:text-marca">
              {l.rotulo}
            </Link>
          ))}
        </nav>
        <Link
          href="/busca"
          className="rounded-full bg-marca-escura px-5 py-3 text-[0.9375rem] font-semibold text-white transition-[background-color,scale] duration-200 hover:bg-marca active:scale-[0.97]"
        >
          Ver pacotes
        </Link>
      </div>
    </header>
  );
}
