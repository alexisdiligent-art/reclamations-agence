import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

// Les contrôles d'accès se font ici, côté serveur, pas en masquant un bouton à l'écran.

export async function exigerSession() {
  const session = await auth();
  if (!session?.user) redirect("/connexion");
  return session.user;
}

export async function exigerResponsable() {
  const utilisateur = await exigerSession();
  if (utilisateur.role !== "responsable") {
    console.warn(
      `Accès refusé : ${utilisateur.email} (${utilisateur.role ?? "sans rôle"}) a tenté d'ouvrir une zone réservée au responsable.`,
    );
    redirect("/");
  }
  return utilisateur;
}
