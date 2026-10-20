import { BarraFiltros } from "@/components/busca/BarraFiltros";
import { AreaResultados, ProvedorBusca } from "@/components/busca/ContextoBusca";
import { GridResultados } from "@/components/busca/GridResultados";
import { SeletorOrdenacao } from "@/components/busca/SeletorOrdenacao";
import { buscarFaixas, buscarPacotes } from "@/lib/catalogo";
import { lerFiltros, type SearchParams } from "@/lib/filtros";

export default async function PaginaBusca({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const filtros = lerFiltros(await searchParams);
  const [faixas, pacotes] = await Promise.all([buscarFaixas(), buscarPacotes(filtros)]);
  const destino = faixas.paises.find((p) => p.slug === filtros.destino);

  return (
    <ProvedorBusca filtros={filtros}>
      <header className="border-b border-borda bg-superficie">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
          <p className="text-sm font-semibold text-marca">Comparador de intercâmbio</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
            Compare cursos de idioma no exterior
          </h1>
          <p className="mt-2 max-w-2xl text-suave">
            Preços de várias agências lado a lado, para a mesma escola e duração. Sem taxa escondida.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:grid lg:grid-cols-[280px_1fr] lg:items-start lg:gap-8">
        <BarraFiltros faixas={faixas} />

        <section aria-labelledby="titulo-resultados" className="min-w-0">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 id="titulo-resultados" className="text-sm text-suave" aria-live="polite">
              <strong className="text-base text-texto">{pacotes.length}</strong>{" "}
              {pacotes.length === 1 ? "pacote" : "pacotes"}
              {destino && ` em ${destino.nome}`}
            </h2>
            <SeletorOrdenacao />
          </div>

          <AreaResultados>
            <GridResultados pacotes={pacotes} />
          </AreaResultados>
        </section>
      </main>
    </ProvedorBusca>
  );
}
