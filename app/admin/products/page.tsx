import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DeleteButton } from "@/app/components/admin/DeleteButton";
import { deleteProduct } from "@/app/actions/admin";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({ orderBy: { code: "asc" } });

  return (
    <div className="space-y-10">
      <header className="flex items-end justify-between border-b border-border pb-6">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-[0.32em] text-voltra">§ 02 / Products</span>
          <h1 className="mt-3 font-display text-5xl">Product Catalog</h1>
          <p className="mt-2 text-sm text-text-muted">{products.length} SKUs</p>
        </div>
        <Link
          href="/admin/products/new"
          className="clip-sharp inline-flex items-center gap-2 bg-voltra px-5 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-black transition-transform hover:-translate-y-[1px] hover:bg-voltra-acid"
        >
          + New Product
        </Link>
      </header>

      <ul className="grid gap-px bg-border lg:grid-cols-2">
        {products.map((p) => (
          <li key={p.id} className="group bg-bg p-6 transition-colors hover:bg-surface">
            <div className="flex items-start justify-between">
              <Link href={`/admin/products/${p.id}`}>
                <div className="flex items-center gap-3">
                  <span
                    className="block h-3 w-3 rounded-full"
                    style={{ background: p.accentColor }}
                  />
                  <h2 className="font-display text-3xl">{p.name}</h2>
                </div>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
                  {p.code} · {p.flavor}
                </p>
              </Link>
              <DeleteButton id={p.id} action={deleteProduct} />
            </div>
            <p className="mt-4 text-sm text-text-muted line-clamp-2">{p.description}</p>
            <dl className="mt-4 flex flex-wrap items-center gap-4 font-mono text-[10px] uppercase tracking-[0.22em]">
              <span className="text-text-dim">Regions <span className="text-voltra">{p.regions}</span></span>
              <span className="text-text-dim">Caf <span className="text-voltra">{p.caffeineMg}mg</span></span>
              <span className="text-text-dim">Sugar <span className="text-voltra">{p.sugarG}g</span></span>
              <span className={`ml-auto ${p.active ? "text-voltra" : "text-text-dim"}`}>{p.active ? "Live" : "Hidden"}</span>
            </dl>
          </li>
        ))}
      </ul>
    </div>
  );
}
