import { NextResponse, after, type NextRequest } from "next/server";
import { buscarPacote, registrarClique } from "@/lib/catalogo";

/**
 * "Ver Oferta" passa por aqui em vez de apontar direto para o link de afiliado:
 * registra o clique (base da comissão) e redireciona. Também esconde o link
 * de afiliado do HTML e permite trocar o destino sem republicar a página.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pacote = await buscarPacote(id);
  if (!pacote) return NextResponse.redirect(new URL("/", request.url));

  // after(): grava o clique depois de enviar o redirect, sem atrasar o usuário
  after(() =>
    registrarClique(pacote.id, request.headers.get("referer"), request.headers.get("user-agent")).catch(
      (e) => console.error("Falha ao registrar clique", e),
    ),
  );

  return NextResponse.redirect(pacote.link_afiliado, 302);
}
