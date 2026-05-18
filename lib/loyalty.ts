import "server-only";
import { prisma } from "@/lib/prisma";

export const CATEGORY_LABELS: Record<string, string> = {
  APPAREL: "Apparel",
  HEADWEAR: "Headwear",
  GAMING: "Gaming",
  ACCESSORIES: "Accessories",
  DIGITAL: "Digital",
};

export const TIER_RANK: Record<string, number> = {
  ROOKIE: 0,
  BEAST: 1,
  LEGEND: 2,
};

export function canUnlock(userTier: string | undefined, itemTier: string | null | undefined) {
  if (!itemTier) return true;
  const u = TIER_RANK[userTier ?? "ROOKIE"] ?? 0;
  const r = TIER_RANK[itemTier] ?? 0;
  return u >= r;
}

export type RewardCheckoutInput = {
  itemId: string;
  shippingName: string;
  shippingLine1: string;
  shippingCity: string;
  shippingZip: string;
  shippingCountry: string;
};

/**
 * Atomically redeems points for a reward item.
 * Throws on insufficient points, out of stock, or tier-gate violation.
 */
export async function redeemRewardItem(
  userId: string,
  input: RewardCheckoutInput
) {
  return prisma.$transaction(async (tx) => {
    const [user, item] = await Promise.all([
      tx.user.findUnique({ where: { id: userId } }),
      tx.rewardItem.findUnique({ where: { id: input.itemId } }),
    ]);
    if (!user) throw new Error("User not found.");
    if (!item) throw new Error("Item not found.");
    if (!item.active) throw new Error("This item is no longer available.");
    if (item.stock <= 0) throw new Error("Sold out.");
    if (!canUnlock(user.tier, item.tier)) {
      throw new Error(`Locked to ${item.tier ?? "—"} tier members.`);
    }
    if (user.rewardPoints < item.pointsCost) {
      throw new Error(
        `Need ${item.pointsCost - user.rewardPoints} more points.`
      );
    }

    // Atomic stock decrement
    const updatedItem = await tx.rewardItem.updateMany({
      where: { id: item.id, stock: { gt: 0 } },
      data: { stock: { decrement: 1 } },
    });
    if (updatedItem.count !== 1) {
      throw new Error("Sold out — someone grabbed the last one.");
    }

    await tx.user.update({
      where: { id: user.id },
      data: { rewardPoints: { decrement: item.pointsCost } },
    });

    return tx.rewardOrder.create({
      data: {
        userId: user.id,
        pointsTotal: item.pointsCost,
        shippingName: input.shippingName,
        shippingLine1: input.shippingLine1,
        shippingCity: input.shippingCity,
        shippingZip: input.shippingZip,
        shippingCountry: input.shippingCountry,
        items: {
          create: {
            itemId: item.id,
            quantity: 1,
            pointsCostEach: item.pointsCost,
          },
        },
      },
      include: { items: { include: { item: true } } },
    });
  });
}
