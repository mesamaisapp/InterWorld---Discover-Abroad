"use server";

import { revalidatePath } from "next/cache";
import { avisarAluno } from "@/lib/cotacoes/fluxo";
import { repo } from "@/lib/cotacoes/repositorio";
import { normalizarWhatsapp, whatsappValido } from "@/lib/cotacoes/triagem";

export interface EstadoResposta {
  erros?: Record<string, string>;
  ok?: boolean;
}

const MOEDAS = ["BRL", "EUR", "GBP", "CAD", "AUD", "USD", "NZD"];
const texto = (f: FormData, campo: string, max = 1000) =>
  String(f.get(campo) ?? "")
    .trim()
    .slice(0, max);

export async function responderCotacao(
  token: string,
  _anterior: EstadoResposta,
  form: FormData,
): Promise<EstadoResposta> {
  const r = repo();
  const resposta = await r.respostaPorToken(token);
  if (!resposta) return { erros: { geral: "Link inválido ou expirado." } };

  const erros: Record<string, string> = {};
  const moeda = texto(form, "moeda", 3).toUpperCase();
  // Aceita "18.900,50" e "18.900" (pt-BR) e "18900.50"
  const precoBruto = texto(form, "preco", 20).replace(/\s/g, "");
  const milharComPonto = /^\d{1,3}(\.\d{3})+$/.test(precoBruto); // "18.900"
  const preco = Number(
    precoBruto.includes(",") || milharComPonto ? precoBruto.replace(/\./g, "").replace(",", ".") : precoBruto,
  );
  const inclui = texto(form, "inclui");
  const validade = texto(form, "validade", 10) || null;
  const mensagem = texto(form, "mensagem") || null;
  const whatsapp = normalizarWhatsapp(texto(form, "whatsapp", 30));

  if (!MOEDAS.includes(moeda)) erros.moeda = "Escolha a moeda.";
  if (!Number.isFinite(preco) || preco <= 0) erros.preco = "Informe o preço total.";
  if (inclui.length < 3) erros.inclui = "Diga o que está incluso no preço.";
  if (validade && !/^\d{4}-\d{2}-\d{2}$/.test(validade)) erros.validade = "Data inválida.";
  if (!whatsappValido(whatsapp)) erros.whatsapp = "Informe o WhatsApp da agência, com DDD.";
  if (Object.keys(erros).length) return { erros };

  const primeira = !resposta.respondido_em;
  const salva = await r.salvarResposta(token, { moeda, preco, inclui, validade, mensagem, whatsapp });
  if (salva && primeira) {
    const pedido = await r.pedidoPorId(salva.pedido_id);
    if (pedido) await avisarAluno(pedido, salva);
  }
  revalidatePath(`/responder/${token}`);
  return { ok: true };
}
