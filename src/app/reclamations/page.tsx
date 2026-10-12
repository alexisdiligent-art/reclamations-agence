import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { and, asc, eq, lt, ne, sql, type SQL } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getDb } from "@/db";
import {
  clients,
  reclamations,
  statutEnum,
  utilisateurs,
  type Statut,
} from "@/db/schema";
import { etatEcheance } from "@/lib/echeance";
import { LIBELLES_MOTIF, LIBELLES_STATUT } from "@/lib/libelles";
import { exigerSession } from "@/lib/session";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Réclamations · Réclamations clients",
};

type Filtres = { statut?: Statut; retard: boolean };

const FORMAT_DATE = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "Europe/Paris",
});

// Les filtres viennent de l'adresse de la page : tout ce qui n'est pas attendu est ignoré.
function lireFiltres(
  parametres: Record<string, string | string[] | undefined>,
): Filtres {
  const statut = statutEnum.enumValues.find((s) => s === parametres.statut);
  return { statut, retard: parametres.retard === "1" };
}

function adresse({ statut, retard }: Filtres) {
  const parametres = new URLSearchParams();
  if (statut) parametres.set("statut", statut);
  if (retard) parametres.set("retard", "1");
  const requete = parametres.toString();
  return requete ? `/reclamations?${requete}` : "/reclamations";
}

export default function PageReclamations({
  searchParams,
}: PageProps<"/reclamations">) {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-6">
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="text-xl font-semibold">Réclamations</h1>
        <Link href="/" className="text-sm underline underline-offset-4">
          Retour à l&apos;accueil
        </Link>
      </div>
      <Suspense fallback={<Chargement />}>
        <Liste parametres={searchParams} />
      </Suspense>
    </main>
  );
}

function Chargement() {
  return (
    <div className="flex flex-col gap-3" aria-busy="true">
      <span className="sr-only">Chargement des réclamations…</span>
      <Skeleton className="h-8 w-full max-w-xl" />
      {Array.from({ length: 8 }, (_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}

async function Liste({
  parametres,
}: {
  parametres: PageProps<"/reclamations">["searchParams"];
}) {
  const utilisateur = await exigerSession();
  const filtres = lireFiltres(await parametres);
  const maintenant = new Date();

  const conditions: SQL[] = [];
  // Règle d'accès : un conseiller ne voit que les réclamations qui lui sont attribuées.
  if (utilisateur.role !== "responsable") {
    conditions.push(eq(reclamations.conseillerId, utilisateur.id));
  }
  if (filtres.statut) conditions.push(eq(reclamations.statut, filtres.statut));
  if (filtres.retard) {
    conditions.push(
      ne(reclamations.statut, "cloturee"),
      lt(reclamations.echeanceLe, maintenant),
    );
  }

  const lignes = await getDb()
    .select({
      id: reclamations.id,
      reference: reclamations.reference,
      objet: reclamations.objet,
      motif: reclamations.motif,
      statut: reclamations.statut,
      echeanceLe: reclamations.echeanceLe,
      clientPrenom: clients.prenom,
      clientNom: clients.nom,
      conseiller: utilisateurs.nom,
    })
    .from(reclamations)
    .innerJoin(clients, eq(reclamations.clientId, clients.id))
    .leftJoin(utilisateurs, eq(reclamations.conseillerId, utilisateurs.id))
    .where(and(...conditions))
    // Les dossiers ouverts d'abord, les plus urgents en tête.
    .orderBy(
      sql`${reclamations.statut} = 'cloturee'`,
      asc(reclamations.echeanceLe),
    );

  return (
    <>
      <nav aria-label="Filtres" className="flex flex-wrap items-center gap-2">
        <Filtre
          href={adresse({ retard: filtres.retard })}
          actif={!filtres.statut}
        >
          Tous les statuts
        </Filtre>
        {statutEnum.enumValues.map((statut) => (
          <Filtre
            key={statut}
            href={adresse({ statut, retard: filtres.retard })}
            actif={filtres.statut === statut}
          >
            {LIBELLES_STATUT[statut]}
          </Filtre>
        ))}
        <span className="mx-1 h-5 w-px bg-border" aria-hidden />
        <Filtre
          href={adresse({ statut: filtres.statut, retard: !filtres.retard })}
          actif={filtres.retard}
        >
          En retard seulement
        </Filtre>
      </nav>

      <p className="text-sm text-muted-foreground" role="status">
        {lignes.length === 0
          ? "Aucune réclamation"
          : lignes.length === 1
            ? "1 réclamation"
            : `${lignes.length} réclamations`}
        {utilisateur.role !== "responsable" && " qui vous sont attribuées"}
      </p>

      {lignes.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
          <p>Aucune réclamation ne correspond à ces filtres.</p>
          {(filtres.statut || filtres.retard) && (
            <Link
              href="/reclamations"
              className="mt-2 inline-block underline underline-offset-4"
            >
              Retirer les filtres
            </Link>
          )}
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Référence</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Objet</TableHead>
                <TableHead>Motif</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Conseiller</TableHead>
                <TableHead>Échéance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lignes.map((ligne) => {
                const etat = etatEcheance(
                  ligne.echeanceLe,
                  ligne.statut === "cloturee",
                  maintenant,
                );
                return (
                  <TableRow key={ligne.id}>
                    <TableCell className="font-medium tabular-nums">
                      {ligne.reference}
                    </TableCell>
                    <TableCell>
                      {ligne.clientPrenom} {ligne.clientNom}
                    </TableCell>
                    <TableCell
                      className="max-w-xs truncate"
                      title={ligne.objet}
                    >
                      {ligne.objet}
                    </TableCell>
                    <TableCell>{LIBELLES_MOTIF[ligne.motif]}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          ligne.statut === "cloturee" ? "outline" : "secondary"
                        }
                      >
                        {LIBELLES_STATUT[ligne.statut]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {ligne.conseiller ?? (
                        <span className="text-muted-foreground">
                          Non attribuée
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-2 tabular-nums">
                        {FORMAT_DATE.format(ligne.echeanceLe)}
                        {etat === "en_retard" && (
                          <Badge variant="destructive">En retard</Badge>
                        )}
                        {etat === "proche" && (
                          <Badge variant="outline">Échéance proche</Badge>
                        )}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}

function Filtre({
  href,
  actif,
  children,
}: {
  href: string;
  actif: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={actif ? "true" : undefined}
      className={cn(
        "rounded-full border px-3 py-1 text-sm transition-colors",
        actif
          ? "border-primary bg-primary text-primary-foreground"
          : "hover:bg-muted",
      )}
    >
      {children}
    </Link>
  );
}
