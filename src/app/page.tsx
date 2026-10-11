import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Réclamations clients</CardTitle>
          <CardDescription>
            Outil de gestion des réclamations pour une agence bancaire
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Le projet est en place. La page de connexion arrive à
            l&apos;étape suivante.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
