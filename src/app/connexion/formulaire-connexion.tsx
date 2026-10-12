"use client";

import { useActionState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { seConnecter, type EtatConnexion } from "./actions";

const etatInitial: EtatConnexion = {};

export function FormulaireConnexion() {
  const [etat, action, enCours] = useActionState(seConnecter, etatInitial);

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      {etat.erreur && (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{etat.erreur}</AlertDescription>
        </Alert>
      )}
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
        <Label htmlFor="motDePasse">Mot de passe</Label>
        <Input
          id="motDePasse"
          name="motDePasse"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      <Button type="submit" disabled={enCours}>
        {enCours ? "Connexion en cours…" : "Se connecter"}
      </Button>
    </form>
  );
}
