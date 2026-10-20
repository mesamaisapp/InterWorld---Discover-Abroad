"use client";

import { useBusca } from "@/components/busca/ContextoBusca";
import type { Ordenacao } from "@/types/catalogo";

const OPCOES: { valor: Ordenacao; rotulo: string }[] = [
  { valor: "preco", rotulo: "Menor preço total" },
  { valor: "preco_semana", rotulo: "Menor preço por semana" },
  { valor: "semanas", rotulo: "Menor duração" },
];

export function SeletorOrdenacao() {
  const { filtros, atualizar } = useBusca();
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="hidden text-suave sm:inline">Ordenar por</span>
      <select
        value={filtros.ordenar}
        onChange={(e) => atualizar({ ordenar: e.target.value as Ordenacao })}
        className="campo w-auto py-2"
        aria-label="Ordenar resultados"
      >
        {OPCOES.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.rotulo}
          </option>
        ))}
      </select>
    </label>
  );
}
