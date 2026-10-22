"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { COOKIE_ORIGEM, DIAS_ORIGEM, lerOrigem, origemDaChegada, serializarOrigem } from "@/lib/metricas/origem";

// Painel e páginas das agências não entram na conta de visitantes
const IGNORAR = /^\/(admin|responder)(\/|$)/;

function sessao() {
  try {
    let id = sessionStorage.getItem("iw_sessao");
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem("iw_sessao", id);
    }
    return id;
  } catch {
    return null;
  }
}

function cookieOrigem() {
  const par = document.cookie.split("; ").find((c) => c.startsWith(`${COOKIE_ORIGEM}=`));
  return lerOrigem(par?.slice(COOKIE_ORIGEM.length + 1));
}

/**
 * Conta cada página vista e guarda de onde a pessoa veio (anúncio, Google, Instagram).
 * Sem dado pessoal: só a página, a origem e um id aleatório da aba.
 */
export function Rastreio() {
  const caminho = usePathname();

  useEffect(() => {
    if (IGNORAR.test(caminho)) return;

    // Um link com utm (anúncio) sempre atualiza a origem; o site de onde veio, só se ainda não houver
    const chegada = origemDaChegada(new URL(location.href), document.referrer);
    const utm = new URL(location.href).searchParams.has("utm_source");
    if (chegada && (utm || !cookieOrigem())) {
      document.cookie = `${COOKIE_ORIGEM}=${serializarOrigem(chegada)}; path=/; max-age=${DIAS_ORIGEM * 86400}; samesite=lax`;
    }

    const origem = cookieOrigem();
    const corpo = JSON.stringify({
      tipo: "visita",
      caminho,
      origem: origem?.origem ?? null,
      campanha: origem?.campanha ?? null,
      sessao: sessao(),
    });
    try {
      navigator.sendBeacon("/api/evento", new Blob([corpo], { type: "application/json" }));
    } catch {
      // sem beacon, sem contagem: a página segue normal
    }
  }, [caminho]);

  return null;
}
