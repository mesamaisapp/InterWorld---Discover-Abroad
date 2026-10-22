"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FotoCidade } from "@/components/comum/FotoCidade";
import { NumeroVivo } from "@/components/comum/NumeroVivo";
import { DESTINOS, destinoPorSlug } from "@/lib/destinos";
import { filtrosParaQuery } from "@/lib/filtros";
import { formatarEuro } from "@/lib/formatar";
import { ROTULO_TIPO_CURSO, TIPOS_CURSO, type TipoCurso } from "@/types/catalogo";

/** O mínimo de cada pacote que o bilhete precisa para contar e precificar ao vivo. */
export interface ItemBilhete {
  cidade: string;
  semanas: number;
  tipo: TipoCurso;
  preco: number;
  chave: string; // mesmo curso em agências diferentes
}

const FOTO_PADRAO = "dublin";

export function HeroBilhete({
  itens,
  paises,
  precoMaximo,
}: {
  itens: ItemBilhete[];
  paises: { slug: string; nome: string }[];
  precoMaximo: number;
}) {
  const [cidade, setCidade] = useState("");
  const [semanas, setSemanas] = useState<number | undefined>();
  const [tipo, setTipo] = useState<TipoCurso | "">("");
  const [orcamento, setOrcamento] = useState(precoMaximo);
  const [camadas, setCamadas] = useState([FOTO_PADRAO]);

  const destino = destinoPorSlug(cidade);
  const destinos = DESTINOS.filter((d) => itens.some((i) => i.cidade === d.cidade));
  const semanasDisponiveis = [...new Set(itens.map((i) => i.semanas))].sort((a, b) => a - b);

  const { quantos, menor, economia } = useMemo(() => {
    const achados = itens.filter(
      (i) =>
        (!destino || i.cidade === destino.cidade) &&
        (!semanas || i.semanas === semanas) &&
        (!tipo || i.tipo === tipo) &&
        i.preco <= orcamento,
    );
    // maior diferença entre agências para o mesmo curso, dentro do que foi encontrado
    const porCurso = new Map<string, number[]>();
    for (const a of achados) porCurso.set(a.chave, [...(porCurso.get(a.chave) ?? []), a.preco]);
    const diferencas = [...porCurso.values()].map((p) => Math.max(...p) - Math.min(...p));
    return {
      quantos: achados.length,
      menor: achados.length ? Math.min(...achados.map((a) => a.preco)) : 0,
      economia: Math.max(0, ...diferencas),
    };
  }, [itens, destino, semanas, tipo, orcamento]);

  function escolherCidade(slug: string) {
    setCidade(slug);
    const foto = slug || FOTO_PADRAO;
    setCamadas((c) => (c.at(-1) === foto ? c : [...c.slice(-1), foto]));
  }

  const query = filtrosParaQuery({
    cidade: cidade || undefined,
    semanas,
    tipos: tipo ? [tipo] : [],
    orcamentoMax: orcamento < precoMaximo ? orcamento : undefined,
    comAcomodacao: false,
    ordenar: "preco",
  });
  const codigo = destino?.codigo ?? "???";

  return (
    <section aria-labelledby="titulo-hero" className="relative isolate overflow-hidden bg-marca-escura">
      {/* Foto do destino escolhido; a nova entra por cima da anterior */}
      <div className="absolute inset-0 -z-10">
        {camadas.map((slug) => {
          const d = destinoPorSlug(slug)!;
          return (
            <div key={slug} className="absolute inset-0 animate-[aparecer_700ms_var(--ease-saida)_both]">
              <FotoCidade foto={d.foto} largura={1920} prioridade className="foto-viva size-full" />
            </div>
          );
        })}
        {/* Véu neutro só para o texto branco ler sobre qualquer foto */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(0_0_0/0.55)_0%,rgb(0_0_0/0.12)_45%,rgb(0_0_0/0.5)_100%)]" />
      </div>

      <div className="mx-auto flex min-h-[calc(100svh-76px)] max-w-[1400px] flex-col justify-between gap-10 px-4 pt-12 pb-6 sm:px-8 sm:pt-16 lg:pb-10">
        <div className="max-w-3xl text-white">
          <h1 id="titulo-hero" className="text-[clamp(2.25rem,6.4vw,6rem)]">
            Estude fora pagando menos
          </h1>
          <p className="mt-6 max-w-[38ch] text-xl leading-snug text-white">
            Compare o mesmo curso, na mesma escola, entre várias agências de intercâmbio — e embarque pela
            oferta mais barata.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {/* O cartão de embarque é a busca */}
          <div
            role="search"
            aria-label="Buscar pacotes de intercâmbio"
            className="bilhete-em-pe lg:bilhete grid bg-superficie text-texto [--corte-y:calc(100%-232px)] lg:grid-cols-[1fr_4px_minmax(300px,30%)] lg:[--corte:calc(70%-2px)]"
          >
            <div className="grid gap-6 p-5 sm:p-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.6fr)] lg:gap-10">
              <div aria-hidden className="flex items-end gap-4 lg:flex-col lg:items-start lg:gap-2">
                <Codigo rotulo="Brasil" codigo="BRA" />
                <IconeAviao />
                <Codigo
                  key={codigo}
                  rotulo={destino ? destino.cidade : "Qualquer lugar"}
                  codigo={codigo}
                  destaque
                />
              </div>

              <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                <Campo rotulo="Para onde" htmlFor="b-cidade">
                  <select
                    id="b-cidade"
                    value={cidade}
                    onChange={(e) => escolherCidade(e.target.value)}
                    className="campo font-semibold"
                  >
                    <option value="">Qualquer destino</option>
                    {paises.map((p) => {
                      const doPais = destinos.filter((d) => d.pais_slug === p.slug);
                      if (!doPais.length) return null;
                      return (
                        <optgroup key={p.slug} label={p.nome}>
                          {doPais.map((d) => (
                            <option key={d.slug} value={d.slug}>
                              {d.cidade}
                            </option>
                          ))}
                        </optgroup>
                      );
                    })}
                  </select>
                </Campo>

                <Campo rotulo="Tipo de curso" htmlFor="b-tipo">
                  <select
                    id="b-tipo"
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value as TipoCurso | "")}
                    className="campo font-semibold"
                  >
                    <option value="">Qualquer curso</option>
                    {TIPOS_CURSO.map((t) => (
                      <option key={t} value={t}>
                        {ROTULO_TIPO_CURSO[t]}
                      </option>
                    ))}
                  </select>
                </Campo>

                <Campo rotulo="Quantas semanas" id="b-semanas">
                  <div role="group" aria-labelledby="b-semanas" className="flex flex-wrap gap-1.5">
                    <Pilula ativo={!semanas} onClick={() => setSemanas(undefined)}>
                      Tanto faz
                    </Pilula>
                    {semanasDisponiveis.map((s) => (
                      <Pilula key={s} ativo={semanas === s} onClick={() => setSemanas(s)}>
                        {s}
                      </Pilula>
                    ))}
                  </div>
                </Campo>

                <Campo rotulo="Quanto quero gastar" htmlFor="b-orcamento">
                  <p className="numeros mb-1 font-display text-xl font-extrabold">
                    {orcamento >= precoMaximo ? "Sem limite" : `Até ${formatarEuro(orcamento)}`}
                  </p>
                  <input
                    id="b-orcamento"
                    type="range"
                    min={500}
                    max={precoMaximo}
                    step={250}
                    value={orcamento}
                    onChange={(e) => setOrcamento(Number(e.target.value))}
                    className="w-full accent-marca"
                  />
                </Campo>
              </div>
            </div>

            <div aria-hidden className="picote-h mx-5 lg:picote-v lg:mx-0 lg:my-6 lg:h-auto" />

            <div className="flex flex-col justify-between gap-5 p-5 sm:p-8" aria-live="polite">
              <div>
                <p className="flex items-baseline gap-2">
                  <span className="font-display text-[3.5rem] font-extrabold leading-none tracking-[-0.04em]">
                    <NumeroVivo valor={quantos} />
                  </span>
                  <span className="text-xl font-semibold">{quantos === 1 ? "pacote" : "pacotes"}</span>
                </p>
                <p className="mt-2 text-suave">
                  {quantos ? (
                    <>
                      a partir de{" "}
                      <strong className="text-texto">
                        <NumeroVivo valor={menor} formatar={formatarEuro} />
                      </strong>
                    </>
                  ) : (
                    "Nada com esses filtros. Aumente o orçamento."
                  )}
                </p>
                {economia > 0 && (
                  <p className="mt-3 inline-flex rounded-full bg-verde px-3 py-1 text-[0.9375rem] font-semibold text-marca-escura">
                    Até&nbsp;<NumeroVivo valor={economia} formatar={formatarEuro} />&nbsp;de diferença entre agências
                  </p>
                )}
              </div>
              <Link
                href={query ? `/busca?${query}` : "/busca"}
                className="flex h-14 items-center justify-center gap-2 rounded-full bg-marca-escura text-lg font-semibold text-white transition-[background-color,scale] duration-200 hover:bg-marca active:scale-[0.97]"
              >
                Ver {quantos === 1 ? "o pacote" : "pacotes"}
                <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          </div>
          {destino && (
            <p className="text-[0.9375rem] text-white">
              {destino.foto.legenda}. {destino.frase}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function Codigo({ rotulo, codigo, destaque }: { rotulo: string; codigo: string; destaque?: boolean }) {
  return (
    <div className="[perspective:400px]">
      <p className={`font-display text-[clamp(2.75rem,5vw,4.75rem)] leading-[0.9] font-extrabold tracking-[-0.03em] ${destaque ? "text-marca" : ""}`}>
        {codigo.split("").map((letra, i) => (
          <span key={i} className={destaque ? "virar" : undefined} style={{ "--i": i } as React.CSSProperties}>
            {letra}
          </span>
        ))}
      </p>
      <p className="mt-1 text-[0.9375rem] font-semibold text-suave">{rotulo}</p>
    </div>
  );
}

function Campo({
  rotulo,
  htmlFor,
  id,
  children,
}: {
  rotulo: string;
  htmlFor?: string;
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      {htmlFor ? (
        <label htmlFor={htmlFor} className="mb-2 block text-[0.9375rem] font-semibold text-suave">
          {rotulo}
        </label>
      ) : (
        <p id={id} className="mb-2 text-[0.9375rem] font-semibold text-suave">
          {rotulo}
        </p>
      )}
      {children}
    </div>
  );
}

function Pilula({ ativo, onClick, children }: { ativo: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={ativo}
      onClick={onClick}
      className={`numeros min-w-11 rounded-full px-3.5 py-2 text-[0.9375rem] font-semibold transition-[background-color,color,scale] duration-150 active:scale-95 ${
        ativo ? "bg-marca-escura text-white" : "bg-ceu text-texto hover:bg-[#d3e2f6]"
      }`}
    >
      {children}
    </button>
  );
}

function IconeAviao() {
  return (
    <svg viewBox="0 0 24 24" className="mb-6 size-8 shrink-0 text-marca lg:mb-0 lg:ml-1 lg:rotate-90" fill="currentColor">
      <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5Z" />
    </svg>
  );
}
