"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";

export type RedeemState =
  | {
      ok?: boolean;
      error?: string;
      pointsAwarded?: number;
      newBalance?: number;
      campaign?: string;
    }
  | undefined;

const CodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .min(3, "Code is too short")
  .max(40, "Code is too long")
  .regex(/^[A-Z0-9-]+$/, "Use letters, numbers and dashes only");

export async function redeemPromoCode(
  _prev: RedeemState,
  formData: FormData
): Promise<RedeemState> {
  const session = await verifySession();
  if (!session) return { error: "Sign in to redeem points." };

  const parsed = CodeSchema.safeParse(formData.get("code"));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid code format." };
  }
  const code = parsed.data;

  // Atomic transaction:
  //  1. Look up the code, validate it's active + not expired
  //  2. Ensure the user hasn't already redeemed it
  //  3. Ensure global redemption cap hasn't been hit
  //  4. Increment user.rewardPoints + create Redemption + increment redeemedCount
  //  5. Bump user tier if they crossed a threshold
  try {
    const result = await prisma.$transaction(async (tx) => {
      const promo = await tx.promoCode.findUnique({ where: { code } });
      if (!promo) throw new Error("This code doesn't exist.");
      if (!promo.active) throw new Error("This code has been retired.");
      if (promo.expiresAt && promo.expiresAt < new Date()) {
        throw new Error("This code has expired.");
      }
      if (promo.redeemedCount >= promo.maxRedemptions) {
        throw new Error("This code has reached its redemption limit.");
      }
      const already = await tx.redemption.findUnique({
        where: { codeId_userId: { codeId: promo.id, userId: session.user.id } },
      });
      if (already) throw new Error("You've already redeemed this code.");

      await tx.redemption.create({
        data: {
          codeId: promo.id,
          userId: session.user.id,
          pointsAwarded: promo.points,
        },
      });
      await tx.promoCode.update({
        where: { id: promo.id },
        data: { redeemedCount: { increment: 1 } },
      });
      const user = await tx.user.update({
        where: { id: session.user.id },
        data: { rewardPoints: { increment: promo.points } },
        select: { rewardPoints: true, tier: true },
      });

      // Tier promotion thresholds
      let newTier = user.tier;
      if (user.rewardPoints >= 5000) newTier = "APEX";
      else if (user.rewardPoints >= 1000) newTier = "SURGE";
      if (newTier !== user.tier) {
        await tx.user.update({
          where: { id: session.user.id },
          data: { tier: newTier },
        });
      }

      return {
        pointsAwarded: promo.points,
        newBalance: user.rewardPoints,
        campaign: promo.campaign ?? null,
      };
    });

    revalidatePath("/", "layout");
    return {
      ok: true,
      pointsAwarded: result.pointsAwarded,
      newBalance: result.newBalance,
      campaign: result.campaign ?? undefined,
    };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Redemption failed." };
  }
}
