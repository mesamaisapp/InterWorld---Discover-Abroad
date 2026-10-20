import Link from "next/link";
import { FotoCidade } from "@/components/comum/FotoCidade";
import { formatarEuro } from "@/lib/formatar";
import type { ResumoDestino } from "@/lib/resumo";

// Etiqueta presa à foto, como a tag de bagagem; as cores revezam entre as da marca.
const ETIQUETAS = [
  "bg-marca-escura text-white",
  "bg-marca text-white",
  "bg-verde text-marca-escura",
  "bg-ceu text-marca-escura",
];

export function GaleriaDestinos({ resumos }: { resumos: ResumoDestino[] }) {
  return (
    <section id="destinos" aria-labelledby="titulo-destinos" className="scroll-mt-4 py-[clamp(5rem,10vw,9rem)]">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-8">
        <div className="mb-10 grid gap-4 lg:grid-cols-[1fr_1fr] lg:items-end">
          <h2 id="titulo-destinos" data-revelar className="text-[clamp(2.25rem,4.6vw,4.25rem)]">
            Para onde você vai?
          </h2>
          <p data-revelar style={{ "--i": 1 } as React.CSSProperties} className="max-w-[46ch] text-xl lg:justify-self-end">
            {resumos.length} cidades, do mais barato por semana ao mais caro. O preço é o menor pacote que as
            agências parceiras cotaram hoje.
          </p>
        </div>

        <ul className="grid grid-cols-1 gap-x-3 gap-y-7 min-[480px]:grid-cols-2 lg:grid-cols-3">
          {resumos.map((r, i) => (
            <li key={r.destino.slug} data-revelar style={{ "--i": i % 3 } as React.CSSProperties}>
              <Link
                href={`/busca?cidade=${r.destino.slug}`}
                className="group block focus-visible:outline-offset-4"
              >
                <div className="overflow-hidden">
                  <FotoCidade
                    foto={r.destino.foto}
                    largura={900}
                    className="aspect-[4/3] w-full transition-transform duration-700 ease-[var(--ease-saida)] group-hover:scale-[1.05] min-[480px]:aspect-[4/5]"
                  />
                </div>
                <div className={`flex flex-col gap-2 p-4 sm:p-5 ${ETIQUETAS[i % ETIQUETAS.length]}`}>
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-[clamp(1.5rem,2.2vw,2rem)]">{r.destino.cidade}</h3>
                    <span className="numeros font-display text-[1.375rem] font-extrabold tracking-[-0.02em]">
                      {r.destino.codigo}
                    </span>
                  </div>
                  <div className="numeros flex flex-wrap justify-between gap-x-4 gap-y-1 text-[0.9375rem]">
                    <span>{r.pais_nome}</span>
                    <span>
                      a partir de <strong>{formatarEuro(r.menorPrecoSemana)}</strong>/semana
                    </span>
                  </div>
                  <div className="numeros flex flex-wrap justify-between gap-x-4 gap-y-1 text-[0.9375rem]">
                    <span>
                      {r.escolas} {r.escolas === 1 ? "escola" : "escolas"} · {r.pacotes}{" "}
                      {r.pacotes === 1 ? "pacote" : "pacotes"}
                    </span>
                    <span className="inline-flex items-center gap-1 font-semibold">
                      Ver pacotes
                      <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                        →
                      </span>
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
