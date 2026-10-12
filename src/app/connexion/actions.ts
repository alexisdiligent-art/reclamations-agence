"use server";

import { AuthError } from "next-auth";
import { identifiantsSchema, signIn, signOut } from "@/auth";

export type EtatConnexion = { erreur?: string; courriel?: string };

export async function seConnecter(
  _etat: EtatConnexion,
  formulaire: FormData,
): Promise<EtatConnexion> {
  const courriel = String(formulaire.get("courriel") ?? "");
  const identifiants = identifiantsSchema.safeParse({
    courriel,
    motDePasse: formulaire.get("motDePasse"),
  });
  if (!identifiants.success) {
    return {
      erreur: "Saisissez une adresse de courriel valide et votre mot de passe.",
      courriel,
    };
  }

  try {
    await signIn("credentials", { ...identifiants.data, redirectTo: "/" });
  } catch (erreur) {
    if (erreur instanceof AuthError) {
      if (erreur.type === "CredentialsSignin") {
        return { erreur: "Courriel ou mot de passe incorrect.", courriel };
      }
      return {
        erreur:
          "La connexion est momentanément indisponible. Réessayez dans un instant.",
        courriel,
      };
    }
    // signIn redirige en levant une exception : il faut la laisser passer.
    throw erreur;
  }
  return {};
}

export async function seDeconnecter() {
  await signOut({ redirectTo: "/connexion" });
}
