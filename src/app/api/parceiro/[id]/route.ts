import { NextResponse, after, type NextRequest } from "next/server";
import { KIT, linkDoParceiro } from "@/lib/kit";
import { COOKIE_ORIGEM, lerOrigem } from "@/lib/metricas/origem";
import { eventos } from "@/lib/metricas/repositorio";

/** Botões do kit passam por aqui: conta o clique no parceiro e segue para o site dele. */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parceiro = KIT.flatMap((item) => item.parceiros).find((p) => p.id === id);
  if (!parceiro) return NextResponse.redirect(new URL("/kit", request.url));

  const origem = lerOrigem(request.cookies.get(COOKIE_ORIGEM)?.value);
  let caminho: string | null = null;
  try {
    caminho = new URL(request.headers.get("referer") ?? "").pathname.slice(0, 200);
  } catch {}

  after(() =>
    eventos()
      .registrar({
        tipo: "clique_parceiro",
        caminho,
        ref: parceiro.id,
        origem: origem?.origem ?? null,
        campanha: origem?.campanha ?? null,
        sessao: null,
      })
      .catch((e) => console.error("Falha ao registrar clique no parceiro", e)),
  );
  return NextResponse.redirect(linkDoParceiro(parceiro), 302);
}
