import Link from "next/link";
import { formatarEuro } from "@/lib/formatar";

// O caminho até o embarque, impresso como um itinerário
const ETAPAS: { quando: string; passos: [string, string][] }[] = [
  {
    quando: "Hoje",
    passos: [
      ["Escolha cidade, curso e semanas", "1 min"],
      ["Veja as agências lado a lado", "2 min"],
      ["Separe a oferta mais barata", "1 clique"],
    ],
  },
  {
    quando: "Esta semana",
    passos: [
      ["Fale com a agência pelo link da oferta", "1 dia"],
      ["Confirme escola, datas e acomodação", "2 dias"],
    ],
  },
  {
    quando: "Antes de embarcar",
    passos: [
      ["Matrícula, seguro e visto com a agência", "4–8 sem"],
      ["Passagem comprada, mala pronta", "você decide"],
    ],
  },
];

export function ComoFunciona({ economiaMaxima }: { economiaMaxima: number }) {
  return (
    <section
      id="como-funciona"
      aria-labelledby="titulo-como"
      className="scroll-mt-4 bg-marca-escura py-[clamp(5rem,10vw,9rem)] text-white"
    >
      <div className="mx-auto grid max-w-[1400px] gap-12 px-4 sm:px-8 lg:grid-cols-12 lg:items-start">
        <div className="lg:col-span-5">
          <h2 id="titulo-como" data-revelar className="text-[clamp(2.25rem,4.6vw,4.25rem)]">
            Do sonho ao embarque
          </h2>
          <p data-revelar style={{ "--i": 1 } as React.CSSProperties} className="mt-6 max-w-[34ch] text-xl">
            A InterWorld não vende pacote: mostra quem vende o mesmo curso por menos. Você fecha direto com a
            agência, pelo preço que viu aqui.
          </p>
          <Link
            data-revelar
            style={{ "--i": 2 } as React.CSSProperties}
            href="/busca"
            className="mt-10 inline-flex h-14 items-center rounded-full bg-verde px-7 text-[1.0625rem] font-semibold text-marca-escura transition-[background-color,scale] duration-200 hover:bg-[#6fcb59] active:scale-[0.97]"
          >
            Começar a comparar
          </Link>
          <Link
            href="/guia"
            className="mt-4 block w-fit text-[1.0625rem] font-semibold underline-offset-4 hover:underline"
          >
            Primeira vez? Leia o guia completo →
          </Link>
        </div>

        <div
          data-revelar
          style={{ "--i": 1 } as React.CSSProperties}
          className="zigue w-full max-w-[520px] bg-superficie px-6 pt-7 pb-12 text-texto sm:px-8 lg:col-span-5 lg:col-start-8"
        >
          <p className="font-display text-xl font-extrabold">Seu itinerário</p>
          {ETAPAS.map((etapa) => (
            <div key={etapa.quando} className="mt-7">
              <h3 className="font-sans text-base font-bold tracking-normal">{etapa.quando}</h3>
              <ul className="mt-2 flex flex-col gap-2">
                {etapa.passos.map(([passo, tempo]) => (
                  <li key={passo} className="numeros flex items-baseline text-base">
                    <span>{passo}</span>
                    <span aria-hidden className="guia" />
                    <span className="shrink-0 font-semibold">{tempo}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <p className="numeros mt-8 flex min-h-11 items-center justify-between gap-3 bg-marca-escura px-4 py-2 font-semibold text-white">
            <span>No bolso, comparando</span>
            <span>até {formatarEuro(economiaMaxima)}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
