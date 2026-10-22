import type { TipoCurso } from "@/types/catalogo";

export type StatusPedido = "aguardando_revisao" | "enviado" | "recusado" | "sem_agencias";

export interface Triagem {
  nota: number; // 0 a 100
  motivos: string[]; // o que pesou contra
}

export interface NovoPedido {
  mercado: string;
  nome: string;
  whatsapp: string;
  email: string | null;
  pais_slug: string;
  cidade: string | null;
  tipo_curso: TipoCurso | null;
  semanas: number | null;
  inicio: string | null; // 'aaaa-mm'
  observacoes: string | null;
  pacote_id: string | null;
  consentimento_texto: string;
  /** De onde o aluno veio (utm_source ou site), para medir cada canal */
  origem: string | null;
  campanha: string | null;
}

export type Desfecho = "fechou" | "ainda_nao" | "desistiu";

export interface Pedido extends NovoPedido {
  id: string;
  token: string;
  triagem: Triagem;
  status: StatusPedido;
  criado_em: string;
  revisado_em: string | null;
  desfecho: Desfecho | null;
  desfecho_resposta_id: string | null;
  desfecho_em: string | null;
}

export interface AgenciaCotacao {
  id: string;
  nome: string;
  email: string;
  mercados: string[];
  destinos: string[] | null;
  ultima_cotacao_em: string | null;
}

export interface Resposta {
  id: string;
  pedido_id: string;
  agencia_id: string;
  agencia_nome: string;
  token: string;
  enviado_em: string;
  respondido_em: string | null;
  moeda: string | null;
  preco: number | null;
  inclui: string | null;
  validade: string | null;
  mensagem: string | null;
  whatsapp: string | null;
}

export interface DadosResposta {
  moeda: string;
  preco: number;
  inclui: string;
  validade: string | null;
  mensagem: string | null;
  whatsapp: string;
}
