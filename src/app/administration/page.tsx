import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { and, count, lt, ne } from "drizzle-orm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getDb } from "@/db";
import { clients, reclamations, statutEnum, utilisateurs } from "@/db/schema";
import { LIBELLES_STATUT } from "@/lib/libelles";
import { exigerResponsable } from "@/lib/session";
import { BoutonGeneration } from "./bouton-generation";

export const metadata: Metadata = {
  title: "Administration · Réclamations clients",
};

export default function PageAdministration() {
  return (
    <main className="flex flex-1 items-start justify-center p-6">
      <Suspense
        fallback={<p className="text-sm text-muted-foreground">Chargement…</p>}
      >
        <Administration />
      </Suspense>
    </main>
  );
}

async function Administration() {
  await exigerResponsable();

  const db = getDb();
  const [parStatut, [enRetard], nombreClients, nombreComptes] =
    await Promise.all([
      db
        .select({ statut: reclamations.statut, nombre: count() })
        .from(reclamations)
        .groupBy(reclamations.statut),
      db
        .select({ nombre: count() })
        .from(reclamations)
        .where(
          and(
            ne(reclamations.statut, "cloturee"),
            lt(reclamations.echeanceLe, new Date()),
          ),
        ),
      db.$count(clients),
      db.$count(utilisateurs),
    ]);

  const nombres = new Map(parStatut.map((l) => [l.statut, l.nombre]));
  const total = parStatut.reduce((somme, l) => somme + l.nombre, 0);

  return (
    <div className="flex w-full max-w-xl flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Contenu de la base</CardTitle>
          <CardDescription>
            {total === 0
              ? "Aucune réclamation pour l'instant."
              : `${total} réclamations, ${nombreClients} clients, ${nombreComptes} comptes.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-2 text-sm">
            {statutEnum.enumValues.map((statut) => (
              <div key={statut} className="contents">
                <dt>{LIBELLES_STATUT[statut]}</dt>
                <dd className="text-right tabular-nums">
                  {nombres.get(statut) ?? 0}
                </dd>
              </div>
            ))}
            <div className="contents font-medium">
              <dt className="border-t pt-2">Échéance dépassée, non clôturées</dt>
              <dd className="border-t pt-2 text-right tabular-nums">
                {enRetard?.nombre ?? 0}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Jeu de données fictif</CardTitle>
          <CardDescription>
            Efface les données fictives et les recrée : 50 réclamations, 30
            clients, 10 comptes. Votre propre compte est conservé.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BoutonGeneration />
        </CardContent>
      </Card>

      <Link href="/" className="text-sm underline underline-offset-4">
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
