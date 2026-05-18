import { notFound } from "next/navigation";

import { saveProduct } from "@/app/actions/admin";
import { prisma } from "@/lib/prisma";
import { CheckField, Field } from "@/app/components/admin/Field";
import { FormShell } from "@/app/components/admin/FormShell";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const p = await prisma.product.findUnique({ where: { id } });
  if (!p) notFound();

  return (
    <FormShell title={`Edit · ${p.name}`} eyebrow={`§ Products / ${p.code}`} backHref="/admin/products">
      <form
        action={async (fd) => {
          "use server";
          await saveProduct(id, fd);
        }}
        className="grid gap-6"
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Name" name="name" required defaultValue={p.name} />
          <Field label="Code (SKU)" name="code" required defaultValue={p.code} />
        </div>
        <Field label="Slug" name="slug" defaultValue={p.slug} />
        <Field label="Flavor" name="flavor" required defaultValue={p.flavor} />
        <Field label="Description" name="description" rows={4} required defaultValue={p.description} />
        <div className="grid gap-6 sm:grid-cols-4">
          <Field label="Caffeine (mg)" name="caffeineMg" type="number" defaultValue={p.caffeineMg} />
          <Field label="Sugar (g)" name="sugarG" type="number" defaultValue={p.sugarG} />
          <Field label="Calories" name="calories" type="number" defaultValue={p.calories} />
          <Field label="Juice %" name="juicePct" type="number" defaultValue={p.juicePct} />
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Accent Color" name="accentColor" defaultValue={p.accentColor} />
          <Field label="Badge" name="badge" defaultValue={p.badge ?? ""} />
        </div>
        <Field label="Regions (CSV)" name="regions" defaultValue={p.regions} />
        <CheckField name="active" label="Active" defaultChecked={p.active} />
        <div className="flex items-center gap-3 border-t border-border pt-6">
          <button
            type="submit"
            className="clip-sharp inline-flex items-center gap-3 bg-voltra px-7 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-black transition-transform hover:-translate-y-[1px] hover:bg-voltra-acid"
          >
            Save →
          </button>
          <a href="/admin/products" className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-dim hover:text-text">Cancel</a>
        </div>
      </form>
    </FormShell>
  );
}
