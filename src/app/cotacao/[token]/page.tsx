import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Cabecalho } from "@/components/comum/Cabecalho";
import { KitResumo } from "@/components/comum/KitResumo";
import { buscarPacotes } from "@/lib/catalogo";
import { AGENCIAS_POR_PEDIDO, descreverPedido, primeiroNome } from "@/lib/cotacoes/fluxo";
import { repo } from "@/lib/cotacoes/repositorio";
import type { Resposta } from "@/lib/cotacoes/tipos";
import { destinoDaCidade } from "@/lib/destinos";
import { formatarEuro } from "@/lib/formatar";

export const metadata: Metadata = { title: "Suas cotações — InterWorld", robots: { index: false } };
export const dynamic = "force-dynamic";

// Centavos só aparecem quando a agência informou centavos
const moeda = (valor: number, codigo: string) => {
  const casas = Number.isInteger(valor) ? 0 : 2;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: codigo,
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  }).format(valor);
};

const DATA = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" });

export default async function PaginaSuasCotacoes({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const r = repo();
  const pedido = await r.pedidoPorToken(token);
  if (!pedido) notFound();

  const respostas = await r.respostasDoPedido(pedido.id);
  const prontas = respostas.filter(
    (x): x is Resposta & { preco: number; moeda: string } => x.preco != null && !!x.moeda,
  );
  const aguardando = respostas.length - prontas.length;

  // Ordena por preço dentro de cada moeda; a economia só compara propostas na mesma moeda
  prontas.sort((a, b) => (a.moeda === b.moeda ? a.preco - b.preco : a.moeda.localeCompare(b.moeda)));
  const mesmaMoeda = prontas.length > 1 && prontas.every((x) => x.moeda === prontas[0].moeda);
  const economia = mesmaMoeda ? prontas.at(-1)!.preco - prontas[0].preco : 0;

  // Referência: o menor preço de tabela que o site conhece para esse pedido
  const cidade = destinoDaCidade(pedido.cidade ?? "");
  const referencia = (
    await buscarPacotes({
      destino: cidade ? undefined : pedido.pais_slug,
      cidade: cidade?.slug,
      semanas: pedido.semanas ?? undefined,
      tipos: pedido.tipo_curso ? [pedido.tipo_curso] : [],
      comAcomodacao: false,
      ordenar: "preco",
    })
  )[0];

  const etapas = [
    { rotulo: "Pedido recebido", feito: true },
    {
      rotulo: pedido.status === "recusado" ? "Pedido não aprovado" : "Conferido pela InterWorld",
      feito: pedido.status !== "aguardando_revisao",
    },
    {
      rotulo: `Enviado para ${respostas.length || AGENCIAS_POR_PEDIDO} agências`,
      feito: pedido.status === "enviado",
    },
    { rotulo: "Propostas chegando", feito: prontas.length > 0 },
  ];

  return (
    <>
      <Cabecalho />
      <div className="min-h-[70svh] bg-ceu">
        <main className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-10 sm:px-8 lg:py-14">
          <div>
            <h1 className="text-[clamp(2rem,4vw,3rem)]">Olá, {primeiroNome(pedido.nome)}</h1>
            <p className="mt-3 text-xl">{descreverPedido(pedido)}</p>
            <p className="mt-2 text-[0.9375rem] text-suave">
              Guarde este link: é por aqui que você acompanha e compara as propostas.
            </p>
          </div>

          <ol className="grid gap-2 sm:grid-cols-4">
            {etapas.map((e) => (
              <li
                key={e.rotulo}
                className={`px-4 py-3 text-[0.9375rem] font-semibold ${e.feito ? "bg-marca-escura text-white" : "bg-superficie text-suave"}`}
              >
                {e.feito ? "✓ " : ""}
                {e.rotulo}
              </li>
            ))}
          </ol>

          {pedido.status === "sem_agencias" && (
            <p className="bg-superficie p-5">
              Ainda não temos agências parceiras para esse destino. Vamos avisar você pelo WhatsApp assim que tivermos.
            </p>
          )}
          {pedido.status === "recusado" && (
            <p className="bg-superficie p-5">
              Não conseguimos enviar este pedido. Confira seus dados e{" "}
              <Link href="/cotacao" className="font-semibold text-marca underline">
                faça um novo pedido
              </Link>
              .
            </p>
          )}

          {referencia && (
            <p className="bg-superficie p-5 text-[1.0625rem]">
              <strong>Referência:</strong> o menor preço que encontramos para esse curso é{" "}
              <strong className="numeros">{formatarEuro(referencia.preco_eur)}</strong> ({referencia.escola_nome},{" "}
              {referencia.agencia_nome}). Use para avaliar as propostas.
            </p>
          )}

          <section aria-labelledby="titulo-propostas" className="flex flex-col gap-4">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 id="titulo-propostas" className="text-[clamp(1.75rem,3vw,2.25rem)]">
                {prontas.length ? `${prontas.length} ${prontas.length === 1 ? "proposta" : "propostas"}` : "Propostas"}
              </h2>
              {aguardando > 0 && (
                <p className="text-[0.9375rem] font-semibold text-suave">
                  {aguardando} {aguardando === 1 ? "agência ainda vai responder" : "agências ainda vão responder"}
                </p>
              )}
            </div>

            {economia > 0 && (
              <p className="bg-verde px-5 py-4 font-display text-xl font-extrabold text-marca-escura">
                Escolhendo a mais barata, você economiza {moeda(economia, prontas[0].moeda)}.
              </p>
            )}

            {!prontas.length && (
              <p className="bg-superficie p-5 text-suave">
                {pedido.status === "aguardando_revisao"
                  ? "Estamos conferindo seu pedido. Em seguida ele vai para as agências."
                  : "As agências estão preparando as propostas. Volte a esta página mais tarde."}
              </p>
            )}

            <ul className="flex flex-col gap-3">
              {prontas.map((p, i) => (
                <li key={p.id} className="grid gap-4 bg-superficie p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-6">
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-2xl">{p.agencia_nome}</h3>
                      {i === 0 && prontas.length > 1 && (
                        <span className="rounded-full bg-verde px-3 py-0.5 text-[0.9375rem] font-semibold text-marca-escura">
                          Menor preço
                        </span>
                      )}
                    </div>
                    {p.inclui && <p className="whitespace-pre-line">{p.inclui}</p>}
                    {p.mensagem && <p className="whitespace-pre-line text-suave">“{p.mensagem}”</p>}
                    {p.validade && (
                      <p className="text-[0.9375rem] text-suave">Válida até {DATA.format(new Date(p.validade))}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-start gap-3 sm:items-end">
                    <p className="numeros font-display text-[2rem] leading-none font-extrabold">
                      {moeda(p.preco, p.moeda)}
                    </p>
                    {p.whatsapp && (
                      <a
                        href={`https://wa.me/${p.whatsapp}?text=${encodeURIComponent(
                          `Olá! Vi a proposta de vocês na InterWorld para ${descreverPedido(pedido)} e quero conversar.`,
                        )}`}
                        target="_blank"
                        rel="noopener"
                        className="flex h-12 items-center rounded-full bg-marca-escura px-6 font-semibold text-white transition-colors hover:bg-marca"
                      >
                        Falar no WhatsApp
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {pedido.status !== "recusado" && (
            <KitResumo titulo="Enquanto isso, o resto da viagem" destino={pedido.pais_slug} />
          )}
        </main>
      </div>
    </>
  );
}
