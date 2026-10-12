import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Créée au premier appel : sans DATABASE_URL, la construction du site ne doit pas échouer.
let instance: ReturnType<typeof drizzle<typeof schema>> | undefined;

export function getDb() {
  if (!instance) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error("DATABASE_URL est absente des variables d'environnement.");
    }
    instance = drizzle(neon(url), { schema });
  }
  return instance;
}
