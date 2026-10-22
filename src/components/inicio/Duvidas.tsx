// Fichas de arquivo empilhadas: cada pergunta tem sua aba; uma aberta por vez (<details name>).
const DUVIDAS = [
  {
    aba: "Preço",
    pergunta: "A InterWorld cobra alguma taxa?",
    resposta:
      "Não. Você paga à escola ou à agência o preço que aparece aqui. Quando você fecha com uma agência parceira pelo nosso link, ela nos paga uma comissão — por isso o comparador é gratuito.",
  },
  {
    aba: "Compra",
    pergunta: "Eu compro o intercâmbio aqui?",
    resposta:
      "Não: comparamos e levamos você até a oferta. Matrícula, pagamento, seguro e orientação de visto são feitos com a agência que você escolher.",
  },
  {
    aba: "Euro",
    pergunta: "Por que os preços estão em euro?",
    resposta:
      "Porque as escolas cotam em moeda estrangeira e assim dá para comparar agências sem a variação do câmbio no meio. Na hora de pagar, a agência converte pelo câmbio do dia.",
  },
  {
    aba: "Pacote",
    pergunta: "O que está incluído no preço?",
    resposta:
      "O curso pelo número de semanas indicado e, quando aparece “com acomodação”, a hospedagem nesse período. Passagem, seguro e visto ficam fora e variam de pessoa para pessoa.",
  },
  {
    aba: "Diferença",
    pergunta: "Por que a mesma escola tem preços diferentes?",
    resposta:
      "Cada agência negocia descontos e comissões com as escolas e repassa uma parte. É o mesmo curso, na mesma escola — a diferença fica no seu bolso.",
  },
];

const CORES = ["bg-marca-escura text-white", "bg-marca text-white", "bg-verde text-marca-escura"];

export function Duvidas() {
  return (
    <section aria-labelledby="titulo-duvidas" className="py-[clamp(5rem,10vw,9rem)]">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 id="titulo-duvidas" data-revelar className="mb-12 text-[clamp(2.25rem,4.6vw,4.25rem)]">
            Antes de você perguntar
          </h2>
          <div data-revelar className="flex flex-col">
            {DUVIDAS.map((d, i) => (
              <details
                key={d.aba}
                name="duvidas"
                open={i === 0}
                className={`group relative ${i ? "-mt-3" : ""} ${CORES[i % CORES.length]}`}
                style={{ zIndex: i }}
              >
                <summary className="flex cursor-pointer list-none items-start justify-between gap-6 px-5 pt-5 pb-8 sm:px-8 [&::-webkit-details-marker]:hidden">
                  <span className="text-xl font-semibold leading-snug">{d.pergunta}</span>
                  <span className="flex shrink-0 items-center gap-3 text-[0.9375rem] font-semibold">
                    <span className="hidden sm:inline">{d.aba}</span>
                    <span
                      aria-hidden
                      className="grid size-8 place-items-center rounded-full bg-white/20 text-xl transition-transform duration-300 group-open:rotate-45"
                    >
                      +
                    </span>
                  </span>
                </summary>
                <p className="max-w-[56ch] px-5 pb-9 text-[1.0625rem] sm:px-8">{d.resposta}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
