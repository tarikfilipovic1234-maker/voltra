import { saveRewardItem } from "@/app/actions/admin-loyalty";
import { CheckField, Field } from "@/app/components/admin/Field";
import { FormShell } from "@/app/components/admin/FormShell";

export default function NewRewardPage() {
  return (
    <FormShell title="New Reward Item" eyebrow="§ Rewards / New" backHref="/admin/rewards">
      <form
        action={async (fd) => {
          "use server";
          await saveRewardItem(null, fd);
        }}
        className="grid gap-6"
      >
        <Field label="Name" name="name" required />
        <Field label="Slug" name="slug" placeholder="auto from name" />
        <Field label="Description" name="description" rows={4} required />
        <Field label="Image URL" name="imageUrl" placeholder="/uploads/…" />
        <div className="grid gap-6 sm:grid-cols-3">
          <Field label="Points cost" name="pointsCost" type="number" defaultValue="1000" required />
          <Field label="Stock" name="stock" type="number" defaultValue="50" required />
          <Field
            label="Category"
            name="category"
            defaultValue="APPAREL"
            options={["APPAREL", "HEADWEAR", "GAMING", "ACCESSORIES", "DIGITAL"].map((v) => ({ value: v, label: v }))}
          />
        </div>
        <Field
          label="Tier gate (optional)"
          name="tier"
          options={[
            { value: "", label: "— None (anyone) —" },
            { value: "SURGE", label: "SURGE + APEX only" },
            { value: "APEX", label: "LEGEND only" },
          ]}
        />
        <CheckField name="active" label="Active" defaultChecked />
        <div className="flex items-center gap-3 border-t border-border pt-6">
          <button
            type="submit"
            className="clip-sharp inline-flex items-center gap-3 bg-voltra px-7 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-black hover:bg-voltra-acid"
          >
            Save →
          </button>
          <a href="/admin/rewards" className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-dim hover:text-text">Cancel</a>
        </div>
      </form>
    </FormShell>
  );
}
