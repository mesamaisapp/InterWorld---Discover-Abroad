// Esqueleto exibido no primeiro carregamento (streaming do Server Component)
export default function Carregando() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse px-4 py-10 sm:px-6">
      <div className="mb-8 h-10 w-2/3 rounded-lg bg-borda" />
      <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-8">
        <div className="hidden h-[480px] rounded-2xl bg-borda lg:block" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 2xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="h-64 rounded-2xl bg-borda" />
          ))}
        </div>
      </div>
    </div>
  );
}
