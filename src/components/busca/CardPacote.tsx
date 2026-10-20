import { FotoCidade } from "@/components/comum/FotoCidade";
import { destinoDaCidade } from "@/lib/destinos";
import { formatarEuro, formatarSemanas } from "@/lib/formatar";
import type { GrupoOferta } from "@/lib/resumo";
import { ROTULO_TIPO_CURSO } from "@/types/catalogo";

/**
 * Um curso como bilhete: foto da cidade, a escola, e no canhoto o preço da agência mais barata.
 * As outras agências que cotam o mesmo curso aparecem embaixo, com quanto custam a mais.
 */
export function CardPacote({ grupo, menorPreco }: { grupo: GrupoOferta; menorPreco?: boolean }) {
  const [pacote, ...outras] = grupo.ofertas;
  const destino = destinoDaCidade(pacote.escola_cidade);

  return (
    <article
      data-ui
      className="group bilhete-em-pe sm:bilhete grid w-full bg-superficie [--corte-y:calc(100%-152px)] sm:grid-cols-[minmax(150px,26%)_1fr_4px_208px] sm:[--corte:calc(100%-210px)]"
    >
      <div className="relative overflow-hidden">
        {destino ? (
          <FotoCidade
            foto={destino.foto}
            largura={640}
            className="aspect-[16/9] size-full transition-transform duration-700 ease-[var(--ease-saida)] group-hover:scale-[1.05] sm:aspect-auto sm:absolute sm:inset-0"
          />
        ) : (
          <div className="aspect-[16/9] size-full bg-marca sm:aspect-auto" />
        )}
        {destino && (
          <span className="absolute top-3 left-3 bg-marca-escura px-2 py-1 font-display text-[0.9375rem] font-extrabold text-white">
            {destino.codigo}
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-col gap-3 p-5">
        <div>
          <p className="text-[0.9375rem] text-suave">
            {pacote.escola_cidade}, {pacote.pais_nome}
          </p>
          <h3 className="mt-1 text-[1.375rem] leading-tight">{pacote.escola_nome}</h3>
        </div>
        <ul className="flex flex-wrap gap-1.5 text-[0.9375rem] font-semibold">
          <li className="rounded-full bg-ceu px-3 py-1">{ROTULO_TIPO_CURSO[pacote.tipo_curso]}</li>
          <li className="numeros rounded-full bg-ceu px-3 py-1">{formatarSemanas(pacote.semanas)}</li>
          <li className="rounded-full bg-ceu px-3 py-1">
            {pacote.acomodacao_inclusa ? "Com acomodação" : "Só o curso"}
          </li>
        </ul>
        <p className="text-[0.9375rem]">
          Melhor preço com <strong>{pacote.agencia_nome}</strong>
        </p>
        {outras.length > 0 && (
          <ul className="numeros mt-auto flex flex-col gap-1 text-[0.9375rem] text-suave">
            {outras.map((o) => (
              <li key={o.id} className="flex items-baseline">
                <a
                  href={`/api/oferta/${o.id}`}
                  target="_blank"
                  rel="sponsored noopener"
                  className="underline-offset-2 hover:text-texto hover:underline"
                >
                  {o.agencia_nome}
                </a>
                <span aria-hidden className="guia" />
                <span>
                  {formatarEuro(o.preco_eur)}{" "}
                  <span className="text-[#a1281f]">+{formatarEuro(o.preco_eur - pacote.preco_eur)}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div aria-hidden className="picote-h mx-5 sm:picote-v sm:mx-0 sm:my-5 sm:h-auto" />

      <div className="flex flex-col justify-between gap-4 p-5">
        <div>
          {menorPreco ? (
            <p className="mb-2 inline-flex rounded-full bg-verde px-2.5 py-0.5 text-[0.9375rem] font-semibold text-marca-escura">
              Menor preço
            </p>
          ) : grupo.economia > 0 ? (
            <p className="mb-2 inline-flex rounded-full bg-verde px-2.5 py-0.5 text-[0.9375rem] font-semibold text-marca-escura">
              {formatarEuro(grupo.economia)} a menos
            </p>
          ) : null}
          <p className="numeros font-display text-[2rem] leading-none font-extrabold tracking-[-0.03em]">
            {formatarEuro(pacote.preco_eur)}
          </p>
          <p className="numeros mt-1 text-[0.9375rem] text-suave">{formatarEuro(pacote.preco_semana_eur)} por semana</p>
        </div>
        <a
          href={`/api/oferta/${pacote.id}`}
          target="_blank"
          rel="sponsored noopener"
          className="flex h-12 items-center justify-center rounded-full bg-marca-escura px-5 font-semibold text-white transition-[background-color,scale] duration-200 hover:bg-marca active:scale-[0.97]"
        >
          Ver oferta
          <span className="sr-only">
            {" "}
            de {pacote.agencia_nome} para {pacote.escola_nome} (abre em nova aba)
          </span>
        </a>
      </div>
    </article>
  );
}
