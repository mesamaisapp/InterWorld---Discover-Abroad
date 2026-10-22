"use client";

import { useEffect, useRef, useState } from "react";

/** Número que corre até o novo valor quando ele muda (placar de aeroporto). */
export function NumeroVivo({ valor, formatar = String }: { valor: number; formatar?: (n: number) => string }) {
  const [exibido, setExibido] = useState(valor);
  const anterior = useRef(valor);
  const [pulo, setPulo] = useState(0);

  useEffect(() => {
    const de = anterior.current;
    anterior.current = valor;
    if (de === valor) return;
    setPulo((p) => p + 1);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setExibido(valor);
      return;
    }
    const inicio = performance.now();
    const duracao = 520;
    let quadro = 0;
    const passo = (agora: number) => {
      const t = Math.min(1, (agora - inicio) / duracao);
      const suave = 1 - Math.pow(1 - t, 3);
      setExibido(Math.round(de + (valor - de) * suave));
      if (t < 1) quadro = requestAnimationFrame(passo);
    };
    quadro = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(quadro);
  }, [valor]);

  return (
    <span key={pulo} className={`numeros inline-block ${pulo ? "pulo" : ""}`}>
      {formatar(exibido)}
    </span>
  );
}
