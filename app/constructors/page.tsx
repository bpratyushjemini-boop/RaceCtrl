import { redirect } from "next/navigation";

export default function ConstructorsPage() {
  redirect("/standings?tab=constructors");
}
