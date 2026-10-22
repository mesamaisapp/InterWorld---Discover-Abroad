// Contas do painel de métricas, sem acesso a banco (testáveis com dados soltos).

export interface EventoFunil {
  tipo: string;
  caminho: string | null;
  ref: string | null;
  origem: string | null;
  campanha: string | null;
  sessao: string | null;
}

export interface PedidoFunil {
  id: string;
  status: string;
  origem: string | null;
  campanha: string | null;
  desfecho: string | null;
}

export interface RespostaFunil {
  pedido_id: string;
  respondido_em: string | null;
}

export interface Etapa {
  rotulo: string;
  valor: number;
}

export interface LinhaCanal {
  origem: string;
  campanha: string | null;
  visitantes: number;
  pedidos: number;
  comProposta: number;
  fecharam: number;
}

export interface Funil {
  etapas: Etapa[];
  canais: LinhaCanal[];
  parceiros: { id: string; cliques: number }[];
}

/** Sem origem = a pessoa digitou o endereço ou veio de um link sem utm */
export const SEM_ORIGEM = "direto";

const chaveCanal = (origem: string | null, campanha: string | null) => `${origem ?? SEM_ORIGEM}|${campanha ?? ""}`;

/** Visitantes = sessões distintas; um evento sem sessão conta como um visitante. */
function contarVisitantes(lista: EventoFunil[]) {
  const sessoes = new Set<string>();
  let semSessao = 0;
  for (const e of lista) {
    if (e.sessao) sessoes.add(e.sessao);
    else semSessao++;
  }
  return sessoes.size + semSessao;
}

export function montarFunil(eventos: EventoFunil[], pedidos: PedidoFunil[], respostas: RespostaFunil[]): Funil {
  const visitas = eventos.filter((e) => e.tipo === "visita");
  const respondidos = new Set(respostas.filter((r) => r.respondido_em).map((r) => r.pedido_id));

  const etapas: Etapa[] = [
    { rotulo: "Visitantes", valor: contarVisitantes(visitas) },
    // Só o formulário; /cotacao/<token> é a página do aluno depois de pedir
    {
      rotulo: "Viram o formulário de cotação",
      valor: contarVisitantes(visitas.filter((e) => e.caminho === "/cotacao")),
    },
    { rotulo: "Pediram cotação", valor: pedidos.length },
    { rotulo: "Enviados às agências", valor: pedidos.filter((p) => p.status === "enviado").length },
    { rotulo: "Receberam proposta", valor: pedidos.filter((p) => respondidos.has(p.id)).length },
    { rotulo: "Fecharam", valor: pedidos.filter((p) => p.desfecho === "fechou").length },
  ];

  const canais = new Map<string, LinhaCanal & { sessoes: EventoFunil[] }>();
  const canal = (origem: string | null, campanha: string | null) => {
    const chave = chaveCanal(origem, campanha);
    let linha = canais.get(chave);
    if (!linha) {
      linha = {
        origem: origem ?? SEM_ORIGEM,
        campanha,
        visitantes: 0,
        pedidos: 0,
        comProposta: 0,
        fecharam: 0,
        sessoes: [],
      };
      canais.set(chave, linha);
    }
    return linha;
  };
  for (const e of visitas) canal(e.origem, e.campanha).sessoes.push(e);
  for (const p of pedidos) {
    const linha = canal(p.origem, p.campanha);
    linha.pedidos++;
    if (respondidos.has(p.id)) linha.comProposta++;
    if (p.desfecho === "fechou") linha.fecharam++;
  }

  const cliques = new Map<string, number>();
  for (const e of eventos) if (e.tipo === "clique_parceiro" && e.ref) cliques.set(e.ref, (cliques.get(e.ref) ?? 0) + 1);

  return {
    etapas,
    canais: [...canais.values()]
      .map(({ sessoes, ...linha }) => ({ ...linha, visitantes: contarVisitantes(sessoes) }))
      .sort((a, b) => b.visitantes - a.visitantes || b.pedidos - a.pedidos),
    parceiros: [...cliques].map(([id, n]) => ({ id, cliques: n })).sort((a, b) => b.cliques - a.cliques),
  };
}
