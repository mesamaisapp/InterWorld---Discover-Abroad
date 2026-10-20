const eur = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export function formatarEuro(valor: number) {
  return eur.format(valor);
}

export function formatarSemanas(semanas: number) {
  return semanas === 1 ? "1 semana" : `${semanas} semanas`;
}
