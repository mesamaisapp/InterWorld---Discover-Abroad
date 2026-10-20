import { CardPacote } from "@/components/busca/CardPacote";
import type { PacoteBusca } from "@/types/catalogo";

export function GridResultados({ pacotes }: { pacotes: PacoteBusca[] }) {
  if (pacotes.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-borda bg-superficie px-6 py-16 text-center">
        <p className="text-lg font-semibold">Nenhum pacote encontrado</p>
        <p className="mt-1 text-sm text-suave">Tente aumentar o orçamento ou remover algum filtro.</p>
      </div>
    );
  }

  const menorPreco = Math.min(...pacotes.map((p) => p.preco_eur));

  return (
    <ul className="grid grid-cols-1 gap-5 pt-2.5 sm:grid-cols-2 2xl:grid-cols-3">
      {pacotes.map((pacote) => (
        <li key={pacote.id} className="flex">
          <CardPacote pacote={pacote} melhorPreco={pacotes.length > 1 && pacote.preco_eur === menorPreco} />
        </li>
      ))}
    </ul>
  );
}
