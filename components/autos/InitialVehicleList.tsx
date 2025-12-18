import { Car } from "@/types/car";
import Link from "next/link";

interface InitialVehicleListProps {
  vehicles: Car[];
}

/**
 * Componente Server que renderiza el listado inicial de vehículos en HTML
 * para que sea indexable por motores de búsqueda
 * Oculto visualmente pero presente en el HTML
 */
export default function InitialVehicleList({ vehicles }: InitialVehicleListProps) {
  if (vehicles.length === 0) {
    return null;
  }

  return (
    <div className="sr-only" aria-hidden="true">
      <ul>
        {vehicles.map((vehicle) => {
          const brand = vehicle.taxonomies?.brand?.[0] || "";
          const model = vehicle.taxonomies?.model?.[0] || "";
          const year = vehicle.year || "";
          const price = vehicle.price_usd && vehicle.price_usd > 0 
            ? vehicle.price_usd 
            : vehicle.price_ars || 0;
          const currency = vehicle.price_usd && vehicle.price_usd > 0 ? "USD" : "ARS";
          
          return (
            <li key={vehicle.id}>
              <Link href={`/autos/${vehicle.id}`}>
                {brand} {model} {year} - {currency === "USD" ? `U$${price}` : `$${price}`} - Córdoba
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

