import "server-only";
import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import type {
  AgenciaCotacao,
  DadosResposta,
  NovoPedido,
  Pedido,
  Resposta,
  StatusPedido,
  Triagem,
} from "@/lib/cotacoes/tipos";

/** Link secreto: 24 bytes aleatórios em base64url (impossível de adivinhar). */
export function novoToken() {
  return randomBytes(24).toString("base64url");
}

export interface ResumoAgencia {
  agencia_id: string;
  agencia_nome: string;
  recebidos: number;
  respondidos: number;
}

export interface Repositorio {
  demonstracao: boolean;
  criarPedido(novo: NovoPedido, triagem: Triagem, status: StatusPedido): Promise<Pedido>;
  pedidoPorToken(token: string): Promise<Pedido | null>;
  pedidoPorId(id: string): Promise<Pedido | null>;
  listarPedidos(): Promise<Pedido[]>;
  atualizarStatus(id: string, status: StatusPedido): Promise<void>;
  agenciasElegiveis(mercado: string, pais_slug: string, limite: number): Promise<AgenciaCotacao[]>;
  criarRespostas(pedido_id: string, agencias: AgenciaCotacao[]): Promise<Resposta[]>;
  respostasDoPedido(pedido_id: string): Promise<Resposta[]>;
  respostaPorToken(token: string): Promise<Resposta | null>;
  salvarResposta(token: string, dados: DadosResposta): Promise<Resposta | null>;
  resumoDoMes(inicioDoMes: Date): Promise<ResumoAgencia[]>;
}

let repositorio: Repositorio | undefined;

/**
 * Com SUPABASE_SERVICE_ROLE_KEY: grava no banco. Sem ela: guarda na memória do servidor,
 * só para demonstração (some quando o servidor reinicia e não funciona entre instâncias).
 */
export function repo(): Repositorio {
  if (repositorio) return repositorio;
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  repositorio = url && chave ? repoSupabase(url, chave) : repoMemoria();
  return repositorio;
}

// ---------------------------------------------------------------------------------------------
// Supabase
// ---------------------------------------------------------------------------------------------

function repoSupabase(url: string, chave: string): Repositorio {
  const db = createClient(url, chave, { auth: { persistSession: false } });

  async function exigir<T>(consulta: PromiseLike<{ data: T | null; error: { message: string } | null }>) {
    const { data, error } = await consulta;
    if (error) throw new Error(error.message);
    return data as T;
  }

  const comAgencia = "*, agencias(nome)";
  const paraResposta = (r: Record<string, unknown> & { agencias?: { nome: string } | null }): Resposta => ({
    ...(r as unknown as Resposta),
    agencia_nome: r.agencias?.nome ?? "",
    preco: r.preco == null ? null : Number(r.preco),
  });

  return {
    demonstracao: false,

    criarPedido: (novo, triagem, status) =>
      exigir<Pedido>(
        db
          .from("pedidos_cotacao")
          .insert({ ...novo, token: novoToken(), triagem, status, consentimento: true })
          .select()
          .single(),
      ),

    pedidoPorToken: (token) => exigir(db.from("pedidos_cotacao").select().eq("token", token).maybeSingle()),
    pedidoPorId: (id) => exigir(db.from("pedidos_cotacao").select().eq("id", id).maybeSingle()),
    listarPedidos: () =>
      exigir<Pedido[]>(db.from("pedidos_cotacao").select().order("criado_em", { ascending: false }).limit(200)),

    async atualizarStatus(id, status) {
      await exigir(db.from("pedidos_cotacao").update({ status, revisado_em: new Date().toISOString() }).eq("id", id));
    },

    async agenciasElegiveis(mercado, pais_slug, limite) {
      const candidatas = await exigir<AgenciaCotacao[]>(
        db
          .from("agencias")
          .select("id, nome, email, mercados, destinos, ultima_cotacao_em")
          .eq("ativa", true)
          .eq("recebe_cotacoes", true)
          .not("email", "is", null)
          .contains("mercados", [mercado])
          .order("ultima_cotacao_em", { ascending: true, nullsFirst: true }),
      );
      return candidatas.filter((a) => !a.destinos || a.destinos.includes(pais_slug)).slice(0, limite);
    },

    async criarRespostas(pedido_id, agencias) {
      const linhas = agencias.map((a) => ({ pedido_id, agencia_id: a.id, token: novoToken() }));
      const criadas = await exigir<(Record<string, unknown> & { agencias: { nome: string } })[]>(
        db.from("respostas_cotacao").insert(linhas).select(comAgencia),
      );
      await exigir(
        db
          .from("agencias")
          .update({ ultima_cotacao_em: new Date().toISOString() })
          .in(
            "id",
            agencias.map((a) => a.id),
          ),
      );
      return criadas.map(paraResposta);
    },

    async respostasDoPedido(pedido_id) {
      const linhas = await exigir<(Record<string, unknown> & { agencias: { nome: string } })[]>(
        db.from("respostas_cotacao").select(comAgencia).eq("pedido_id", pedido_id),
      );
      return linhas.map(paraResposta);
    },

    async respostaPorToken(token) {
      const linha = await exigir<(Record<string, unknown> & { agencias: { nome: string } }) | null>(
        db.from("respostas_cotacao").select(comAgencia).eq("token", token).maybeSingle(),
      );
      return linha ? paraResposta(linha) : null;
    },

    async salvarResposta(token, dados) {
      const linha = await exigir<(Record<string, unknown> & { agencias: { nome: string } }) | null>(
        db
          .from("respostas_cotacao")
          .update({ ...dados, respondido_em: new Date().toISOString() })
          .eq("token", token)
          .select(comAgencia)
          .maybeSingle(),
      );
      return linha ? paraResposta(linha) : null;
    },

    async resumoDoMes(inicioDoMes) {
      const linhas = await exigir<(Record<string, unknown> & { agencias: { nome: string } })[]>(
        db.from("respostas_cotacao").select(comAgencia).gte("enviado_em", inicioDoMes.toISOString()),
      );
      return resumir(linhas.map(paraResposta));
    },
  };
}

// ---------------------------------------------------------------------------------------------
// Memória (demonstração sem banco)
// ---------------------------------------------------------------------------------------------

interface Memoria {
  pedidos: Pedido[];
  respostas: Resposta[];
  agencias: AgenciaCotacao[];
}

function repoMemoria(): Repositorio {
  // globalThis: sobrevive ao recarregamento de módulos do `next dev`
  const g = globalThis as unknown as { __cotacoes?: Memoria };
  g.__cotacoes ??= {
    pedidos: [],
    respostas: [],
    agencias: [
      {
        id: "a-1",
        nome: "Rota Intercâmbios",
        email: "cotacoes@rota.example",
        mercados: ["br"],
        destinos: null,
        ultima_cotacao_em: null,
      },
      {
        id: "a-2",
        nome: "Mundo Aberto",
        email: "cotacoes@mundoaberto.example",
        mercados: ["br"],
        destinos: null,
        ultima_cotacao_em: null,
      },
      {
        id: "a-3",
        nome: "Passaporte Edu",
        email: "cotacoes@passaporte.example",
        mercados: ["br"],
        destinos: null,
        ultima_cotacao_em: null,
      },
      {
        id: "a-4",
        nome: "Embarque Já",
        email: "cotacoes@embarqueja.example",
        mercados: ["br"],
        destinos: null,
        ultima_cotacao_em: null,
      },
    ],
  };
  const m = g.__cotacoes;
  const agora = () => new Date().toISOString();

  return {
    demonstracao: true,

    async criarPedido(novo, triagem, status) {
      const pedido: Pedido = {
        ...novo,
        id: crypto.randomUUID(),
        token: novoToken(),
        triagem,
        status,
        criado_em: agora(),
        revisado_em: null,
      };
      m.pedidos.unshift(pedido);
      return pedido;
    },
    pedidoPorToken: async (token) => m.pedidos.find((p) => p.token === token) ?? null,
    pedidoPorId: async (id) => m.pedidos.find((p) => p.id === id) ?? null,
    listarPedidos: async () => m.pedidos,

    async atualizarStatus(id, status) {
      const p = m.pedidos.find((x) => x.id === id);
      if (p) Object.assign(p, { status, revisado_em: agora() });
    },

    async agenciasElegiveis(mercado, pais_slug, limite) {
      return m.agencias
        .filter((a) => a.mercados.includes(mercado) && (!a.destinos || a.destinos.includes(pais_slug)))
        .sort((a, b) => (a.ultima_cotacao_em ?? "").localeCompare(b.ultima_cotacao_em ?? ""))
        .slice(0, limite);
    },

    async criarRespostas(pedido_id, agencias) {
      const criadas = agencias.map(
        (a): Resposta => ({
          id: crypto.randomUUID(),
          pedido_id,
          agencia_id: a.id,
          agencia_nome: a.nome,
          token: novoToken(),
          enviado_em: agora(),
          respondido_em: null,
          moeda: null,
          preco: null,
          inclui: null,
          validade: null,
          mensagem: null,
          whatsapp: null,
        }),
      );
      m.respostas.push(...criadas);
      for (const a of agencias) a.ultima_cotacao_em = agora();
      return criadas;
    },
    respostasDoPedido: async (pedido_id) => m.respostas.filter((r) => r.pedido_id === pedido_id),
    respostaPorToken: async (token) => m.respostas.find((r) => r.token === token) ?? null,

    async salvarResposta(token, dados) {
      const r = m.respostas.find((x) => x.token === token);
      if (!r) return null;
      Object.assign(r, dados, { respondido_em: agora() });
      return r;
    },

    resumoDoMes: async (inicioDoMes) => resumir(m.respostas.filter((r) => new Date(r.enviado_em) >= inicioDoMes)),
  };
}

function resumir(respostas: Resposta[]): ResumoAgencia[] {
  const porAgencia = new Map<string, ResumoAgencia>();
  for (const r of respostas) {
    const linha = porAgencia.get(r.agencia_id) ?? {
      agencia_id: r.agencia_id,
      agencia_nome: r.agencia_nome,
      recebidos: 0,
      respondidos: 0,
    };
    linha.recebidos++;
    if (r.respondido_em) linha.respondidos++;
    porAgencia.set(r.agencia_id, linha);
  }
  return [...porAgencia.values()].sort((a, b) => b.recebidos - a.recebidos);
}
