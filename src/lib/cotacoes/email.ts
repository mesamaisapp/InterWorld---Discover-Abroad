import "server-only";

/**
 * E-mails pela API do Resend (https://resend.com). Sem RESEND_API_KEY, só registra no log:
 * o painel de revisão mostra os links para enviar à mão.
 */
export async function enviarEmail(para: string, assunto: string, html: string) {
  const chave = process.env.RESEND_API_KEY;
  const de = process.env.EMAIL_REMETENTE ?? "InterWorld <cotacoes@interworld.example>";
  if (!chave) {
    console.info(`[email não enviado: sem RESEND_API_KEY] para ${para}: ${assunto}`);
    return { enviado: false };
  }
  const resposta = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${chave}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: de, to: [para], subject: assunto, html }),
  });
  if (!resposta.ok) throw new Error(`Resend respondeu ${resposta.status}: ${await resposta.text()}`);
  return { enviado: true };
}

/** Escapa o que veio de formulário antes de entrar no HTML do e-mail. */
export function esc(texto: string | null | undefined) {
  return (texto ?? "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}

export function urlDoSite(caminho: string) {
  const base =
    process.env.SITE_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  return new URL(caminho, base).toString();
}
