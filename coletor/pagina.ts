import { createHash } from "node:crypto";
import * as cheerio from "cheerio";
import { AGENTE, permitidoPeloRobots } from "./robots.ts";

const CABECALHOS = {
  "User-Agent": `${AGENTE}/1.0 (comparador de intercambio; ${process.env.COLETOR_CONTATO ?? "contato no site InterWorld"})`,
  "Accept-Language": "en,pt-BR;q=0.8",
};
const TIMEOUT_MS = 30_000;
const PDF_MAX_BYTES = 30 * 1024 * 1024; // a API aceita até 32 MB por requisição
/** Texto acima disso fica de fora da extração; a coleta registra que cortou. */
export const TEXTO_MAX_CARACTERES = 300_000;
// Links de PDF que costumam ser a tabela de preços
const PDF_DE_PRECO = /price|prices|pricelist|fees|tuition|tarif|preis|precio|preco|preço/i;

export type Conteudo =
  | { tipo: "html"; texto: string; cortado: boolean; pdfs: Documento[]; hash: string }
  | { tipo: "pdf"; documento: Documento; hash: string };

export interface Documento {
  url: string;
  base64: string;
}

export class BloqueadoPeloRobots extends Error {}

const robotsPorOrigem = new Map<string, string>();

async function buscar(url: string) {
  const resposta = await fetch(url, { headers: CABECALHOS, redirect: "follow", signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!resposta.ok) throw new Error(`HTTP ${resposta.status} em ${url}`);
  return resposta;
}

async function conferirRobots(url: string) {
  const { origin, pathname, search } = new URL(url);
  if (!robotsPorOrigem.has(origin)) {
    try {
      const r = await fetch(`${origin}/robots.txt`, { headers: CABECALHOS, signal: AbortSignal.timeout(TIMEOUT_MS) });
      robotsPorOrigem.set(origin, r.ok ? await r.text() : "");
    } catch {
      robotsPorOrigem.set(origin, ""); // sem robots.txt acessível: o padrão é permitir
    }
  }
  if (!permitidoPeloRobots(robotsPorOrigem.get(origin)!, pathname + search)) {
    throw new BloqueadoPeloRobots(`robots.txt de ${origin} não permite ler ${pathname}`);
  }
}

async function baixarPdf(url: string): Promise<Documento> {
  await conferirRobots(url);
  const bytes = Buffer.from(await (await buscar(url)).arrayBuffer());
  if (bytes.length > PDF_MAX_BYTES) throw new Error(`PDF grande demais (${(bytes.length / 1e6).toFixed(1)} MB): ${url}`);
  return { url, base64: bytes.toString("base64") };
}

/** Baixa a fonte respeitando o robots.txt. Numa página HTML, segue até 2 PDFs de preço linkados nela. */
export async function lerFonte(url: string): Promise<Conteudo> {
  await conferirRobots(url);
  const resposta = await buscar(url);
  const tipo = resposta.headers.get("content-type") ?? "";

  if (tipo.includes("application/pdf") || /\.pdf($|\?)/i.test(url)) {
    const bytes = Buffer.from(await resposta.arrayBuffer());
    if (bytes.length > PDF_MAX_BYTES) throw new Error(`PDF grande demais (${(bytes.length / 1e6).toFixed(1)} MB)`);
    return { tipo: "pdf", documento: { url, base64: bytes.toString("base64") }, hash: sha256(bytes) };
  }

  const { texto, pdfs: links } = textoDaPagina(await resposta.text(), resposta.url || url);
  const pdfs: Documento[] = [];
  for (const link of links.slice(0, 2)) {
    try {
      pdfs.push(await baixarPdf(link));
    } catch (e) {
      console.warn(`  PDF ignorado (${link}): ${(e as Error).message}`);
    }
  }
  const cortado = texto.length > TEXTO_MAX_CARACTERES;
  return {
    tipo: "html",
    texto: cortado ? texto.slice(0, TEXTO_MAX_CARACTERES) : texto,
    cortado,
    pdfs,
    hash: sha256(texto + pdfs.map((p) => p.base64).join("")),
  };
}

/** HTML → texto legível para a IA: tabelas viram linhas "a | b | c", scripts e estilos saem. */
export function textoDaPagina(html: string, urlBase: string) {
  const $ = cheerio.load(html);
  $("script, style, noscript, svg, iframe, template").remove();

  const pdfs = new Set<string>();
  $("a[href]").each((_, a) => {
    const href = $(a).attr("href")!;
    const rotulo = `${href} ${$(a).text()}`;
    if (/\.pdf($|[?#])/i.test(href) && PDF_DE_PRECO.test(rotulo)) {
      try {
        pdfs.add(new URL(href, urlBase).toString());
      } catch {}
    }
  });

  $("table").each((_, tabela) => {
    const linhas = $(tabela)
      .find("tr")
      .toArray()
      .map((tr) =>
        $(tr)
          .find("th, td")
          .toArray()
          .map((c) => $(c).text().replace(/\s+/g, " ").trim())
          .join(" | "),
      );
    $(tabela).replaceWith(`\n${linhas.join("\n")}\n`);
  });
  $("br").replaceWith("\n");
  $("p, div, li, h1, h2, h3, h4, h5, h6, section, article, tr").after("\n");

  const raiz = $("main").length ? $("main") : $("body");
  const texto = raiz
    .text()
    .split("\n")
    .map((l) => l.replace(/[ \t ]+/g, " ").trim())
    .filter(Boolean)
    .join("\n");
  return { texto, pdfs: [...pdfs] };
}

function sha256(dados: Buffer | string) {
  return createHash("sha256").update(dados).digest("hex");
}
