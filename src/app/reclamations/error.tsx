"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function ErreurReclamations({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-4 p-6">
      <Alert variant="destructive" role="alert">
        <AlertTitle>Les réclamations n&apos;ont pas pu être chargées.</AlertTitle>
        <AlertDescription>
          Le problème vient de notre côté, pas de votre saisie. Réessayez dans
          un instant.
        </AlertDescription>
      </Alert>
      <Button onClick={reset} variant="outline" className="self-start">
        Réessayer
      </Button>
    </main>
  );
}
