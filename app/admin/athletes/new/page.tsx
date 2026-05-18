import { saveAthlete } from "@/app/actions/admin";
import { CheckField, Field } from "@/app/components/admin/Field";
import { FormShell } from "@/app/components/admin/FormShell";
import { REGIONS, REGION_LABELS } from "@/lib/i18n/config";

export default function NewAthletePage() {
  return (
    <FormShell title="New Athlete" eyebrow="§ Athletes / New" backHref="/admin/athletes">
      <form
        action={async (fd) => {
          "use server";
          await saveAthlete(null, fd);
        }}
        className="grid gap-6"
      >
        <Field label="Name" name="name" required placeholder="Ken Roczen" />
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Sport" name="sport" required placeholder="Motocross" />
          <Field label="Discipline" name="discipline" placeholder="450SX" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Country (ISO-2)" name="country" required placeholder="DE" />
          <Field
            label="Region"
            name="region"
            required
            options={REGIONS.map((r) => ({ value: r, label: `${r} · ${REGION_LABELS[r]}` }))}
          />
        </div>
        <Field label="Slug" name="slug" placeholder="auto-generated from name" />
        <Field label="Image URL" name="imageUrl" placeholder="https://…" />
        <Field label="Bio" name="bio" rows={6} required placeholder="Markdown supported." />
        <div className="flex flex-wrap gap-6">
          <CheckField name="hero" label="Hero athlete" />
          <CheckField name="active" label="Active" defaultChecked />
        </div>
        <Buttons backHref="/admin/athletes" />
      </form>
    </FormShell>
  );
}

function Buttons({ backHref }: { backHref: string }) {
  return (
    <div className="flex items-center gap-3 border-t border-border pt-6">
      <button
        type="submit"
        className="clip-sharp inline-flex items-center gap-3 bg-voltra px-7 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-black transition-transform hover:-translate-y-[1px] hover:bg-voltra-acid"
      >
        Save →
      </button>
      <a
        href={backHref}
        className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-dim hover:text-text"
      >
        Cancel
      </a>
    </div>
  );
}
