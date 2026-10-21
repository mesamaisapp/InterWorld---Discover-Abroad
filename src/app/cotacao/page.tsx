import type { Metadata } from "next";
import { FormCotacao, type OpcaoDestino } from "@/app/cotacao/FormCotacao";
import { Cabecalho } from "@/components/comum/Cabecalho";
import { FotoCidade } from "@/components/comum/FotoCidade";
import { buscarFaixas, buscarPacoteCompleto } from "@/lib/catalogo";
import { AGENCIAS_POR_PEDIDO } from "@/lib/cotacoes/fluxo";
import { DESTINOS, destinoDaCidade, destinoPorSlug } from "@/lib/destinos";
import { primeiro, type SearchParams } from "@/lib/filtros";

export const metadata: Metadata = {
  title: "Receber cotações de intercâmbio — InterWorld",
  description: "Diga para onde quer ir e receba até 3 propostas de agências parceiras para comparar lado a lado.",
};

const MESES = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

function proximosMeses(quantos = 18, hoje = new Date()) {
  return Array.from({ length: quantos }, (_, i) => {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1);
    return {
      valor: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      rotulo: `${MESES[d.getMonth()]} de ${d.getFullYear()}`,
    };
  });
}

export default async function PaginaCotacao({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const [faixas, pacote] = await Promise.all([buscarFaixas(), buscarPacoteCompleto(primeiro(params.pacote) ?? "")]);

  // Opções: cada cidade com foto, e "qualquer cidade" de cada país
  const destinos: OpcaoDestino[] = faixas.paises.flatMap((p) => [
    ...DESTINOS.filter((d) => d.pais_slug === p.slug).map((d) => ({
      valor: `cidade:${d.slug}`,
      rotulo: d.cidade,
      grupo: p.nome,
    })),
    { valor: `pais:${p.slug}`, rotulo: `Qualquer cidade (${p.nome})`, grupo: p.nome },
  ]);

  // Vindo de um bilhete da busca, o formulário já chega preenchido
  const cidade = pacote ? destinoDaCidade(pacote.escola_cidade) : destinoPorSlug(primeiro(params.cidade));
  const inicial: Record<string, string> = {
    destino: cidade ? `cidade:${cidade.slug}` : pacote ? `pais:${pacote.pais_slug}` : "",
    tipo: pacote?.tipo_curso ?? primeiro(params.tipo) ?? "",
    semanas: pacote ? String(pacote.semanas) : (primeiro(params.semanas) ?? ""),
    pacote: pacote?.id ?? "",
  };
  const foto = (cidade ?? DESTINOS[0]).foto;

  return (
    <>
      <Cabecalho />
      <div className="bg-ceu">
        <main className="mx-auto grid max-w-[1400px] gap-10 px-4 py-10 sm:px-8 lg:grid-cols-[1fr_1.15fr] lg:gap-16 lg:py-16">
          <div className="flex flex-col gap-6">
            <h1 className="text-[clamp(2.25rem,4.4vw,3.75rem)]">
              Receba até {AGENCIAS_POR_PEDIDO} propostas para o mesmo curso
            </h1>
            <p className="max-w-[44ch] text-xl">
              Conte para onde quer ir. Agências parceiras mandam a melhor oferta e você compara tudo lado a lado, numa
              página só sua. É grátis e sem compromisso.
            </p>
            <ol className="flex flex-col gap-3 text-[1.0625rem]">
              {[
                "Você pede em 1 minuto",
                "A gente confere o pedido e envia para até 3 agências",
                "Elas respondem com preço e o que está incluso",
                "Você compara e fala direto com a que escolher",
              ].map((passo, i) => (
                <li key={passo} className="flex items-center gap-3">
                  <span className="numeros grid size-9 shrink-0 place-items-center rounded-full bg-marca-escura font-display font-extrabold text-white">
                    {i + 1}
                  </span>
                  {passo}
                </li>
              ))}
            </ol>
            <FotoCidade foto={foto} largura={1200} prioridade className="mt-2 hidden aspect-[4/3] w-full lg:block" />
          </div>

          <div className="bg-superficie p-5 sm:p-8">
            <FormCotacao destinos={destinos} inicial={inicial} meses={proximosMeses()} />
          </div>
        </main>
      </div>
    </>
  );
}
