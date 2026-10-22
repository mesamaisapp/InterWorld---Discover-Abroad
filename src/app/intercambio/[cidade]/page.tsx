import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Cabecalho } from "@/components/comum/Cabecalho";
import { FotoCidade } from "@/components/comum/FotoCidade";
import { KitResumo } from "@/components/comum/KitResumo";
import { Rodape } from "@/components/comum/Rodape";
import { buscarCatalogo } from "@/lib/catalogo";
import { DESTINOS, destinoPorSlug } from "@/lib/destinos";
import { formatarEuro, formatarSemanas } from "@/lib/formatar";
import { PAISES } from "@/lib/guia";
import { SEGURO_POR_PAIS } from "@/lib/kit";
import { maioresEconomias } from "@/lib/resumo";
import { ROTULO_TIPO_CURSO } from "@/types/catalogo";

// Preços do catálogo: regenera de hora em hora, como o guia
export const revalidate = 3600;

export function generateStaticParams() {
  return DESTINOS.map((d) => ({ cidade: d.slug }));
}

const DATA = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" });

async function dadosDaCidade(slug: string) {
  const destino = destinoPorSlug(slug);
  if (!destino) return null;
  const pacotes = (await buscarCatalogo()).filter((p) => p.escola_cidade === destino.cidade);
  return { destino, pacotes, pais: PAISES.find((p) => p.slug === destino.pais_slug) };
}

export async function generateMetadata({ params }: { params: Promise<{ cidade: string }> }): Promise<Metadata> {
  const dados = await dadosDaCidade((await params).cidade);
  if (!dados) return {};
  const { destino, pacotes } = dados;
  const menor = pacotes.length ? Math.min(...pacotes.map((p) => p.preco_semana_eur)) : null;
  return {
    title: `Intercâmbio em ${destino.cidade}: quanto custa — InterWorld`,
    description: `${menor ? `Cursos de inglês em ${destino.cidade} a partir de ${formatarEuro(menor)} por semana. ` : ""}Compare escolas e agências, veja as regras do país e receba até 3 propostas.`,
    alternates: { canonical: `/intercambio/${destino.slug}` },
  };
}

export default async function PaginaCidade({ params }: { params: Promise<{ cidade: string }> }) {
  const dados = await dadosDaCidade((await params).cidade);
  if (!dados) notFound();
  const { destino, pacotes, pais } = dados;

  // Por escola: o menor preço por semana, o menor pacote e quantas agências vendem
  const porEscola = new Map<string, typeof pacotes>();
  for (const p of pacotes) porEscola.set(p.escola_id, [...(porEscola.get(p.escola_id) ?? []), p]);
  const escolas = [...porEscola.values()]
    .map((lista) => {
      const maisBarato = lista.reduce((a, b) => (b.preco_eur < a.preco_eur ? b : a));
      return {
        id: lista[0].escola_id,
        nome: lista[0].escola_nome,
        porSemana: Math.min(...lista.map((p) => p.preco_semana_eur)),
        maisBarato,
        agencias: new Set(lista.map((p) => p.agencia_id)).size,
      };
    })
    .sort((a, b) => a.porSemana - b.porSemana);

  const menorSemana = escolas[0]?.porSemana;
  const comparacao = maioresEconomias(pacotes, 1)[0];
  const visto = pacotes
    .map((p) => p.visto_em)
    .filter((d): d is string => !!d)
    .sort()
    .at(-1);
  const seguro = SEGURO_POR_PAIS[destino.pais_slug];
  const cotacao = `/cotacao?cidade=${destino.slug}`;

  return (
    <>
      <Cabecalho />

      <section aria-labelledby="titulo-cidade" className="relative isolate overflow-hidden bg-marca-escura text-white">
        <div className="absolute inset-0 -z-10">
          <FotoCidade foto={destino.foto} largura={1920} prioridade className="foto-viva size-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/40 to-black/20" />
        </div>
        <div className="mx-auto flex min-h-[70svh] max-w-[1400px] flex-col justify-end gap-6 px-4 py-12 sm:px-8 sm:py-16">
          <p className="font-semibold">
            Intercâmbio em {destino.cidade} · {pais?.nome}
          </p>
          <h1 id="titulo-cidade" className="max-w-4xl text-[clamp(2.5rem,6vw,5.5rem)]">
            {menorSemana ? (
              <>
                Estudar em {destino.cidade} a partir de{" "}
                <span className="numeros text-verde">{formatarEuro(menorSemana)}</span> por semana
              </>
            ) : (
              <>Quanto custa estudar em {destino.cidade}</>
            )}
          </h1>
          <p className="max-w-[48ch] text-xl">{destino.frase}</p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={cotacao}
              className="inline-flex h-14 items-center rounded-full bg-verde px-8 text-[1.0625rem] font-semibold text-marca-escura transition-[background-color,scale] duration-200 hover:bg-[#6fcb59] active:scale-[0.97]"
            >
              Receber até 3 propostas
            </Link>
            <Link
              href={`/busca?cidade=${destino.slug}`}
              className="inline-flex h-14 items-center rounded-full bg-white/15 px-8 text-[1.0625rem] font-semibold backdrop-blur transition-colors hover:bg-white/25"
            >
              Ver todos os pacotes
            </Link>
          </div>
          <p className="text-[0.9375rem] text-white/85">
            {escolas.length} {escolas.length === 1 ? "escola" : "escolas"} · {pacotes.length} pacotes
            {visto && ` · preços conferidos até ${DATA.format(new Date(visto))}`} · foto: {destino.foto.legenda}
          </p>
        </div>
      </section>

      <div className="mx-auto flex max-w-5xl flex-col gap-[clamp(4rem,8vw,6rem)] px-4 py-16 sm:px-8 lg:py-24">
        {comparacao && (
          <section aria-labelledby="t-mesmo-curso" className="flex flex-col gap-5">
            <h2 id="t-mesmo-curso" data-revelar className="text-[clamp(2rem,4vw,3rem)]">
              O mesmo curso, {formatarEuro(comparacao.economia)} de diferença
            </h2>
            <p className="max-w-[60ch] text-xl">
              {ROTULO_TIPO_CURSO[comparacao.ofertas[0].tipo_curso]} de {formatarSemanas(comparacao.ofertas[0].semanas)}{" "}
              na {comparacao.ofertas[0].escola_nome}
              {comparacao.ofertas[0].acomodacao_inclusa ? ", com acomodação" : ""}. Mesma escola, mesmo curso, preços
              diferentes em cada agência:
            </p>
            <ol className="flex flex-col gap-2">
              {comparacao.ofertas.map((o, i) => (
                <li
                  key={o.id}
                  className={`flex items-center justify-between gap-4 p-5 ${i === 0 ? "bg-verde text-marca-escura" : "bg-ceu"}`}
                >
                  <span className="font-semibold">
                    {o.agencia_nome}
                    {i === 0 && <span className="ml-3 text-[0.9375rem]">Menor preço</span>}
                  </span>
                  <span className="numeros font-display text-2xl font-extrabold">{formatarEuro(o.preco_eur)}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        <section aria-labelledby="t-escolas" className="flex flex-col gap-5">
          <h2 id="t-escolas" data-revelar className="text-[clamp(2rem,4vw,3rem)]">
            Escolas em {destino.cidade}
          </h2>
          {escolas.length ? (
            <div>
              <table className="numeros w-full bg-ceu text-left">
                <thead>
                  <tr className="border-b border-borda">
                    <th className="p-3 font-semibold sm:p-4">Escola</th>
                    <th className="p-4 text-right font-semibold">A partir de, por semana</th>
                    <th className="p-4 text-right font-semibold">Menor pacote</th>
                    <th className="hidden p-4 text-right font-semibold sm:table-cell">Agências</th>
                  </tr>
                </thead>
                <tbody>
                  {escolas.map((e) => (
                    <tr key={e.id} className="border-b border-borda last:border-0">
                      <td className="p-4 font-semibold">{e.nome}</td>
                      <td className="p-4 text-right">{formatarEuro(e.porSemana)}</td>
                      <td className="p-4 text-right">
                        {formatarEuro(e.maisBarato.preco_eur)}{" "}
                        <span className="block text-suave sm:inline">({formatarSemanas(e.maisBarato.semanas)})</span>
                      </td>
                      <td className="hidden p-4 text-right sm:table-cell">{e.agencias}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="bg-ceu p-5">
              Ainda não temos preços para {destino.cidade}. Peça uma cotação e as agências mandam.
            </p>
          )}
          <p className="text-[0.9375rem] text-suave">
            Preço do curso com as taxas obrigatórias, em euros. Passagem, seguro e custo de vida ficam à parte.{" "}
            <Link href={`/busca?cidade=${destino.slug}`} className="font-semibold text-marca underline">
              Ver e filtrar todos os pacotes
            </Link>
          </p>
        </section>

        {pais && (
          <section aria-labelledby="t-regras" className="flex flex-col gap-5">
            <h2 id="t-regras" data-revelar className="text-[clamp(2rem,4vw,3rem)]">
              O que precisa para estudar {pais.slug === "malta" ? "em" : "na"} {pais.nome}
            </h2>
            <dl className="grid gap-3 md:grid-cols-3">
              <div className="flex flex-col gap-2 bg-marca-escura p-5 text-white">
                <dt className="font-display text-xl font-extrabold">Para entrar</dt>
                <dd>{pais.entrada}</dd>
              </div>
              <div className="flex flex-col gap-2 bg-marca p-5 text-white">
                <dt className="font-display text-xl font-extrabold">Trabalhar</dt>
                <dd>{pais.trabalho}</dd>
              </div>
              {seguro && (
                <div className="flex flex-col gap-2 bg-ceu p-5">
                  <dt className="font-display text-xl font-extrabold">Seguro</dt>
                  <dd>{seguro.texto}</dd>
                </div>
              )}
            </dl>
            <p className="text-[0.9375rem] text-suave">
              Regras mudam: confira na{" "}
              <a href={pais.fonte.url} target="_blank" rel="noopener" className="font-semibold text-marca underline">
                fonte oficial ({pais.fonte.rotulo})
              </a>{" "}
              antes de pagar. Mais detalhes no{" "}
              <Link href="/guia#pais" className="font-semibold text-marca underline">
                guia do primeiro intercâmbio
              </Link>
              .
            </p>
          </section>
        )}

        <KitResumo titulo={`Além do curso: o kit para ${destino.cidade}`} destino={destino.pais_slug} />

        <div className="grid gap-6 bg-verde p-6 text-marca-escura sm:p-10 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h2 className="text-[clamp(1.75rem,3vw,2.5rem)]">Quer o preço certo para você?</h2>
            <p className="mt-3 max-w-[48ch] text-lg">
              Diga quantas semanas e quando quer ir. Até 3 agências mandam a proposta e você compara numa página só sua.
              É grátis.
            </p>
          </div>
          <Link
            href={cotacao}
            className="inline-flex h-14 items-center justify-center rounded-full bg-marca-escura px-8 text-[1.0625rem] font-semibold text-white transition-[background-color,scale] duration-200 hover:bg-marca active:scale-[0.97]"
          >
            Receber cotações
          </Link>
        </div>
      </div>

      <Rodape />
    </>
  );
}
