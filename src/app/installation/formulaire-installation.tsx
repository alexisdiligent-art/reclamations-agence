"use client";

import { useActionState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { creerPremierCompte, type EtatInstallation } from "./actions";

const etatInitial: EtatInstallation = {};

export function FormulaireInstallation() {
  const [etat, action, enCours] = useActionState(
    creerPremierCompte,
    etatInitial,
  );

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      {etat.erreur && (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{etat.erreur}</AlertDescription>
        </Alert>
      )}
      <div className="flex flex-col gap-2">
        <Label htmlFor="nom">Nom</Label>
        <Input
          id="nom"
          name="nom"
          autoComplete="name"
          defaultValue={etat.nom}
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="courriel">Courriel</Label>
        <Input
          id="courriel"
          name="courriel"
          type="email"
          autoComplete="username"
          defaultValue={etat.courriel}
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="motDePasse">Mot de passe (12 caractères au moins)</Label>
        <Input
          id="motDePasse"
          name="motDePasse"
          type="password"
          autoComplete="new-password"
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="confirmation">Mot de passe, une seconde fois</Label>
        <Input
          id="confirmation"
          name="confirmation"
          type="password"
          autoComplete="new-password"
          required
        />
      </div>
      <Button type="submit" disabled={enCours}>
        {enCours ? "Création en cours…" : "Créer le compte responsable"}
      </Button>
    </form>
  );
}
