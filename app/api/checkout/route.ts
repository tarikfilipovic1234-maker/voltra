import { NextResponse, type NextRequest } from "next/server";

import { clearCart, getCart } from "@/lib/cart";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";

/**
 * POST /api/checkout
 *
 * Flow:
 *  1. Build a server-side snapshot of the cart from the cookie
 *  2. Reserve stock atomically (decrement `stock`, increment `reserved`) — fails fast on oversell
 *  3. Persist a PENDING Order record with `expiresAt = +30min`
 *  4. If Stripe configured → create a Checkout Session, redirect there
 *     Else (demo mode)         → mark order PAID immediately and redirect to success page
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  const cart = await getCart();

  if (cart.lines.length === 0) {
    return NextResponse.redirect(new URL("/cart", req.url));
  }

  // ─── Reserve inventory atomically (no oversell) ─────────────────────
  try {
    await prisma.$transaction(async (tx) => {
      for (const line of cart.lines) {
        // updateMany returns count; only succeeds when stock - reserved >= quantity
        const ok = await tx.merchProduct.updateMany({
          where: {
            id: line.productId,
            stock: { gte: line.quantity },
          },
          data: { reserved: { increment: line.quantity } },
        });
        if (ok.count !== 1) {
          throw new Error(`Sold out: ${line.product.name}`);
        }
      }
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Out of stock.";
    const url = new URL("/cart", req.url);
    url.searchParams.set("error", message);
    return NextResponse.redirect(url, { status: 303 });
  }

  // ─── Persist a PENDING Order ────────────────────────────────────────
  const orderData = await prisma.order.create({
    data: {
      userId: session?.user?.id ?? null,
      email: session?.user?.email ?? null,
      status: "PENDING",
      subtotalCents: cart.subtotalCents,
      shippingCents: 0,
      taxCents: 0,
      totalCents: cart.subtotalCents,
      currency: cart.currency,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      items: {
        create: cart.lines.map((l) => ({
          productId: l.productId,
          quantity: l.quantity,
          unitPriceCents: l.product.priceCents,
          nameSnapshot: l.product.name,
        })),
      },
    },
  });

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;
  const stripe = getStripe();

  // ─── Demo mode: no Stripe configured → mark paid immediately ────────
  if (!stripe) {
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderData.id },
        data: { status: "PAID", paidAt: new Date() },
      });
      // Commit the reserved inventory permanently
      for (const line of cart.lines) {
        await tx.merchProduct.update({
          where: { id: line.productId },
          data: {
            stock: { decrement: line.quantity },
            reserved: { decrement: line.quantity },
          },
        });
      }
    });
    await clearCart();
    return NextResponse.redirect(
      new URL(`/checkout/success?demo=1&order=${orderData.id}`, siteUrl),
      { status: 303 }
    );
  }

  // ─── Stripe Checkout Session ────────────────────────────────────────
  const stripeSession = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: cart.lines.map((l) => ({
      quantity: l.quantity,
      price_data: {
        currency: cart.currency.toLowerCase(),
        unit_amount: l.product.priceCents,
        product_data: {
          name: l.product.name,
          description: l.product.description.slice(0, 200),
        },
      },
    })),
    success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/checkout/cancel?order=${orderData.id}`,
    customer_email: session?.user?.email ?? undefined,
    metadata: { orderId: orderData.id },
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
  });

  await prisma.order.update({
    where: { id: orderData.id },
    data: { stripeSessionId: stripeSession.id },
  });

  return NextResponse.redirect(stripeSession.url!, { status: 303 });
}
