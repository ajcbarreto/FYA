import { RouteLoading } from "@/components/route-loading";

export default function PetsLoading() {
  return (
    <RouteLoading
      title="A carregar catalogo..."
      subtitle="Estamos a buscar os pets disponiveis."
    />
  );
}
