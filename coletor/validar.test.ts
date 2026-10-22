import { strict as assert } from "node:assert";
import { test } from "node:test";
import { deduplicar, normalizarCidade, paisParaSlug, validarOferta, type OfertaExtraida } from "./validar.ts";
import { textoDaPagina } from "./pagina.ts";
import { permitidoPeloRobots } from "./robots.ts";

const CAMBIO = { EUR: 1, CAD: 1.5, AUD: 1.7, GBP: 0.85 } as const;

const base: OfertaExtraida = {
  escola: "Atlas Language School",
  cidade: "Dublin",
  pais: "Ireland",
  tipo_curso: "geral",
  semanas: 12,
  preco: 3315,
  moeda: "EUR",
  inclui_acomodacao: false,
  trecho: "GE20 9–16 weeks €270/week",
};

test("aceita uma oferta coerente", () => {
  const r = validarOferta(base, CAMBIO);
  assert.ok(r.ok);
  if (r.ok) {
    assert.equal(r.oferta.pais_slug, "irlanda");
    assert.equal(r.oferta.preco_eur, 3315);
  }
});

test("converte para euro pelo câmbio", () => {
  const r = validarOferta({ ...base, pais: "Canada", cidade: "Toronto", moeda: "CAD", preco: 5280 }, CAMBIO);
  assert.ok(r.ok);
  if (r.ok) assert.equal(r.oferta.preco_eur, 3520);
});

test("recusa preço por semana implausível (provável preço anual ou taxa solta)", () => {
  assert.equal(validarOferta({ ...base, preco: 75 }, CAMBIO).ok, false);
  assert.equal(validarOferta({ ...base, semanas: 1, preco: 9800 }, CAMBIO).ok, false);
});

test("recusa país, tipo, moeda e semanas desconhecidos", () => {
  assert.equal(validarOferta({ ...base, pais: "Japan" }, CAMBIO).ok, false);
  assert.equal(validarOferta({ ...base, tipo_curso: "yoga" }, CAMBIO).ok, false);
  assert.equal(validarOferta({ ...base, moeda: "JPY" }, CAMBIO).ok, false);
  assert.equal(validarOferta({ ...base, semanas: 0 }, CAMBIO).ok, false);
  assert.equal(validarOferta({ ...base, semanas: 2.5 }, CAMBIO).ok, false);
});

test("normaliza nomes de país e cidade para os do site", () => {
  assert.equal(paisParaSlug("United Kingdom"), "reino-unido");
  assert.equal(paisParaSlug("España"), "espanha");
  assert.equal(normalizarCidade("London"), "Londres");
  assert.equal(normalizarCidade("St. Julian’s"), "St Julian's");
  assert.equal(normalizarCidade("  Galway "), "Galway");
});

test("deduplica mantendo o menor preço", () => {
  const a = validarOferta(base, CAMBIO);
  const b = validarOferta({ ...base, preco: 3100 }, CAMBIO);
  assert.ok(a.ok && b.ok);
  if (a.ok && b.ok) {
    const unicas = deduplicar([a.oferta, b.oferta]);
    assert.equal(unicas.length, 1);
    assert.equal(unicas[0].preco_eur, 3100);
  }
});

test("texto da página mantém as tabelas e descarta scripts", () => {
  const html = `<html><head><script>var x = 1</script><style>p{}</style></head><body>
    <nav>Menu</nav><main><h1>Prices 2026</h1>
    <table><tr><th>Course</th><th>1-8 weeks</th></tr><tr><td>GE20</td><td>€300</td></tr></table>
    <a href="/docs/price-list-2026.pdf">Download price list</a></main></body></html>`;
  const { texto, pdfs } = textoDaPagina(html, "https://escola.example/precos");
  assert.match(texto, /Course \| 1-8 weeks/);
  assert.match(texto, /GE20 \| €300/);
  assert.doesNotMatch(texto, /var x/);
  assert.deepEqual(pdfs, ["https://escola.example/docs/price-list-2026.pdf"]);
});

test("robots.txt: respeita Disallow para todos e para o nosso robô", () => {
  const robots = "User-agent: *\nDisallow: /privado\n\nUser-agent: InterWorldBot\nDisallow: /precos-internos\n";
  assert.equal(permitidoPeloRobots(robots, "/prices"), true);
  assert.equal(permitidoPeloRobots(robots, "/privado/tabela"), false);
  assert.equal(permitidoPeloRobots(robots, "/precos-internos"), false);
  assert.equal(permitidoPeloRobots("User-agent: *\nDisallow: /\n", "/qualquer"), false);
  assert.equal(permitidoPeloRobots("User-agent: *\nDisallow:\n", "/qualquer"), true);
});
