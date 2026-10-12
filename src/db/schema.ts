import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

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
