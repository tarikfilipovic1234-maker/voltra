import { notFound } from "next/navigation";

import { saveMerch } from "@/app/actions/admin-loyalty";
import { prisma } from "@/lib/prisma";
import { CheckField, Field } from "@/app/components/admin/Field";
import { FormShell } from "@/app/components/admin/FormShell";

function toLocalDT(d: Date | null | undefined) {
  if (!d) return "";
  return d.toISOString().slice(0, 16);
}

export default async function EditMerchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const m = await prisma.merchProduct.findUnique({ where: { id } });
  if (!m) notFound();

  return (
    <FormShell title={`Edit · ${m.name}`} eyebrow="§ Merch / Edit" backHref="/admin/merch">
      <form
        action={async (fd) => {
          "use server";
          await saveMerch(id, fd);
        }}
        className="grid gap-6"
      >
        <Field label="Name" name="name" required defaultValue={m.name} />
        <Field label="Slug" name="slug" defaultValue={m.slug} />
        <Field label="Description" name="description" rows={4} required defaultValue={m.description} />
        <Field label="Image URL" name="imageUrl" defaultValue={m.imageUrl ?? ""} />
        <div className="grid gap-6 sm:grid-cols-3">
          <Field label="Price (cents)" name="priceCents" type="number" defaultValue={m.priceCents} />
          <Field label="Currency" name="currency" defaultValue={m.currency} />
          <Field label="Stock" name="stock" type="number" defaultValue={m.stock} hint={`${m.reserved} currently reserved`} />
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          <Field
            label="Category"
            name="category"
            defaultValue={m.category}
            options={["APPAREL", "HEADWEAR", "ACCESSORIES", "COLLAB", "DROP"].map((v) => ({ value: v, label: v }))}
          />
          <Field label="Drop starts" name="dropAt" type="datetime-local" defaultValue={toLocalDT(m.dropAt)} />
          <Field label="Drop ends" name="dropEndsAt" type="datetime-local" defaultValue={toLocalDT(m.dropEndsAt)} />
        </div>
        <div className="flex flex-wrap gap-6">
          <CheckField name="active" label="Live on storefront" defaultChecked={m.active} />
          <CheckField name="featured" label="Featured on shop" defaultChecked={m.featured} />
        </div>
        <div className="flex items-center gap-3 border-t border-border pt-6">
          <button type="submit" className="clip-sharp inline-flex items-center gap-3 bg-voltra px-7 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-black hover:bg-voltra-acid">
            Save →
          </button>
          <a href="/admin/merch" className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-dim hover:text-text">Cancel</a>
        </div>
      </form>
    </FormShell>
  );
}
