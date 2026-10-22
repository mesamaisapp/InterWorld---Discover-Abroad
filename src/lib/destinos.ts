// Conteúdo editorial das cidades: a foto que "vende" o destino e uma frase curta.
// O catálogo (escolas, preços) vem do banco; aqui fica só o que não é cotação.
// Fotos: Wikimedia Commons, servidas pelo próprio Commons (Special:FilePath redimensiona).
// Autor e licença de cada uma estão na página do arquivo (link em `pagina`).

export interface FotoDestino {
  arquivo: string;
  legenda: string;
  autor?: string;
  licenca?: string;
}

export interface Destino {
  slug: string;
  /** Código do aeroporto, como no cartão de embarque */
  codigo: string;
  /** Igual ao `escolas.cidade` no banco */
  cidade: string;
  pais_slug: string;
  frase: string;
  foto: FotoDestino;
}

export const DESTINOS: Destino[] = [
  {
    slug: "dublin",
    codigo: "DUB",
    cidade: "Dublin",
    pais_slug: "irlanda",
    frase: "Pubs com música ao vivo e permissão para trabalhar meio período.",
    foto: { arquivo: "Ha'penny Bridge, Dublin, at night.jpg", legenda: "Ha'penny Bridge à noite", autor: "Bob Collowan" },
  },
  {
    slug: "galway",
    codigo: "GWY",
    cidade: "Galway",
    pais_slug: "irlanda",
    frase: "A cidade dos músicos de rua, na beira do Atlântico.",
    foto: { arquivo: "Galway - Claddagh Quay (8112577829).jpg", legenda: "Claddagh Quay" },
  },
  {
    slug: "st-julians",
    codigo: "MLA",
    cidade: "St Julian's",
    pais_slug: "malta",
    frase: "Inglês com 300 dias de sol e o Mediterrâneo na porta.",
    foto: { arquivo: "Valletta, Malta's Grand Harbor.jpg", legenda: "Grand Harbour, Valletta" },
  },
  {
    slug: "toronto",
    codigo: "YYZ",
    cidade: "Toronto",
    pais_slug: "canada",
    frase: "Metade da cidade nasceu em outro país. Você vai se sentir em casa.",
    foto: { arquivo: "Toronto - ON - Skyline bei Nacht.jpg", legenda: "O skyline e a CN Tower ao anoitecer" },
  },
  {
    slug: "vancouver",
    codigo: "YVR",
    cidade: "Vancouver",
    pais_slug: "canada",
    frase: "Praia de manhã, montanha à tarde, aula no meio.",
    foto: { arquivo: "Vancouver Skyline and Mountains.jpg", legenda: "Downtown e as North Shore Mountains" },
  },
  {
    slug: "oxford",
    codigo: "OXF",
    cidade: "Oxford",
    pais_slug: "reino-unido",
    frase: "Estudar inglês na cidade que ensina inglês há 900 anos.",
    foto: {
      arquivo: "Oxford, City of Dreaming Spires-L1002837.jpg",
      legenda: "Radcliffe Square na hora azul",
      autor: "Frank Schulenburg",
      licenca: "CC BY-SA 4.0",
    },
  },
  {
    slug: "londres",
    codigo: "LHR",
    cidade: "Londres",
    pais_slug: "reino-unido",
    frase: "Museus de graça e sotaques do mundo inteiro no mesmo vagão.",
    foto: { arquivo: "Tower Bridge London Dusk Feb 2006.jpg", legenda: "Tower Bridge ao entardecer", autor: "David Iliff" },
  },
  {
    slug: "barcelona",
    codigo: "BCN",
    cidade: "Barcelona",
    pais_slug: "espanha",
    frase: "Espanhol de dia, Mediterrâneo no fim da tarde.",
    foto: { arquivo: "Barcelona vista desde Montjuic (20631553029).jpg", legenda: "Barcelona vista de Montjuïc" },
  },
  {
    slug: "sydney",
    codigo: "SYD",
    cidade: "Sydney",
    pais_slug: "australia",
    frase: "Visto que deixa trabalhar 48 horas a cada duas semanas.",
    foto: {
      arquivo: "Sydney Opera House and Harbour Bridge Dusk (3) 2019-06-21.jpg",
      legenda: "Opera House e Harbour Bridge ao anoitecer",
    },
  },
];

const POR_CIDADE = new Map(DESTINOS.map((d) => [d.cidade, d]));
const POR_SLUG = new Map(DESTINOS.map((d) => [d.slug, d]));

export function destinoDaCidade(cidade: string) {
  return POR_CIDADE.get(cidade);
}

export function destinoPorSlug(slug: string | undefined) {
  return slug ? POR_SLUG.get(slug) : undefined;
}

/** URL redimensionada pelo próprio Commons. */
export function urlFoto(foto: FotoDestino, largura = 1280) {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(foto.arquivo)}?width=${largura}`;
}

export function paginaFoto(foto: FotoDestino) {
  return `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(foto.arquivo.replaceAll(" ", "_"))}`;
}
