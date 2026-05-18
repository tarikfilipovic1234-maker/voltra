"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";

type ModStatus = "APPROVED" | "REJECTED" | "PENDING";

export async function moderateReview(id: string, status: ModStatus) {
  const session = await requireRole("EDITOR");
  await prisma.review.update({
    where: { id },
    data: {
      status,
      moderatedAt: new Date(),
      moderatedBy: session.user.id,
    },
  });
  revalidatePath("/admin/reviews");
}

export async function moderateComment(id: string, status: ModStatus) {
  const session = await requireRole("EDITOR");
  await prisma.comment.update({
    where: { id },
    data: {
      status,
      moderatedAt: new Date(),
      moderatedBy: session.user.id,
    },
  });
  revalidatePath("/admin/comments");
}

export async function deleteReview(id: string) {
  await requireRole("EDITOR");
  await prisma.review.delete({ where: { id } });
  revalidatePath("/admin/reviews");
}

export async function deleteComment(id: string) {
  await requireRole("EDITOR");
  await prisma.comment.delete({ where: { id } });
  revalidatePath("/admin/comments");
}

export async function resolveReport(
  id: string,
  status: "RESOLVED" | "DISMISSED",
  resolution?: string
) {
  const session = await requireRole("EDITOR");
  await prisma.report.update({
    where: { id },
    data: {
      status,
      resolution: resolution ?? null,
      resolvedAt: new Date(),
      resolvedBy: session.user.id,
    },
  });
  revalidatePath("/admin/reports");
}

export async function banUser(id: string, reason: string) {
  await requireRole("ADMIN");
  await prisma.user.update({
    where: { id },
    data: { banned: true, bannedReason: reason, bannedAt: new Date() },
  });
  revalidatePath("/admin/users");
  revalidatePath("/admin/reports");
}

export async function unbanUser(id: string) {
  await requireRole("ADMIN");
  await prisma.user.update({
    where: { id },
    data: { banned: false, bannedReason: null, bannedAt: null },
  });
  revalidatePath("/admin/users");
}
