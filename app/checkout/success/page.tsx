import Link from "next/link";
import Image from "next/image";

import { prisma } from "@/lib/prisma";
import { clearCart, formatMoney } from "@/lib/cart";
import { getStripe } from "@/lib/stripe";

type Props = {
  searchParams: Promise<{ session_id?: string; order?: string; demo?: string }>;
};

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const sp = await searchParams;

  // Resolve order: either by Stripe session id, or by order param (demo mode).
  let order = null;
  if (sp.session_id) {
    order = await prisma.order.findUnique({
      where: { stripeSessionId: sp.session_id },
      include: { items: { include: { product: true } } },
    });

    // If webhook hasn't fired yet (or in dev), best-effort confirm via Stripe API
    if (order && order.status === "PENDING") {
      const stripe = getStripe();
      if (stripe) {
        try {
          const s = await stripe.checkout.sessions.retrieve(sp.session_id);
          if (s.payment_status === "paid") {
            await prisma.$transaction(async (tx) => {
              await tx.order.update({
                where: { id: order!.id },
                data: { status: "PAID", paidAt: new Date(), stripePaymentIntent: typeof s.payment_intent === "string" ? s.payment_intent : null },
              });
              for (const item of order!.items) {
                await tx.merchProduct.update({
                  where: { id: item.productId },
                  data: { stock: { decrement: item.quantity }, reserved: { decrement: item.quantity } },
                });
              }
              if (order!.userId) {
                await tx.user.update({
                  where: { id: order!.userId },
                  data: { rewardPoints: { increment: Math.floor(order!.totalCents / 100) } },
                });
              }
            });
            order = await prisma.order.findUnique({
              where: { id: order!.id },
              include: { items: { include: { product: true } } },
            });
          }
        } catch {
          // Fall through with PENDING status; webhook will eventually sync.
        }
      }
    }
  } else if (sp.order) {
    order = await prisma.order.findUnique({
      where: { id: sp.order },
      include: { items: { include: { product: true } } },
    });
  }

  // Always clear the cart on this page.
  await clearCart();

  return (
    <div className="relative isolate min-h-screen bg-bg">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-[80vh] w-[80vw] -translate-x-1/2 animate-drift">
          <div className="halo opacity-50" />
          <Image
            src="/logo.svg"
            alt=""
            fill
            sizes="80vw"
            className="object-contain opacity-25 drop-shadow-[0_0_120px_rgba(0,255,65,0.4)]"
          />
        </div>
      </div>

      <main className="relative mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
        <span className="font-mono text-[11px] uppercase tracking-[0.32em] text-voltra">
          § Order / Confirmed
        </span>
        <h1 className="mt-6 font-display text-[clamp(4rem,12vw,11rem)] leading-[0.85] tracking-[-0.02em]">
          <span className="text-gradient-green">Roar.</span>
        </h1>
        <p className="mt-6 max-w-md font-mono text-xs uppercase tracking-[0.22em] text-text-muted">
          {sp.demo
            ? "Demo checkout complete — no charge. In production, Stripe handles the payment."
            : order?.status === "PAID"
              ? "Your order is in. Tracking goes out within 48 hours."
              : "Payment processing — we'll email the confirmation."}
        </p>

        {order && (
          <div className="mt-12 w-full clip-tag border border-border bg-surface p-6 text-left">
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-text-dim">
              <span>Order · {order.id}</span>
              <span className={order.status === "PAID" ? "text-voltra" : "text-text-muted"}>
                {order.status}
              </span>
            </div>
            <ul className="mt-4 divide-y divide-border border-y border-border">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center justify-between py-3 font-mono text-xs uppercase tracking-[0.18em]">
                  <span className="text-text">{item.nameSnapshot} × {item.quantity}</span>
                  <span className="text-voltra tabular">{formatMoney(item.unitPriceCents * item.quantity, order.currency)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-end justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-text-dim">Total</span>
              <span className="font-display text-4xl text-gradient-green tabular">{formatMoney(order.totalCents, order.currency)}</span>
            </div>
          </div>
        )}

        <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="clip-sharp bg-voltra px-6 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-black hover:bg-voltra-acid"
          >
            → Home
          </Link>
          <Link
            href="/profile"
            className="clip-tag border border-border bg-surface px-6 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-text-muted hover:border-voltra hover:text-voltra"
          >
            View Profile
          </Link>
        </div>
      </main>
    </div>
  );
}
