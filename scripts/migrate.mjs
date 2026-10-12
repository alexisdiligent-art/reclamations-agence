// Joue les migrations du dossier drizzle/ sur la base désignée par les variables d'environnement.
// Lancé par Vercel avant la construction du site (voir vercel.json).
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";

const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
if (!url) {
  console.error("Migrations : DATABASE_URL est absente des variables d'environnement.");
  process.exit(1);
}

await migrate(drizzle(neon(url)), { migrationsFolder: "./drizzle" });
console.log("Migrations : la base est à jour.");
