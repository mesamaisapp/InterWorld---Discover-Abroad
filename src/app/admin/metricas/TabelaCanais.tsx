"use client";

import { useEffect, useState } from "react";
import type { LinhaCanal } from "@/lib/metricas/funil";

const REAIS = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const CHAVE = "iw_gasto_canais";

const chave = (c: LinhaCanal) => `${c.origem}|${c.campanha ?? ""}`;
const taxa = (parte: number, todo: number) => (todo ? `${((parte / todo) * 100).toFixed(1).replace(".", ",")}%` : "—");

/** Canais com o gasto digitado à mão (fica guardado neste navegador) e o custo por pedido. */
export function TabelaCanais({ canais }: { canais: LinhaCanal[] }) {
  const [gastos, setGastos] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      setGastos(JSON.parse(localStorage.getItem(CHAVE) ?? "{}"));
    } catch {}
  }, []);

  const mudar = (k: string, valor: string) => {
    const novos = { ...gastos, [k]: valor };
    setGastos(novos);
    try {
      localStorage.setItem(CHAVE, JSON.stringify(novos));
    } catch {}
  };

  if (!canais.length) return <p className="bg-superficie p-5 text-suave">Nenhuma visita no período.</p>;

  return (
    <div className="overflow-x-auto bg-superficie">
      <table className="numeros w-full min-w-[760px] text-left">
        <thead>
          <tr className="border-b border-borda">
            <th className="p-3 font-semibold">Origem</th>
            <th className="p-3 font-semibold">Campanha</th>
            <th className="p-3 text-right font-semibold">Visitantes</th>
            <th className="p-3 text-right font-semibold">Pedidos</th>
            <th className="p-3 text-right font-semibold">Visita → pedido</th>
            <th className="p-3 text-right font-semibold">Fecharam</th>
            <th className="p-3 text-right font-semibold">Gasto (R$)</th>
            <th className="p-3 text-right font-semibold">Custo por pedido</th>
          </tr>
        </thead>
        <tbody>
          {canais.map((c) => {
            const k = chave(c);
            const gasto = Number((gastos[k] ?? "").replace(/\./g, "").replace(",", "."));
            return (
              <tr key={k} className="border-b border-borda last:border-0">
                <td className="p-3 font-semibold">{c.origem}</td>
                <td className="p-3">{c.campanha ?? <span className="text-suave">—</span>}</td>
                <td className="p-3 text-right">{c.visitantes}</td>
                <td className="p-3 text-right">{c.pedidos}</td>
                <td className="p-3 text-right">{taxa(c.pedidos, c.visitantes)}</td>
                <td className="p-3 text-right">{c.fecharam}</td>
                <td className="p-2 text-right">
                  <input
                    aria-label={`Gasto com ${c.origem} ${c.campanha ?? ""}`}
                    inputMode="decimal"
                    placeholder="0"
                    value={gastos[k] ?? ""}
                    onChange={(e) => mudar(k, e.target.value)}
                    className="campo h-10 w-28 text-right"
                  />
                </td>
                <td className="p-3 text-right font-semibold">
                  {gasto > 0 && c.pedidos ? REAIS.format(gasto / c.pedidos) : <span className="text-suave">—</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
