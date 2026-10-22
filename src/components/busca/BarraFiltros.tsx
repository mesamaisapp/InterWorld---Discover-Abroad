"use client";

import { useEffect, useRef, useState } from "react";
import { useBusca } from "@/components/busca/ContextoBusca";
import { contarFiltrosAtivos } from "@/lib/filtros";
import { DESTINOS } from "@/lib/destinos";
import { formatarEuro } from "@/lib/formatar";
import { ROTULO_TIPO_CURSO, TIPOS_CURSO, type FaixasCatalogo, type TipoCurso } from "@/types/catalogo";

export function BarraFiltros({ faixas }: { faixas: FaixasCatalogo }) {
  const { filtros, atualizar, limpar } = useBusca();
  const [aberta, setAberta] = useState(false);
  const ativos = contarFiltrosAtivos(filtros);

  // Trava o scroll da página enquanto o painel está aberto no mobile
  useEffect(() => {
    document.body.style.overflow = aberta ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [aberta]);

  function alternarTipo(tipo: TipoCurso) {
    const tipos = filtros.tipos.includes(tipo)
      ? filtros.tipos.filter((t) => t !== tipo)
      : [...filtros.tipos, tipo];
    atualizar({ tipos });
  }

  return (
    <>
      {/* Botão que abre o painel — só no mobile */}
      <button
        type="button"
        onClick={() => setAberta(true)}
        className="mb-4 inline-flex h-11 items-center gap-2 rounded-full bg-marca-escura px-5 text-[0.9375rem] font-semibold text-white lg:hidden"
      >
        <IconeFiltro />
        Filtros
        {ativos > 0 && (
          <span className="grid size-6 place-items-center rounded-full bg-verde text-[0.875rem] text-marca-escura">{ativos}</span>
        )}
      </button>

      {/* Fundo escuro do painel no mobile */}
      {aberta && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setAberta(false)} aria-hidden />
      )}

      <aside
        aria-label="Filtros"
        className={`${aberta ? "visible translate-x-0" : "invisible -translate-x-full"} fixed inset-y-0 left-0 z-50 flex w-[85%] max-w-sm flex-col bg-superficie shadow-xl transition-[translate,visibility] duration-300 lg:visible lg:sticky lg:top-6 lg:bottom-auto lg:z-auto lg:max-h-[calc(100dvh-3rem)] lg:w-auto lg:max-w-none lg:translate-x-0 lg:bg-superficie lg:shadow-none lg:transition-none`}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-2">
          <h2 className="text-2xl">Filtros</h2>
          <div className="flex items-center gap-3">
            {ativos > 0 && (
              <button type="button" onClick={limpar} className="text-[0.9375rem] font-semibold text-marca hover:underline">
                Limpar
              </button>
            )}
            <button
              type="button"
              onClick={() => setAberta(false)}
              className="rounded-md p-1 text-suave hover:bg-fundo lg:hidden"
              aria-label="Fechar filtros"
            >
              <IconeFechar />
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-7 overflow-y-auto px-5 py-5">
          <Grupo titulo="Destino" htmlFor="filtro-destino">
            <select
              id="filtro-destino"
              value={filtros.cidade ? `cidade:${filtros.cidade}` : filtros.destino ? `pais:${filtros.destino}` : ""}
              onChange={(e) => {
                const [tipo, slug] = e.target.value.split(":");
                atualizar({
                  destino: tipo === "pais" ? slug : undefined,
                  cidade: tipo === "cidade" ? slug : undefined,
                });
              }}
              className="campo font-semibold"
            >
              <option value="">Qualquer destino</option>
              {faixas.paises.map((p) => (
                <optgroup key={p.id} label={p.nome}>
                  <option value={`pais:${p.slug}`}>Todo o país: {p.nome}</option>
                  {DESTINOS.filter((d) => d.pais_slug === p.slug).map((d) => (
                    <option key={d.slug} value={`cidade:${d.slug}`}>
                      {d.cidade}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </Grupo>

          <Grupo titulo="Duração">
            <div className="flex flex-wrap gap-2">
              <Chip ativo={!filtros.semanas} onClick={() => atualizar({ semanas: undefined })}>
                Qualquer
              </Chip>
              {faixas.semanasDisponiveis.map((s) => (
                <Chip key={s} ativo={filtros.semanas === s} onClick={() => atualizar({ semanas: s })}>
                  {s} sem
                </Chip>
              ))}
            </div>
          </Grupo>

          <Grupo titulo="Tipo de curso">
            <div className="space-y-2.5">
              {TIPOS_CURSO.map((tipo) => (
                <label key={tipo} className="flex cursor-pointer items-center gap-3 text-[0.9375rem]">
                  <input
                    type="checkbox"
                    checked={filtros.tipos.includes(tipo)}
                    onChange={() => alternarTipo(tipo)}
                    className="size-5 rounded accent-marca"
                  />
                  {ROTULO_TIPO_CURSO[tipo]}
                </label>
              ))}
            </div>
          </Grupo>

          {/* key: reinicia o estado local do slider quando o filtro muda por fora (ex.: "Limpar") */}
          <SliderOrcamento
            key={filtros.orcamentoMax ?? "sem-limite"}
            valor={filtros.orcamentoMax}
            maximo={faixas.precoMaximo}
            onConfirmar={(v) => atualizar({ orcamentoMax: v })}
          />

          <label className="flex cursor-pointer items-center justify-between gap-3 text-[0.9375rem] font-semibold">
            Com acomodação inclusa
            <input
              type="checkbox"
              role="switch"
              checked={filtros.comAcomodacao}
              onChange={(e) => atualizar({ comAcomodacao: e.target.checked })}
              className="size-5 accent-marca"
            />
          </label>
        </div>

        <div className="p-4 lg:hidden">
          <button
            type="button"
            onClick={() => setAberta(false)}
            className="h-12 w-full rounded-full bg-marca-escura font-semibold text-white"
          >
            Ver resultados
          </button>
        </div>
      </aside>
    </>
  );
}

function SliderOrcamento({
  valor,
  maximo,
  onConfirmar,
}: {
  valor?: number;
  maximo: number;
  onConfirmar: (v: number | undefined) => void;
}) {
  const [local, setLocal] = useState(valor ?? maximo);
  const confirmar = useRef(onConfirmar);
  confirmar.current = onConfirmar;

  // Debounce: só atualiza a URL quando o usuário para de arrastar
  useEffect(() => {
    if (local === (valor ?? maximo)) return;
    const t = setTimeout(() => confirmar.current(local >= maximo ? undefined : local), 350);
    return () => clearTimeout(t);
  }, [local, valor, maximo]);

  return (
    <Grupo titulo="Orçamento máximo" htmlFor="filtro-orcamento">
      <div className="numeros mb-2 font-display text-lg font-extrabold">
        {local >= maximo ? "Sem limite" : `Até ${formatarEuro(local)}`}
      </div>
      <input
        id="filtro-orcamento"
        type="range"
        min={500}
        max={maximo}
        step={100}
        value={local}
        onChange={(e) => setLocal(Number(e.target.value))}
        className="w-full accent-marca"
      />
      <div className="numeros mt-1 flex justify-between text-[0.9375rem] text-suave">
        <span>{formatarEuro(500)}</span>
        <span>{formatarEuro(maximo)}</span>
      </div>
    </Grupo>
  );
}

function Grupo({ titulo, htmlFor, children }: { titulo: string; htmlFor?: string; children: React.ReactNode }) {
  const Rotulo = htmlFor ? "label" : "h3";
  return (
    <section>
      <Rotulo htmlFor={htmlFor} className="mb-3 block font-sans text-[0.9375rem] font-bold tracking-normal">
        {titulo}
      </Rotulo>
      {children}
    </section>
  );
}

function Chip({ ativo, onClick, children }: { ativo: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={ativo}
      onClick={onClick}
      className={`numeros rounded-full px-3.5 py-2 text-[0.9375rem] font-semibold transition-[background-color,color,scale] duration-150 active:scale-95 ${
        ativo ? "bg-marca-escura text-white" : "bg-ceu hover:bg-[#d3e2f6] lg:bg-ceu lg:hover:bg-[#d3e2f6]"
      }`}
    >
      {children}
    </button>
  );
}

function IconeFiltro() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-4" aria-hidden>
      <path d="M3 5h14M6 10h8M8.5 15h3" strokeLinecap="round" />
    </svg>
  );
}

function IconeFechar() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-5" aria-hidden>
      <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
    </svg>
  );
}
