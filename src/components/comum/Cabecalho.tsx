import Link from "next/link";
import { Logo } from "@/components/marca/Logo";

const LINKS = [
  { href: "/#destinos", rotulo: "Destinos" },
  { href: "/cotacao", rotulo: "Receber cotações" },
  { href: "/#como-funciona", rotulo: "Como funciona" },
  { href: "/guia", rotulo: "Guia do 1º intercâmbio" },
];

export function Cabecalho() {
  return (
    <header className="relative z-30 bg-superficie">
      <div className="mx-auto flex h-[76px] max-w-[1400px] items-center justify-between gap-6 px-4 sm:px-8">
        <Logo />
        <nav aria-label="Principal" className="hidden items-center gap-7 text-[0.9375rem] font-semibold lg:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="transition-colors hover:text-marca">
              {l.rotulo}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3 sm:gap-4">
          <Link href="/guia" className="text-[0.9375rem] font-semibold hover:text-marca lg:hidden">
            Guia
          </Link>
          <Link
            href="/busca"
            className="rounded-full bg-marca-escura px-4 py-3 whitespace-nowrap sm:px-5 text-[0.9375rem] font-semibold text-white transition-[background-color,scale] duration-200 hover:bg-marca active:scale-[0.97]"
          >
            Ver pacotes
          </Link>
        </div>
      </div>
    </header>
  );
}
