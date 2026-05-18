import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DeleteButton } from "@/app/components/admin/DeleteButton";
import { deleteMerch } from "@/app/actions/admin-loyalty";
import { formatMoney } from "@/lib/cart";

export default async function MerchAdminPage() {
  const items = await prisma.merchProduct.findMany({ orderBy: [{ featured: "desc" }, { createdAt: "desc" }] });

  return (
    <div className="space-y-10">
      <header className="flex items-end justify-between border-b border-border pb-6">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-[0.32em] text-voltra">§ 09 / Merch</span>
          <h1 className="mt-3 font-display text-5xl">Merch Catalog</h1>
          <p className="mt-2 text-sm text-text-muted">{items.length} SKUs</p>
        </div>
        <Link href="/admin/merch/new" className="clip-sharp inline-flex items-center gap-2 bg-voltra px-5 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-black hover:bg-voltra-acid">
          + New Merch
        </Link>
      </header>

      <table className="w-full border-collapse border border-border bg-surface font-mono text-xs">
        <thead className="bg-bg text-left uppercase tracking-[0.18em] text-text-dim">
          <tr>
            <th className="border-b border-border p-3">Name</th>
            <th className="border-b border-border p-3">Category</th>
            <th className="border-b border-border p-3">Price</th>
            <th className="border-b border-border p-3">Stock / Reserved</th>
            <th className="border-b border-border p-3">Featured</th>
            <th className="border-b border-border p-3">Status</th>
            <th className="border-b border-border p-3"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((m) => (
            <tr key={m.id} className="border-b border-border last:border-b-0">
              <td className="p-3">
                <Link href={`/admin/merch/${m.id}`} className="text-text hover:text-voltra">{m.name}</Link>
              </td>
              <td className="p-3 text-text-muted">{m.category}</td>
              <td className="p-3 text-voltra">{formatMoney(m.priceCents, m.currency)}</td>
              <td className="p-3">
                <span className="text-text tabular">{m.stock}</span>
                {m.reserved > 0 && <span className="text-text-dim"> · {m.reserved} held</span>}
              </td>
              <td className="p-3">{m.featured ? <span className="text-voltra">★</span> : <span className="text-text-dim">—</span>}</td>
              <td className="p-3">
                <span className={m.active ? "text-voltra" : "text-text-dim"}>{m.active ? "Live" : "Hidden"}</span>
              </td>
              <td className="p-3 text-right"><DeleteButton id={m.id} action={deleteMerch} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
