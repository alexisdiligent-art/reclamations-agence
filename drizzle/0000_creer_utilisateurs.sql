CREATE TYPE "public"."role" AS ENUM('conseiller', 'responsable');--> statement-breakpoint
CREATE TABLE "utilisateurs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"courriel" text NOT NULL,
	"nom" text NOT NULL,
	"mot_de_passe_hache" text NOT NULL,
	"role" "role" DEFAULT 'conseiller' NOT NULL,
	"cree_le" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "utilisateurs_courriel_unique" UNIQUE("courriel")
);
