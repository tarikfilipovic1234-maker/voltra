import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DeleteButton } from "@/app/components/admin/DeleteButton";
import { deleteRewardItem } from "@/app/actions/admin-loyalty";

export default async function RewardsAdminPage() {
  const items = await prisma.rewardItem.findMany({ orderBy: { pointsCost: "asc" } });

  return (
    <div className="space-y-10">
      <header className="flex items-end justify-between border-b border-border pb-6">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-[0.32em] text-voltra">§ 08 / Rewards</span>
          <h1 className="mt-3 font-display text-5xl">Reward Catalog</h1>
          <p className="mt-2 text-sm text-text-muted">{items.length} items</p>
        </div>
        <Link href="/admin/rewards/new" className="clip-sharp inline-flex items-center gap-2 bg-voltra px-5 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-black hover:bg-voltra-acid">
          + New Item
        </Link>
      </header>

      <table className="w-full border-collapse border border-border bg-surface font-mono text-xs">
        <thead className="bg-bg text-left uppercase tracking-[0.18em] text-text-dim">
          <tr>
            <th className="border-b border-border p-3">Name</th>
            <th className="border-b border-border p-3">Category</th>
            <th className="border-b border-border p-3">Cost</th>
            <th className="border-b border-border p-3">Stock</th>
            <th className="border-b border-border p-3">Tier</th>
            <th className="border-b border-border p-3">Status</th>
            <th className="border-b border-border p-3"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((r) => (
            <tr key={r.id} className="border-b border-border last:border-b-0">
              <td className="p-3">
                <Link href={`/admin/rewards/${r.id}`} className="text-text hover:text-voltra">{r.name}</Link>
                <p className="mt-1 text-text-dim normal-case tracking-normal">{r.description}</p>
              </td>
              <td className="p-3 text-text-muted">{r.category}</td>
              <td className="p-3 text-voltra tabular">{r.pointsCost.toLocaleString()}</td>
              <td className="p-3 text-text">{r.stock}</td>
              <td className="p-3 text-text-muted">{r.tier ?? "—"}</td>
              <td className="p-3">
                <span className={r.active ? "text-voltra" : "text-text-dim"}>{r.active ? "Live" : "Hidden"}</span>
              </td>
              <td className="p-3 text-right"><DeleteButton id={r.id} action={deleteRewardItem} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
