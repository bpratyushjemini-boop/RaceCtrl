import { getDriversList } from "@/lib/api/f1";
import { FavoritesManager } from "@/components/favorites/FavoritesManager";

export const revalidate = 3600;

export default async function FavoritesPage() {
  const allDrivers = await getDriversList();

  return <FavoritesManager allDrivers={allDrivers} />;
}
