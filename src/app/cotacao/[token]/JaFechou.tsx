import { registrarDesfecho } from "@/app/cotacao/[token]/acoes";
import type { Pedido, Resposta } from "@/lib/cotacoes/tipos";

/** Pergunta ao aluno se ele fechou: é o número que diz se o InterWorld gera matrículas. */
export function JaFechou({ pedido, propostas }: { pedido: Pedido; propostas: Resposta[] }) {
  const escolhida = propostas.find((p) => p.id === pedido.desfecho_resposta_id);
  const agradecimento =
    pedido.desfecho === "fechou"
      ? `Boa viagem! Você nos contou que fechou com ${escolhida?.agencia_nome ?? "uma das agências"}.`
      : pedido.desfecho === "desistiu"
        ? "Obrigado por contar. Quando quiser tentar de novo, é só pedir outra cotação."
        : pedido.desfecho === "ainda_nao"
          ? "Sem pressa. Se fechar, volte aqui e conte para a gente."
          : null;

  const formulario = (
    <form action={registrarDesfecho.bind(null, pedido.token)} className="flex flex-col gap-3">
      <fieldset className="flex flex-col gap-2">
        <legend className="sr-only">Já fechou?</legend>
        {propostas.map((p) => (
          <Opcao key={p.id} valor={`fechou:${p.id}`} marcado={pedido.desfecho_resposta_id === p.id}>
            Fechei com <strong>{p.agencia_nome}</strong>
          </Opcao>
        ))}
        <Opcao valor="ainda_nao" marcado={pedido.desfecho === "ainda_nao"}>
          Ainda não decidi
        </Opcao>
        <Opcao valor="desistiu" marcado={pedido.desfecho === "desistiu"}>
          Desisti do intercâmbio por enquanto
        </Opcao>
      </fieldset>
      <button className="h-12 self-start rounded-full bg-marca-escura px-6 font-semibold text-white transition-colors hover:bg-marca">
        Enviar
      </button>
    </form>
  );

  return (
    <section aria-labelledby="titulo-ja-fechou" className="flex flex-col gap-4 bg-superficie p-5 sm:p-6">
      <h2 id="titulo-ja-fechou" className="text-[clamp(1.5rem,3vw,2rem)]">
        Já fechou?
      </h2>
      {agradecimento ? (
        <>
          <p className="text-lg">{agradecimento}</p>
          <details>
            <summary className="cursor-pointer font-semibold text-marca">Mudar resposta</summary>
            <div className="mt-4">{formulario}</div>
          </details>
        </>
      ) : (
        <>
          <p>Conte para a gente: isso ajuda a saber quais agências respondem bem e melhora as próximas cotações.</p>
          {formulario}
        </>
      )}
    </section>
  );
}

function Opcao({ valor, marcado, children }: { valor: string; marcado: boolean; children: React.ReactNode }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 bg-ceu px-4 py-3 has-[:checked]:bg-[#d3e2f6]">
      <input
        type="radio"
        name="desfecho"
        value={valor}
        defaultChecked={marcado}
        required
        className="size-5 accent-marca"
      />
      <span>{children}</span>
    </label>
  );
}
