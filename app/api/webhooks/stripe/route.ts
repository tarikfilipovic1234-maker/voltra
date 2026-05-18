import { NextResponse, type NextRequest } from "next/server";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

// IMPORTANT: Stripe requires the *raw* body to verify signatures.
// Next 16 route handlers give us `req.text()` for that.

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook secret missing" }, { status: 503 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    const body = await req.text();
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (e) {
    return NextResponse.json(
      { error: `Bad signature: ${e instanceof Error ? e.message : "?"}` },
      { status: 400 }
    );
  }

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;
      if (!orderId) break;
      await commitOrder(orderId, session.payment_intent as string | null);
      break;
    }
    case "checkout.session.expired":
    case "checkout.session.async_payment_failed": {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;
      if (!orderId) break;
      await releaseOrder(orderId);
      break;
    }
  }

  return NextResponse.json({ received: true });
}

/**
 * Mark an order PAID and convert its reserved stock to permanent stock decrement.
 * Awards loyalty points (1 pt per $1 spent) if the order is tied to a user.
 */
async function commitOrder(orderId: string, paymentIntent: string | null) {
  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) return;
    if (order.status === "PAID") return; // idempotent

    await tx.order.update({
      where: { id: orderId },
      data: {
        status: "PAID",
        paidAt: new Date(),
        stripePaymentIntent: paymentIntent ?? undefined,
      },
    });
    for (const item of order.items) {
      await tx.merchProduct.update({
        where: { id: item.productId },
        data: {
          stock: { decrement: item.quantity },
          reserved: { decrement: item.quantity },
        },
      });
    }
    if (order.userId) {
      const points = Math.floor(order.totalCents / 100); // $1 = 1 pt
      await tx.user.update({
        where: { id: order.userId },
        data: { rewardPoints: { increment: points } },
      });
    }
  });
}

/**
 * Release reservations on a PENDING order. Idempotent.
 */
async function releaseOrder(orderId: string) {
  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) return;
    if (order.status !== "PENDING") return;

    await tx.order.update({
      where: { id: orderId },
      data: { status: "EXPIRED" },
    });
    for (const item of order.items) {
      await tx.merchProduct.update({
        where: { id: item.productId },
        data: { reserved: { decrement: item.quantity } },
      });
    }
  });
}
