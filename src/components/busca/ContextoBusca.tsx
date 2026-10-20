"use client";

import { createContext, useContext, useOptimistic, useTransition, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { filtrosParaQuery } from "@/lib/filtros";
import type { FiltrosBusca } from "@/types/catalogo";

interface ValorContexto {
  filtros: FiltrosBusca;
  carregando: boolean;
  atualizar: (parcial: Partial<FiltrosBusca>) => void;
  limpar: () => void;
}

const Contexto = createContext<ValorContexto | null>(null);

/**
 * A URL é a fonte da verdade dos filtros: cada mudança faz router.replace,
 * o Server Component re-renderiza com os novos searchParams e a busca roda no servidor.
 * Links de busca ficam compartilháveis e o botão "voltar" não acumula histórico.
 * useOptimistic faz os controles refletirem a escolha na hora, antes de a busca voltar.
 */
export function ProvedorBusca({ filtros: filtrosServidor, children }: { filtros: FiltrosBusca; children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [carregando, iniciarTransicao] = useTransition();
  const [filtros, setFiltrosOtimistas] = useOptimistic(filtrosServidor);

  function navegar(novos: FiltrosBusca) {
    const query = filtrosParaQuery(novos);
    iniciarTransicao(() => {
      setFiltrosOtimistas(novos);
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });
  }

  return (
    <Contexto.Provider
      value={{
        filtros,
        carregando,
        atualizar: (parcial) => navegar({ ...filtros, ...parcial }),
        limpar: () => navegar({ tipos: [], comAcomodacao: false, ordenar: filtros.ordenar }),
      }}
    >
      {children}
    </Contexto.Provider>
  );
}

export function useBusca() {
  const valor = useContext(Contexto);
  if (!valor) throw new Error("useBusca deve ser usado dentro de <ProvedorBusca>");
  return valor;
}

/** Esmaece os resultados enquanto a nova busca carrega. */
export function AreaResultados({ children }: { children: ReactNode }) {
  const { carregando } = useBusca();
  return (
    <div
      aria-busy={carregando}
      className={`transition-opacity duration-200 ${carregando ? "pointer-events-none opacity-50" : ""}`}
    >
      {children}
    </div>
  );
}
