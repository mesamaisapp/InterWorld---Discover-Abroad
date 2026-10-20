import type { Metadata } from "next";
import Link from "next/link";
import { Cabecalho } from "@/components/comum/Cabecalho";
import { FotoCidade } from "@/components/comum/FotoCidade";
import { Rodape } from "@/components/comum/Rodape";
import { Calculadora } from "@/components/guia/Calculadora";
import { ChecklistDocumentos } from "@/components/guia/ChecklistDocumentos";
import { IndiceGuia } from "@/components/guia/IndiceGuia";
import { buscarCatalogo } from "@/lib/catalogo";
import { destinoPorSlug } from "@/lib/destinos";
import {
  ARMADILHAS,
  CHEGADA,
  LINHA_DO_TEMPO,
  OBJETIVOS,
  PAISES,
  PERGUNTAS_AGENCIA,
  PERGUNTAS_ESCOLA,
} from "@/lib/guia";
import { resumirDestinos } from "@/lib/resumo";
import { ROTULO_TIPO_CURSO } from "@/types/catalogo";

// Os preços da calculadora vêm do catálogo: regenera a página de hora em hora.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Guia do primeiro intercâmbio — InterWorld",
  description:
    "Do objetivo ao embarque: como escolher país, curso, escola e agência, quanto custa de verdade, documentos, visto e as ciladas mais comuns.",
};

const CAPITULOS = [
  { id: "objetivo", titulo: "Por que você vai?" },
  { id: "pais", titulo: "Qual país combina" },
  { id: "custo", titulo: "Quanto custa de verdade" },
  { id: "quando", titulo: "Quando começar" },
  { id: "documentos", titulo: "Documentos" },
  { id: "escola", titulo: "Escola e agência" },
  { id: "ciladas", titulo: "Ciladas comuns" },
  { id: "chegada", titulo: "Chegando lá" },
];

const FOTO_CAPA = destinoPorSlug("galway")!.foto;

export default async function PaginaGuia() {
  const catalogo = await buscarCatalogo();
  const cursos = resumirDestinos(catalogo).map((r) => ({
    slug: r.destino.slug,
    cidade: r.destino.cidade,
    precoSemana: r.menorPrecoSemana,
  }));

  return (
    <>
      <Cabecalho />

      <section aria-labelledby="titulo-guia" className="relative isolate overflow-hidden bg-marca-escura text-white">
        <div className="absolute inset-0 -z-10">
          <FotoCidade foto={FOTO_CAPA} largura={1920} prioridade className="foto-viva size-full" />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <div className="mx-auto flex min-h-[62svh] max-w-[1400px] flex-col justify-end gap-6 px-4 py-12 sm:px-8 sm:py-16">
          <h1 id="titulo-guia" className="max-w-4xl text-[clamp(2.5rem,6vw,5.5rem)]">
            Guia do primeiro intercâmbio
          </h1>
          <p className="max-w-[46ch] text-xl">
            Tudo o que vale saber antes de pagar qualquer coisa: país, curso, custo real, documentos, visto e as
            perguntas certas para a escola e a agência.
          </p>
          <p className="text-[0.9375rem] font-semibold">
            {CAPITULOS.length} capítulos · uns 15 minutos de leitura · foto: {FOTO_CAPA.legenda}, Galway
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-[1400px] gap-12 px-4 py-16 sm:px-8 lg:grid-cols-[240px_1fr] lg:py-24">
        <aside>
          <IndiceGuia capitulos={CAPITULOS} />
        </aside>

        <main className="flex min-w-0 flex-col gap-[clamp(6rem,10vw,9rem)]">
          {/* 1 */}
          <Capitulo id="objetivo" titulo="Por que você vai?">
            <p className="max-w-[60ch] text-xl">
              O objetivo decide o tipo de curso, e o tipo de curso decide quantas semanas e quanto dinheiro. Escolha a
              frase que mais parece com você:
            </p>
            <ul className="flex flex-col gap-2">
              {OBJETIVOS.map((o) => (
                <li key={o.curso}>
                  <Link
                    href={`/busca?tipo=${o.curso}`}
                    className="group grid gap-2 bg-ceu p-5 transition-colors duration-200 hover:bg-[#d3e2f6] sm:grid-cols-[1fr_1.3fr_auto] sm:items-center sm:gap-6"
                  >
                    <span className="font-display text-xl font-extrabold tracking-[-0.02em]">{o.quero}</span>
                    <span>
                      <strong>{ROTULO_TIPO_CURSO[o.curso]}.</strong> {o.explicacao}
                    </span>
                    <span className="font-semibold whitespace-nowrap text-marca">
                      Ver cursos{" "}
                      <span
                        aria-hidden
                        className="inline-block transition-transform duration-200 group-hover:translate-x-1"
                      >
                        →
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Capitulo>

          {/* 2 */}
          <Capitulo id="pais" titulo="Qual país combina com você">
            <p className="max-w-[60ch] text-xl">
              Para quem sai do Brasil, a grande diferença entre os países é se dá para trabalhar enquanto estuda e o que
              precisa para entrar. Regras mudam: confira sempre na fonte oficial antes de pagar.
            </p>
            <ul className="flex flex-col gap-3">
              {PAISES.map((p) => {
                const foto = destinoPorSlug(p.foto)!.foto;
                return (
                  <li key={p.slug} data-revelar className="grid bg-ceu sm:grid-cols-[200px_1fr]">
                    <FotoCidade foto={foto} largura={600} className="aspect-[16/9] w-full sm:aspect-auto sm:h-full" />
                    <div className="flex flex-col gap-4 p-5 sm:p-6">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3 className="text-[1.75rem]">{p.nome}</h3>
                        <span className="text-[0.9375rem] font-semibold">{p.idioma}</span>
                      </div>
                      <dl className="grid gap-4 text-[1rem] md:grid-cols-3">
                        <div>
                          <dt className="font-bold">Para entrar</dt>
                          <dd className="mt-1">{p.entrada}</dd>
                        </div>
                        <div>
                          <dt className="font-bold">Trabalhar</dt>
                          <dd className="mt-1">{p.trabalho}</dd>
                        </div>
                        <div>
                          <dt className="font-bold">Bom para</dt>
                          <dd className="mt-1">{p.bomPara}</dd>
                        </div>
                      </dl>
                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-[0.9375rem] font-semibold">
                        <a href={p.fonte.url} target="_blank" rel="noopener" className="text-marca hover:underline">
                          Fonte oficial: {p.fonte.rotulo} ↗
                        </a>
                        <Link href={`/busca?destino=${p.slug}`} className="hover:underline">
                          Pacotes em {p.nome} →
                        </Link>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Capitulo>

          {/* 3 */}
          <Capitulo id="custo" titulo="Quanto custa de verdade">
            <p className="max-w-[60ch] text-xl">
              O preço do curso costuma ser menos da metade da conta. Mexa nos valores e veja o total da viagem:
            </p>
            <div className="bg-ceu p-2 sm:p-3">
              <Calculadora cursos={cursos} />
            </div>
          </Capitulo>

          {/* 4 */}
          <Capitulo id="quando" titulo="Quando começar">
            <p className="max-w-[60ch] text-xl">
              Um ano antes parece cedo, mas é o que deixa você escolher com calma e pagar sem susto. Com visto, o prazo
              encurta rápido.
            </p>
            <ol className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {LINHA_DO_TEMPO.map((etapa, i) => (
                <li
                  key={etapa.quando}
                  data-revelar
                  style={{ "--i": i % 3 } as React.CSSProperties}
                  className={`flex flex-col gap-3 p-5 sm:p-6 ${i % 2 ? "bg-marca text-white" : "bg-marca-escura text-white"}`}
                >
                  <h3 className="text-[1.375rem]">{etapa.quando}</h3>
                  <ul className="flex flex-col gap-2">
                    {etapa.passos.map((passo) => (
                      <li key={passo} className="flex gap-3">
                        <span aria-hidden className="mt-2 size-2 shrink-0 rounded-full bg-verde" />
                        {passo}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
              <li className="flex flex-col justify-between gap-4 bg-verde p-5 text-marca-escura sm:p-6">
                <h3 className="text-[1.375rem]">Embarque</h3>
                <p>Chegue alguns dias antes da aula para acertar chip, transporte e o caminho até a escola.</p>
              </li>
            </ol>
          </Capitulo>

          {/* 5 */}
          <Capitulo id="documentos" titulo="Sua mala de documentos">
            <p className="max-w-[60ch] text-xl">
              Marque o que já está pronto — a lista fica guardada neste aparelho para você voltar depois.
            </p>
            <ChecklistDocumentos />
          </Capitulo>

          {/* 6 */}
          <Capitulo id="escola" titulo="Perguntas para escola e agência">
            <p className="max-w-[60ch] text-xl">
              Mande estas perguntas por escrito. Quem responde rápido e claro antes de vender costuma responder depois
              também.
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              {[
                {
                  titulo: "Para a escola",
                  perguntas: PERGUNTAS_ESCOLA,
                  cor: "bg-ceu",
                },
                {
                  titulo: "Para a agência",
                  perguntas: PERGUNTAS_AGENCIA,
                  cor: "bg-marca-escura text-white",
                },
              ].map((bloco) => (
                <div key={bloco.titulo} data-revelar className={`p-5 sm:p-7 ${bloco.cor}`}>
                  <h3 className="text-[1.5rem]">{bloco.titulo}</h3>
                  <ul className="mt-5 flex flex-col gap-3">
                    {bloco.perguntas.map((q) => (
                      <li key={q} className="flex gap-3">
                        <span aria-hidden className="font-display font-extrabold text-verde">
                          ?
                        </span>
                        {q}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Capitulo>

          {/* 7 */}
          <Capitulo id="ciladas" titulo="As ciladas mais comuns">
            <ul className="flex flex-col gap-2">
              {ARMADILHAS.map((a, i) => (
                <li
                  key={a.cilada}
                  data-revelar
                  style={{ "--i": i % 3 } as React.CSSProperties}
                  className="grid gap-2 bg-ceu p-5 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] sm:gap-8 sm:p-6"
                >
                  <h3 className="text-[1.375rem] leading-tight">{a.cilada}</h3>
                  <p>{a.saida}</p>
                </li>
              ))}
            </ul>
          </Capitulo>

          {/* 8 */}
          <Capitulo id="chegada" titulo="Chegando lá">
            <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {CHEGADA.map((c, i) => (
                <li
                  key={c.quando}
                  data-revelar
                  style={{ "--i": i } as React.CSSProperties}
                  className="flex flex-col gap-2 bg-ceu p-5"
                >
                  <h3 className="text-[1.25rem]">{c.quando}</h3>
                  <p>{c.texto}</p>
                </li>
              ))}
            </ol>

            <div className="mt-6 grid gap-6 bg-marca-escura p-6 text-white sm:p-10 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <h3 className="text-[clamp(1.75rem,3vw,2.5rem)]">Pronto para comparar?</h3>
                <p className="mt-3 max-w-[48ch] text-lg">
                  O mesmo curso, na mesma escola, sai mais barato em uma agência do que em outra. Veja quanto lado a
                  lado.
                </p>
              </div>
              <Link
                href="/busca"
                className="inline-flex h-14 items-center justify-center rounded-full bg-verde px-8 text-[1.0625rem] font-semibold text-marca-escura transition-[background-color,scale] duration-200 hover:bg-[#6fcb59] active:scale-[0.97]"
              >
                Comparar pacotes
              </Link>
            </div>
          </Capitulo>
        </main>
      </div>

      <Rodape />
    </>
  );
}

function Capitulo({ id, titulo, children }: { id: string; titulo: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`t-${id}`} className="flex scroll-mt-6 flex-col gap-8">
      <h2 id={`t-${id}`} data-revelar className="text-[clamp(2rem,4vw,3.5rem)]">
        {titulo}
      </h2>
      {children}
    </section>
  );
}
