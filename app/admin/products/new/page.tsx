import { saveProduct } from "@/app/actions/admin";
import { CheckField, Field } from "@/app/components/admin/Field";
import { FormShell } from "@/app/components/admin/FormShell";

export default function NewProductPage() {
  return (
    <FormShell title="New Product" eyebrow="§ Products / New" backHref="/admin/products">
      <form
        action={async (fd) => {
          "use server";
          await saveProduct(null, fd);
        }}
        className="grid gap-6"
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Name" name="name" required placeholder="Original" />
          <Field label="Code (SKU)" name="code" required placeholder="M-009" />
        </div>
        <Field label="Slug" name="slug" placeholder="auto from name" />
        <Field label="Flavor" name="flavor" required placeholder="Green / Classic" />
        <Field label="Description" name="description" rows={4} required />
        <div className="grid gap-6 sm:grid-cols-4">
          <Field label="Caffeine (mg)" name="caffeineMg" type="number" defaultValue="160" required />
          <Field label="Sugar (g)" name="sugarG" type="number" defaultValue="0" required />
          <Field label="Calories" name="calories" type="number" defaultValue="10" required />
          <Field label="Juice %" name="juicePct" type="number" defaultValue="0" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Accent Color" name="accentColor" defaultValue="#00ff41" required hint="Hex e.g. #00ff41" />
          <Field label="Badge" name="badge" placeholder="Signature / Zero Sugar / …" />
        </div>
        <Field label="Regions (CSV)" name="regions" defaultValue="NA,EU,APAC,LATAM,MEA" required hint="Comma-separated region codes" />
        <CheckField name="active" label="Active (visible on site)" defaultChecked />
        <Buttons />
      </form>
    </FormShell>
  );
}

function Buttons() {
  return (
    <div className="flex items-center gap-3 border-t border-border pt-6">
      <button
        type="submit"
        className="clip-sharp inline-flex items-center gap-3 bg-voltra px-7 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-black transition-transform hover:-translate-y-[1px] hover:bg-voltra-acid"
      >
        Save →
      </button>
      <a href="/admin/products" className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-dim hover:text-text">Cancel</a>
    </div>
  );
}
