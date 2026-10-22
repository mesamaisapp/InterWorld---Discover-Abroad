// Kit do intercambista: o que se compra além do curso, na ordem em que se compra.
// Cada parceiro tem o site normal e, se cadastrado, o link de afiliado numa variável de ambiente
// (KIT_LINK_<ID>, ex.: KIT_LINK_SEGUROS_PROMO). Sem a variável, o botão leva ao site normal.

export type CategoriaKit = "passagem" | "seguro" | "conta" | "hospedagem" | "chip";

export interface Parceiro {
  id: string;
  nome: string;
  /** Em uma frase, por que ele está aqui */
  bomPara: string;
  site: string;
}

export interface ItemKit {
  slug: CategoriaKit;
  titulo: string;
  quando: string;
  porque: string;
  dicas: string[];
  parceiros: Parceiro[];
}

export const KIT: ItemKit[] = [
  {
    slug: "passagem",
    titulo: "Passagem aérea",
    quando: "2 a 3 meses antes",
    porque:
      "Com a data do curso fechada, a passagem é o maior gasto depois da escola, e o preço só sobe perto do embarque.",
    dicas: [
      "Compare o preço final com bagagem despachada: para ficar semanas fora, você vai levar mala grande.",
      "Mudar a data em um ou dois dias costuma mudar bastante o preço.",
      "Em cursos longos, a imigração pode pedir passagem de volta ou dinheiro para comprá-la. Veja a regra do país.",
    ],
    parceiros: [
      {
        id: "skyscanner",
        nome: "Skyscanner",
        bomPara: "Compara companhias e sites de viagem de uma vez.",
        site: "https://www.skyscanner.com.br/",
      },
      {
        id: "kiwi",
        nome: "Kiwi.com",
        bomPara: "Monta rotas com conexões entre companhias diferentes.",
        site: "https://www.kiwi.com/br/",
      },
    ],
  },
  {
    slug: "seguro",
    titulo: "Seguro viagem e saúde",
    quando: "Assim que tiver as datas",
    porque:
      "Muitos países pedem seguro para o visto ou para o registro na imigração. E, sem seguro, uma ida ao hospital lá fora pode custar mais que o curso.",
    dicas: [
      "Compre cobrindo a viagem inteira, do embarque à volta, e não só as semanas de aula.",
      "Confira a cobertura mínima que o país exige antes de escolher o plano mais barato.",
      "Veja se tem atendimento em português 24 h e como funciona o reembolso.",
    ],
    parceiros: [
      {
        id: "seguros-promo",
        nome: "Seguros Promo",
        bomPara: "Compara planos de várias seguradoras lado a lado.",
        site: "https://www.segurospromo.com.br/",
      },
      {
        id: "assist-card",
        nome: "Assist Card",
        bomPara: "Seguradora grande, com atendimento em português.",
        site: "https://www.assistcard.com/br",
      },
    ],
  },
  {
    slug: "conta",
    titulo: "Conta internacional",
    quando: "1 mês antes",
    porque:
      "Pagar lá fora com o cartão de crédito brasileiro sai caro: tem IOF e você só descobre o câmbio na fatura. Numa conta internacional você vê o câmbio na hora e paga na moeda local.",
    dicas: [
      "Peça o cartão com antecedência: ele chega pelo correio.",
      "Leve dois cartões de bandeiras diferentes, guardados em lugares diferentes.",
      "Para o comprovante financeiro do visto, o país pode pedir extrato de banco: confira se o da conta internacional serve.",
    ],
    parceiros: [
      {
        id: "wise",
        nome: "Wise",
        bomPara: "Conta em várias moedas, com câmbio comercial e tarifa mostrada antes.",
        site: "https://wise.com/br/",
      },
      {
        id: "nomad",
        nome: "Nomad",
        bomPara: "Conta em dólar e euro com app em português.",
        site: "https://www.nomadglobal.com/",
      },
    ],
  },
  {
    slug: "hospedagem",
    titulo: "Hospedagem das primeiras semanas",
    quando: "1 mês antes, se a escola não incluir",
    porque:
      "Procurar moradia daqui é difícil e arriscado. O mais seguro é chegar com as primeiras semanas reservadas e procurar o resto lá, vendo o lugar.",
    dicas: [
      "Reserve só as primeiras 2 a 4 semanas e procure o resto com calma, já na cidade.",
      "Nunca pague aluguel adiantado a quem você não conheceu: golpe de anúncio é comum onde falta moradia, como em Dublin.",
      "Fique perto de uma linha de transporte que leve à escola.",
    ],
    parceiros: [
      {
        id: "hostelworld",
        nome: "Hostelworld",
        bomPara: "Albergues, bons para fazer amigos logo na chegada.",
        site: "https://www.hostelworld.com/pt/",
      },
      {
        id: "booking",
        nome: "Booking.com",
        bomPara: "Quartos e apartamentos para quem quer mais privacidade.",
        site: "https://www.booking.com/",
      },
    ],
  },
  {
    slug: "chip",
    titulo: "Chip ou eSIM",
    quando: "Na semana do embarque",
    porque:
      "Você chega precisando de internet para o mapa, o transporte e falar com a família. Com eSIM, o celular já desce do avião conectado.",
    dicas: [
      "Confira se o seu celular aceita eSIM antes de comprar.",
      "Para ficar meses, um chip pré-pago local costuma sair mais barato: use o eSIM nas primeiras semanas.",
      "Banco e trabalho lá fora costumam pedir número local, então vale ter um.",
    ],
    parceiros: [
      {
        id: "airalo",
        nome: "Airalo",
        bomPara: "Planos de eSIM por país, instalados pelo app.",
        site: "https://www.airalo.com/pt-BR",
      },
      {
        id: "holafly",
        nome: "Holafly",
        bomPara: "eSIM com dados ilimitados em vários países.",
        site: "https://esim.holafly.com/pt-br/",
      },
    ],
  },
];

/** O que cada país pede de seguro. Regras mudam: o link leva à fonte oficial. */
export const SEGURO_POR_PAIS: Record<string, { em: string; texto: string; fonte: string }> = {
  irlanda: {
    em: "Na Irlanda",
    texto:
      "Para o registro na imigração (IRP), seguro com cobertura hospitalar e no mínimo € 25 mil para acidente e € 25 mil para doença. No primeiro ano, um seguro viagem que cubra toda a estadia serve.",
    fonte:
      "https://www.educationinireland.com/en/how-do-i-apply-/get-your-student-visa/for-higher-education/medical-insurance.html",
  },
  malta: {
    em: "Em Malta",
    texto:
      "Para o visto de estudante, seguro válido em todo o espaço Schengen, com no mínimo € 30 mil de cobertura médica.",
    fonte: "https://identita.gov.mt/",
  },
  espanha: {
    em: "Na Espanha",
    texto:
      "A Espanha está no espaço Schengen, onde a referência é € 30 mil de cobertura médica. Para estudar mais de 90 dias, o visto de estudos pede seguro saúde.",
    fonte: "https://www.exteriores.gob.es/",
  },
  australia: {
    em: "Na Austrália",
    texto: "O visto de estudante exige o seguro saúde do estudante (OSHC) durante toda a estadia.",
    fonte: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500",
  },
  canada: {
    em: "No Canadá",
    texto: "A regra muda por província, e muitas escolas exigem seguro saúde. Confirme com a escola antes de comprar.",
    fonte: "https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada.html",
  },
  "reino-unido": {
    em: "No Reino Unido",
    texto:
      "Como visitante, o seguro não é exigido, mas o atendimento no sistema público é cobrado de quem é de fora. Vá com seguro.",
    fonte: "https://www.gov.uk/check-uk-visa",
  },
};

export const AVISO_PARCEIROS =
  "Alguns links são de parceiros: se você comprar por eles, a InterWorld pode ganhar uma comissão, sem custo extra para você. Isso não muda as dicas nem a ordem.";

/** Link de afiliado, se cadastrado; senão, o site normal. Só no servidor (lê o ambiente). */
export function linkDoParceiro(p: Parceiro): string {
  const chave = `KIT_LINK_${p.id.toUpperCase().replace(/-/g, "_")}`;
  return process.env[chave] || p.site;
}
