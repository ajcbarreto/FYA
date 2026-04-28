import { RouteLoading } from "@/components/route-loading";

export default function PetDetailsLoading() {
  return (
    <RouteLoading
      title="A carregar detalhes..."
      subtitle="Estamos a preparar a ficha completa do pet."
    />
  );
}
