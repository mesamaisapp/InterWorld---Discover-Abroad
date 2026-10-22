"use server";

import { revalidatePath } from "next/cache";
import { repo } from "@/lib/cotacoes/repositorio";

/** "Já fechou?": o aluno conta se fechou (e com qual proposta), ainda não decidiu ou desistiu. */
export async function registrarDesfecho(token: string, form: FormData) {
  const r = repo();
  const pedido = await r.pedidoPorToken(token);
  if (!pedido) return;

  const escolha = String(form.get("desfecho") ?? "");
  if (escolha === "ainda_nao" || escolha === "desistiu") {
    await r.registrarDesfecho(pedido.id, escolha, null);
  } else if (escolha.startsWith("fechou:")) {
    // Só vale uma proposta deste pedido que já foi respondida
    const resposta = (await r.respostasDoPedido(pedido.id)).find(
      (x) => x.id === escolha.slice("fechou:".length) && x.respondido_em,
    );
    if (!resposta) return;
    await r.registrarDesfecho(pedido.id, "fechou", resposta.id);
  } else {
    return;
  }
  revalidatePath(`/cotacao/${token}`);
}
