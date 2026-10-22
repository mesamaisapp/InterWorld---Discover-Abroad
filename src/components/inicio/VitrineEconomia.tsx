"use client";

import Link from "next/link";
import { useState } from "react";
import { FotoCidade } from "@/components/comum/FotoCidade";
import { NumeroVivo } from "@/components/comum/NumeroVivo";
import { destinoDaCidade } from "@/lib/destinos";
import { formatarEuro, formatarSemanas } from "@/lib/formatar";
import type { GrupoOferta } from "@/lib/resumo";
import { ROTULO_TIPO_CURSO } from "@/types/catalogo";

/** O argumento do site: o mesmo curso custa diferente em cada agência. */
export function VitrineEconomia({ grupos }: { grupos: GrupoOferta[] }) {
  const [ativo, setAtivo] = useState(0);
  if (!grupos.length) return null;
  const grupo = grupos[ativo];
  const curso = grupo.ofertas[0];
  const destino = destinoDaCidade(curso.escola_cidade);

  return (
    <section id="economia" aria-labelledby="titulo-economia" className="scroll-mt-4 bg-ceu py-[clamp(5rem,9vw,8rem)]">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-4 sm:px-8 lg:min-h-[78svh] lg:grid-cols-2 lg:items-center lg:gap-16">
        {/* Foto da cidade recortada como canhoto de passagem */}
        <div data-revelar className="relative">
          {destino && (
            <FotoCidade
              key={destino.slug}
              foto={destino.foto}
              largura={1200}
              className="bilhete aspect-square w-full animate-[aparecer_600ms_var(--ease-saida)_both] [--corte:72%]"
            />
          )}
          <p className="absolute bottom-4 left-4 bg-marca-escura px-3 py-1.5 text-[0.9375rem] font-semibold text-white">
            {curso.escola_cidade}, {curso.pais_nome}
          </p>
        </div>

        <div className="flex flex-col gap-8">
          <h2 id="titulo-economia" data-revelar className="text-[clamp(2.25rem,4.6vw,4.25rem)]">
            Mesmo curso, preço diferente
          </h2>

          <div role="tablist" aria-label="Escolas" data-revelar className="-mx-1 flex flex-wrap gap-1.5">
            {grupos.map((g, i) => (
              <button
                key={g.chave}
                type="button"
                role="tab"
                aria-selected={i === ativo}
                aria-controls="painel-economia"
                onClick={() => setAtivo(i)}
                className={`rounded-full px-4 py-2 text-[0.9375rem] font-semibold transition-[background-color,color,scale] duration-150 active:scale-95 ${
                  i === ativo ? "bg-marca-escura text-white" : "bg-superficie text-texto hover:bg-white/60"
                }`}
              >
                {g.ofertas[0].escola_nome}
              </button>
            ))}
          </div>

          <div id="painel-economia" role="tabpanel" data-revelar className="flex flex-col gap-6">
            <p className="max-w-[44ch] text-xl">
              {ROTULO_TIPO_CURSO[curso.tipo_curso]}, {formatarSemanas(curso.semanas)}
              {curso.acomodacao_inclusa ? ", com acomodação" : ""} na {curso.escola_nome}. Mesma escola, mesma sala
              de aula — {grupo.ofertas.length} agências, {grupo.ofertas.length} preços:
            </p>

            <p className="font-display text-[clamp(1.75rem,3vw,2.5rem)] font-extrabold leading-tight tracking-[-0.03em]">
              <NumeroVivo valor={grupo.economia} formatar={formatarEuro} /> a menos, só por comparar.
            </p>

            <ol className="flex flex-col gap-2">
              {grupo.ofertas.map((o, i) => (
                <li
                  key={o.id}
                  className={`numeros flex items-center justify-between gap-4 px-4 py-3.5 text-[1.0625rem] ${
                    i === 0 ? "bg-verde font-semibold text-marca-escura" : "bg-superficie"
                  }`}
                >
                  <span>
                    {o.agencia_nome}
                    {i === 0 && <span className="ml-2 text-[0.9375rem]">menor preço</span>}
                  </span>
                  <span className="font-display text-xl font-extrabold">{formatarEuro(o.preco_eur)}</span>
                </li>
              ))}
            </ol>

            <div className="grid gap-2 sm:grid-cols-2">
              <a
                href={`/api/oferta/${curso.id}`}
                target="_blank"
                rel="sponsored noopener"
                className="flex h-16 items-center justify-center rounded-full bg-marca-escura px-6 text-lg font-semibold text-white transition-[background-color,scale] duration-200 hover:bg-marca active:scale-[0.97]"
              >
                Ver oferta de {formatarEuro(curso.preco_eur)}
              </a>
              <Link
                href={destino ? `/busca?cidade=${destino.slug}` : "/busca"}
                className="flex h-16 items-center justify-center rounded-full bg-superficie px-6 text-lg font-semibold transition-[background-color,scale] duration-200 hover:bg-white/60 active:scale-[0.97]"
              >
                Tudo em {curso.escola_cidade}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
