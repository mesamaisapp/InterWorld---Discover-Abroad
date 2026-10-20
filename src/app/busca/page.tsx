import { BarraFiltros } from "@/components/busca/BarraFiltros";
import { AreaResultados, ProvedorBusca } from "@/components/busca/ContextoBusca";
import { GridResultados } from "@/components/busca/GridResultados";
import { SeletorOrdenacao } from "@/components/busca/SeletorOrdenacao";
import { Cabecalho } from "@/components/comum/Cabecalho";
import { FotoCidade } from "@/components/comum/FotoCidade";
import { buscarFaixas, buscarPacotes } from "@/lib/catalogo";
import { destinoPorSlug } from "@/lib/destinos";
import { lerFiltros, type SearchParams } from "@/lib/filtros";
import { formatarEuro, formatarSemanas } from "@/lib/formatar";
import { agruparOfertas } from "@/lib/resumo";

export const metadata = { title: "Pacotes de intercâmbio — InterWorld" };

export default async function PaginaBusca({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const filtros = lerFiltros(await searchParams);
  const [faixas, pacotes] = await Promise.all([buscarFaixas(), buscarPacotes(filtros)]);
  const cidade = destinoPorSlug(filtros.cidade);
  const pais = faixas.paises.find((p) => p.slug === filtros.destino);
  const lugar = cidade?.cidade ?? pais?.nome;
  const grupos = agruparOfertas(pacotes);
  const escolas = new Set(pacotes.map((p) => p.escola_id)).size;

  const destaques = pacotes.length
    ? {
        preco: formatarEuro(Math.min(...pacotes.map((p) => p.preco_eur))),
        preco_semana: `${formatarEuro(Math.min(...pacotes.map((p) => p.preco_semana_eur)))}/sem`,
        semanas: formatarSemanas(Math.min(...pacotes.map((p) => p.semanas))),
      }
    : { preco: null, preco_semana: null, semanas: null };

  return (
    <ProvedorBusca filtros={filtros}>
      <Cabecalho />

      <section className="relative isolate overflow-hidden bg-marca-escura text-white">
        {cidade && (
          <div className="absolute inset-0 -z-10">
            <FotoCidade foto={cidade.foto} largura={1920} prioridade className="foto-viva size-full" />
            <div className="absolute inset-0 bg-black/45" />
          </div>
        )}
        <div className="mx-auto flex min-h-[180px] max-w-[1400px] flex-col justify-end px-4 py-8 sm:min-h-[240px] sm:px-8">
          <h1 className="text-[clamp(2rem,4vw,3.25rem)]">{lugar ? `Intercâmbio em ${lugar}` : "Todos os pacotes"}</h1>
          <p className="mt-3 text-xl" aria-live="polite">
            <strong className="numeros">{grupos.length}</strong> {grupos.length === 1 ? "curso" : "cursos"} em{" "}
            {escolas} {escolas === 1 ? "escola" : "escolas"}, <strong className="numeros">{pacotes.length}</strong>{" "}
            {pacotes.length === 1 ? "oferta" : "ofertas"} de agências
            {cidade && <span className="hidden sm:inline"> · {cidade.frase}</span>}
          </p>
        </div>
      </section>

      <div className="bg-ceu">
      <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-8 lg:grid lg:grid-cols-[300px_1fr] lg:items-start lg:gap-8 lg:py-10">
        <BarraFiltros faixas={faixas} />

        <section aria-label="Resultados" className="flex min-w-0 flex-col gap-5">
          <SeletorOrdenacao destaques={destaques} />
          <AreaResultados>
            <GridResultados grupos={grupos} />
          </AreaResultados>
        </section>
      </main>
      </div>
    </ProvedorBusca>
  );
}
