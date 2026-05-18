import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/cart";
import { OrderStatusSelect } from "@/app/components/admin/OrderStatusSelect";

export default async function OrdersAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const filter = sp.status;

  const [orders, byStatus, byStatusReward] = await Promise.all([
    prisma.order.findMany({
      where: filter ? { status: filter } : {},
      include: { items: true, user: { select: { email: true, name: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.order.groupBy({
      by: ["status"],
      _count: { _all: true },
      _sum: { totalCents: true },
    }),
    prisma.rewardOrder.findMany({
      include: { items: { include: { item: true } }, user: { select: { email: true, name: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  return (
    <div className="space-y-12">
      <header className="border-b border-border pb-6">
        <span className="font-mono text-[11px] uppercase tracking-[0.32em] text-voltra">§ 10 / Orders</span>
        <h1 className="mt-3 font-display text-5xl">Orders & Fulfillment</h1>
      </header>

      <section>
        <div className="flex items-end justify-between border-b border-border pb-3">
          <h2 className="font-display text-3xl">Merch (cash)</h2>
          <div className="flex gap-2">
            <Filter href="/admin/orders" label="All" active={!filter} />
            {byStatus.map((s) => (
              <Filter
                key={s.status}
                href={`/admin/orders?status=${s.status}`}
                label={`${s.status} · ${s._count._all}`}
                active={filter === s.status}
              />
            ))}
          </div>
        </div>

        <table className="mt-4 w-full border-collapse border border-border bg-surface font-mono text-xs">
          <thead className="bg-bg text-left uppercase tracking-[0.18em] text-text-dim">
            <tr>
              <th className="border-b border-border p-3">When</th>
              <th className="border-b border-border p-3">Order ID</th>
              <th className="border-b border-border p-3">Customer</th>
              <th className="border-b border-border p-3">Items</th>
              <th className="border-b border-border p-3">Total</th>
              <th className="border-b border-border p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-border last:border-b-0">
                <td className="p-3 text-text-muted">{o.createdAt.toISOString().slice(0, 16).replace("T", " ")}</td>
                <td className="p-3 text-text">{o.id.slice(-8)}</td>
                <td className="p-3 text-text-muted">
                  {o.user?.name ?? o.user?.email ?? o.email ?? "guest"}
                </td>
                <td className="p-3 text-text">{o.items.length} × items</td>
                <td className="p-3 text-voltra tabular">{formatMoney(o.totalCents, o.currency)}</td>
                <td className="p-3"><OrderStatusSelect id={o.id} status={o.status} /></td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-text-dim">No orders match.</td></tr>
            )}
          </tbody>
        </table>
      </section>

      <section>
        <h2 className="font-display text-3xl border-b border-border pb-3">Reward Redemptions (points)</h2>
        <table className="mt-4 w-full border-collapse border border-border bg-surface font-mono text-xs">
          <thead className="bg-bg text-left uppercase tracking-[0.18em] text-text-dim">
            <tr>
              <th className="border-b border-border p-3">When</th>
              <th className="border-b border-border p-3">User</th>
              <th className="border-b border-border p-3">Items</th>
              <th className="border-b border-border p-3">Points Spent</th>
              <th className="border-b border-border p-3">Status</th>
              <th className="border-b border-border p-3">Ship To</th>
            </tr>
          </thead>
          <tbody>
            {byStatusReward.map((o) => (
              <tr key={o.id} className="border-b border-border last:border-b-0">
                <td className="p-3 text-text-muted">{o.createdAt.toISOString().slice(0, 10)}</td>
                <td className="p-3 text-text">{o.user.name ?? o.user.email ?? "—"}</td>
                <td className="p-3 text-text-muted">
                  {o.items.map((i) => `${i.item.name} × ${i.quantity}`).join(", ")}
                </td>
                <td className="p-3 text-voltra tabular">−{o.pointsTotal.toLocaleString()}</td>
                <td className="p-3 text-voltra">{o.status}</td>
                <td className="p-3 text-text-dim normal-case">
                  {o.shippingName}, {o.shippingCity} {o.shippingCountry}
                </td>
              </tr>
            ))}
            {byStatusReward.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-text-dim">No reward redemptions yet.</td></tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function Filter({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.22em] transition-colors ${
        active ? "border-voltra bg-voltra/10 text-voltra" : "border-border text-text-muted hover:text-text"
      }`}
    >
      {label}
    </Link>
  );
}
