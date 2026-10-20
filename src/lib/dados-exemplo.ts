import type { PacoteBusca, Pais, TipoCurso } from "@/types/catalogo";

// Espelha supabase/seed.sql — usado quando o Supabase não está configurado.

export const PAISES_EXEMPLO: Pais[] = [
  { id: "p-ie", nome: "Irlanda", slug: "irlanda" },
  { id: "p-mt", nome: "Malta", slug: "malta" },
  { id: "p-ca", nome: "Canadá", slug: "canada" },
  { id: "p-uk", nome: "Reino Unido", slug: "reino-unido" },
  { id: "p-es", nome: "Espanha", slug: "espanha" },
];

const ESCOLAS = {
  atlantic: { id: "e-1", nome: "Atlantic Language School", cidade: "Dublin", pais: "irlanda" },
  galway: { id: "e-2", nome: "Galway Cultural Institute", cidade: "Galway", pais: "irlanda" },
  ecMalta: { id: "e-3", nome: "EC Malta", cidade: "St Julian's", pais: "malta" },
  ilac: { id: "e-4", nome: "ILAC Toronto", cidade: "Toronto", pais: "canada" },
  kings: { id: "e-5", nome: "Kings Oxford", cidade: "Oxford", pais: "reino-unido" },
  dq: { id: "e-6", nome: "Don Quijote Barcelona", cidade: "Barcelona", pais: "espanha" },
};

const AGENCIAS = {
  rota: { id: "a-1", nome: "Rota Intercâmbios" },
  mundo: { id: "a-2", nome: "Mundo Aberto" },
  passaporte: { id: "a-3", nome: "Passaporte Edu" },
};

type Linha = [keyof typeof ESCOLAS, keyof typeof AGENCIAS, TipoCurso, number, number, boolean, string];

const LINHAS: Linha[] = [
  ["atlantic", "rota", "geral", 25, 3290, false, "https://rota.example/oferta/atlantic-25"],
  ["atlantic", "mundo", "geral", 25, 3150, false, "https://mundoaberto.example/a/atlantic-25"],
  ["galway", "passaporte", "intensivo", 12, 3980, true, "https://passaporte.example/go/gci-12"],
  ["ecMalta", "mundo", "geral", 4, 980, true, "https://mundoaberto.example/a/ecmalta-4"],
  ["ecMalta", "rota", "business", 8, 2240, false, "https://rota.example/oferta/ecmalta-biz-8"],
  ["ilac", "passaporte", "preparatorio", 12, 4520, false, "https://passaporte.example/go/ilac-ielts-12"],
  ["kings", "rota", "ferias", 2, 1890, true, "https://rota.example/oferta/kings-verao-2"],
  ["dq", "mundo", "intensivo", 4, 1260, false, "https://mundoaberto.example/a/dq-bcn-4"],
];

export const PACOTES_EXEMPLO: PacoteBusca[] = LINHAS.map(
  ([escolaChave, agenciaChave, tipo_curso, semanas, preco_eur, acomodacao_inclusa, link_afiliado], i) => {
    const escola = ESCOLAS[escolaChave];
    const agencia = AGENCIAS[agenciaChave];
    const pais = PAISES_EXEMPLO.find((p) => p.slug === escola.pais)!;
    return {
      id: `pk-${i + 1}`,
      tipo_curso,
      semanas,
      preco_eur,
      preco_semana_eur: Math.round((preco_eur / semanas) * 100) / 100,
      acomodacao_inclusa,
      link_afiliado,
      escola_id: escola.id,
      escola_nome: escola.nome,
      escola_cidade: escola.cidade,
      pais_id: pais.id,
      pais_nome: pais.nome,
      pais_slug: pais.slug,
      agencia_id: agencia.id,
      agencia_nome: agencia.nome,
      agencia_logo_url: null,
    };
  },
);
