import { TIPOS_CURSO, type FiltrosBusca, type Ordenacao, type TipoCurso } from "@/types/catalogo";

export type SearchParams = Record<string, string | string[] | undefined>;

const ORDENACOES: Ordenacao[] = ["preco", "preco_semana", "semanas"];

function primeiro(valor: string | string[] | undefined) {
  return Array.isArray(valor) ? valor[0] : valor;
}

function inteiroPositivo(valor: string | undefined) {
  const n = Number(valor);
  return Number.isInteger(n) && n > 0 ? n : undefined;
}

/** Converte a query string (?destino=malta&tipo=geral,intensivo...) em filtros validados. */
export function lerFiltros(params: SearchParams): FiltrosBusca {
  const tipos = (primeiro(params.tipo) ?? "")
    .split(",")
    .filter((t): t is TipoCurso => (TIPOS_CURSO as readonly string[]).includes(t));
  const ordenar = primeiro(params.ordenar) as Ordenacao;

  return {
    destino: primeiro(params.destino) || undefined,
    cidade: primeiro(params.cidade) || undefined,
    semanas: inteiroPositivo(primeiro(params.semanas)),
    tipos,
    orcamentoMax: inteiroPositivo(primeiro(params.orcamento)),
    comAcomodacao: primeiro(params.acomodacao) === "1",
    ordenar: ORDENACOES.includes(ordenar) ? ordenar : "preco",
  };
}

/** Caminho inverso: filtros → query string, omitindo valores padrão. */
export function filtrosParaQuery(filtros: FiltrosBusca) {
  const q = new URLSearchParams();
  if (filtros.destino) q.set("destino", filtros.destino);
  if (filtros.cidade) q.set("cidade", filtros.cidade);
  if (filtros.semanas) q.set("semanas", String(filtros.semanas));
  if (filtros.tipos.length) q.set("tipo", filtros.tipos.join(","));
  if (filtros.orcamentoMax) q.set("orcamento", String(filtros.orcamentoMax));
  if (filtros.comAcomodacao) q.set("acomodacao", "1");
  if (filtros.ordenar !== "preco") q.set("ordenar", filtros.ordenar);
  return q.toString();
}

export function contarFiltrosAtivos(filtros: FiltrosBusca) {
  return [
    filtros.destino,
    filtros.cidade,
    filtros.semanas,
    filtros.tipos.length > 0,
    filtros.orcamentoMax,
    filtros.comAcomodacao,
  ].filter(Boolean).length;
}
