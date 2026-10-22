// Esqueleto exibido no primeiro carregamento (streaming do Server Component)
export default function Carregando() {
  return (
    <div className="animate-pulse">
      <div className="h-[76px] bg-superficie" />
      <div className="h-[180px] bg-marca-escura sm:h-[240px]" />
      <div className="mx-auto max-w-[1400px] bg-ceu px-4 py-6 sm:px-8 lg:grid lg:grid-cols-[300px_1fr] lg:gap-8 lg:py-10">
        <div className="hidden h-[520px] bg-ceu lg:block" />
        <div className="flex flex-col gap-4">
          <div className="h-16 bg-ceu" />
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="h-52 bg-ceu" />
          ))}
        </div>
      </div>
    </div>
  );
}
