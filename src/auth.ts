import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { roleEnum, utilisateurs } from "@/db/schema";

export const identifiantsSchema = z.object({
  courriel: z.string().trim().toLowerCase().max(254).pipe(z.email()),
  motDePasse: z.string().min(1).max(200),
});

const roleSchema = z.enum(roleEnum.enumValues);

// Comparé quand le courriel est inconnu, pour que la réponse prenne le même temps
// qu'avec un courriel connu et ne révèle pas quels comptes existent.
const HACHE_FACTICE = bcrypt.hashSync("aucun-compte", 12);

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/connexion" },
  providers: [
    Credentials({
      credentials: { courriel: {}, motDePasse: {} },
      async authorize(saisie) {
        const identifiants = identifiantsSchema.safeParse(saisie);
        if (!identifiants.success) return null;

        const [utilisateur] = await getDb()
          .select()
          .from(utilisateurs)
          .where(eq(utilisateurs.courriel, identifiants.data.courriel))
          .limit(1);

        const correct = await bcrypt.compare(
          identifiants.data.motDePasse,
          utilisateur?.motDePasseHache ?? HACHE_FACTICE,
        );
        if (!utilisateur || !correct) return null;

        return {
          id: utilisateur.id,
          email: utilisateur.courriel,
          name: utilisateur.nom,
          role: utilisateur.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.role = user.role;
      return token;
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      const role = roleSchema.safeParse(token.role);
      if (role.success) session.user.role = role.data;
      return session;
    },
  },
});
