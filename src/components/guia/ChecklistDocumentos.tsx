"use client";

import { useEffect, useState } from "react";
import { DOCUMENTOS } from "@/lib/guia";

const CHAVE = "interworld:documentos";

/** A "mala de documentos": o que já está pronto fica guardado só neste navegador. */
export function ChecklistDocumentos() {
  const [prontos, setProntos] = useState<string[]>([]);

  useEffect(() => {
    try {
      const salvo = JSON.parse(localStorage.getItem(CHAVE) ?? "[]");
      if (Array.isArray(salvo)) setProntos(salvo.filter((s) => typeof s === "string"));
    } catch {
      // sem armazenamento (aba anônima, bloqueado): a lista funciona, só não lembra
    }
  }, []);

  function alternar(id: string) {
    setProntos((atual) => {
      const novo = atual.includes(id) ? atual.filter((p) => p !== id) : [...atual, id];
      try {
        localStorage.setItem(CHAVE, JSON.stringify(novo));
      } catch {}
      return novo;
    });
  }

  const feitos = DOCUMENTOS.filter((d) => prontos.includes(d.id)).length;
  const completo = feitos === DOCUMENTOS.length;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3" aria-live="polite">
        <p className="numeros font-display text-2xl font-extrabold">
          {feitos} de {DOCUMENTOS.length} prontos
        </p>
        {completo && (
          <p className="pulo rounded-full bg-verde px-4 py-1.5 font-semibold text-marca-escura">
            Mala pronta. Boa viagem!
          </p>
        )}
      </div>
      <div className="h-2 w-full bg-ceu" aria-hidden>
        <div
          className="h-full bg-verde transition-[width] duration-500 ease-[var(--ease-saida)]"
          style={{ width: `${(feitos / DOCUMENTOS.length) * 100}%` }}
        />
      </div>
      <ul className="grid gap-2 sm:grid-cols-2">
        {DOCUMENTOS.map((d) => {
          const pronto = prontos.includes(d.id);
          return (
            <li key={d.id}>
              <label
                className={`flex h-full cursor-pointer gap-4 p-4 transition-colors duration-200 ${
                  pronto ? "bg-verde text-marca-escura" : "bg-ceu hover:bg-[#d3e2f6]"
                }`}
              >
                <input
                  type="checkbox"
                  checked={pronto}
                  onChange={() => alternar(d.id)}
                  className="mt-1 size-5 shrink-0 accent-marca-escura"
                />
                <span>
                  <span className="block font-semibold">{d.item}</span>
                  <span className="block text-[0.9375rem]">{d.detalhe}</span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
