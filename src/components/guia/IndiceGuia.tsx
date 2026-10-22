"use client";

import { useEffect, useState } from "react";

/** Sumário fixo ao lado do guia; marca o capítulo que está na tela. */
export function IndiceGuia({ capitulos }: { capitulos: { id: string; titulo: string }[] }) {
  const [atual, setAtual] = useState(capitulos[0]?.id);

  useEffect(() => {
    const observador = new IntersectionObserver(
      (entradas) => {
        const visivel = entradas
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visivel) setAtual(visivel.target.id);
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );
    for (const c of capitulos) {
      const el = document.getElementById(c.id);
      if (el) observador.observe(el);
    }
    return () => observador.disconnect();
  }, [capitulos]);

  return (
    <nav aria-label="Capítulos do guia" className="sticky top-6 hidden lg:block">
      <p className="mb-4 font-display text-lg font-extrabold">Neste guia</p>
      <ol className="flex flex-col gap-1">
        {capitulos.map((c) => (
          <li key={c.id}>
            <a
              href={`#${c.id}`}
              aria-current={atual === c.id ? "location" : undefined}
              className={`block px-3 py-2 text-[0.9375rem] font-semibold transition-colors duration-200 ${
                atual === c.id ? "bg-marca-escura text-white" : "hover:bg-ceu"
              }`}
            >
              {c.titulo}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
