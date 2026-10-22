import Link from "next/link";

/**
 * Logo InterWorld redesenhada em SVG a partir da arte da marca (globo, órbita e avião).
 * Quando a arte original entrar em /public/marca, troque o <Globo /> por ela.
 */
export function Globo({ className = "size-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <defs>
        <clipPath id="iw-globo">
          <circle cx="46" cy="52" r="34" />
        </clipPath>
      </defs>
      <circle cx="46" cy="52" r="34" fill="#1565c0" />
      <g clipPath="url(#iw-globo)" fill="#5cb746">
        {/* América do Norte */}
        <path d="M14 26c8-6 20-8 28-5 4 2 2 6-2 8-3 2-1 6 3 7 3 1 3 5 0 7-4 2-6 6-9 6-4 0-6-4-9-7-4-3-9-4-12-8-2-3-1-6 1-8Z" />
        {/* América do Sul */}
        <path d="M33 56c4-2 10-1 13 3 3 3 2 8 0 12-2 5-4 9-6 13-1 2-4 2-4-1-1-5-3-9-5-13-2-5-1-11 2-14Z" />
        {/* Europa e África, na borda */}
        <path d="M66 30c5-1 10 2 12 6 1 3-2 4-4 4-2 1-1 4 1 6 4 3 5 8 4 13-1 6-5 11-9 13-3 1-5-2-5-5 0-4-2-7-4-10-2-4 0-8 2-11 1-3-2-6 0-9 1-2 2-6 3-7Z" />
      </g>
      {/* Órbita: azul fora do globo, branca por cima dele */}
      <ellipse cx="50" cy="56" rx="46" ry="13" transform="rotate(-18 50 56)" fill="none" stroke="#1565c0" strokeWidth="4" />
      <g clipPath="url(#iw-globo)">
        <ellipse cx="50" cy="56" rx="46" ry="13" transform="rotate(-18 50 56)" fill="none" stroke="#fff" strokeWidth="4" />
      </g>
      {/* Avião */}
      <path
        d="M80 30l14-9c2-1 4 0 3 2l-9 10 1 9-3 2-4-8-7 6 0 4-2 1-2-6-5-3 1-2 4 1 6-6-8-3 2-3Z"
        fill="#1565c0"
      />
    </svg>
  );
}

export function Logo({ claro = false, href = "/" }: { claro?: boolean; href?: string }) {
  return (
    <Link href={href} className="group inline-flex items-center gap-2" aria-label="InterWorld, página inicial">
      <Globo className="size-11 transition-transform duration-500 ease-[var(--ease-saida)] group-hover:rotate-[-12deg]" />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[1.45rem] font-extrabold tracking-[-0.04em]">
          <span className={claro ? "text-white" : "text-marca-escura"}>inter</span>
          <span className={claro ? "text-[#8fc1ff]" : "text-marca"}>world</span>
        </span>
        <span className={`mt-1 text-[0.8125rem] lowercase ${claro ? "text-white/85" : "text-suave"}`}>
          discover abroad
        </span>
      </span>
    </Link>
  );
}
