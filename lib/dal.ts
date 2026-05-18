import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const verifySession = cache(async () => {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session;
});

export async function requireAuth(redirectTo: string = "/login") {
  const session = await verifySession();
  if (!session) redirect(redirectTo);
  return session;
}

export async function requireRole(
  role: "ADMIN" | "EDITOR",
  redirectTo: string = "/login"
) {
  const session = await requireAuth(redirectTo);
  const allowed =
    session.user.role === "ADMIN" ||
    (role === "EDITOR" && session.user.role === "EDITOR");
  if (!allowed) redirect("/");
  return session;
}

export const getCurrentUser = cache(async () => {
  const session = await verifySession();
  if (!session) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      locale: true,
      region: true,
      country: true,
      newsletter: true,
      rewardPoints: true,
      tier: true,
      createdAt: true,
    },
  });
  return user;
});
