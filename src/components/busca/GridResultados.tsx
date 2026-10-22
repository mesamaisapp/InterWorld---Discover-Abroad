import Link from "next/link";
import { CardPacote } from "@/components/busca/CardPacote";
import type { GrupoOferta } from "@/lib/resumo";

export function GridResultados({ grupos }: { grupos: GrupoOferta[] }) {
  if (grupos.length === 0) {
    return (
      <div className="bg-ceu px-6 py-16 text-center">
        <p className="font-display text-2xl font-extrabold">Nenhum pacote com esses filtros</p>
        <p className="mt-2 text-suave">Aumente o orçamento ou tire algum filtro — ou veja tudo de uma vez.</p>
        <Link
          href="/busca"
          className="mt-6 inline-flex h-12 items-center rounded-full bg-marca-escura px-6 font-semibold text-white transition-colors hover:bg-marca"
        >
          Ver todos os pacotes
        </Link>
      </div>
    );
  }

  const menorPreco = Math.min(...grupos.map((g) => g.ofertas[0].preco_eur));

  return (
    <ul className="flex flex-col gap-4">
      {grupos.map((grupo) => (
        <li key={grupo.chave} className="flex">
          <CardPacote
            grupo={grupo}
            menorPreco={grupos.length > 1 && grupo.ofertas[0].preco_eur === menorPreco}
          />
        </li>
      ))}
    </ul>
  );
}
