"use client";

import Link from "next/link";
import { useState } from "react";
import { NumeroVivo } from "@/components/comum/NumeroVivo";
import { formatarEuro } from "@/lib/formatar";

export interface CursoPorCidade {
  slug: string;
  cidade: string;
  /** menor preço por semana cotado na cidade */
  precoSemana: number;
}

// Cada parte do custo com a sua cor na barra (as da marca, revezando)
const PARTES = [
  { chave: "curso", rotulo: "Curso", cor: "bg-marca-escura" },
  { chave: "casa", rotulo: "Acomodação", cor: "bg-marca" },
  { chave: "vida", rotulo: "Comida e transporte", cor: "bg-verde" },
  { chave: "viagem", rotulo: "Passagem, seguro e taxas", cor: "bg-[#8fc1ff]" },
  { chave: "reserva", rotulo: "Reserva de emergência", cor: "bg-[#a9b8cf]" },
] as const;

/** "Quanto custa de verdade": o curso vem do catálogo; o resto o visitante ajusta. */
export function Calculadora({ cursos }: { cursos: CursoPorCidade[] }) {
  const [slug, setSlug] = useState(cursos[0]?.slug ?? "");
  const [semanas, setSemanas] = useState(12);
  const [casa, setCasa] = useState(220);
  const [vida, setVida] = useState(120);
  const [passagem, setPassagem] = useState(1000);
  const [taxas, setTaxas] = useState(250);
  const [reserva, setReserva] = useState(15);

  const curso = cursos.find((c) => c.slug === slug);
  const valores = {
    curso: Math.round((curso?.precoSemana ?? 0) * semanas),
    casa: casa * semanas,
    vida: vida * semanas,
    viagem: passagem + taxas,
    reserva: 0,
  };
  const semReserva = valores.curso + valores.casa + valores.vida + valores.viagem;
  valores.reserva = Math.round((semReserva * reserva) / 100);
  const total = semReserva + valores.reserva;
  const porMes = Math.round(total / (semanas / 4.345));

  return (
    <div data-ui className="grid gap-8 bg-superficie p-5 sm:p-8 lg:grid-cols-[1fr_1.1fr] lg:gap-12">
      <div className="flex flex-col gap-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-[0.9375rem] font-semibold">
            Cidade
            <select value={slug} onChange={(e) => setSlug(e.target.value)} className="campo font-semibold">
              {cursos.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.cidade}
                </option>
              ))}
            </select>
          </label>
          <Faixa
            rotulo="Semanas"
            valor={semanas}
            min={2}
            max={52}
            passo={1}
            onChange={setSemanas}
            mostrar={(v) => `${v} sem`}
          />
        </div>
        <Faixa
          rotulo="Acomodação por semana"
          valor={casa}
          min={80}
          max={500}
          passo={10}
          onChange={setCasa}
          mostrar={formatarEuro}
          dica="Quarto em casa de família ou residência fica, em geral, entre € 150 e € 350."
        />
        <Faixa
          rotulo="Comida e transporte por semana"
          valor={vida}
          min={50}
          max={300}
          passo={10}
          onChange={setVida}
          mostrar={formatarEuro}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Faixa
            rotulo="Passagem ida e volta"
            valor={passagem}
            min={400}
            max={2500}
            passo={50}
            onChange={setPassagem}
            mostrar={formatarEuro}
          />
          <Faixa
            rotulo="Seguro, visto e taxas"
            valor={taxas}
            min={0}
            max={2500}
            passo={50}
            onChange={setTaxas}
            mostrar={formatarEuro}
          />
        </div>
        <Faixa
          rotulo="Reserva de emergência"
          valor={reserva}
          min={0}
          max={30}
          passo={5}
          onChange={setReserva}
          mostrar={(v) => `${v}%`}
          dica="Para imprevistos e para as semanas antes do primeiro salário, se você puder trabalhar."
        />
      </div>

      <div className="flex flex-col gap-6" aria-live="polite">
        <div>
          <p className="text-[0.9375rem] font-semibold text-suave">
            {semanas} semanas em {curso?.cidade}, tudo incluído
          </p>
          <p className="font-display text-[clamp(3rem,6vw,4.5rem)] leading-none font-extrabold tracking-[-0.04em]">
            <NumeroVivo valor={total} formatar={formatarEuro} />
          </p>
          <p className="numeros mt-2 text-lg">
            cerca de <strong>{formatarEuro(porMes)}</strong> por mês
          </p>
        </div>

        <div className="flex h-5 w-full overflow-hidden" aria-hidden>
          {PARTES.map((p) => (
            <div
              key={p.chave}
              className={`${p.cor} h-full transition-[flex-grow] duration-500 ease-[var(--ease-saida)]`}
              style={{ flexGrow: valores[p.chave], flexBasis: 0 }}
            />
          ))}
        </div>

        <ul className="numeros flex flex-col gap-2 text-[1.0625rem]">
          {PARTES.map((p) => (
            <li key={p.chave} className="flex items-baseline">
              <span aria-hidden className={`mr-3 size-3 shrink-0 self-center ${p.cor}`} />
              <span>{p.rotulo}</span>
              <span aria-hidden className="guia" />
              <span className="font-semibold">{formatarEuro(valores[p.chave])}</span>
            </li>
          ))}
        </ul>

        <p className="text-[0.9375rem] text-suave">
          O curso usa o menor preço por semana cotado hoje em {curso?.cidade} ({formatarEuro(curso?.precoSemana ?? 0)}).
          O resto são estimativas: ajuste aos seus números.
        </p>

        <Link
          href={`/busca?cidade=${slug}`}
          className="mt-auto flex h-14 items-center justify-center rounded-full bg-marca-escura px-6 text-[1.0625rem] font-semibold text-white transition-[background-color,scale] duration-200 hover:bg-marca active:scale-[0.97]"
        >
          Ver cursos em {curso?.cidade}
        </Link>
      </div>
    </div>
  );
}

function Faixa({
  rotulo,
  valor,
  min,
  max,
  passo,
  onChange,
  mostrar,
  dica,
}: {
  rotulo: string;
  valor: number;
  min: number;
  max: number;
  passo: number;
  onChange: (v: number) => void;
  mostrar: (v: number) => string;
  dica?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-baseline justify-between gap-3 text-[0.9375rem] font-semibold">
        {rotulo}
        <span className="numeros font-display text-lg font-extrabold">{mostrar(valor)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={passo}
        value={valor}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-marca"
      />
      {dica && <span className="text-[0.9375rem] text-suave">{dica}</span>}
    </label>
  );
}
