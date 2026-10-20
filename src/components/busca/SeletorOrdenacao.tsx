"use client";

import { useBusca } from "@/components/busca/ContextoBusca";
import type { Ordenacao } from "@/types/catalogo";

const OPCOES: { valor: Ordenacao; rotulo: string }[] = [
  { valor: "preco", rotulo: "Mais barato" },
  { valor: "preco_semana", rotulo: "Melhor por semana" },
  { valor: "semanas", rotulo: "Mais curto" },
];

/** Abas de ordenação que já mostram o melhor valor de cada critério, como nos buscadores de voo. */
export function SeletorOrdenacao({ destaques }: { destaques: Record<Ordenacao, string | null> }) {
  const { filtros, atualizar } = useBusca();
  return (
    <div role="tablist" aria-label="Ordenar resultados" className="grid grid-cols-3 gap-1 bg-superficie p-1">
      {OPCOES.map((o) => {
        const ativo = filtros.ordenar === o.valor;
        return (
          <button
            key={o.valor}
            type="button"
            role="tab"
            aria-selected={ativo}
            onClick={() => atualizar({ ordenar: o.valor })}
            className={`flex flex-col items-start gap-0.5 px-3 py-2.5 text-left transition-[background-color,color,scale] duration-150 active:scale-[0.98] sm:px-4 ${
              ativo ? "bg-marca-escura text-white" : "hover:bg-ceu"
            }`}
          >
            <span className="text-[0.9375rem] font-semibold">{o.rotulo}</span>
            <span className="numeros font-display text-lg font-extrabold">{destaques[o.valor] ?? "—"}</span>
          </button>
        );
      })}
    </div>
  );
}
