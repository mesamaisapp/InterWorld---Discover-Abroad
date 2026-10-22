import assert from "node:assert/strict";
import { test } from "node:test";
import { montarFunil, type EventoFunil } from "./funil.ts";
import { lerOrigem, origemDaChegada, serializarOrigem } from "./origem.ts";

const visita = (sessao: string | null, caminho: string, origem: string | null = null, campanha: string | null = null) =>
  ({ tipo: "visita", caminho, ref: null, origem, campanha, sessao }) satisfies EventoFunil;

test("funil conta visitantes por sessão e segue o pedido até o fechamento", () => {
  const eventos = [
    visita("a", "/", "instagram", "dublin-out"),
    visita("a", "/cotacao", "instagram", "dublin-out"),
    visita("a", "/cotacao/tok", "instagram", "dublin-out"),
    visita("b", "/"),
    visita(null, "/kit"),
    { tipo: "clique_parceiro", caminho: "/kit", ref: "wise", origem: null, campanha: null, sessao: null },
    { tipo: "clique_parceiro", caminho: "/kit", ref: "wise", origem: null, campanha: null, sessao: null },
  ];
  const pedidos = [
    { id: "p1", status: "enviado", origem: "instagram", campanha: "dublin-out", desfecho: "fechou" },
    { id: "p2", status: "aguardando_revisao", origem: null, campanha: null, desfecho: null },
  ];
  const respostas = [
    { pedido_id: "p1", respondido_em: "2026-10-22T10:00:00Z" },
    { pedido_id: "p1", respondido_em: null },
  ];

  const f = montarFunil(eventos, pedidos, respostas);
  assert.deepEqual(
    f.etapas.map((e) => e.valor),
    [3, 1, 2, 1, 1, 1],
  );

  const insta = f.canais.find((c) => c.origem === "instagram")!;
  assert.deepEqual(
    { ...insta },
    { origem: "instagram", campanha: "dublin-out", visitantes: 1, pedidos: 1, comProposta: 1, fecharam: 1 },
  );
  const direto = f.canais.find((c) => c.origem === "direto")!;
  assert.equal(direto.visitantes, 2);
  assert.equal(direto.pedidos, 1);
  assert.deepEqual(f.parceiros, [{ id: "wise", cliques: 2 }]);
});

test("origem: utm vence, depois o site de onde veio; navegação interna não conta", () => {
  const site = (q: string) => new URL(`https://interworld.com.br/${q}`);
  assert.deepEqual(origemDaChegada(site("?utm_source=Instagram&utm_campaign=Dublin-Out"), ""), {
    origem: "instagram",
    campanha: "dublin-out",
  });
  assert.deepEqual(origemDaChegada(site(""), "https://www.google.com.br/"), { origem: "google", campanha: null });
  assert.deepEqual(origemDaChegada(site(""), "https://l.instagram.com/?u=x"), { origem: "instagram", campanha: null });
  assert.equal(origemDaChegada(site(""), "https://interworld.com.br/busca"), null);
  assert.equal(origemDaChegada(site(""), ""), null);
});

test("origem sobrevive ao cookie, inclusive com caracteres especiais", () => {
  const o = { origem: "tiktok", campanha: "malta|verão" };
  assert.deepEqual(lerOrigem(serializarOrigem(o)), o);
  assert.deepEqual(lerOrigem(serializarOrigem({ origem: "google", campanha: null })), {
    origem: "google",
    campanha: null,
  });
  assert.equal(lerOrigem(""), null);
  assert.equal(lerOrigem("%E0%A4%A|x"), null);
});
