"use server";

import { inArray, like, or } from "drizzle-orm";
import { refresh } from "next/cache";
import { getDb } from "@/db";
import {
  DOMAINE_COMPTES_FICTIFS,
  genererJeuDeDonnees,
  PREFIXE_CLIENTS_FICTIFS,
} from "@/db/jeu-de-donnees";
import { clients, historique, reclamations, utilisateurs } from "@/db/schema";
import { exigerResponsable } from "@/lib/session";

export type EtatGeneration = { message?: string; erreur?: string };

export async function regenererJeuDeDonnees(): Promise<EtatGeneration> {
  const responsable = await exigerResponsable();
  const db = getDb();
  const jeu = genererJeuDeDonnees(new Date());

  const clientsFictifs = db
    .select({ id: clients.id })
    .from(clients)
    .where(like(clients.numeroClient, `${PREFIXE_CLIENTS_FICTIFS}%`));
  const comptesFictifs = db
    .select({ id: utilisateurs.id })
    .from(utilisateurs)
    .where(like(utilisateurs.courriel, `%${DOMAINE_COMPTES_FICTIFS}`));

  try {
    // Un seul lot, tout ou rien : on efface l'ancien jeu fictif puis on recrée le nouveau.
    // L'historique part avec ses réclamations (suppression en cascade).
    await db.batch([
      db
        .delete(reclamations)
        .where(
          or(
            inArray(reclamations.clientId, clientsFictifs),
            inArray(reclamations.conseillerId, comptesFictifs),
          ),
        ),
      db
        .delete(clients)
        .where(like(clients.numeroClient, `${PREFIXE_CLIENTS_FICTIFS}%`)),
      db
        .delete(utilisateurs)
        .where(like(utilisateurs.courriel, `%${DOMAINE_COMPTES_FICTIFS}`)),
      db.insert(utilisateurs).values(jeu.comptes),
      db.insert(clients).values(jeu.clients),
      db.insert(reclamations).values(jeu.reclamations),
      db.insert(historique).values(jeu.historique),
    ]);
  } catch (erreur) {
    console.error("Jeu de données : la génération a échoué.", erreur);
    return { erreur: "La génération a échoué. Rien n'a été modifié." };
  }

  // Fait relire la page par le serveur, pour que les compteurs affichent le nouveau contenu.
  refresh();
  console.info(
    `Jeu de données régénéré par ${responsable.email} : ${jeu.reclamations.length} réclamations, ${jeu.clients.length} clients, ${jeu.comptes.length} comptes.`,
  );
  return {
    message: `Jeu de données généré : ${jeu.reclamations.length} réclamations, ${jeu.clients.length} clients, ${jeu.comptes.length} comptes fictifs.`,
  };
}
