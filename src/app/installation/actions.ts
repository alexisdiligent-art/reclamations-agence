"use server";

import bcrypt from "bcryptjs";
import { sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb } from "@/db";

export type EtatInstallation = {
  erreur?: string;
  nom?: string;
  courriel?: string;
};

const premierCompteSchema = z
  .object({
    nom: z.string().trim().min(1).max(100),
    courriel: z.string().trim().toLowerCase().max(254).pipe(z.email()),
    motDePasse: z.string().min(12).max(200),
    confirmation: z.string(),
  })
  .refine((saisie) => saisie.motDePasse === saisie.confirmation);

export async function creerPremierCompte(
  _etat: EtatInstallation,
  formulaire: FormData,
): Promise<EtatInstallation> {
  const nom = String(formulaire.get("nom") ?? "");
  const courriel = String(formulaire.get("courriel") ?? "");
  const saisie = premierCompteSchema.safeParse({
    nom,
    courriel,
    motDePasse: formulaire.get("motDePasse"),
    confirmation: formulaire.get("confirmation"),
  });
  if (!saisie.success) {
    return {
      erreur:
        "Vérifiez la saisie : un nom, un courriel valide, et deux fois le même mot de passe d'au moins 12 caractères.",
      nom,
      courriel,
    };
  }

  const motDePasseHache = await bcrypt.hash(saisie.data.motDePasse, 12);

  let cree: boolean;
  try {
    // Une seule requête : le compte n'est inséré que si la table est encore vide,
    // pour que cette page ne puisse jamais créer un second responsable.
    const resultat = await getDb().execute(sql`
      insert into utilisateurs (courriel, nom, mot_de_passe_hache, role)
      select ${saisie.data.courriel}, ${saisie.data.nom}, ${motDePasseHache}, 'responsable'
      where not exists (select 1 from utilisateurs)
      returning id
    `);
    cree = resultat.rows.length === 1;
  } catch (erreur) {
    console.error("Installation : la création du premier compte a échoué.", erreur);
    return {
      erreur: "La création du compte a échoué. Réessayez dans un instant.",
      nom,
      courriel,
    };
  }

  if (!cree) {
    return { erreur: "L'installation est déjà faite : un compte existe." };
  }
  console.info("Installation : premier compte responsable créé.");
  redirect("/connexion");
}
