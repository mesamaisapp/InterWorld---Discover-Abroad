// Conteúdo do "Guia do primeiro intercâmbio" (/guia).
// Regras de visto e trabalho mudam: cada país aponta para a fonte oficial, e o texto diz o que conferir lá.

import type { TipoCurso } from "@/types/catalogo";

export interface Objetivo {
  quero: string;
  curso: TipoCurso;
  explicacao: string;
}

export const OBJETIVOS: Objetivo[] = [
  {
    quero: "Destravar a conversa e perder a vergonha",
    curso: "geral",
    explicacao: "15 a 20 aulas por semana. Sobra tempo para viver a cidade — onde se aprende metade.",
  },
  {
    quero: "Evoluir rápido em pouco tempo",
    curso: "intensivo",
    explicacao: "25 a 30 aulas por semana. Rende mais por semana paga, mas cansa: bom para férias curtas.",
  },
  {
    quero: "Usar o idioma no trabalho",
    curso: "business",
    explicacao: "Reuniões, e-mails, apresentações e negociação. Normalmente pede nível intermediário para entrar.",
  },
  {
    quero: "Tirar a nota para faculdade ou imigração",
    curso: "preparatorio",
    explicacao: "Confira a nota que o seu objetivo exige antes de escolher a duração.",
  },
  {
    quero: "Conhecer um lugar nas férias, estudando",
    curso: "ferias",
    explicacao: "2 a 4 semanas, muitas vezes com atividades e acomodação juntas. O mais simples para a primeira vez.",
  },
];

export interface Pais {
  slug: string;
  nome: string;
  /** cidade cuja foto representa o país (src/lib/destinos.ts) */
  foto: string;
  idioma: string;
  entrada: string;
  trabalho: string;
  bomPara: string;
  fonte: { rotulo: string; url: string };
}

export const PAISES: Pais[] = [
  {
    slug: "irlanda",
    nome: "Irlanda",
    foto: "dublin",
    idioma: "Inglês",
    entrada:
      "Brasileiro entra sem visto. Para ficar mais de 90 dias, você se registra na imigração depois de chegar (IRP), com matrícula, seguro saúde e comprovante de recursos.",
    trabalho:
      "Com curso de inglês de pelo menos 25 semanas numa escola da lista oficial (ILEP): 20 h por semana no período de aulas e 40 h nas férias.",
    bomPara: "Quem quer estudar e trabalhar meio período, com custo menor que o Reino Unido.",
    fonte: { rotulo: "Irish Immigration Service", url: "https://www.irishimmigration.ie/coming-to-study-in-ireland/" },
  },
  {
    slug: "malta",
    nome: "Malta",
    foto: "st-julians",
    idioma: "Inglês",
    entrada: "Até 90 dias, sem visto. Cursos mais longos pedem visto de estudante, solicitado antes ou renovado em Malta.",
    trabalho:
      "Em cursos de mais de 90 dias numa escola licenciada, dá para pedir permissão de trabalho de até 20 h por semana, depois das primeiras semanas.",
    bomPara: "Primeira viagem, cursos curtos, sol e um custo de vida mais em conta na Europa.",
    fonte: { rotulo: "Identità — Central Visa Unit", url: "https://identita.gov.mt/" },
  },
  {
    slug: "canada",
    nome: "Canadá",
    foto: "toronto",
    idioma: "Inglês e francês",
    entrada:
      "Curso de até 6 meses dispensa permissão de estudo, mas exige visto de visitante (ou eTA, para quem se enquadra). Acima de 6 meses, permissão de estudo.",
    trabalho: "Quem estuda idioma como visitante não pode trabalhar.",
    bomPara: "Quem quer só estudar, numa cidade grande e multicultural, e talvez planejar uma faculdade depois.",
    fonte: {
      rotulo: "IRCC — Governo do Canadá",
      url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada.html",
    },
  },
  {
    slug: "reino-unido",
    nome: "Reino Unido",
    foto: "londres",
    idioma: "Inglês",
    entrada: "Curso de até 6 meses como visitante, com autorização eletrônica de viagem (ETA) feita antes do embarque.",
    trabalho: "Visitante não pode trabalhar, nem como voluntário remunerado.",
    bomPara: "Cursos curtos e intensivos, preparatórios para Cambridge e IELTS.",
    fonte: { rotulo: "GOV.UK", url: "https://www.gov.uk/check-uk-visa" },
  },
  {
    slug: "espanha",
    nome: "Espanha",
    foto: "barcelona",
    idioma: "Espanhol",
    entrada: "Até 90 dias, sem visto. Para mais tempo, visto de estudos pedido no consulado antes de viajar.",
    trabalho:
      "A reforma de 2025 permite a estudantes trabalhar até 30 h por semana, mas nem todo curso de idioma se enquadra — confirme com o consulado.",
    bomPara: "Quem quer espanhol, ou um segundo idioma além do inglês, com clima e praia.",
    fonte: { rotulo: "Ministerio de Asuntos Exteriores", url: "https://www.exteriores.gob.es/" },
  },
  {
    slug: "australia",
    nome: "Austrália",
    foto: "sydney",
    idioma: "Inglês",
    entrada: "Estudo de até 3 meses com visto de turista; mais que isso, visto de estudante (subclass 500), com taxa alta.",
    trabalho: "Com visto de estudante: até 48 h a cada duas semanas durante as aulas.",
    bomPara: "Quem pode investir mais para ficar meses, trabalhar e ganhar em dólar australiano.",
    fonte: {
      rotulo: "Department of Home Affairs",
      url: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500",
    },
  },
];

/** Da decisão ao embarque, impresso como um itinerário. */
export const LINHA_DO_TEMPO: { quando: string; passos: string[] }[] = [
  {
    quando: "12 a 9 meses antes",
    passos: ["Defina objetivo, país e quanto pode gastar", "Tire ou renove o passaporte", "Comece a guardar dinheiro todo mês"],
  },
  {
    quando: "9 a 6 meses antes",
    passos: ["Compare escolas e agências", "Faça um teste de nível on-line", "Escolha datas fora da alta temporada, se puder"],
  },
  {
    quando: "6 a 3 meses antes",
    passos: ["Matricule-se e pague o sinal", "Reserve a acomodação das primeiras semanas", "Dê entrada no visto, se o país pedir"],
  },
  {
    quando: "3 a 1 mês antes",
    passos: ["Compre a passagem e o seguro", "Separe o comprovante financeiro", "Avise o banco e leve um cartão internacional"],
  },
  {
    quando: "Na última semana",
    passos: ["Imprima carta da escola, seguro e endereço", "Baixe mapas e o app de transporte da cidade", "Leve dinheiro para os primeiros dias"],
  },
];

export const DOCUMENTOS: { id: string; item: string; detalhe: string }[] = [
  { id: "passaporte", item: "Passaporte válido", detalhe: "Válido por toda a estadia — de preferência com 6 meses de folga." },
  { id: "visto", item: "Visto ou autorização eletrônica", detalhe: "Visto de estudante, de visitante, ETA ou eTA, conforme o país e a duração." },
  { id: "carta", item: "Carta de matrícula da escola", detalhe: "Com datas, horas de aula por semana e o valor pago." },
  { id: "pagamento", item: "Comprovante de pagamento do curso", detalhe: "Recibo da escola ou da agência." },
  { id: "seguro", item: "Seguro saúde e viagem", detalhe: "Na Europa, o visto costuma exigir cobertura mínima de € 30 mil." },
  { id: "dinheiro", item: "Comprovante de recursos", detalhe: "Extratos recentes em seu nome ou de quem paga, conforme a regra do país." },
  { id: "passagem", item: "Passagem de ida (e volta, se pedirem)", detalhe: "Alguns países pedem a volta ou dinheiro para comprá-la." },
  { id: "endereco", item: "Endereço da acomodação", detalhe: "A imigração pergunta onde você vai ficar." },
  { id: "cartao", item: "Cartão internacional e um pouco de dinheiro", detalhe: "Para os primeiros dias, antes de abrir conta lá." },
  { id: "copias", item: "Cópias digitais de tudo", detalhe: "No e-mail ou na nuvem, caso perca a bolsa." },
];

export const PERGUNTAS_ESCOLA = [
  "A escola é acreditada no país? (ILEP na Irlanda, FELTOM em Malta, Languages Canada, British Council/English UK, Instituto Cervantes, NEAS na Austrália)",
  "Quantos alunos por turma, no máximo?",
  "Quantas aulas por semana, e quanto dura cada uma?",
  "Qual a mistura de nacionalidades? Muitos brasileiros na sala = menos inglês.",
  "Tem teste de nível no primeiro dia e troca de turma se não servir?",
  "O que acontece se eu cancelar ou precisar adiar?",
];

export const PERGUNTAS_AGENCIA = [
  "O preço inclui matrícula, material e taxa de acomodação, ou elas vêm depois?",
  "O valor está em euro (ou na moeda da escola) e em que dia ele vira real?",
  "A agência ajuda com visto e registro na imigração, ou só vende o curso?",
  "Quem eu chamo se algo der errado lá fora? Tem atendimento no fuso de lá?",
  "Qual a política de reembolso se o visto for negado?",
  "Posso falar com alguém que já foi com vocês para essa escola?",
];

export const ARMADILHAS: { cilada: string; saida: string }[] = [
  {
    cilada: "Comparar só o preço do curso",
    saida: "Some matrícula, material, acomodação, seguro e taxas de colocação. Dois pacotes de mesmo preço podem ter centenas de euros de diferença no fim.",
  },
  {
    cilada: "Pagar tudo de uma vez, meses antes",
    saida: "Prefira sinal na matrícula e o restante perto do embarque, com recibo de cada pagamento.",
  },
  {
    cilada: "Esquecer o câmbio e o IOF",
    saida: "Preço em euro vira real no dia do pagamento, com IOF. Pagamentos parcelados no tempo diluem o risco do câmbio.",
  },
  {
    cilada: "Contar com o salário de lá para pagar o começo",
    saida: "Arrumar trabalho leva semanas. Leve reserva para pelo menos os dois primeiros meses.",
  },
  {
    cilada: "Fechar acomodação longa sem ver",
    saida: "Reserve as primeiras 2 a 4 semanas pela escola e procure o resto já lá, visitando.",
  },
  {
    cilada: "Escolher curso curto demais para trabalhar",
    saida: "Onde o direito a trabalho depende da duração (como as 25 semanas da Irlanda), uma semana a menos tira o direito.",
  },
];

export const CHEGADA = [
  { quando: "Primeiro dia", texto: "Chip de celular local, cartão de transporte e o caminho até a escola." },
  { quando: "Primeira semana", texto: "Teste de nível, turma definida e, se o país pedir, agendamento do registro na imigração." },
  { quando: "Primeiro mês", texto: "Conta no banco, número fiscal para trabalhar (se puder) e procura de acomodação definitiva." },
  { quando: "Depois", texto: "Clubes de conversa, voluntariado e amigos de outros países: é aí que o idioma destrava." },
];
