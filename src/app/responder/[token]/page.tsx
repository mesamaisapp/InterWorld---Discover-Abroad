import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FormResposta } from "@/app/responder/[token]/FormResposta";
import { Logo } from "@/components/marca/Logo";
import { AGENCIAS_POR_PEDIDO, descreverPedido, primeiroNome } from "@/lib/cotacoes/fluxo";
import { repo } from "@/lib/cotacoes/repositorio";

export const metadata: Metadata = { title: "Responder cotação — InterWorld", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function PaginaResponder({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const r = repo();
  const resposta = await r.respostaPorToken(token);
  const pedido = resposta && (await r.pedidoPorId(resposta.pedido_id));
  if (!resposta || !pedido) notFound();

  return (
    <div className="min-h-svh bg-ceu">
      <header className="bg-superficie">
        <div className="mx-auto flex h-[76px] max-w-4xl items-center px-4 sm:px-8">
          <Logo />
        </div>
      </header>
      <main className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-10 sm:px-8">
        <div>
          <p className="text-[0.9375rem] font-semibold text-suave">Cotação para {resposta.agencia_nome}</p>
          <h1 className="mt-2 text-[clamp(2rem,4vw,2.75rem)]">
            {primeiroNome(pedido.nome)} quer ir para {pedido.cidade ?? pedido.pais_slug}
          </h1>
          <p className="mt-3 text-xl">{descreverPedido(pedido)}</p>
          {pedido.observacoes && <p className="mt-3 whitespace-pre-line">Observações: {pedido.observacoes}</p>}
          <p className="mt-3 text-[0.9375rem] text-suave">
            Até {AGENCIAS_POR_PEDIDO} agências recebem este pedido. O aluno vê as propostas lado a lado, ordenadas pelo
            preço total.
          </p>
        </div>

        {resposta.respondido_em ? (
          <section aria-labelledby="titulo-contato" className="bg-marca-escura p-5 text-white sm:p-6">
            <h2 id="titulo-contato" className="text-2xl">
              Contato do aluno
            </h2>
            <p className="mt-3 text-lg">{pedido.nome}</p>
            <p className="mt-1">
              <a
                href={`https://wa.me/${pedido.whatsapp}`}
                className="font-semibold underline"
                target="_blank"
                rel="noopener"
              >
                WhatsApp +{pedido.whatsapp}
              </a>
              {pedido.email && <> · {pedido.email}</>}
            </p>
          </section>
        ) : (
          <p className="bg-superficie p-5 font-semibold">Envie sua proposta para liberar o contato do aluno.</p>
        )}

        <section aria-labelledby="titulo-proposta" className="bg-superficie p-5 sm:p-8">
          <h2 id="titulo-proposta" className="mb-6 text-2xl">
            Sua proposta
          </h2>
          <FormResposta token={token} atual={resposta} />
        </section>
      </main>
    </div>
  );
}
