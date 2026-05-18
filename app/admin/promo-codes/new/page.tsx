import { savePromoCode } from "@/app/actions/admin-loyalty";
import { CheckField, Field } from "@/app/components/admin/Field";
import { FormShell } from "@/app/components/admin/FormShell";

export default function NewPromoCodePage() {
  return (
    <FormShell title="New Promo Code" eyebrow="§ Promo / New" backHref="/admin/promo-codes">
      <form
        action={async (fd) => {
          "use server";
          await savePromoCode(null, fd);
        }}
        className="grid gap-6"
      >
        <Field label="Code" name="code" required placeholder="VOLT-2026" />
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Points awarded" name="points" type="number" defaultValue="50" required />
          <Field label="Max redemptions" name="maxRedemptions" type="number" defaultValue="1" required />
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field
            label="Source"
            name="source"
            defaultValue="CAN"
            options={["CAN", "EVENT", "EMAIL", "PARTNER"].map((s) => ({ value: s, label: s }))}
          />
          <Field label="Expires At" name="expiresAt" type="datetime-local" />
        </div>
        <Field label="Campaign" name="campaign" placeholder="Drop 016 cans" />
        <CheckField name="active" label="Active" defaultChecked />
        <div className="flex items-center gap-3 border-t border-border pt-6">
          <button
            type="submit"
            className="clip-sharp inline-flex items-center gap-3 bg-voltra px-7 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-black hover:bg-voltra-acid"
          >
            Save →
          </button>
          <a href="/admin/promo-codes" className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-dim hover:text-text">Cancel</a>
        </div>
      </form>
    </FormShell>
  );
}
