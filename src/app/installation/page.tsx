import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getDb } from "@/db";
import { utilisateurs } from "@/db/schema";
import { FormulaireInstallation } from "./formulaire-installation";

export const metadata: Metadata = {
  title: "Installation · Réclamations clients",
};

export default function PageInstallation() {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <Suspense
        fallback={<p className="text-sm text-muted-foreground">Chargement…</p>}
      >
        <Installation />
      </Suspense>
    </main>
  );
}

// Cette page n'existe que tant qu'aucun compte n'a été créé.
async function Installation() {
  // À évaluer à chaque visite, jamais pendant la construction du site.
  await connection();
  const comptes = await getDb().$count(utilisateurs);
  if (comptes > 0) redirect("/connexion");

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Premier compte</CardTitle>
        <CardDescription>
          Créez le compte du responsable de l&apos;agence. Cette page se ferme
          dès qu&apos;un compte existe.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FormulaireInstallation />
      </CardContent>
    </Card>
  );
}
