import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { TabelaCanais } from "@/app/admin/metricas/TabelaCanais";
import { MolduraAdmin } from "@/components/admin/MolduraAdmin";
import { podeAdministrar } from "@/lib/cotacoes/admin";
import { repo } from "@/lib/cotacoes/repositorio";
import { primeiro, type SearchParams } from "@/lib/filtros";
import { KIT } from "@/lib/kit";
import { montarFunil } from "@/lib/metricas/funil";
import { eventos } from "@/lib/metricas/repositorio";

export const metadata: Metadata = { title: "Métricas — painel InterWorld", robots: { index: false } };
export const dynamic = "force-dynamic";

const PERIODOS = [7, 30, 90];
const NOME_PARCEIRO = new Map(
  KIT.flatMap((i) => i.parceiros.map((p) => [p.id, `${p.nome} (${i.titulo.toLowerCase()})`])),
);

const pct = (parte: number, todo: number) => (todo ? `${Math.round((parte / todo) * 100)}%` : "—");

export default async function PainelMetricas({ searchParams }: { searchParams: Promise<SearchParams> }) {
  if (!(await podeAdministrar())) redirect("/admin/cotacoes");

  const pedidoDias = Number(primeiro((await searchParams).dias));
  const dias = PERIODOS.includes(pedidoDias) ? pedidoDias : 30;
  const desde = new Date(Date.now() - dias * 86_400_000);

  const r = repo();
  const [lista, pedidos, respostas] = await Promise.all([
    eventos().desde(desde),
    r.pedidosDesde(desde),
    r.respostasDesde(desde),
  ]);
  const funil = montarFunil(lista, pedidos, respostas);
  const topo = funil.etapas[0].valor;

  return (
    <MolduraAdmin atual="/admin/metricas">
      <div className="flex flex-col gap-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-[clamp(1.75rem,3vw,2.5rem)]">Métricas</h1>
          <nav aria-label="Período" className="flex gap-2">
            {PERIODOS.map((d) => (
              <Link
                key={d}
                href={`/admin/metricas?dias=${d}`}
                aria-current={d === dias ? "true" : undefined}
                className={`rounded-full px-4 py-2 text-[0.9375rem] font-semibold ${d === dias ? "bg-marca-escura text-white" : "bg-superficie hover:bg-white"}`}
              >
                {d} dias
              </Link>
            ))}
          </nav>
        </div>
        {r.demonstracao && (
          <p className="-mt-6 text-[0.9375rem] text-suave">
            Modo demonstração: os números somem quando o servidor reinicia.
          </p>
        )}

        <section aria-labelledby="t-funil" className="flex flex-col gap-3">
          <h2 id="t-funil" className="text-2xl">
            Do visitante à matrícula
          </h2>
          <ol className="flex flex-col gap-2 bg-superficie p-5">
            {funil.etapas.map((e, i) => {
              const anterior = i ? funil.etapas[i - 1].valor : 0;
              return (
                <li key={e.rotulo} className="grid items-center gap-x-4 gap-y-1 sm:grid-cols-[230px_1fr_110px]">
                  <span className="font-semibold">{e.rotulo}</span>
                  <span className="h-7 bg-ceu">
                    <span
                      className={`block h-full ${i === funil.etapas.length - 1 ? "bg-verde" : "bg-marca"}`}
                      style={{ width: `${topo ? Math.max((e.valor / topo) * 100, e.valor ? 0.8 : 0) : 0}%` }}
                    />
                  </span>
                  <span className="numeros text-right">
                    <strong>{e.valor}</strong>
                    {i > 0 && <span className="ml-2 text-[0.875rem] text-suave">{pct(e.valor, anterior)}</span>}
                  </span>
                </li>
              );
            })}
          </ol>
          <p className="text-[0.9375rem] text-suave">
            A porcentagem compara cada etapa com a anterior. "Fecharam" conta quem respondeu "Já fechou?" na página de
            cotações.
          </p>
        </section>

        <section aria-labelledby="t-canais" className="flex flex-col gap-3">
          <h2 id="t-canais" className="text-2xl">
            Por canal
          </h2>
          <p className="max-w-[70ch] text-[0.9375rem] text-suave">
            Use links com <code>?utm_source=instagram&amp;utm_campaign=dublin-outubro</code> nos anúncios e na bio.
            Digite quanto gastou em cada campanha para ver o custo por pedido (fica guardado só neste navegador).
          </p>
          <TabelaCanais canais={funil.canais} />
        </section>

        <section aria-labelledby="t-kit" className="flex flex-col gap-3">
          <h2 id="t-kit" className="text-2xl">
            Cliques no kit do intercambista
          </h2>
          {funil.parceiros.length ? (
            <table className="numeros w-full bg-superficie text-left">
              <thead>
                <tr className="border-b border-borda">
                  <th className="p-3 font-semibold">Parceiro</th>
                  <th className="p-3 text-right font-semibold">Cliques</th>
                </tr>
              </thead>
              <tbody>
                {funil.parceiros.map((p) => (
                  <tr key={p.id} className="border-b border-borda last:border-0">
                    <td className="p-3">{NOME_PARCEIRO.get(p.id) ?? p.id}</td>
                    <td className="p-3 text-right">{p.cliques}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="bg-superficie p-5 text-suave">Nenhum clique no período.</p>
          )}
          <p className="text-[0.9375rem] text-suave">
            As vendas e comissões aparecem no painel de cada programa de afiliados.
          </p>
        </section>
      </div>
    </MolduraAdmin>
  );
}
