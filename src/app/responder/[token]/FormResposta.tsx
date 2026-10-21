"use client";

import { useActionState } from "react";
import { responderCotacao, type EstadoResposta } from "@/app/responder/[token]/acoes";
import type { Resposta } from "@/lib/cotacoes/tipos";

export function FormResposta({ token, atual }: { token: string; atual: Resposta }) {
  const [estado, acao, enviando] = useActionState<EstadoResposta, FormData>(responderCotacao.bind(null, token), {});
  const erro = (campo: string) =>
    estado.erros?.[campo] && (
      <span className="text-[0.9375rem] font-semibold text-[#a1281f]">{estado.erros[campo]}</span>
    );

  return (
    <form action={acao} className="grid gap-5 sm:grid-cols-[160px_1fr]" noValidate>
      <label className="flex flex-col gap-2 text-[0.9375rem] font-semibold">
        Moeda
        <select name="moeda" defaultValue={atual.moeda ?? "BRL"} className="campo">
          {["BRL", "EUR", "GBP", "CAD", "AUD", "USD", "NZD"].map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
        {erro("moeda")}
      </label>
      <label className="flex flex-col gap-2 text-[0.9375rem] font-semibold">
        Preço total do pacote
        <input
          name="preco"
          inputMode="decimal"
          placeholder="Ex.: 18900"
          defaultValue={atual.preco ?? ""}
          className="campo numeros"
        />
        {erro("preco")}
      </label>
      <label className="flex flex-col gap-2 text-[0.9375rem] font-semibold sm:col-span-2">
        O que está incluso
        <textarea
          name="inclui"
          rows={3}
          placeholder="Ex.: curso de 25 semanas na escola X, matrícula, material, acomodação nas 4 primeiras semanas, seguro"
          defaultValue={atual.inclui ?? ""}
          className="campo font-normal"
        />
        {erro("inclui")}
      </label>
      <label className="flex flex-col gap-2 text-[0.9375rem] font-semibold">
        Válida até
        <input name="validade" type="date" defaultValue={atual.validade ?? ""} className="campo" />
        {erro("validade")}
      </label>
      <label className="flex flex-col gap-2 text-[0.9375rem] font-semibold">
        WhatsApp da agência
        <input
          name="whatsapp"
          type="tel"
          inputMode="tel"
          placeholder="(11) 91234-5678"
          defaultValue={atual.whatsapp ?? ""}
          className="campo numeros"
        />
        {erro("whatsapp")}
      </label>
      <label className="flex flex-col gap-2 text-[0.9375rem] font-semibold sm:col-span-2">
        Mensagem para o aluno (opcional)
        <textarea name="mensagem" rows={2} defaultValue={atual.mensagem ?? ""} className="campo font-normal" />
      </label>
      {estado.erros?.geral && <p className="font-semibold text-[#a1281f] sm:col-span-2">{estado.erros.geral}</p>}
      {estado.ok && (
        <p className="bg-verde px-4 py-3 font-semibold text-marca-escura sm:col-span-2">
          Proposta enviada. O aluno já pode ver.
        </p>
      )}
      <button
        type="submit"
        disabled={enviando}
        className="flex h-14 items-center justify-center rounded-full bg-marca-escura text-lg font-semibold text-white transition-colors hover:bg-marca disabled:opacity-60 sm:col-span-2"
      >
        {enviando ? "Enviando…" : atual.respondido_em ? "Atualizar proposta" : "Enviar proposta e ver o contato"}
      </button>
    </form>
  );
}
