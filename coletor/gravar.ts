import { createClient } from "@supabase/supabase-js";
import type { OfertaValida } from "./validar.ts";

export interface Fonte {
  id: string;
  url: string;
  tipo: "escola" | "agencia";
  nome: string;
  agencia_id: string | null;
  pais_slug: string | null;
  cidade: string | null;
  ultimo_hash: string | null;
  ultima_coleta: string | null;
}

export type StatusColeta = "ok" | "sem_mudanca" | "sem_precos" | "bloqueada" | "erro";

const NOMES_PAISES: Record<string, string> = {
  irlanda: "Irlanda",
  malta: "Malta",
  canada: "Canadá",
  "reino-unido": "Reino Unido",
  espanha: "Espanha",
  australia: "Austrália",
};

/** Acesso ao banco com a service_role: só o coletor escreve no catálogo. */
export function conectar() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !chave) throw new Error("Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY para gravar no banco.");
  const db = createClient(url, chave, { auth: { persistSession: false } });

  const paises = new Map<string, string>();
  const escolas = new Map<string, string>();
  const agencias = new Map<string, string>();

  async function exigir<T>(consulta: PromiseLike<{ data: T | null; error: { message: string } | null }>) {
    const { data, error } = await consulta;
    if (error) throw new Error(error.message);
    return data as T;
  }

  async function paisId(slug: string) {
    if (paises.has(slug)) return paises.get(slug)!;
    const linha = await exigir<{ id: string }>(
      db.from("paises").upsert({ slug, nome: NOMES_PAISES[slug] ?? slug }, { onConflict: "slug" }).select("id").single(),
    );
    paises.set(slug, linha.id);
    return linha.id;
  }

  async function escolaId(nome: string, cidade: string, pais_slug: string) {
    const k = `${nome}|${cidade}`;
    if (escolas.has(k)) return escolas.get(k)!;
    const linha = await exigir<{ id: string }>(
      db
        .from("escolas")
        .upsert({ nome, cidade, pais_id: await paisId(pais_slug) }, { onConflict: "nome,cidade" })
        .select("id")
        .single(),
    );
    escolas.set(k, linha.id);
    return linha.id;
  }

  /** Quem vende: a agência da fonte, ou a própria escola ("direto na escola"). */
  async function agenciaId(fonte: Fonte) {
    if (fonte.tipo === "agencia" && fonte.agencia_id) return fonte.agencia_id;
    const nome = fonte.tipo === "escola" ? `${fonte.nome} (direto na escola)` : fonte.nome;
    if (agencias.has(nome)) return agencias.get(nome)!;
    const linha = await exigir<{ id: string }>(
      db
        .from("agencias")
        .upsert({ nome, direto_escola: fonte.tipo === "escola" }, { onConflict: "nome" })
        .select("id")
        .single(),
    );
    agencias.set(nome, linha.id);
    return linha.id;
  }

  return {
    async fontesParaColetar(limite: number, url?: string) {
      let consulta = db.from("fontes").select("*").eq("ativa", true);
      if (url) consulta = consulta.eq("url", url);
      return exigir<Fonte[]>(consulta.order("ultima_coleta", { ascending: true, nullsFirst: true }).limit(limite));
    },

    async importarFontes(lista: Omit<Fonte, "id" | "agencia_id" | "ultimo_hash" | "ultima_coleta">[]) {
      await exigir(db.from("fontes").upsert(lista, { onConflict: "url", ignoreDuplicates: true }));
    },

    /** Grava ou atualiza cada oferta; o que a fonte deixou de mostrar sai do ar. */
    async gravarOfertas(fonte: Fonte, ofertas: OfertaValida[], inicio: Date) {
      const agencia_id = await agenciaId(fonte);
      const linhas = [];
      for (const o of ofertas) {
        linhas.push({
          escola_id: await escolaId(o.escola, o.cidade, o.pais_slug),
          agencia_id,
          tipo_curso: o.tipo_curso,
          semanas: o.semanas,
          preco_eur: o.preco_eur,
          acomodacao_inclusa: o.inclui_acomodacao,
          link_afiliado: fonte.url,
          ativo: true,
          origem: "coletado",
          fonte_id: fonte.id,
          moeda: o.moeda,
          preco_original: o.preco_original,
          visto_em: new Date().toISOString(),
          evidencia: o.trecho,
        });
      }
      if (linhas.length) {
        await exigir(
          db.from("pacotes").upsert(linhas, { onConflict: "escola_id,agencia_id,tipo_curso,semanas,acomodacao_inclusa" }),
        );
      }
      await exigir(
        db.from("pacotes").update({ ativo: false }).eq("fonte_id", fonte.id).lt("visto_em", inicio.toISOString()),
      );
    },

    /** Página igual à da última coleta: os preços continuam valendo, só renova a data. */
    async confirmarOfertas(fonte: Fonte) {
      await exigir(
        db.from("pacotes").update({ visto_em: new Date().toISOString() }).eq("fonte_id", fonte.id).eq("ativo", true),
      );
    },

    async registrar(
      fonte: Fonte,
      inicio: Date,
      r: { status: StatusColeta; ofertas?: number; descartadas?: number; detalhe?: string; hash?: string },
    ) {
      await exigir(
        db.from("coletas").insert({
          fonte_id: fonte.id,
          iniciada_em: inicio.toISOString(),
          terminada_em: new Date().toISOString(),
          status: r.status,
          ofertas: r.ofertas ?? 0,
          descartadas: r.descartadas ?? 0,
          detalhe: r.detalhe?.slice(0, 4000),
        }),
      );
      await exigir(
        db
          .from("fontes")
          .update({
            ultima_coleta: new Date().toISOString(),
            ultimo_status: r.status,
            ...(r.hash && { ultimo_hash: r.hash }),
          })
          .eq("id", fonte.id),
      );
    },
  };
}
