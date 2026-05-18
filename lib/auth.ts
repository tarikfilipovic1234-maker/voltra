import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Discord from "next-auth/providers/discord";
import Facebook from "next-auth/providers/facebook";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

// Only enable a provider if its env vars are populated. Lets the UI render
// social buttons conditionally and avoids the Auth.js "client_id is required"
// crashes when keys are missing.
const providers = [
  Credentials({
    name: "Email",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const parsed = z
        .object({
          email: z.string().email(),
          password: z.string().min(1),
        })
        .safeParse(credentials);
      if (!parsed.success) return null;

      const user = await prisma.user.findUnique({
        where: { email: parsed.data.email },
      });
      if (!user || !user.passwordHash) return null;

      const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
      if (!ok) return null;

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      };
    },
  }),
];

if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    })
  );
}
if (process.env.AUTH_DISCORD_ID && process.env.AUTH_DISCORD_SECRET) {
  providers.push(
    Discord({
      clientId: process.env.AUTH_DISCORD_ID,
      clientSecret: process.env.AUTH_DISCORD_SECRET,
      allowDangerousEmailAccountLinking: true,
    })
  );
}
if (process.env.AUTH_FACEBOOK_ID && process.env.AUTH_FACEBOOK_SECRET) {
  providers.push(
    Facebook({
      clientId: process.env.AUTH_FACEBOOK_ID,
      clientSecret: process.env.AUTH_FACEBOOK_SECRET,
      allowDangerousEmailAccountLinking: true,
    })
  );
}

export const enabledOAuthProviders = providers
  .map((p) => (typeof p === "function" ? null : p.id))
  .filter((id): id is string => Boolean(id) && id !== "credentials");

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers,
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.uid = user.id;
      }
      // Pull fresh role/locale/region from DB so role changes take effect
      // without forcing the user to log out + back in.
      if (token.uid && (trigger === "update" || !token.role)) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.uid as string },
          select: { role: true, locale: true, region: true, tier: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.locale = dbUser.locale;
          token.region = dbUser.region;
          token.tier = dbUser.tier;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.uid) {
        session.user.id = token.uid as string;
        session.user.role = (token.role as string) ?? "USER";
        session.user.locale = (token.locale as string) ?? "en";
        session.user.region = (token.region as string) ?? "NA";
        session.user.tier = (token.tier as string) ?? "ROOKIE";
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      // First-touch tier + admin bootstrap.
      if (
        process.env.ADMIN_EMAIL &&
        user.email === process.env.ADMIN_EMAIL
      ) {
        await prisma.user.update({
          where: { id: user.id! },
          data: { role: "ADMIN", tier: "APEX", rewardPoints: 1000 },
        });
      } else {
        await prisma.user.update({
          where: { id: user.id! },
          data: { rewardPoints: 100 },
        });
      }
    },
  },
});
