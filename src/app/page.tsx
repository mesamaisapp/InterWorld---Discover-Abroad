import { redirect } from "next/navigation";
import { Cabecalho } from "@/components/comum/Cabecalho";
import { Rodape } from "@/components/comum/Rodape";
import { ComoFunciona } from "@/components/inicio/ComoFunciona";
import { Duvidas } from "@/components/inicio/Duvidas";
import { GaleriaDestinos } from "@/components/inicio/GaleriaDestinos";
import { HeroBilhete } from "@/components/inicio/HeroBilhete";
import { VitrineEconomia } from "@/components/inicio/VitrineEconomia";
import { buscarCatalogo, buscarFaixas } from "@/lib/catalogo";
import { filtrosParaQuery, lerFiltros, type SearchParams } from "@/lib/filtros";
import { chaveCurso, maioresEconomias, resumirDestinos } from "@/lib/resumo";

export default async function PaginaInicial({ searchParams }: { searchParams: Promise<SearchParams> }) {
  // Links antigos de busca (/?destino=malta...) continuam funcionando
  const query = filtrosParaQuery(lerFiltros(await searchParams));
  if (query) redirect(`/busca?${query}`);

  const [catalogo, faixas] = await Promise.all([buscarCatalogo(), buscarFaixas()]);
  const resumos = resumirDestinos(catalogo);
  const economias = maioresEconomias(catalogo);

  return (
    <>
      <main>
        <Cabecalho />
        <HeroBilhete
          itens={catalogo.map((p) => ({
            cidade: p.escola_cidade,
            semanas: p.semanas,
            tipo: p.tipo_curso,
            preco: p.preco_eur,
            chave: chaveCurso(p),
          }))}
          paises={faixas.paises}
          precoMaximo={faixas.precoMaximo}
        />
        <GaleriaDestinos resumos={resumos} />
        <VitrineEconomia grupos={economias} />
        <ComoFunciona economiaMaxima={economias[0]?.economia ?? 0} />
        <Duvidas />
      </main>
      <Rodape />
    </>
  );
}
