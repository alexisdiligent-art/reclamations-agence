const MOIS_DE_DELAI = 2;

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
