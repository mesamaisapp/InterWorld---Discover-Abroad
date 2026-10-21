import type { NovoPedido, Triagem } from "@/lib/cotacoes/tipos";

/** WhatsApp só com dígitos e com DDI; brasileiro sem DDI ganha o 55. */
export function normalizarWhatsapp(bruto: string, ddi = "55") {
  const digitos = bruto.replace(/\D/g, "");
  if (digitos.length === 10 || digitos.length === 11) return ddi + digitos; // DDD + número
  return digitos;
}

export function whatsappValido(numero: string) {
  // Brasil: 55 + DDD (2) + 8 ou 9 dígitos; outros países: 10 a 15 dígitos no total
  if (numero.startsWith("55")) return /^55[1-9]{2}9?\d{8}$/.test(numero);
  return /^\d{10,15}$/.test(numero);
}

/**
 * Nota de 0 a 100 de quão pronto para fechar o pedido parece.
 * Serve para ordenar a revisão e, quando a revisão manual for desligada, para decidir o envio automático.
 */
export function triar(p: NovoPedido, hoje = new Date()): Triagem {
  let nota = 100;
  const motivos: string[] = [];
  const tirar = (pontos: number, motivo: string) => {
    nota -= pontos;
    motivos.push(motivo);
  };

  if (!whatsappValido(p.whatsapp)) tirar(40, "WhatsApp parece inválido");
  if (p.nome.trim().split(/\s+/).length < 2) tirar(10, "Só o primeiro nome");
  if (!p.cidade) tirar(10, "Sem cidade definida");
  if (!p.semanas) tirar(10, "Sem duração definida");
  if (!p.tipo_curso) tirar(5, "Sem tipo de curso");

  if (!p.inicio) {
    tirar(15, "Sem data de início");
  } else {
    const [ano, mes] = p.inicio.split("-").map(Number);
    const meses = (ano - hoje.getFullYear()) * 12 + (mes - 1 - hoje.getMonth());
    if (meses < 0) tirar(20, "Data de início no passado");
    else if (meses > 18) tirar(15, "Início daqui a mais de 18 meses");
  }

  if (p.observacoes && /https?:\/\/|www\./i.test(p.observacoes)) tirar(30, "Link nas observações (possível spam)");

  return { nota: Math.max(0, nota), motivos };
}
