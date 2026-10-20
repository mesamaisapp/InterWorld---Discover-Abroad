import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cliente: SupabaseClient | null | undefined;

/**
 * Cliente Supabase para Server Components e Route Handlers.
 * O catálogo é público (RLS libera SELECT para `anon`), então não há sessão de usuário.
 * Retorna null quando as variáveis de ambiente não estão definidas — aí o app usa os dados de exemplo.
 */
export function supabaseServidor() {
  if (cliente !== undefined) return cliente;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  cliente = url && chave ? createClient(url, chave, { auth: { persistSession: false } }) : null;
  return cliente;
}
