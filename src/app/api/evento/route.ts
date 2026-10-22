import { NextResponse, after, type NextRequest } from "next/server";
import { eventos } from "@/lib/metricas/repositorio";

const ROBO = /bot|crawl|spider|slurp|preview|lighthouse|headless/i;

const texto = (v: unknown, max: number) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null);

/** Recebe a visita contada pelo navegador (components/comum/Rastreio.tsx). */
export async function POST(request: NextRequest) {
  if (ROBO.test(request.headers.get("user-agent") ?? "")) return new NextResponse(null, { status: 204 });

  let corpo: Record<string, unknown>;
  try {
    corpo = await request.json();
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  if (corpo.tipo !== "visita") return new NextResponse(null, { status: 400 });

  const caminho = texto(corpo.caminho, 200);
  if (!caminho?.startsWith("/")) return new NextResponse(null, { status: 400 });

  after(() =>
    eventos()
      .registrar({
        tipo: "visita",
        caminho,
        ref: null,
        origem: texto(corpo.origem, 60),
        campanha: texto(corpo.campanha, 60),
        sessao: texto(corpo.sessao, 64),
      })
      .catch((e) => console.error("Falha ao registrar visita", e)),
  );
  return new NextResponse(null, { status: 204 });
}
