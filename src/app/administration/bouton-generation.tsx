"use client";

import { useActionState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { regenererJeuDeDonnees, type EtatGeneration } from "./actions";

const etatInitial: EtatGeneration = {};

export function BoutonGeneration() {
  const [etat, action, enCours] = useActionState(
    regenererJeuDeDonnees,
    etatInitial,
  );

  return (
    <form action={action} className="flex flex-col gap-3">
      {etat.erreur && (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{etat.erreur}</AlertDescription>
        </Alert>
      )}
      {etat.message && (
        <Alert role="status">
          <AlertDescription>{etat.message}</AlertDescription>
        </Alert>
      )}
      <Button type="submit" disabled={enCours} className="self-start">
        {enCours ? "Génération en cours…" : "Générer le jeu de données"}
      </Button>
    </form>
  );
}
