import { strict as assert } from "node:assert";
import { test } from "node:test";
import { normalizarWhatsapp, triar, whatsappValido } from "./triagem.ts";
import type { NovoPedido } from "./tipos.ts";

const HOJE = new Date(2026, 9, 21); // 21/10/2026

const completo: NovoPedido = {
  mercado: "br",
  nome: "Ana Souza",
  whatsapp: "5511912345678",
  email: null,
  pais_slug: "irlanda",
  cidade: "Dublin",
  tipo_curso: "geral",
  semanas: 25,
  inicio: "2027-03",
  observacoes: null,
  pacote_id: null,
  consentimento_texto: "ok",
};

test("WhatsApp brasileiro ganha DDI e é validado", () => {
  assert.equal(normalizarWhatsapp("(11) 91234-5678"), "5511912345678");
  assert.equal(normalizarWhatsapp("+55 21 3333-4444"), "552133334444");
  assert.equal(whatsappValido("5511912345678"), true);
  assert.equal(whatsappValido("55119123"), false);
});

test("pedido completo tira nota máxima", () => {
  assert.deepEqual(triar(completo, HOJE), { nota: 100, motivos: [] });
});

test("pedido vago ou suspeito perde pontos com o motivo", () => {
  const t = triar(
    { ...completo, nome: "Ana", cidade: null, inicio: "2026-01", observacoes: "veja www.spam.com" },
    HOJE,
  );
  assert.ok(t.nota < 70);
  assert.ok(t.motivos.includes("Data de início no passado"));
  assert.ok(t.motivos.some((m) => m.includes("spam")));
});
