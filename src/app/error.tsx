"use client";

export default function Erro({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="text-xl font-semibold">Não foi possível carregar os pacotes</h1>
      <p className="mt-2 text-sm text-suave">Tente novamente em alguns instantes.</p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-xl bg-marca px-5 py-2.5 text-sm font-semibold text-white"
      >
        Tentar de novo
      </button>
    </div>
  );
}
