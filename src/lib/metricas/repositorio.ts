import "server-only";
import { createClient } from "@supabase/supabase-js";

export type TipoEvento = "visita" | "clique_parceiro";

export interface Evento {
  tipo: TipoEvento;
  caminho: string | null;
  ref: string | null;
  origem: string | null;
  campanha: string | null;
  sessao: string | null;
  criado_em: string;
}

export interface RepositorioEventos {
  registrar(e: Omit<Evento, "criado_em">): Promise<void>;
  desde(data: Date): Promise<Evento[]>;
}

let repositorio: RepositorioEventos | undefined;

/** Mesmo critério das cotações: banco com a service_role, memória na demonstração. */
export function eventos(): RepositorioEventos {
  if (repositorio) return repositorio;
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  repositorio = url && chave ? eventosSupabase(url, chave) : eventosMemoria();
  return repositorio;
}

function eventosSupabase(url: string, chave: string): RepositorioEventos {
  const db = createClient(url, chave, { auth: { persistSession: false } });
  return {
    async registrar(e) {
      const { error } = await db.from("eventos").insert(e);
      if (error) throw new Error(error.message);
    },
    async desde(data) {
      // Lê em páginas de 1.000 (limite do Supabase por consulta)
      const todos: Evento[] = [];
      for (let de = 0; ; de += 1000) {
        const { data: linhas, error } = await db
          .from("eventos")
          .select("tipo, caminho, ref, origem, campanha, sessao, criado_em")
          .gte("criado_em", data.toISOString())
          .order("id")
          .range(de, de + 999);
        if (error) throw new Error(error.message);
        todos.push(...(linhas as Evento[]));
        if (linhas.length < 1000 || todos.length >= 200_000) return todos;
      }
    },
  };
}

function eventosMemoria(): RepositorioEventos {
  const g = globalThis as unknown as { __eventos?: Evento[] };
  g.__eventos ??= [];
  const lista = g.__eventos;
  return {
    async registrar(e) {
      lista.push({ ...e, criado_em: new Date().toISOString() });
      if (lista.length > 50_000) lista.splice(0, lista.length - 50_000);
    },
    desde: async (data) => lista.filter((e) => new Date(e.criado_em) >= data),
  };
}
