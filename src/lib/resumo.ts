import { DESTINOS, type Destino } from "@/lib/destinos";
import type { PacoteBusca } from "@/types/catalogo";

export interface ResumoDestino {
  destino: Destino;
  pais_nome: string;
  pacotes: number;
  escolas: number;
  menorPreco: number;
  menorPrecoSemana: number;
  semanasMin: number;
  semanasMax: number;
}

/** "A partir de" de cada cidade com pacotes, na ordem do menor preço por semana. */
export function resumirDestinos(pacotes: PacoteBusca[]): ResumoDestino[] {
  return DESTINOS.flatMap((destino) => {
    const daCidade = pacotes.filter((p) => p.escola_cidade === destino.cidade);
    if (!daCidade.length) return [];
    const semanas = daCidade.map((p) => p.semanas);
    return [
      {
        destino,
        pais_nome: daCidade[0].pais_nome,
        pacotes: daCidade.length,
        escolas: new Set(daCidade.map((p) => p.escola_id)).size,
        menorPreco: Math.min(...daCidade.map((p) => p.preco_eur)),
        menorPrecoSemana: Math.min(...daCidade.map((p) => p.preco_semana_eur)),
        semanasMin: Math.min(...semanas),
        semanasMax: Math.max(...semanas),
      },
    ];
  }).sort((a, b) => a.menorPrecoSemana - b.menorPrecoSemana);
}

/** Mesmo curso (escola, tipo, semanas, acomodação) cotado por mais de uma agência. */
export interface GrupoOferta {
  chave: string;
  ofertas: PacoteBusca[]; // da mais barata para a mais cara
  economia: number; // mais cara − mais barata
}

export function chaveCurso(p: PacoteBusca) {
  return `${p.escola_id}|${p.tipo_curso}|${p.semanas}|${p.acomodacao_inclusa ? 1 : 0}`;
}

/** Agrupa mantendo a ordem em que o primeiro pacote de cada grupo aparece. */
export function agruparOfertas(pacotes: PacoteBusca[]): GrupoOferta[] {
  const grupos = new Map<string, PacoteBusca[]>();
  for (const p of pacotes) {
    const chave = chaveCurso(p);
    grupos.set(chave, [...(grupos.get(chave) ?? []), p]);
  }
  return [...grupos].map(([chave, lista]) => {
    const ofertas = [...lista].sort((a, b) => a.preco_eur - b.preco_eur);
    return { chave, ofertas, economia: ofertas.at(-1)!.preco_eur - ofertas[0].preco_eur };
  });
}

/** As comparações que mais economizam, para a vitrine da página inicial. */
export function maioresEconomias(pacotes: PacoteBusca[], quantas = 4) {
  return agruparOfertas(pacotes)
    .filter((g) => g.ofertas.length > 1)
    .sort((a, b) => b.economia - a.economia)
    .slice(0, quantas);
}
