import "server-only";
import { enviarEmail, esc, urlDoSite } from "@/lib/cotacoes/email";
import { repo } from "@/lib/cotacoes/repositorio";
import type { Pedido, Resposta } from "@/lib/cotacoes/tipos";
import { destinoPorSlug } from "@/lib/destinos";
import { formatarSemanas } from "@/lib/formatar";
import { ROTULO_TIPO_CURSO } from "@/types/catalogo";

export const AGENCIAS_POR_PEDIDO = 3;

/** Revisão manual antes do envio. Desligue com REVISAO_MANUAL=false quando o volume crescer. */
export const revisaoManual = () => process.env.REVISAO_MANUAL !== "false";

/** Nota mínima da triagem para ir direto às agências quando a revisão manual está desligada. */
export const NOTA_ENVIO_AUTOMATICO = 70;

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

export function descreverInicio(inicio: string | null) {
  if (!inicio) return "data em aberto";
  const [ano, mes] = inicio.split("-").map(Number);
  return `${MESES[mes - 1]}/${ano}`;
}

export function descreverPedido(p: Pick<Pedido, "cidade" | "pais_slug" | "tipo_curso" | "semanas" | "inicio">) {
  return [
    p.cidade ?? `qualquer cidade (${p.pais_slug})`,
    p.tipo_curso ? ROTULO_TIPO_CURSO[p.tipo_curso] : "curso em aberto",
    p.semanas ? formatarSemanas(p.semanas) : "duração em aberto",
    `início ${descreverInicio(p.inicio)}`,
  ].join(" · ");
}

export const primeiroNome = (nome: string) => nome.trim().split(/\s+/)[0];

/**
 * Manda o pedido para até 3 agências que atendem o mercado e o destino, em rodízio,
 * e avisa cada uma por e-mail com o link de resposta.
 */
export async function distribuir(pedido: Pedido): Promise<Resposta[]> {
  const r = repo();
  const agencias = await r.agenciasElegiveis(pedido.mercado, pedido.pais_slug, AGENCIAS_POR_PEDIDO);
  if (!agencias.length) {
    await r.atualizarStatus(pedido.id, "sem_agencias");
    return [];
  }
  const respostas = await r.criarRespostas(pedido.id, agencias);
  await r.atualizarStatus(pedido.id, "enviado");

  const resumo = esc(descreverPedido(pedido));
  await Promise.allSettled(
    respostas.map((resposta) => {
      const agencia = agencias.find((a) => a.id === resposta.agencia_id)!;
      const link = urlDoSite(`/responder/${resposta.token}`);
      return enviarEmail(
        agencia.email,
        `Novo pedido de cotação: ${pedido.cidade ?? pedido.pais_slug}`,
        `<p>Olá, ${esc(agencia.nome)}.</p>
         <p><strong>${esc(primeiroNome(pedido.nome))}</strong> pediu cotação pela InterWorld:</p>
         <p>${resumo}</p>
         ${pedido.observacoes ? `<p>Observações: ${esc(pedido.observacoes)}</p>` : ""}
         <p>Envie sua melhor oferta por este link. O contato do aluno é liberado assim que você responder,
         e ele vai comparar até ${AGENCIAS_POR_PEDIDO} propostas lado a lado.</p>
         <p><a href="${link}">Responder a cotação</a></p>`,
      );
    }),
  );
  return respostas;
}

/** Quando uma agência responde, avisa o aluno (se ele deixou e-mail). */
export async function avisarAluno(pedido: Pedido, resposta: Resposta) {
  if (!pedido.email) return;
  const link = urlDoSite(`/cotacao/${pedido.token}`);
  await enviarEmail(
    pedido.email,
    `${resposta.agencia_nome} respondeu sua cotação`,
    `<p>Olá, ${esc(primeiroNome(pedido.nome))}.</p>
     <p>${esc(resposta.agencia_nome)} enviou uma proposta para ${esc(descreverPedido(pedido))}.</p>
     <p><a href="${link}">Ver e comparar as propostas</a></p>`,
  ).catch((e) => console.error("Falha ao avisar aluno", e));
}

export function nomeDaCidade(slug: string | null) {
  return destinoPorSlug(slug ?? undefined)?.cidade ?? null;
}
