export const TIPOS_CURSO = ["geral", "intensivo", "business", "preparatorio", "ferias"] as const;
export type TipoCurso = (typeof TIPOS_CURSO)[number];

export const ROTULO_TIPO_CURSO: Record<TipoCurso, string> = {
  geral: "Idioma geral",
  intensivo: "Intensivo",
  business: "Business",
  preparatorio: "Preparatório (IELTS, TOEFL…)",
  ferias: "Férias",
};

export interface Pais {
  id: string;
  nome: string;
  slug: string;
}

/** Uma linha da view `pacotes_busca`. */
export interface PacoteBusca {
  id: string;
  tipo_curso: TipoCurso;
  semanas: number;
  preco_eur: number;
  preco_semana_eur: number;
  acomodacao_inclusa: boolean;
  link_afiliado: string;
  escola_id: string;
  escola_nome: string;
  escola_cidade: string;
  pais_id: string;
  pais_nome: string;
  pais_slug: string;
  agencia_id: string;
  agencia_nome: string;
  agencia_logo_url: string | null;
  /** 'coletado' = lido do site da escola ou agência pelo coletor (coletor/) */
  origem?: "parceiro" | "coletado";
  visto_em?: string | null;
}

export type Ordenacao = "preco" | "preco_semana" | "semanas";

export interface FiltrosBusca {
  /** slug do país */
  destino?: string;
  /** slug da cidade (src/lib/destinos.ts) */
  cidade?: string;
  semanas?: number;
  tipos: TipoCurso[];
  orcamentoMax?: number;
  comAcomodacao: boolean;
  ordenar: Ordenacao;
}

export interface FaixasCatalogo {
  paises: Pais[];
  semanasDisponiveis: number[];
  precoMaximo: number;
}
