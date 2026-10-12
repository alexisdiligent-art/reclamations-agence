CREATE TYPE "public"."motif_reclamation" AS ENUM('frais_bancaires', 'carte', 'credit', 'virement', 'assurance', 'accueil', 'autre');--> statement-breakpoint
CREATE TYPE "public"."statut_reclamation" AS ENUM('nouvelle', 'en_cours', 'en_attente_client', 'a_valider', 'cloturee');--> statement-breakpoint
CREATE TABLE "clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"numero_client" text NOT NULL,
	"nom" text NOT NULL,
	"prenom" text NOT NULL,
	"courriel" text,
	"telephone" text,
	"cree_le" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "clients_numero_client_unique" UNIQUE("numero_client")
);
--> statement-breakpoint
CREATE TABLE "historique" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reclamation_id" uuid NOT NULL,
	"auteur_id" uuid,
	"ancien_statut" "statut_reclamation",
	"nouveau_statut" "statut_reclamation" NOT NULL,
	"commentaire" text,
	"cree_le" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reclamations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reference" text NOT NULL,
	"client_id" uuid NOT NULL,
	"conseiller_id" uuid,
	"objet" text NOT NULL,
	"description" text NOT NULL,
	"motif" "motif_reclamation" NOT NULL,
	"montant_en_jeu" numeric(12, 2),
	"statut" "statut_reclamation" DEFAULT 'nouvelle' NOT NULL,
	"recue_le" timestamp with time zone NOT NULL,
	"echeance_le" timestamp with time zone NOT NULL,
	"cloturee_le" timestamp with time zone,
	"cree_le" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reclamations_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
ALTER TABLE "historique" ADD CONSTRAINT "historique_reclamation_id_reclamations_id_fk" FOREIGN KEY ("reclamation_id") REFERENCES "public"."reclamations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "historique" ADD CONSTRAINT "historique_auteur_id_utilisateurs_id_fk" FOREIGN KEY ("auteur_id") REFERENCES "public"."utilisateurs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reclamations" ADD CONSTRAINT "reclamations_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reclamations" ADD CONSTRAINT "reclamations_conseiller_id_utilisateurs_id_fk" FOREIGN KEY ("conseiller_id") REFERENCES "public"."utilisateurs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "historique_reclamation_idx" ON "historique" USING btree ("reclamation_id");--> statement-breakpoint
CREATE INDEX "reclamations_statut_idx" ON "reclamations" USING btree ("statut");--> statement-breakpoint
CREATE INDEX "reclamations_conseiller_idx" ON "reclamations" USING btree ("conseiller_id");--> statement-breakpoint
CREATE INDEX "reclamations_client_idx" ON "reclamations" USING btree ("client_id");