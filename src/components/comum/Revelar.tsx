"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Entrada em cascata dos blocos marcados com data-revelar.
 * O HTML chega visível; só o que ainda está abaixo da dobra é escondido e anima ao entrar.
 * Sem JavaScript (ou com movimento reduzido) nada fica escondido.
 */
export function Revelar() {
  const caminho = usePathname();

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const alvos = [...document.querySelectorAll<HTMLElement>("[data-revelar]:not(.revelado)")].filter(
      (el) => el.getBoundingClientRect().top > innerHeight * 0.9,
    );
    if (!alvos.length) return;
    document.documentElement.classList.add("revelar-pronto");

    const observador = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("revelado");
          observador.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    for (const el of document.querySelectorAll<HTMLElement>("[data-revelar]")) {
      if (alvos.includes(el)) observador.observe(el);
      else el.classList.add("revelado");
    }
    return () => observador.disconnect();
  }, [caminho]);

  return null;
}
