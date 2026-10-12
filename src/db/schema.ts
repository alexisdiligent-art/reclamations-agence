import {
  index,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["conseiller", "responsable"]);

export const utilisateurs = pgTable("utilisateurs", {
  id: uuid("id").primaryKey().defaultRandom(),
  courriel: text("courriel").notNull().unique(),
  nom: text("nom").notNull(),
  motDePasseHache: text("mot_de_passe_hache").notNull(),
  role: roleEnum("role").notNull().default("conseiller"),
  creeLe: timestamp("cree_le", { withTimezone: true }).notNull().defaultNow(),
});

export type Role = (typeof roleEnum.enumValues)[number];

// Cycle de vie d'une réclamation : voir la section « Décisions » d'AGENTS.md.
export const statutEnum = pgEnum("statut_reclamation", [
  "nouvelle",
  "en_cours",
  "en_attente_client",
  "a_valider",
  "cloturee",
]);

export type Statut = (typeof statutEnum.enumValues)[number];

export const motifEnum = pgEnum("motif_reclamation", [
  "frais_bancaires",
  "carte",
  "credit",
  "virement",
  "assurance",
  "accueil",
  "autre",
]);

export type Motif = (typeof motifEnum.enumValues)[number];

export const clients = pgTable("clients", {
  id: uuid("id").primaryKey().defaultRandom(),
  numeroClient: text("numero_client").notNull().unique(),
  nom: text("nom").notNull(),
  prenom: text("prenom").notNull(),
  courriel: text("courriel"),
  telephone: text("telephone"),
  creeLe: timestamp("cree_le", { withTimezone: true }).notNull().defaultNow(),
});

export const reclamations = pgTable(
  "reclamations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reference: text("reference").notNull().unique(),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id),
    // Vide tant que la réclamation est « nouvelle » et que personne ne l'a prise en charge.
    conseillerId: uuid("conseiller_id").references(() => utilisateurs.id),
    objet: text("objet").notNull(),
    description: text("description").notNull(),
    motif: motifEnum("motif").notNull(),
    montantEnJeu: numeric("montant_en_jeu", { precision: 12, scale: 2 }),
    statut: statutEnum("statut").notNull().default("nouvelle"),
    recueLe: timestamp("recue_le", { withTimezone: true }).notNull(),
    // Règle métier : réponse due deux mois après la réception.
    echeanceLe: timestamp("echeance_le", { withTimezone: true }).notNull(),
    clotureeLe: timestamp("cloturee_le", { withTimezone: true }),
    creeLe: timestamp("cree_le", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("reclamations_statut_idx").on(table.statut),
    index("reclamations_conseiller_idx").on(table.conseillerId),
    index("reclamations_client_idx").on(table.clientId),
  ],
);

// Une ligne par changement de statut : qui, quand, de quoi vers quoi.
export const historique = pgTable(
  "historique",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reclamationId: uuid("reclamation_id")
      .notNull()
      .references(() => reclamations.id, { onDelete: "cascade" }),
    auteurId: uuid("auteur_id").references(() => utilisateurs.id),
    ancienStatut: statutEnum("ancien_statut"),
    nouveauStatut: statutEnum("nouveau_statut").notNull(),
    commentaire: text("commentaire"),
    creeLe: timestamp("cree_le", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("historique_reclamation_idx").on(table.reclamationId)],
);
