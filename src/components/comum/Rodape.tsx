import Link from "next/link";
import { Globo } from "@/components/marca/Logo";
import { DESTINOS, paginaFoto } from "@/lib/destinos";

export function Rodape() {
  return (
    <footer className="bg-marca-escura text-white">
      <div className="mx-auto max-w-[1400px] px-4 pt-16 pb-8 sm:px-8 sm:pt-20">
        <p data-revelar className="flex items-center gap-[2vw] font-display text-[clamp(3.5rem,15vw,14rem)] leading-[0.85] font-extrabold tracking-[-0.05em]">
          <Globo className="size-[0.8em] shrink-0" />
          <span>
            inter<span className="text-[#8fc1ff]">world</span>
          </span>
        </p>

        <div className="mt-14 grid gap-12 lg:grid-cols-12">
          <nav aria-label="Destinos" className="lg:col-span-5">
            <h2 className="sr-only">Destinos</h2>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-1">
              {DESTINOS.map((d) => (
                <li key={d.slug}>
                  <Link
                    href={`/busca?cidade=${d.slug}`}
                    className="font-display text-[clamp(1.5rem,2.4vw,2.125rem)] font-extrabold tracking-[-0.03em] text-[#8fc1ff] transition-colors hover:text-verde"
                  >
                    {d.cidade}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="grid gap-8 text-[0.9375rem] sm:grid-cols-2 lg:col-span-6 lg:col-start-7">
            <div>
              <h2 className="font-sans text-base font-bold tracking-normal">InterWorld</h2>
              <ul className="mt-3 flex flex-col gap-2">
                <li>
                  <Link href="/busca" className="hover:underline">
                    Todos os pacotes
                  </Link>
                </li>
                <li>
                  <Link href="/#economia" className="hover:underline">
                    Quanto se economiza
                  </Link>
                </li>
                <li>
                  <Link href="/#como-funciona" className="hover:underline">
                    Como funciona
                  </Link>
                </li>
                <li>
                  <Link href="/guia" className="hover:underline">
                    Guia do primeiro intercâmbio
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="font-sans text-base font-bold tracking-normal">Fotos das cidades</h2>
              <p className="mt-3 text-white/85">Wikimedia Commons, com licenças livres. Autor e licença em cada link:</p>
              <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                {DESTINOS.map((d) => (
                  <li key={d.slug}>
                    <a href={paginaFoto(d.foto)} className="underline-offset-2 hover:underline" rel="noopener">
                      {d.cidade}
                      {d.foto.autor ? ` (${d.foto.autor})` : ""}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 text-[0.9375rem] text-white/85">
          <p>© {new Date().getFullYear()} InterWorld · discover abroad. Preços das agências parceiras e dos sites oficiais das escolas.</p>
          <a href="#" className="hover:text-white">
            Voltar ao topo ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
