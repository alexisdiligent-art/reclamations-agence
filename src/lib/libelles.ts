import type { Motif, Statut } from "@/db/schema";

export const LIBELLES_STATUT: Record<Statut, string> = {
  nouvelle: "Nouvelle",
  en_cours: "En cours",
  en_attente_client: "En attente client",
  a_valider: "À valider",
  cloturee: "Clôturée",
};

export const LIBELLES_MOTIF: Record<Motif, string> = {
  frais_bancaires: "Frais bancaires",
  carte: "Carte",
  credit: "Crédit",
  virement: "Virement",
  assurance: "Assurance",
  accueil: "Accueil",
  autre: "Autre",
};
