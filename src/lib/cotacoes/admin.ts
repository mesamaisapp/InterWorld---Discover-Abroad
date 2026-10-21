import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { repo } from "@/lib/cotacoes/repositorio";

const COOKIE = "iw_admin";

function assinatura(senha: string) {
  return createHmac("sha256", senha).update("interworld-admin").digest("base64url");
}

/**
 * Painel protegido pela senha ADMIN_SENHA. Sem senha definida, só abre no modo demonstração
 * (sem banco), para que nunca fique aberto em produção por esquecimento.
 */
export async function podeAdministrar() {
  const senha = process.env.ADMIN_SENHA;
  if (!senha) return repo().demonstracao;
  const valor = (await cookies()).get(COOKIE)?.value ?? "";
  const esperado = assinatura(senha);
  return valor.length === esperado.length && timingSafeEqual(Buffer.from(valor), Buffer.from(esperado));
}

export async function entrar(senhaDigitada: string) {
  const senha = process.env.ADMIN_SENHA;
  if (!senha || senhaDigitada.length !== senha.length) return false;
  if (!timingSafeEqual(Buffer.from(senhaDigitada), Buffer.from(senha))) return false;
  (await cookies()).set(COOKIE, assinatura(senha), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    maxAge: 60 * 60 * 24 * 14,
  });
  return true;
}
