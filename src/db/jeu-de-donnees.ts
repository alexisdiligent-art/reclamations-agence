import { calculerEcheance } from "@/lib/echeance";
import type {
  clients,
  historique,
  Motif,
  reclamations,
  Statut,
  utilisateurs,
} from "./schema";

// Jeu de données entièrement fictif : aucune personne réelle.
// Tout ce qu'il crée est reconnaissable, pour pouvoir être effacé et rejoué :
// courriels des comptes en @jeu.agence-exemple.fr, numéros de clients en FICT-.
export const DOMAINE_COMPTES_FICTIFS = "@jeu.agence-exemple.fr";
export const PREFIXE_CLIENTS_FICTIFS = "FICT-";

// Ne correspond à aucun mot de passe : ces comptes ne peuvent pas se connecter.
const MOT_DE_PASSE_INUTILISABLE = "!";

const JOUR = 24 * 60 * 60 * 1000;

const COMPTES = [
  { nom: "Nadia Benali", role: "responsable" },
  { nom: "Hugo Lefèvre", role: "responsable" },
  { nom: "Inès Moreau", role: "conseiller" },
  { nom: "Théo Garnier", role: "conseiller" },
  { nom: "Chloé Rousseau", role: "conseiller" },
  { nom: "Karim Haddad", role: "conseiller" },
  { nom: "Manon Petit", role: "conseiller" },
  { nom: "Lucas Fontaine", role: "conseiller" },
  { nom: "Élodie N'Guyen", role: "conseiller" },
  // Cas tordu : un conseiller sans aucune réclamation.
  { nom: "Baptiste Le Gall-Dupré", role: "conseiller" },
] as const;

const PRENOMS = [
  "Aline", "Bruno", "Cécile", "Damien", "Émilie", "Fabrice", "Gaëlle", "Hervé",
  "Isabelle", "Julien", "Karine", "Laurent", "Mathilde", "Nicolas", "Océane",
  "Pascal", "Quentin", "Rachida", "Sébastien", "Thi-Lan",
];
const NOMS = [
  "Durand", "Lambert", "Mercier", "Blanchard", "Marchand", "Perrin", "Renaud",
  "Colin", "Aubert", "Lemoine", "Picard", "Gaillard", "Roussel", "Vasseur",
  "O'Connor", "Le Bihan", "Da Silva", "Müller", "Saint-Étienne", "Diallo",
];

const OBJETS: Record<Motif, string[]> = {
  frais_bancaires: [
    "Contestation de frais de tenue de compte",
    "Commission d'intervention prélevée deux fois",
    "Frais de rejet de prélèvement jugés abusifs",
  ],
  carte: [
    "Paiement par carte débité deux fois",
    "Opération par carte non reconnue",
    "Carte avalée par le distributeur de l'agence",
  ],
  credit: [
    "Désaccord sur le tableau d'amortissement du prêt",
    "Retard dans le déblocage des fonds du crédit",
    "Refus de report d'échéance non expliqué",
  ],
  virement: [
    "Virement non reçu par le bénéficiaire",
    "Virement émis vers un mauvais compte",
    "Délai anormal sur un virement international",
  ],
  assurance: [
    "Assurance moyens de paiement souscrite sans accord",
    "Refus de prise en charge par l'assurance emprunteur",
  ],
  accueil: [
    "Attente excessive au guichet",
    "Rendez-vous annulé sans prévenir",
    "Conseiller injoignable depuis trois semaines",
  ],
  autre: [
    "Clôture de compte non effectuée",
    "Relevés envoyés à une ancienne adresse",
  ],
};
const MOTIFS = Object.keys(OBJETS) as Motif[];

// Répartition des 50 réclamations par statut.
const STATUTS: Statut[] = [
  ...Array<Statut>(8).fill("nouvelle"),
  ...Array<Statut>(14).fill("en_cours"),
  ...Array<Statut>(7).fill("en_attente_client"),
  ...Array<Statut>(6).fill("a_valider"),
  ...Array<Statut>(15).fill("cloturee"),
];

// Tirage reproductible : le même jeu sort à chaque génération.
function creerTirage(graine: number) {
  let etat = graine;
  return () => {
    etat = (etat + 0x6d2b79f5) | 0;
    let t = Math.imul(etat ^ (etat >>> 15), 1 | etat);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function sansAccents(texte: string) {
  return texte
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function genererJeuDeDonnees(maintenant: Date) {
  const hasard = creerTirage(20261012);
  const choisir = <T>(liste: readonly T[]) =>
    liste[Math.floor(hasard() * liste.length)];
  const ilYA = (jours: number) => new Date(maintenant.getTime() - jours * JOUR);

  const comptes: (typeof utilisateurs.$inferInsert & { id: string })[] =
    COMPTES.map((compte) => ({
      id: crypto.randomUUID(),
      nom: compte.nom,
      courriel: `${sansAccents(compte.nom)}${DOMAINE_COMPTES_FICTIFS}`,
      role: compte.role,
      motDePasseHache: MOT_DE_PASSE_INUTILISABLE,
    }));
  const responsables = comptes.filter((c) => c.role === "responsable");
  // Le dernier conseiller reste volontairement sans réclamation.
  const conseillers = comptes
    .filter((c) => c.role === "conseiller")
    .slice(0, -1);

  const listeClients: (typeof clients.$inferInsert & { id: string })[] =
    Array.from({ length: 30 }, (_, i) => {
      const prenom = PRENOMS[i % PRENOMS.length];
      const nom = NOMS[(i * 7 + 3) % NOMS.length];
      // Cas tordus : un client sur dix n'a ni courriel ni téléphone.
      const injoignable = i % 10 === 9;
      return {
        id: crypto.randomUUID(),
        numeroClient: `${PREFIXE_CLIENTS_FICTIFS}${String(i + 1).padStart(4, "0")}`,
        prenom,
        nom,
        courriel: injoignable
          ? null
          : `${sansAccents(prenom)}.${sansAccents(nom)}@client.exemple.fr`,
        telephone: injoignable
          ? null
          : `01 99 00 ${String(10 + i).padStart(2, "0")} ${String(20 + i).padStart(2, "0")}`,
      };
    });

  const listeReclamations: (typeof reclamations.$inferInsert & {
    id: string;
  })[] = [];
  const lignesHistorique: (typeof historique.$inferInsert)[] = [];

  STATUTS.forEach((statut, i) => {
    const motif = choisir(MOTIFS);
    const conseiller = statut === "nouvelle" ? null : choisir(conseillers);
    let client = choisir(listeClients);
    let objet = choisir(OBJETS[motif]);
    let description = `${objet}. Le client demande une explication écrite et, le cas échéant, un remboursement.`;
    let montant: string | null = (20 + Math.floor(hasard() * 480)).toFixed(2);
    // Réception entre 1 et 55 jours avant aujourd'hui, donc dans le délai.
    let recueLe = ilYA(1 + Math.floor(hasard() * 55));
    if (motif === "accueil") montant = null;

    // Cas tordus, placés à des rangs fixes pour être retrouvés facilement.
    if (i === 9 || i === 10) recueLe = ilYA(75 + i); // en cours et en retard
    if (i === 23) recueLe = ilYA(58); // en attente client, échéance dans quelques jours
    if (i === 30) recueLe = ilYA(90); // à valider depuis longtemps, en retard
    if (i === 12) montant = "0.00"; // montant nul
    if (i === 13) montant = "187450.00"; // montant très élevé
    if (i === 14) {
      objet = `${objet} — ${"relance du client, ".repeat(12)}dernière relance`;
    }
    if (i === 15) {
      // Texte à afficher tel quel, jamais à exécuter.
      description = `<script>alert("test")</script> Le client écrit : « C'est inadmissible ! » & exige 100 % du montant.`;
    }
    if (i === 17) client = listeClients[9]; // client injoignable
    if (i === 3 || i === 4) {
      // Deux réclamations du même client, le même jour, sur le même sujet : doublon probable.
      client = listeClients[0];
      objet = OBJETS.carte[0];
      recueLe = ilYA(6);
    }

    const duree = maintenant.getTime() - recueLe.getTime();
    // Cas tordu : une réclamation clôturée le jour même de sa réception.
    const clotureeLe =
      statut === "cloturee"
        ? new Date(recueLe.getTime() + (i === 40 ? 3 * 60 * 60 * 1000 : duree * 0.8))
        : null;

    const id = crypto.randomUUID();
    listeReclamations.push({
      id,
      reference: `REC-${maintenant.getUTCFullYear()}-${String(i + 1).padStart(4, "0")}`,
      clientId: client.id,
      conseillerId: conseiller?.id ?? null,
      objet,
      description,
      motif,
      montantEnJeu: montant,
      statut,
      recueLe,
      echeanceLe: calculerEcheance(recueLe),
      clotureeLe,
      creeLe: recueLe,
    });

    const fin = clotureeLe ?? maintenant;
    const etape = (fraction: number) =>
      new Date(recueLe.getTime() + (fin.getTime() - recueLe.getTime()) * fraction);
    const noter = (
      ancienStatut: Statut | null,
      nouveauStatut: Statut,
      auteurId: string | null,
      creeLe: Date,
      commentaire: string,
    ) =>
      lignesHistorique.push({
        reclamationId: id,
        auteurId,
        ancienStatut,
        nouveauStatut,
        commentaire,
        creeLe,
      });

    noter(null, "nouvelle", null, recueLe, "Réclamation enregistrée.");
    if (statut === "nouvelle" || !conseiller) return;
    noter("nouvelle", "en_cours", conseiller.id, etape(0.2), "Prise en charge.");
    if (statut === "en_attente_client") {
      noter("en_cours", "en_attente_client", conseiller.id, etape(0.5), "Justificatif demandé au client.");
    }
    if (statut === "a_valider" || statut === "cloturee") {
      noter("en_cours", "a_valider", conseiller.id, etape(0.7), "Réponse proposée au responsable.");
    }
    if (statut === "cloturee") {
      noter("a_valider", "cloturee", choisir(responsables).id, fin, "Réponse validée et envoyée au client.");
    }
  });

  return {
    comptes,
    clients: listeClients,
    reclamations: listeReclamations,
    historique: lignesHistorique,
  };
}
