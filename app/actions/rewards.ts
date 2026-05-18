"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { verifySession } from "@/lib/dal";
import { redeemRewardItem } from "@/lib/loyalty";

export type RewardCheckoutState =
  | { ok?: boolean; error?: string; orderId?: string; pointsSpent?: number }
  | undefined;

const ShippingSchema = z.object({
  itemId: z.string().min(1),
  shippingName: z.string().trim().min(1, "Name required").max(120),
  shippingLine1: z.string().trim().min(1, "Address required").max(200),
  shippingCity: z.string().trim().min(1, "City required").max(80),
  shippingZip: z.string().trim().min(1, "ZIP required").max(20),
  shippingCountry: z.string().trim().length(2, "ISO-2 country code"),
});

export async function checkoutReward(
  _prev: RewardCheckoutState,
  formData: FormData
): Promise<RewardCheckoutState> {
  const session = await verifySession();
  if (!session) return { error: "Sign in to redeem rewards." };

  const parsed = ShippingSchema.safeParse({
    itemId: formData.get("itemId"),
    shippingName: formData.get("shippingName"),
    shippingLine1: formData.get("shippingLine1"),
    shippingCity: formData.get("shippingCity"),
    shippingZip: formData.get("shippingZip"),
    shippingCountry: String(formData.get("shippingCountry") ?? "").toUpperCase(),
  });
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Check the shipping fields.",
    };
  }

  try {
    const order = await redeemRewardItem(session.user.id, parsed.data);
    revalidatePath("/", "layout");
    return { ok: true, orderId: order.id, pointsSpent: order.pointsTotal };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Redemption failed." };
  }
}
