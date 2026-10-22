export const AGENTE = "InterWorldBot";

/**
 * Lê as regras Disallow/Allow que valem para "*" e para o InterWorldBot.
 * Mais conservador que o padrão: obedece aos dois grupos juntos, e o caminho
 * fica bloqueado se a regra Disallow mais longa que casa for maior que a Allow mais longa.
 */
export function permitidoPeloRobots(robots: string, caminho: string) {
  const regras: { permitir: boolean; prefixo: string }[] = [];
  let grupoNosso = false;
  let lendoAgentes = false;

  for (const bruta of robots.split(/\r?\n/)) {
    const linha = bruta.replace(/#.*/, "").trim();
    if (!linha) continue;
    const [campo, ...resto] = linha.split(":");
    const valor = resto.join(":").trim();
    const nome = campo.trim().toLowerCase();

    if (nome === "user-agent") {
      const nosso = valor === "*" || valor.toLowerCase() === AGENTE.toLowerCase();
      grupoNosso = lendoAgentes ? grupoNosso || nosso : nosso;
      lendoAgentes = true;
      continue;
    }
    lendoAgentes = false;
    if (!grupoNosso) continue;
    if (nome === "disallow" && valor) regras.push({ permitir: false, prefixo: valor });
    if (nome === "allow" && valor) regras.push({ permitir: true, prefixo: valor });
  }

  const casa = (prefixo: string) => {
    const padrao = prefixo.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\\\$$/, "$");
    return new RegExp(`^${padrao}`).test(caminho);
  };
  const maior = (permitir: boolean) =>
    Math.max(-1, ...regras.filter((r) => r.permitir === permitir && casa(r.prefixo)).map((r) => r.prefixo.length));

  return maior(false) <= maior(true) || maior(false) === -1;
}
