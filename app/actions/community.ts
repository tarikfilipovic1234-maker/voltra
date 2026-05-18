"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { autoModerate, REPORT_REASONS } from "@/lib/moderation";

const TARGET_TYPES_REVIEW = ["PRODUCT", "ATHLETE", "ARTICLE"] as const;
const TARGET_TYPES_COMMENT = ["ARTICLE", "VIDEO", "EVENT"] as const;

export type CommunityState =
  | { ok?: boolean; error?: string; pending?: boolean }
  | undefined;

// ─── Reviews ────────────────────────────────────────────────────────────
const ReviewSchema = z.object({
  targetType: z.enum(TARGET_TYPES_REVIEW),
  targetId: z.string().min(1).max(40),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().trim().min(3, "Title too short").max(120),
  body: z.string().trim().min(10, "Tell us a bit more").max(2000),
  redirectTo: z.string().optional(),
});

export async function submitReview(
  _prev: CommunityState,
  formData: FormData
): Promise<CommunityState> {
  const session = await verifySession();
  if (!session) return { error: "Sign in to leave a review." };
  if (session.user && (session.user as { banned?: boolean }).banned) {
    return { error: "Account suspended." };
  }

  const parsed = ReviewSchema.safeParse({
    targetType: formData.get("targetType"),
    targetId: formData.get("targetId"),
    rating: formData.get("rating"),
    title: formData.get("title"),
    body: formData.get("body"),
    redirectTo: formData.get("redirectTo"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form." };
  }

  const status = autoModerate({ title: parsed.data.title, body: parsed.data.body });

  await prisma.review.create({
    data: {
      userId: session.user.id,
      targetType: parsed.data.targetType,
      targetId: parsed.data.targetId,
      rating: parsed.data.rating,
      title: parsed.data.title,
      body: parsed.data.body,
      status,
    },
  });

  if (parsed.data.redirectTo) revalidatePath(parsed.data.redirectTo);
  revalidatePath("/admin/reviews");
  return { ok: true, pending: status === "PENDING" };
}

// ─── Comments ───────────────────────────────────────────────────────────
const CommentSchema = z.object({
  targetType: z.enum(TARGET_TYPES_COMMENT),
  targetId: z.string().min(1).max(40),
  parentId: z.string().max(40).optional(),
  body: z.string().trim().min(2).max(2000),
  redirectTo: z.string().optional(),
});

export async function submitComment(
  _prev: CommunityState,
  formData: FormData
): Promise<CommunityState> {
  const session = await verifySession();
  if (!session) return { error: "Sign in to comment." };

  const parsed = CommentSchema.safeParse({
    targetType: formData.get("targetType"),
    targetId: formData.get("targetId"),
    parentId: formData.get("parentId") || undefined,
    body: formData.get("body"),
    redirectTo: formData.get("redirectTo"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form." };
  }

  const status = autoModerate({ body: parsed.data.body });

  await prisma.comment.create({
    data: {
      userId: session.user.id,
      targetType: parsed.data.targetType,
      targetId: parsed.data.targetId,
      parentId: parsed.data.parentId ?? null,
      body: parsed.data.body,
      status,
    },
  });

  if (parsed.data.redirectTo) revalidatePath(parsed.data.redirectTo);
  revalidatePath("/admin/comments");
  return { ok: true, pending: status === "PENDING" };
}

// ─── Reports ────────────────────────────────────────────────────────────
const ReportSchema = z.object({
  contentType: z.enum(["REVIEW", "COMMENT"]),
  contentId: z.string().min(1).max(40),
  reason: z.enum(REPORT_REASONS),
  detail: z.string().trim().max(500).optional(),
});

export async function submitReport(
  _prev: CommunityState,
  formData: FormData
): Promise<CommunityState> {
  const session = await verifySession();
  if (!session) return { error: "Sign in to report content." };

  const parsed = ReportSchema.safeParse({
    contentType: formData.get("contentType"),
    contentId: formData.get("contentId"),
    reason: formData.get("reason"),
    detail: formData.get("detail"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form." };
  }

  await prisma.report.create({
    data: {
      submittedById: session.user.id,
      contentType: parsed.data.contentType,
      contentId: parsed.data.contentId,
      reason: parsed.data.reason,
      detail: parsed.data.detail ?? null,
    },
  });

  // Bump the flagCount on the reported content
  if (parsed.data.contentType === "REVIEW") {
    await prisma.review.update({
      where: { id: parsed.data.contentId },
      data: { flagCount: { increment: 1 } },
    });
  } else {
    await prisma.comment.update({
      where: { id: parsed.data.contentId },
      data: { flagCount: { increment: 1 } },
    });
  }

  revalidatePath("/admin/reports");
  return { ok: true };
}
