import { notFound } from "next/navigation";

import { saveRewardItem } from "@/app/actions/admin-loyalty";
import { prisma } from "@/lib/prisma";
import { CheckField, Field } from "@/app/components/admin/Field";
import { FormShell } from "@/app/components/admin/FormShell";

export default async function EditRewardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const r = await prisma.rewardItem.findUnique({ where: { id } });
  if (!r) notFound();

  return (
    <FormShell title={`Edit · ${r.name}`} eyebrow="§ Rewards / Edit" backHref="/admin/rewards">
      <form
        action={async (fd) => {
          "use server";
          await saveRewardItem(id, fd);
        }}
        className="grid gap-6"
      >
        <Field label="Name" name="name" required defaultValue={r.name} />
        <Field label="Slug" name="slug" defaultValue={r.slug} />
        <Field label="Description" name="description" rows={4} required defaultValue={r.description} />
        <Field label="Image URL" name="imageUrl" defaultValue={r.imageUrl ?? ""} />
        <div className="grid gap-6 sm:grid-cols-3">
          <Field label="Points cost" name="pointsCost" type="number" defaultValue={r.pointsCost} />
          <Field label="Stock" name="stock" type="number" defaultValue={r.stock} />
          <Field
            label="Category"
            name="category"
            defaultValue={r.category}
            options={["APPAREL", "HEADWEAR", "GAMING", "ACCESSORIES", "DIGITAL"].map((v) => ({ value: v, label: v }))}
          />
        </div>
        <Field
          label="Tier gate"
          name="tier"
          defaultValue={r.tier ?? ""}
          options={[
            { value: "", label: "— None —" },
            { value: "SURGE", label: "SURGE + APEX" },
            { value: "APEX", label: "LEGEND only" },
          ]}
        />
        <CheckField name="active" label="Active" defaultChecked={r.active} />
        <div className="flex items-center gap-3 border-t border-border pt-6">
          <button type="submit" className="clip-sharp inline-flex items-center gap-3 bg-voltra px-7 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-black hover:bg-voltra-acid">
            Save →
          </button>
          <a href="/admin/rewards" className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-dim hover:text-text">Cancel</a>
        </div>
      </form>
    </FormShell>
  );
}
