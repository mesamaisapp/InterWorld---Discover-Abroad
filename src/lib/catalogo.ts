import "server-only";
import { cache } from "react";
import { supabaseServidor } from "@/lib/supabase/servidor";
import { PACOTES_EXEMPLO, PAISES_EXEMPLO } from "@/lib/dados-exemplo";
import { destinoPorSlug } from "@/lib/destinos";
import type { FaixasCatalogo, FiltrosBusca, Ordenacao, PacoteBusca } from "@/types/catalogo";

const COLUNA_ORDENACAO: Record<Ordenacao, keyof PacoteBusca> = {
  preco: "preco_eur",
  preco_semana: "preco_semana_eur",
  semanas: "semanas",
};

const LIMITE_RESULTADOS = 60;
const LIMITE_CATALOGO = 2000;

/** Busca pacotes aplicando os filtros no banco (view `pacotes_busca`). */
export async function buscarPacotes(filtros: FiltrosBusca): Promise<PacoteBusca[]> {
  const supabase = supabaseServidor();
  if (!supabase) return filtrarEmMemoria(PACOTES_EXEMPLO, filtros);

  let query = supabase.from("pacotes_busca").select("*");
  if (filtros.destino) query = query.eq("pais_slug", filtros.destino);
  const cidade = destinoPorSlug(filtros.cidade)?.cidade;
  if (cidade) query = query.eq("escola_cidade", cidade);
  if (filtros.semanas) query = query.eq("semanas", filtros.semanas);
  if (filtros.tipos.length) query = query.in("tipo_curso", filtros.tipos);
  if (filtros.orcamentoMax) query = query.lte("preco_eur", filtros.orcamentoMax);
  if (filtros.comAcomodacao) query = query.eq("acomodacao_inclusa", true);

  const { data, error } = await query
    .order(COLUNA_ORDENACAO[filtros.ordenar], { ascending: true })
    .limit(LIMITE_RESULTADOS);

  if (error) throw new Error(`Falha ao buscar pacotes: ${error.message}`);
  return normalizar(data);
}

/** Todo o catálogo ativo, para os resumos da página inicial (preço "a partir de", comparações). */
export const buscarCatalogo = cache(async (): Promise<PacoteBusca[]> => {
  const supabase = supabaseServidor();
  if (!supabase) return PACOTES_EXEMPLO;

  const { data, error } = await supabase.from("pacotes_busca").select("*").limit(LIMITE_CATALOGO);
  if (error) throw new Error(`Falha ao buscar o catálogo: ${error.message}`);
  return normalizar(data);
});

// numeric chega como string pelo PostgREST
function normalizar(data: PacoteBusca[] | null): PacoteBusca[] {
  return (data ?? []).map((p) => ({
    ...p,
    preco_eur: Number(p.preco_eur),
    preco_semana_eur: Number(p.preco_semana_eur),
  }));
}

/** Opções da barra de filtros: destinos, durações existentes e teto do slider de orçamento. */
export const buscarFaixas = cache(async (): Promise<FaixasCatalogo> => {
  const supabase = supabaseServidor();
  if (!supabase) return faixasDe(PACOTES_EXEMPLO, PAISES_EXEMPLO);

  const [paises, pacotes] = await Promise.all([
    supabase.from("paises").select("id, nome, slug").order("nome"),
    supabase.from("pacotes_busca").select("semanas, preco_eur"),
  ]);
  if (paises.error) throw new Error(paises.error.message);
  if (pacotes.error) throw new Error(pacotes.error.message);

  return faixasDe(
    (pacotes.data ?? []).map((p) => ({ semanas: p.semanas, preco_eur: Number(p.preco_eur) })),
    paises.data ?? [],
  );
});

/** Busca um pacote pelo id (usado no redirecionamento de afiliado). */
export async function buscarPacote(id: string) {
  const supabase = supabaseServidor();
  if (!supabase) return PACOTES_EXEMPLO.find((p) => p.id === id) ?? null;

  const { data } = await supabase
    .from("pacotes_busca")
    .select("id, link_afiliado")
    .eq("id", id)
    .maybeSingle();
  return data;
}

export async function registrarClique(pacoteId: string, referer: string | null, userAgent: string | null) {
  const supabase = supabaseServidor();
  if (!supabase) return;
  // Falha de tracking nunca deve bloquear o redirecionamento
  await supabase
    .from("cliques_oferta")
    .insert({ pacote_id: pacoteId, referer, user_agent: userAgent?.slice(0, 500) });
}

function faixasDe(pacotes: Pick<PacoteBusca, "semanas" | "preco_eur">[], paises: FaixasCatalogo["paises"]) {
  const semanas = [...new Set(pacotes.map((p) => p.semanas))].sort((a, b) => a - b);
  const maior = Math.max(0, ...pacotes.map((p) => p.preco_eur));
  return {
    paises,
    semanasDisponiveis: semanas,
    // arredonda para cima em degraus de 500 € para o slider ficar "redondo"
    precoMaximo: Math.max(500, Math.ceil(maior / 500) * 500),
  };
}

function filtrarEmMemoria(pacotes: PacoteBusca[], f: FiltrosBusca) {
  const coluna = COLUNA_ORDENACAO[f.ordenar];
  const cidade = destinoPorSlug(f.cidade)?.cidade;
  return pacotes
    .filter(
      (p) =>
        (!f.destino || p.pais_slug === f.destino) &&
        (!cidade || p.escola_cidade === cidade) &&
        (!f.semanas || p.semanas === f.semanas) &&
        (!f.tipos.length || f.tipos.includes(p.tipo_curso)) &&
        (!f.orcamentoMax || p.preco_eur <= f.orcamentoMax) &&
        (!f.comAcomodacao || p.acomodacao_inclusa),
    )
    .sort((a, b) => Number(a[coluna]) - Number(b[coluna]))
    .slice(0, LIMITE_RESULTADOS);
}
