import Link from "next/link";
import { KIT } from "@/lib/kit";

/** Chamada curta para o kit, com um atalho para cada item. */
export function KitResumo({ titulo, destino }: { titulo: string; destino?: string }) {
  const base = destino ? `/kit?destino=${destino}` : "/kit";
  return (
    <section aria-labelledby="titulo-kit-resumo" className="flex flex-col gap-4 bg-marca-escura p-5 text-white sm:p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="titulo-kit-resumo" className="text-[clamp(1.5rem,3vw,2.25rem)]">
          {titulo}
        </h2>
        <Link href={base} className="font-semibold text-[#8fc1ff] hover:underline">
          Ver o kit completo →
        </Link>
      </div>
      <ol className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {KIT.map((item, i) => (
          <li key={item.slug}>
            <Link
              href={`${base}#${item.slug}`}
              className="flex h-full flex-col gap-1 bg-white/10 p-4 transition-colors duration-200 hover:bg-white/20"
            >
              <span className="numeros font-display text-xl font-extrabold text-verde">{i + 1}</span>
              <span className="font-semibold leading-tight">{item.titulo}</span>
              <span className="text-[0.875rem] text-white/80">{item.quando}</span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
