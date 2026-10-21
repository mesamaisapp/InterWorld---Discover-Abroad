// Coletor de preços da InterWorld.
//
//   npm run coletor                       coleta as fontes ativas (as mais antigas primeiro)
//   npm run coletor -- --limite 10        no máximo 10 fontes nesta execução
//   npm run coletor -- --url <URL> --seco lê uma URL e mostra as ofertas, sem gravar nada
//   npm run coletor -- --forcar           chama a IA mesmo se a página não mudou
//   npm run coletor -- --importar-fontes  grava coletor/fontes-iniciais.json na tabela `fontes`

import { readFile } from "node:fs/promises";
import { parseArgs } from "node:util";
import { buscarCambio } from "./cambio.ts";
import { extrairOfertas } from "./extrair.ts";
import { conectar, type Fonte } from "./gravar.ts";
import { BloqueadoPeloRobots, lerFonte } from "./pagina.ts";
import { deduplicar, validarOferta, type OfertaValida } from "./validar.ts";

const { values: opcoes } = parseArgs({
  options: {
    limite: { type: "string", default: "50" },
    url: { type: "string" },
    seco: { type: "boolean", default: false },
    forcar: { type: "boolean", default: false },
    "importar-fontes": { type: "boolean", default: false },
  },
});

// Sem mudança na página há menos que isso: não gasta IA, só renova a data dos preços
const REVALIDAR_DIAS = 7;
const PAUSA_ENTRE_FONTES_MS = 2_000;

async function principal() {
  if (opcoes["importar-fontes"]) {
    const arquivo = JSON.parse(await readFile(new URL("./fontes-iniciais.json", import.meta.url), "utf8"));
    await conectar().importarFontes(arquivo.fontes);
    console.log(`${arquivo.fontes.length} fontes importadas (as que já existiam ficaram como estavam).`);
    return;
  }

  const cambio = await buscarCambio();
  console.log(`Câmbio BCE: ${Object.entries(cambio).map(([m, v]) => `${m} ${v}`).join(" · ")}`);

  const db = opcoes.seco ? null : conectar();
  const fontes: Fonte[] = db
    ? await db.fontesParaColetar(Number(opcoes.limite), opcoes.url)
    : [fonteAvulsa(opcoes.url)];
  if (!fontes.length) {
    console.log("Nenhuma fonte ativa para coletar.");
    return;
  }

  const placar = { ok: 0, sem_mudanca: 0, sem_precos: 0, bloqueada: 0, erro: 0, ofertas: 0 };

  for (const [i, fonte] of fontes.entries()) {
    if (i) await new Promise((r) => setTimeout(r, PAUSA_ENTRE_FONTES_MS));
    const inicio = new Date();
    console.log(`\n[${i + 1}/${fontes.length}] ${fonte.nome} — ${fonte.url}`);

    try {
      const conteudo = await lerFonte(fonte.url);
      const recente =
        fonte.ultima_coleta && Date.now() - new Date(fonte.ultima_coleta).getTime() < REVALIDAR_DIAS * 864e5;
      if (db && !opcoes.forcar && recente && conteudo.hash === fonte.ultimo_hash) {
        await db.confirmarOfertas(fonte);
        await db.registrar(fonte, inicio, { status: "sem_mudanca" });
        placar.sem_mudanca++;
        console.log("  sem mudança desde a última coleta; preços confirmados");
        continue;
      }

      const extracao = await extrairOfertas(conteudo, fonte);
      const validas: OfertaValida[] = [];
      const motivos: string[] = [];
      for (const o of extracao.ofertas) {
        const r = validarOferta(o, cambio);
        if (r.ok) validas.push(r.oferta);
        else motivos.push(`${o.escola} ${o.semanas}sem: ${r.motivo}`);
      }
      const ofertas = deduplicar(validas);
      const cortado = conteudo.tipo === "html" && conteudo.cortado ? "Texto da página cortado no limite. " : "";
      const detalhe = [cortado + extracao.observacoes, ...motivos].filter(Boolean).join("\n");
      console.log(
        `  ${ofertas.length} ofertas válidas, ${motivos.length} descartadas · tokens: ${extracao.tokens.entrada} entrada, ${extracao.tokens.saida} saída`,
      );
      for (const m of motivos) console.log(`  descartada: ${m}`);

      if (!db) {
        console.table(
          ofertas.map((o) => ({
            escola: o.escola,
            cidade: o.cidade,
            curso: o.tipo_curso,
            semanas: o.semanas,
            preco: `${o.preco_original} ${o.moeda}`,
            eur: o.preco_eur,
            acomodacao: o.inclui_acomodacao,
          })),
        );
        if (extracao.observacoes) console.log(`  observações: ${extracao.observacoes}`);
        continue;
      }

      if (!ofertas.length) {
        await db.registrar(fonte, inicio, {
          status: "sem_precos",
          descartadas: motivos.length,
          detalhe,
          hash: conteudo.hash,
        });
        placar.sem_precos++;
        continue;
      }
      await db.gravarOfertas(fonte, ofertas, inicio);
      await db.registrar(fonte, inicio, {
        status: "ok",
        ofertas: ofertas.length,
        descartadas: motivos.length,
        detalhe,
        hash: conteudo.hash,
      });
      placar.ok++;
      placar.ofertas += ofertas.length;
    } catch (e) {
      const bloqueada = e instanceof BloqueadoPeloRobots;
      const mensagem = (e as Error).message;
      console.warn(`  ${bloqueada ? "bloqueada" : "erro"}: ${mensagem}`);
      // Uma fonte com problema não derruba as outras; o erro fica registrado na coleta
      if (db) await db.registrar(fonte, inicio, { status: bloqueada ? "bloqueada" : "erro", detalhe: mensagem });
      placar[bloqueada ? "bloqueada" : "erro"]++;
    }
  }

  console.log(
    `\nResumo: ${placar.ok} ok (${placar.ofertas} ofertas) · ${placar.sem_mudanca} sem mudança · ${placar.sem_precos} sem preços · ${placar.bloqueada} bloqueadas · ${placar.erro} com erro`,
  );
}

function fonteAvulsa(url?: string): Fonte {
  if (!url) throw new Error("Use --seco junto com --url <endereço> (o modo seco não lê a tabela de fontes).");
  return {
    id: "avulsa",
    url,
    tipo: "escola",
    nome: new URL(url).hostname,
    agencia_id: null,
    pais_slug: null,
    cidade: null,
    ultimo_hash: null,
    ultima_coleta: null,
  };
}

principal().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
