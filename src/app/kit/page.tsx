import type { Metadata } from "next";
import Link from "next/link";
import { Cabecalho } from "@/components/comum/Cabecalho";
import { FotoCidade } from "@/components/comum/FotoCidade";
import { Rodape } from "@/components/comum/Rodape";
import { destinoPorSlug } from "@/lib/destinos";
import { primeiro, type SearchParams } from "@/lib/filtros";
import { PAISES } from "@/lib/guia";
import { AVISO_PARCEIROS, KIT, linkDoParceiro, SEGURO_POR_PAIS } from "@/lib/kit";

export const metadata: Metadata = {
  title: "Kit do intercambista — InterWorld",
  description:
    "Passagem, seguro, conta internacional, hospedagem e chip: o que comprar além do curso, quando comprar e o que conferir em cada um.",
};

const FOTO_CAPA = destinoPorSlug("londres")!.foto;

export default async function PaginaKit({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const slug = primeiro((await searchParams).destino);
  const pais = PAISES.find((p) => p.slug === slug);

  return (
    <>
      <Cabecalho />

      <section aria-labelledby="titulo-kit" className="relative isolate overflow-hidden bg-marca-escura text-white">
        <div className="absolute inset-0 -z-10">
          <FotoCidade foto={FOTO_CAPA} largura={1920} prioridade className="foto-viva size-full" />
          <div className="absolute inset-0 bg-black/55" />
        </div>
        <div className="mx-auto flex min-h-[52svh] max-w-[1400px] flex-col justify-end gap-6 px-4 py-12 sm:px-8 sm:py-16">
          <h1 id="titulo-kit" className="max-w-4xl text-[clamp(2.5rem,6vw,5.5rem)]">
            Kit do intercambista
          </h1>
          <p className="max-w-[46ch] text-xl">
            O curso é só uma parte. Estas são as outras {KIT.length} coisas que todo intercambista compra, na ordem
            certa e com o que conferir em cada uma.
          </p>
        </div>
      </section>

      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-14 sm:px-8 lg:py-20">
        <nav aria-label="Destino" className="flex flex-col gap-3">
          <h2 className="text-2xl">Para onde você vai?</h2>
          <ul className="flex flex-wrap gap-2">
            {PAISES.map((p) => {
              const ativo = p.slug === pais?.slug;
              return (
                <li key={p.slug}>
                  <Link
                    href={ativo ? "/kit" : `/kit?destino=${p.slug}`}
                    scroll={false}
                    aria-current={ativo ? "true" : undefined}
                    className={`inline-flex h-11 items-center rounded-full px-5 font-semibold transition-colors ${
                      ativo ? "bg-marca-escura text-white" : "bg-ceu hover:bg-[#d3e2f6]"
                    }`}
                  >
                    {p.nome}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <p className="text-[0.9375rem] text-suave">{AVISO_PARCEIROS}</p>

        <ol className="flex flex-col gap-4">
          {KIT.map((item, i) => {
            const seguro = item.slug === "seguro" && pais ? SEGURO_POR_PAIS[pais.slug] : undefined;
            return (
              <li
                key={item.slug}
                id={item.slug}
                data-revelar
                className="grid scroll-mt-6 bg-ceu md:grid-cols-[220px_1fr]"
              >
                <div className="flex flex-row items-center gap-4 bg-marca-escura p-5 text-white md:flex-col md:items-start md:justify-between md:p-6">
                  <span className="numeros font-display text-[clamp(2.5rem,5vw,4rem)] leading-none font-extrabold text-verde">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="font-semibold">{item.quando}</p>
                </div>

                <div className="flex flex-col gap-5 p-5 sm:p-7">
                  <div className="flex flex-col gap-2">
                    <h2 className="text-[clamp(1.5rem,3vw,2rem)]">{item.titulo}</h2>
                    <p className="max-w-[62ch] text-[1.0625rem]">{item.porque}</p>
                  </div>

                  {seguro && (
                    <p className="bg-superficie p-4">
                      <strong>{seguro.em}:</strong> {seguro.texto}{" "}
                      <a
                        href={seguro.fonte}
                        target="_blank"
                        rel="noopener"
                        className="font-semibold text-marca underline"
                      >
                        Fonte oficial ↗
                      </a>
                    </p>
                  )}

                  <ul className="flex flex-col gap-2">
                    {item.dicas.map((d) => (
                      <li key={d} className="flex gap-3">
                        <span aria-hidden className="mt-2 size-2 shrink-0 rounded-full bg-verde" />
                        {d}
                      </li>
                    ))}
                  </ul>

                  <ul className="grid gap-2 sm:grid-cols-2">
                    {item.parceiros.map((p) => (
                      <li key={p.id}>
                        <a
                          href={linkDoParceiro(p)}
                          target="_blank"
                          rel="sponsored noopener"
                          className="group flex h-full flex-col gap-1 bg-superficie p-4 transition-colors duration-200 hover:bg-white"
                        >
                          <span className="flex items-center justify-between gap-3 font-display text-lg font-extrabold">
                            {p.nome}
                            <span
                              aria-hidden
                              className="text-marca transition-transform duration-200 group-hover:translate-x-1"
                            >
                              ↗
                            </span>
                          </span>
                          <span className="text-[0.9375rem] text-suave">{p.bomPara}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="grid gap-6 bg-marca-escura p-6 text-white sm:p-10 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h2 className="text-[clamp(1.75rem,3vw,2.5rem)]">Ainda falta o curso?</h2>
            <p className="mt-3 max-w-[48ch] text-lg">
              Peça uma cotação e receba até 3 propostas de agências para comparar lado a lado.
            </p>
          </div>
          <Link
            href={pais ? `/cotacao?destino=${pais.slug}` : "/cotacao"}
            className="inline-flex h-14 items-center justify-center rounded-full bg-verde px-8 text-[1.0625rem] font-semibold text-marca-escura transition-[background-color,scale] duration-200 hover:bg-[#6fcb59] active:scale-[0.97]"
          >
            Receber cotações
          </Link>
        </div>
      </div>

      <Rodape />
    </>
  );
}
