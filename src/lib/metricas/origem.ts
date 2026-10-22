// De onde veio a visita: guardado num cookie por 30 dias, lido no navegador e no servidor.
// Formato: "origem|campanha", com cada parte codificada.

export const COOKIE_ORIGEM = "iw_origem";
export const DIAS_ORIGEM = 30;

export interface Origem {
  origem: string;
  campanha: string | null;
}

const limpar = (s: string) => s.trim().toLowerCase().slice(0, 60);

export function serializarOrigem(o: Origem) {
  return `${encodeURIComponent(o.origem)}|${encodeURIComponent(o.campanha ?? "")}`;
}

export function lerOrigem(valor: string | undefined | null): Origem | null {
  if (!valor) return null;
  const [origem, campanha] = valor.split("|").map((p) => {
    try {
      return decodeURIComponent(p ?? "");
    } catch {
      return "";
    }
  });
  return origem ? { origem: limpar(origem), campanha: campanha ? limpar(campanha) : null } : null;
}

/**
 * A origem desta chegada: utm_source/utm_campaign do link (anúncio, bio do Instagram) ou,
 * sem eles, o site que mandou a pessoa (google.com → "google"). Navegação interna não conta.
 */
export function origemDaChegada(url: URL, referrer: string): Origem | null {
  const utm = url.searchParams.get("utm_source");
  if (utm) return { origem: limpar(utm), campanha: url.searchParams.get("utm_campaign")?.trim().toLowerCase() || null };
  if (!referrer) return null;
  try {
    const host = new URL(referrer).hostname.replace(/^(www|m|l|lm)\./, "");
    if (!host || host === url.hostname) return null;
    // "google.com.br" → "google", "instagram.com" → "instagram"
    return { origem: limpar(host.split(".")[0]), campanha: null };
  } catch {
    return null;
  }
}
