"use client";

import { useActionState } from "react";
import { pedirCotacao, type EstadoPedido } from "@/app/cotacao/acoes";
import { TEXTO_CONSENTIMENTO } from "@/lib/cotacoes/textos";
import { ROTULO_TIPO_CURSO, TIPOS_CURSO } from "@/types/catalogo";

export interface OpcaoDestino {
  valor: string;
  rotulo: string;
  grupo: string;
}

export function FormCotacao({
  destinos,
  inicial,
  meses,
}: {
  destinos: OpcaoDestino[];
  inicial: Record<string, string>;
  meses: { valor: string; rotulo: string }[];
}) {
  const [estado, acao, enviando] = useActionState<EstadoPedido, FormData>(pedirCotacao, { valores: inicial });
  const v = estado.valores ?? inicial;
  const erro = (campo: string) =>
    estado.erros?.[campo] && (
      <span id={`erro-${campo}`} className="text-[0.9375rem] font-semibold text-[#a1281f]">
        {estado.erros[campo]}
      </span>
    );
  const grupos = [...new Set(destinos.map((d) => d.grupo))];

  return (
    <form action={acao} className="grid gap-5 sm:grid-cols-2" noValidate>
      <input type="hidden" name="pacote" defaultValue={v.pacote ?? ""} />
      {/* Armadilha para robôs: escondido de pessoas e leitores de tela */}
      <input type="text" name="site" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />

      <Campo rotulo="Para onde" id="destino" className="sm:col-span-2">
        <select
          id="destino"
          name="destino"
          defaultValue={v.destino ?? ""}
          className="campo font-semibold"
          aria-describedby="erro-destino"
        >
          <option value="">Escolha a cidade</option>
          {grupos.map((g) => (
            <optgroup key={g} label={g}>
              {destinos
                .filter((d) => d.grupo === g)
                .map((d) => (
                  <option key={d.valor} value={d.valor}>
                    {d.rotulo}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>
        {erro("destino")}
      </Campo>

      <Campo rotulo="Tipo de curso" id="tipo">
        <select id="tipo" name="tipo" defaultValue={v.tipo ?? ""} className="campo">
          <option value="">Ainda não sei</option>
          {TIPOS_CURSO.map((t) => (
            <option key={t} value={t}>
              {ROTULO_TIPO_CURSO[t]}
            </option>
          ))}
        </select>
        {erro("tipo")}
      </Campo>

      <Campo rotulo="Quantas semanas" id="semanas">
        <input
          id="semanas"
          name="semanas"
          type="number"
          inputMode="numeric"
          min={1}
          max={104}
          placeholder="Ex.: 12"
          defaultValue={v.semanas ?? ""}
          className="campo numeros"
        />
        {erro("semanas")}
      </Campo>

      <Campo rotulo="Quando quer começar" id="inicio" className="sm:col-span-2">
        <select id="inicio" name="inicio" defaultValue={v.inicio ?? ""} className="campo">
          <option value="">Ainda não sei</option>
          {meses.map((m) => (
            <option key={m.valor} value={m.valor}>
              {m.rotulo}
            </option>
          ))}
        </select>
        {erro("inicio")}
      </Campo>

      <Campo rotulo="Seu nome" id="nome">
        <input
          id="nome"
          name="nome"
          autoComplete="name"
          defaultValue={v.nome ?? ""}
          className="campo"
          aria-describedby="erro-nome"
        />
        {erro("nome")}
      </Campo>

      <Campo rotulo="WhatsApp com DDD" id="whatsapp">
        <input
          id="whatsapp"
          name="whatsapp"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="(11) 91234-5678"
          defaultValue={v.whatsapp ?? ""}
          className="campo numeros"
          aria-describedby="erro-whatsapp"
        />
        {erro("whatsapp")}
      </Campo>

      <Campo rotulo="E-mail (opcional, para avisarmos das propostas)" id="email" className="sm:col-span-2">
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={v.email ?? ""}
          className="campo"
        />
        {erro("email")}
      </Campo>

      <Campo rotulo="Algo mais? (opcional)" id="observacoes" className="sm:col-span-2">
        <textarea
          id="observacoes"
          name="observacoes"
          rows={3}
          placeholder="Ex.: quero acomodação em casa de família, curso pela manhã…"
          defaultValue={v.observacoes ?? ""}
          className="campo"
        />
      </Campo>

      <label className="flex cursor-pointer gap-3 text-[0.9375rem] sm:col-span-2">
        <input
          type="checkbox"
          name="consentimento"
          defaultChecked={v.consentimento === "on"}
          className="mt-1 size-5 shrink-0 accent-marca"
        />
        <span>
          {TEXTO_CONSENTIMENTO} <span className="text-suave">Você pode pedir a exclusão a qualquer momento.</span>
          <span className="block">{erro("consentimento")}</span>
        </span>
      </label>

      {estado.erros?.geral && <p className="font-semibold text-[#a1281f] sm:col-span-2">{estado.erros.geral}</p>}

      <button
        type="submit"
        disabled={enviando}
        className="flex h-14 items-center justify-center rounded-full bg-marca-escura text-lg font-semibold text-white transition-[background-color,scale,opacity] duration-200 hover:bg-marca active:scale-[0.98] disabled:opacity-60 sm:col-span-2"
      >
        {enviando ? "Enviando…" : "Receber até 3 propostas grátis"}
      </button>
    </form>
  );
}

function Campo({
  rotulo,
  id,
  className = "",
  children,
}: {
  rotulo: string;
  id: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label htmlFor={id} className="text-[0.9375rem] font-semibold">
        {rotulo}
      </label>
      {children}
    </div>
  );
}
