import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { seDeconnecter } from "./connexion/actions";

const LIBELLES_ROLE = { conseiller: "Conseiller", responsable: "Responsable" };

export default function Accueil() {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <Suspense
        fallback={<p className="text-sm text-muted-foreground">Chargement…</p>}
      >
        <Bienvenue />
      </Suspense>
    </main>
  );
}

async function Bienvenue() {
  const session = await auth();
  if (!session?.user) redirect("/connexion");

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Réclamations clients</CardTitle>
        <CardDescription>
          Connecté : {session.user.name}
          {session.user.role && ` (${LIBELLES_ROLE[session.user.role]})`}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          Les écrans de gestion des réclamations arrivent dans les prochaines
          étapes.
        </p>
        <Link href="/reclamations" className="text-sm underline underline-offset-4">
          Voir les réclamations
        </Link>
        {session.user.role === "responsable" && (
          <Link
            href="/administration"
            className="text-sm underline underline-offset-4"
          >
            Administration et jeu de données
          </Link>
        )}
        <form action={seDeconnecter}>
          <Button type="submit" variant="outline">
            Se déconnecter
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
