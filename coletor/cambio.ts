import { MOEDAS, type Cambio } from "./validar.ts";

/**
 * Câmbio de referência do Banco Central Europeu (via Frankfurter, sem chave).
 * Usado só para levar as tabelas em CAD, GBP, AUD... para euro e comparar.
 */
export async function buscarCambio(): Promise<Cambio> {
  const outras = MOEDAS.filter((m) => m !== "EUR").join(",");
  const resposta = await fetch(`https://api.frankfurter.dev/v1/latest?base=EUR&symbols=${outras}`, {
    signal: AbortSignal.timeout(15_000),
  }).catch((e: Error) => {
    throw new Error(`Câmbio indisponível (api.frankfurter.dev): ${e.message}`);
  });
  if (!resposta.ok) throw new Error(`Câmbio indisponível (HTTP ${resposta.status})`);
  const { rates } = (await resposta.json()) as { rates: Record<string, number> };
  return { ...rates, EUR: 1 };
}
