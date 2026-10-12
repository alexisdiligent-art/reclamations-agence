import { defineConfig } from "drizzle-kit";

// Sert uniquement à générer les fichiers de migration à partir du schéma.
// Les migrations sont jouées par scripts/migrate.mjs pendant le déploiement.
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
});
