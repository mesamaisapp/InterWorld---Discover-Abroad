import { urlFoto, type FotoDestino } from "@/lib/destinos";

/** Foto da cidade servida pelo Wikimedia Commons; o fundo marinho segura o lugar enquanto carrega. */
export function FotoCidade({
  foto,
  largura = 1280,
  className = "",
  prioridade = false,
}: {
  foto: FotoDestino;
  largura?: number;
  className?: string;
  prioridade?: boolean;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- o Commons já entrega a foto redimensionada
    <img
      src={urlFoto(foto, largura)}
      alt={foto.legenda}
      loading={prioridade ? "eager" : "lazy"}
      fetchPriority={prioridade ? "high" : "auto"}
      decoding="async"
      className={`bg-marca-escura object-cover ${className}`}
    />
  );
}
