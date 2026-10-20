import { formatarEuro, formatarSemanas } from "@/lib/formatar";
import { ROTULO_TIPO_CURSO, type PacoteBusca } from "@/types/catalogo";

export function CardPacote({ pacote, melhorPreco }: { pacote: PacoteBusca; melhorPreco?: boolean }) {
  return (
    <article className="relative flex w-full flex-col rounded-2xl border border-borda bg-superficie p-5 transition-shadow hover:shadow-lg">
      {melhorPreco && (
        <span className="absolute -top-2.5 left-5 rounded-full bg-destaque px-2.5 py-0.5 text-xs font-semibold text-white">
          Menor preço
        </span>
      )}

      <header className="mb-4">
        <p className="mb-1 text-xs font-medium text-suave">
          {pacote.escola_cidade}, {pacote.pais_nome}
        </p>
        <h3 className="text-lg font-semibold leading-snug">{pacote.escola_nome}</h3>
      </header>

      <dl className="mb-5 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
        <Info rotulo="Curso" valor={ROTULO_TIPO_CURSO[pacote.tipo_curso]} />
        <Info rotulo="Duração" valor={formatarSemanas(pacote.semanas)} />
        <Info rotulo="Agência" valor={<NomeAgencia pacote={pacote} />} />
        <Info rotulo="Acomodação" valor={pacote.acomodacao_inclusa ? "Inclusa" : "Não inclusa"} />
      </dl>

      <footer className="mt-auto flex items-end justify-between gap-4 border-t border-borda pt-4">
        <div>
          <p className="text-2xl font-bold tracking-tight">{formatarEuro(pacote.preco_eur)}</p>
          <p className="text-xs text-suave">{formatarEuro(pacote.preco_semana_eur)} / semana</p>
        </div>
        <a
          href={`/api/oferta/${pacote.id}`}
          target="_blank"
          rel="sponsored noopener"
          className="shrink-0 rounded-xl bg-marca px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-marca-escura focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca"
        >
          Ver Oferta
          <span className="sr-only">
            {" "}
            de {pacote.agencia_nome} para {pacote.escola_nome} (abre em nova aba)
          </span>
        </a>
      </footer>
    </article>
  );
}

function Info({ rotulo, valor }: { rotulo: string; valor: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-suave">{rotulo}</dt>
      <dd className="truncate font-medium">{valor}</dd>
    </div>
  );
}

function NomeAgencia({ pacote }: { pacote: PacoteBusca }) {
  return (
    <span className="inline-flex max-w-full items-center gap-1.5">
      {pacote.agencia_logo_url ? (
        // eslint-disable-next-line @next/next/no-img-element -- logos pequenos de domínios variados
        <img src={pacote.agencia_logo_url} alt="" className="size-4 shrink-0 rounded-sm object-contain" />
      ) : (
        <span
          aria-hidden
          className="grid size-4 shrink-0 place-items-center rounded-sm bg-marca/10 text-[10px] font-bold text-marca"
        >
          {pacote.agencia_nome[0]}
        </span>
      )}
      <span className="truncate">{pacote.agencia_nome}</span>
    </span>
  );
}
