// País de origem do aluno. Hoje só o Brasil; um novo mercado entra aqui com idioma, moeda e DDI.
export interface Mercado {
  slug: string;
  nome: string;
  idioma: string;
  moeda: string;
  ddi: string;
}

export const MERCADOS: Record<string, Mercado> = {
  br: { slug: "br", nome: "Brasil", idioma: "pt-BR", moeda: "BRL", ddi: "55" },
};

export const MERCADO_PADRAO = MERCADOS.br;
