import type { Metadata } from "next";
import { aprovarPedido, fazerLogin, recusarPedido } from "@/app/admin/cotacoes/acoes";
import { Logo } from "@/components/marca/Logo";
import { podeAdministrar } from "@/lib/cotacoes/admin";
import { descreverPedido, revisaoManual } from "@/lib/cotacoes/fluxo";
import { repo } from "@/lib/cotacoes/repositorio";
import type { Pedido, Resposta } from "@/lib/cotacoes/tipos";
import { primeiro, type SearchParams } from "@/lib/filtros";

export const metadata: Metadata = { title: "Cotações — painel InterWorld", robots: { index: false } };
export const dynamic = "force-dynamic";

const QUANDO = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "America/Sao_Paulo",
});

const ROTULO_STATUS: Record<Pedido["status"], string> = {
  aguardando_revisao: "Aguardando revisão",
  enviado: "Enviado",
  recusado: "Recusado",
  sem_agencias: "Sem agências para o destino",
};

export default async function PainelCotacoes({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const erroLogin = primeiro((await searchParams).erro) === "1";

  if (!(await podeAdministrar())) {
    return (
      <Moldura>
        <form action={fazerLogin} className="mx-auto flex max-w-sm flex-col gap-4 bg-superficie p-6">
          <h1 className="text-2xl">Painel de cotações</h1>
          {process.env.ADMIN_SENHA ? (
            <>
              <label className="flex flex-col gap-2 text-[0.9375rem] font-semibold">
                Senha
                <input name="senha" type="password" autoComplete="current-password" className="campo" />
              </label>
              {erroLogin && <p className="font-semibold text-[#a1281f]">Senha incorreta.</p>}
              <button className="h-12 rounded-full bg-marca-escura font-semibold text-white hover:bg-marca">
                Entrar
              </button>
            </>
          ) : (
            <p>Defina a variável ADMIN_SENHA no servidor para liberar o painel.</p>
          )}
        </form>
      </Moldura>
    );
  }

  const r = repo();
  const pedidos = await r.listarPedidos();
  const pendentes = pedidos
    .filter((p) => p.status === "aguardando_revisao")
    .sort((a, b) => b.triagem.nota - a.triagem.nota);
  const outros = pedidos.filter((p) => p.status !== "aguardando_revisao").slice(0, 50);
  const respostas = new Map(
    await Promise.all(outros.map(async (p) => [p.id, await r.respostasDoPedido(p.id)] as const)),
  );
  const agora = new Date();
  const resumo = await r.resumoDoMes(new Date(agora.getFullYear(), agora.getMonth(), 1));

  return (
    <Moldura>
      <div className="flex flex-col gap-10">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h1 className="text-[clamp(1.75rem,3vw,2.5rem)]">Cotações</h1>
          <p className="text-[0.9375rem] text-suave">
            {r.demonstracao && "Modo demonstração: os pedidos ficam só na memória do servidor. "}
            Revisão manual {revisaoManual() ? "ligada" : "desligada (envio automático acima da nota mínima)"}.
            {!process.env.RESEND_API_KEY && " Sem RESEND_API_KEY: copie os links das agências e envie à mão."}
          </p>
        </div>

        <section aria-labelledby="t-pendentes" className="flex flex-col gap-3">
          <h2 id="t-pendentes" className="text-2xl">
            Para revisar <span className="numeros text-suave">({pendentes.length})</span>
          </h2>
          {!pendentes.length && <p className="bg-superficie p-5 text-suave">Nenhum pedido esperando.</p>}
          {pendentes.map((p) => (
            <article key={p.id} className="grid gap-4 bg-superficie p-5 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="flex flex-col gap-1">
                <p className="flex flex-wrap items-center gap-3">
                  <strong className="text-lg">{p.nome}</strong>
                  <Nota valor={p.triagem.nota} />
                  <span className="text-[0.9375rem] text-suave">{QUANDO.format(new Date(p.criado_em))}</span>
                </p>
                <p>{descreverPedido(p)}</p>
                <p className="text-[0.9375rem]">
                  <a className="underline" href={`https://wa.me/${p.whatsapp}`} target="_blank" rel="noopener">
                    +{p.whatsapp}
                  </a>
                  {p.email && ` · ${p.email}`}
                </p>
                {p.observacoes && <p className="text-[0.9375rem] text-suave">“{p.observacoes}”</p>}
                {p.triagem.motivos.length > 0 && (
                  <p className="text-[0.9375rem] text-[#a1281f]">{p.triagem.motivos.join(" · ")}</p>
                )}
              </div>
              <div className="flex gap-2">
                <form action={aprovarPedido}>
                  <input type="hidden" name="id" value={p.id} />
                  <button className="h-11 rounded-full bg-marca-escura px-5 font-semibold text-white hover:bg-marca">
                    Aprovar e enviar
                  </button>
                </form>
                <form action={recusarPedido}>
                  <input type="hidden" name="id" value={p.id} />
                  <button className="h-11 rounded-full bg-ceu px-5 font-semibold hover:bg-[#d3e2f6]">Recusar</button>
                </form>
              </div>
            </article>
          ))}
        </section>

        <section aria-labelledby="t-mes" className="flex flex-col gap-3">
          <h2 id="t-mes" className="text-2xl">
            Este mês, por agência
          </h2>
          <table className="numeros w-full bg-superficie text-left">
            <thead>
              <tr className="border-b border-borda">
                <th className="p-3 font-semibold">Agência</th>
                <th className="p-3 text-right font-semibold">Pedidos recebidos</th>
                <th className="p-3 text-right font-semibold">Respondidos</th>
              </tr>
            </thead>
            <tbody>
              {resumo.map((a) => (
                <tr key={a.agencia_id} className="border-b border-borda last:border-0">
                  <td className="p-3">{a.agencia_nome}</td>
                  <td className="p-3 text-right">{a.recebidos}</td>
                  <td className="p-3 text-right">{a.respondidos}</td>
                </tr>
              ))}
              {!resumo.length && (
                <tr>
                  <td colSpan={3} className="p-3 text-suave">
                    Nenhum pedido enviado neste mês.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        <section aria-labelledby="t-historico" className="flex flex-col gap-3">
          <h2 id="t-historico" className="text-2xl">
            Histórico
          </h2>
          {outros.map((p) => (
            <article key={p.id} className="flex flex-col gap-2 bg-superficie p-5">
              <p className="flex flex-wrap items-center gap-3">
                <strong>{p.nome}</strong>
                <span className="rounded-full bg-ceu px-3 py-0.5 text-[0.9375rem] font-semibold">
                  {ROTULO_STATUS[p.status]}
                </span>
                <span className="text-[0.9375rem] text-suave">{descreverPedido(p)}</span>
                <a href={`/cotacao/${p.token}`} className="text-[0.9375rem] font-semibold text-marca underline">
                  página do aluno
                </a>
              </p>
              <ListaRespostas respostas={respostas.get(p.id) ?? []} />
            </article>
          ))}
        </section>
      </div>
    </Moldura>
  );
}

function ListaRespostas({ respostas }: { respostas: Resposta[] }) {
  if (!respostas.length) return null;
  return (
    <ul className="flex flex-col gap-1 text-[0.9375rem]">
      {respostas.map((r) => (
        <li key={r.id} className="flex flex-wrap gap-x-3">
          <span className="font-semibold">{r.agencia_nome}</span>
          <span className={r.respondido_em ? "text-destaque" : "text-suave"}>
            {r.respondido_em ? `respondeu: ${r.moeda} ${r.preco}` : "aguardando"}
          </span>
          <a href={`/responder/${r.token}`} className="break-all text-marca underline">
            link da agência
          </a>
        </li>
      ))}
    </ul>
  );
}

function Nota({ valor }: { valor: number }) {
  const cor =
    valor >= 70
      ? "bg-verde text-marca-escura"
      : valor >= 40
        ? "bg-[#ffd166] text-marca-escura"
        : "bg-[#a1281f] text-white";
  return <span className={`numeros rounded-full px-3 py-0.5 text-[0.9375rem] font-semibold ${cor}`}>nota {valor}</span>;
}

function Moldura({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh bg-ceu">
      <header className="bg-superficie">
        <div className="mx-auto flex h-[76px] max-w-6xl items-center px-4 sm:px-8">
          <Logo />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-8">{children}</main>
    </div>
  );
}
