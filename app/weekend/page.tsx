import WeekendPageForRound from "./[round]/page";
import { getRelevantWeekend } from "@/lib/api/f1";
import { notFound } from "next/navigation";

export const revalidate = 300;

export default async function WeekendPage() {
  const weekend = await getRelevantWeekend();

  if (!weekend) {
    notFound();
  }

  return (
    <WeekendPageForRound 
      params={Promise.resolve({ round: String(weekend.round) })} 
    />
  );
}
