import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

// À appeler dans chaque page et chaque action réservée au responsable :
// le contrôle se fait ici, côté serveur, pas en masquant un bouton à l'écran.
export async function exigerResponsable() {
  const session = await auth();
  if (!session?.user) redirect("/connexion");
  if (session.user.role !== "responsable") {
    console.warn(
      `Accès refusé : ${session.user.email} (${session.user.role ?? "sans rôle"}) a tenté d'ouvrir une zone réservée au responsable.`,
    );
    redirect("/");
  }
  return session.user;
}
