import Link from "next/link";

import { prisma } from "@/lib/prisma";

type Props = {
  searchParams: Promise<{ order?: string }>;
};

export default async function CheckoutCancelPage({ searchParams }: Props) {
  const sp = await searchParams;

  // If the order is still PENDING, release its inventory reservation.
  if (sp.order) {
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: sp.order! },
        include: { items: true },
      });
      if (!order || order.status !== "PENDING") return;
      await tx.order.update({
        where: { id: order.id },
        data: { status: "CANCELLED" },
      });
      for (const item of order.items) {
        await tx.merchProduct.update({
          where: { id: item.productId },
          data: { reserved: { decrement: item.quantity } },
        });
      }
    });
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 py-16 text-center">
      <span className="font-mono text-[11px] uppercase tracking-[0.32em] text-text-muted">§ Checkout / Cancelled</span>
      <h1 className="mt-6 font-display text-7xl leading-[0.85] tracking-[-0.02em] text-text">No charge.</h1>
      <p className="mt-4 font-mono text-xs uppercase tracking-[0.22em] text-text-muted">
        Inventory released. The cart's still loaded — come back when you're ready.
      </p>
      <div className="mt-10 flex gap-3">
        <Link href="/cart" className="clip-sharp bg-voltra px-6 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-black hover:bg-voltra-acid">
          ← Back to Cart
        </Link>
        <Link href="/shop" className="clip-tag border border-border bg-surface px-6 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-text-muted hover:border-voltra hover:text-voltra">
          Shop
        </Link>
      </div>
    </main>
  );
}
