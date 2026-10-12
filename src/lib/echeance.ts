const MOIS_DE_DELAI = 2;
const JOURS_D_ALERTE = 7;
const JOUR = 24 * 60 * 60 * 1000;

// Règle métier : la réponse est due deux mois, de date à date, après la réception.
// Si le jour n'existe pas dans le mois d'arrivée (31 décembre → février), on prend le dernier jour du mois.
export function calculerEcheance(recueLe: Date): Date {
  const echeance = new Date(recueLe);
  const jour = echeance.getUTCDate();
  echeance.setUTCDate(1);
  echeance.setUTCMonth(echeance.getUTCMonth() + MOIS_DE_DELAI);
  const dernierJourDuMois = new Date(
    Date.UTC(echeance.getUTCFullYear(), echeance.getUTCMonth() + 1, 0),
  ).getUTCDate();
  echeance.setUTCDate(Math.min(jour, dernierJourDuMois));
  return echeance;
}

export type EtatEcheance = "dans_les_temps" | "proche" | "en_retard" | "close";

// Une réclamation clôturée n'est plus jamais « en retard », même si elle l'a été.
export function etatEcheance(
  echeanceLe: Date,
  cloturee: boolean,
  maintenant: Date,
): EtatEcheance {
  if (cloturee) return "close";
  const reste = echeanceLe.getTime() - maintenant.getTime();
  if (reste < 0) return "en_retard";
  if (reste <= JOURS_D_ALERTE * JOUR) return "proche";
  return "dans_les_temps";
}
