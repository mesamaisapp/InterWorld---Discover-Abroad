"use server";

import { redirect } from "next/navigation";
import { buscarPacoteCompleto } from "@/lib/catalogo";
import { distribuir, NOTA_ENVIO_AUTOMATICO, revisaoManual } from "@/lib/cotacoes/fluxo";
import { repo } from "@/lib/cotacoes/repositorio";
import { normalizarWhatsapp, triar, whatsappValido } from "@/lib/cotacoes/triagem";
import { TEXTO_CONSENTIMENTO } from "@/lib/cotacoes/textos";
import type { NovoPedido } from "@/lib/cotacoes/tipos";
import { DESTINOS, destinoPorSlug } from "@/lib/destinos";
import { MERCADO_PADRAO } from "@/lib/mercados";
import { TIPOS_CURSO, type TipoCurso } from "@/types/catalogo";

export interface EstadoPedido {
  erros?: Record<string, string>;
  valores?: Record<string, string>;
}

const texto = (f: FormData, campo: string, max = 300) =>
  String(f.get(campo) ?? "")
    .trim()
    .slice(0, max);

export async function pedirCotacao(_anterior: EstadoPedido, form: FormData): Promise<EstadoPedido> {
  const valores = Object.fromEntries([...form.entries()].map(([k, v]) => [k, String(v)]));
  // Campo escondido: só robô preenche
  if (texto(form, "site")) return { erros: { geral: "Não foi possível enviar." }, valores };

  const erros: Record<string, string> = {};
  const nome = texto(form, "nome", 120);
  const whatsapp = normalizarWhatsapp(texto(form, "whatsapp", 30), MERCADO_PADRAO.ddi);
  const email = texto(form, "email", 160) || null;
  const destino = texto(form, "destino");
  const tipo = texto(form, "tipo") as TipoCurso | "";
  const semanas = Number(texto(form, "semanas")) || null;
  const inicio = texto(form, "inicio") || null;
  const observacoes = texto(form, "observacoes", 1000) || null;
  const pacote = texto(form, "pacote") || null;

  if (nome.length < 2) erros.nome = "Diga seu nome.";
  if (!whatsappValido(whatsapp)) erros.whatsapp = "Confira o WhatsApp, com DDD.";
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) erros.email = "Esse e-mail não parece válido.";
  if (tipo && !TIPOS_CURSO.includes(tipo)) erros.tipo = "Escolha um tipo de curso.";
  if (semanas !== null && (semanas < 1 || semanas > 104)) erros.semanas = "Entre 1 e 104 semanas.";
  if (inicio && !/^\d{4}-\d{2}$/.test(inicio)) erros.inicio = "Escolha o mês.";
  if (form.get("consentimento") !== "on") erros.consentimento = "Precisamos da sua autorização para enviar o pedido.";

  // destino: "cidade:dublin" ou "pais:irlanda"
  const [tipoDestino, slug] = destino.split(":");
  const cidade = tipoDestino === "cidade" ? destinoPorSlug(slug) : undefined;
  const pais_slug =
    cidade?.pais_slug ?? (tipoDestino === "pais" && DESTINOS.some((d) => d.pais_slug === slug) ? slug : "");
  if (!pais_slug) erros.destino = "Escolha para onde quer ir.";

  if (Object.keys(erros).length) return { erros, valores };

  const pacoteValido = pacote && (await buscarPacoteCompleto(pacote)) ? pacote : null;
  const novo: NovoPedido = {
    mercado: MERCADO_PADRAO.slug,
    nome,
    whatsapp,
    email,
    pais_slug,
    cidade: cidade?.cidade ?? null,
    tipo_curso: tipo || null,
    semanas,
    inicio,
    observacoes,
    pacote_id: pacoteValido,
    consentimento_texto: TEXTO_CONSENTIMENTO,
  };

  const triagem = triar(novo);
  const automatico = !revisaoManual() && triagem.nota >= NOTA_ENVIO_AUTOMATICO;
  const pedido = await repo().criarPedido(novo, triagem, "aguardando_revisao");
  if (automatico) await distribuir(pedido);

  redirect(`/cotacao/${pedido.token}`);
}
