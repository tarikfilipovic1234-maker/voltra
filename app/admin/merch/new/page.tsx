import { saveMerch } from "@/app/actions/admin-loyalty";
import { CheckField, Field } from "@/app/components/admin/Field";
import { FormShell } from "@/app/components/admin/FormShell";

export default function NewMerchPage() {
  return (
    <FormShell title="New Merch Product" eyebrow="§ Merch / New" backHref="/admin/merch">
      <form
        action={async (fd) => {
          "use server";
          await saveMerch(null, fd);
        }}
        className="grid gap-6"
      >
        <Field label="Name" name="name" required />
        <Field label="Slug" name="slug" placeholder="auto from name" />
        <Field label="Description" name="description" rows={4} required />
        <Field label="Image URL" name="imageUrl" />
        <div className="grid gap-6 sm:grid-cols-3">
          <Field label="Price (cents)" name="priceCents" type="number" defaultValue="3500" required hint="3500 = $35.00" />
          <Field label="Currency" name="currency" defaultValue="USD" />
          <Field label="Stock" name="stock" type="number" defaultValue="100" required />
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          <Field
            label="Category"
            name="category"
            defaultValue="APPAREL"
            options={["APPAREL", "HEADWEAR", "ACCESSORIES", "COLLAB", "DROP"].map((v) => ({ value: v, label: v }))}
          />
          <Field label="Drop starts" name="dropAt" type="datetime-local" hint="Optional limited-drop window" />
          <Field label="Drop ends" name="dropEndsAt" type="datetime-local" />
        </div>
        <div className="flex flex-wrap gap-6">
          <CheckField name="active" label="Live on storefront" defaultChecked />
          <CheckField name="featured" label="Featured on shop" />
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
