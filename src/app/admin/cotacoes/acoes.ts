"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { entrar, podeAdministrar } from "@/lib/cotacoes/admin";
import { distribuir } from "@/lib/cotacoes/fluxo";
import { repo } from "@/lib/cotacoes/repositorio";

export async function fazerLogin(form: FormData) {
  const ok = await entrar(String(form.get("senha") ?? ""));
  redirect(ok ? "/admin/cotacoes" : "/admin/cotacoes?erro=1");
}

export async function aprovarPedido(form: FormData) {
  if (!(await podeAdministrar())) redirect("/admin/cotacoes");
  const pedido = await repo().pedidoPorId(String(form.get("id")));
  if (pedido?.status === "aguardando_revisao") await distribuir(pedido);
  revalidatePath("/admin/cotacoes");
}

export async function recusarPedido(form: FormData) {
  if (!(await podeAdministrar())) redirect("/admin/cotacoes");
  const pedido = await repo().pedidoPorId(String(form.get("id")));
  if (pedido?.status === "aguardando_revisao") await repo().atualizarStatus(pedido.id, "recusado");
  revalidatePath("/admin/cotacoes");
}
