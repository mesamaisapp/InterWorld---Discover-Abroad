// Regras de conferência do que a IA extraiu, antes de qualquer coisa ir para o banco.
// Funções puras: testadas em validar.test.ts.

export const TIPOS_CURSO = ["geral", "intensivo", "business", "preparatorio", "ferias"] as const;
export type TipoCurso = (typeof TIPOS_CURSO)[number];

export const MOEDAS = ["EUR", "GBP", "CAD", "AUD", "USD", "NZD"] as const;
export type Moeda = (typeof MOEDAS)[number];

/** Uma oferta como a IA devolve (formato do JSON schema em extrair.ts). */
export interface OfertaExtraida {
  escola: string;
  cidade: string;
  pais: string;
  tipo_curso: string;
  semanas: number;
  preco: number;
  moeda: string;
  inclui_acomodacao: boolean;
  trecho: string;
}

export interface OfertaValida {
  escola: string;
  cidade: string;
  pais_slug: string;
  tipo_curso: TipoCurso;
  semanas: number;
  moeda: Moeda;
  preco_original: number;
  preco_eur: number;
  inclui_acomodacao: boolean;
  trecho: string;
}

/** Unidades de cada moeda por 1 euro (como o BCE publica). */
export type Cambio = Partial<Record<Moeda, number>> & { EUR: 1 };

// Preço por semana fora dessa faixa quase sempre é erro de leitura (preço anual, taxa solta, centavos)
const SEMANA_MIN_EUR = 40;
const SEMANA_MAX_EUR = 1500;

const PAISES: Record<string, string> = {
  irlanda: "irlanda",
  ireland: "irlanda",
  malta: "malta",
  canada: "canada",
  "reino unido": "reino-unido",
  "united kingdom": "reino-unido",
  uk: "reino-unido",
  england: "reino-unido",
  inglaterra: "reino-unido",
  scotland: "reino-unido",
  escocia: "reino-unido",
  espanha: "espanha",
  spain: "espanha",
  espana: "espanha",
  australia: "australia",
};

// Nomes como o site mostra (src/lib/destinos.ts usa "Londres" e "St Julian's")
const CIDADES: Record<string, string> = {
  london: "Londres",
  londres: "Londres",
  "st julians": "St Julian's",
  "saint julians": "St Julian's",
  "san giljan": "St Julian's",
};

function chave(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[.'’]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function paisParaSlug(pais: string): string | undefined {
  return PAISES[chave(pais)];
}

export function normalizarCidade(cidade: string) {
  const limpa = cidade.replace(/\s+/g, " ").trim();
  return CIDADES[chave(limpa)] ?? limpa;
}

export type Resultado = { ok: true; oferta: OfertaValida } | { ok: false; motivo: string };

export function validarOferta(o: OfertaExtraida, cambio: Cambio): Resultado {
  const escola = o.escola?.replace(/\s+/g, " ").trim();
  const cidade = o.cidade ? normalizarCidade(o.cidade) : "";
  if (!escola || !cidade) return { ok: false, motivo: "sem escola ou cidade" };

  const pais_slug = paisParaSlug(o.pais ?? "");
  if (!pais_slug) return { ok: false, motivo: `país fora do catálogo: ${o.pais}` };

  if (!(TIPOS_CURSO as readonly string[]).includes(o.tipo_curso)) {
    return { ok: false, motivo: `tipo de curso desconhecido: ${o.tipo_curso}` };
  }
  if (!Number.isInteger(o.semanas) || o.semanas < 1 || o.semanas > 52) {
    return { ok: false, motivo: `semanas inválidas: ${o.semanas}` };
  }
  if (!Number.isFinite(o.preco) || o.preco <= 0) return { ok: false, motivo: `preço inválido: ${o.preco}` };

  const moeda = o.moeda?.toUpperCase() as Moeda;
  if (!(MOEDAS as readonly string[]).includes(moeda)) return { ok: false, motivo: `moeda desconhecida: ${o.moeda}` };
  const taxa = cambio[moeda];
  if (!taxa) return { ok: false, motivo: `sem câmbio para ${moeda}` };

  const preco_original = Math.round(o.preco * 100) / 100;
  const preco_eur = Math.round((preco_original / taxa) * 100) / 100;
  const porSemana = preco_eur / o.semanas;
  if (porSemana < SEMANA_MIN_EUR || porSemana > SEMANA_MAX_EUR) {
    return { ok: false, motivo: `€${porSemana.toFixed(0)}/semana fora da faixa plausível` };
  }

  return {
    ok: true,
    oferta: {
      escola,
      cidade,
      pais_slug,
      tipo_curso: o.tipo_curso as TipoCurso,
      semanas: o.semanas,
      moeda,
      preco_original,
      preco_eur,
      inclui_acomodacao: Boolean(o.inclui_acomodacao),
      trecho: (o.trecho ?? "").slice(0, 500),
    },
  };
}

/** Mesma escola, curso, semanas e acomodação aparecendo duas vezes: fica o menor preço. */
export function deduplicar(ofertas: OfertaValida[]) {
  const porChave = new Map<string, OfertaValida>();
  for (const o of ofertas) {
    const k = [chave(o.escola), chave(o.cidade), o.tipo_curso, o.semanas, o.inclui_acomodacao].join("|");
    const atual = porChave.get(k);
    if (!atual || o.preco_eur < atual.preco_eur) porChave.set(k, o);
  }
  return [...porChave.values()];
}
