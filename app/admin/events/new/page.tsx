import { saveEvent } from "@/app/actions/admin";
import { CheckField, Field } from "@/app/components/admin/Field";
import { FormShell } from "@/app/components/admin/FormShell";
import { REGIONS, REGION_LABELS } from "@/lib/i18n/config";

export default function NewEventPage() {
  return (
    <FormShell title="New Event" eyebrow="§ Events / New" backHref="/admin/events">
      <form
        action={async (fd) => {
          "use server";
          await saveEvent(null, fd);
        }}
        className="grid gap-6"
      >
        <Field label="Title" name="title" required />
        <Field label="Description" name="description" rows={4} required />
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Starts At" name="startsAt" type="datetime-local" required />
          <Field label="Ends At" name="endsAt" type="datetime-local" />
        </div>
        <Field label="Location" name="location" required />
        <div className="grid gap-6 sm:grid-cols-3">
          <Field
            label="Region"
            name="region"
            required
            options={REGIONS.map((r) => ({ value: r, label: `${r} · ${REGION_LABELS[r]}` }))}
          />
          <Field label="Country (ISO-2)" name="country" />
          <Field label="Sport" name="sport" />
        </div>
        <Field label="Image URL" name="imageUrl" />
        <Field label="External URL" name="url" />
        <CheckField name="active" label="Active" defaultChecked />
        <div className="flex items-center gap-3 border-t border-border pt-6">
          <button
            type="submit"
            className="clip-sharp inline-flex items-center gap-3 bg-voltra px-7 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-black transition-transform hover:-translate-y-[1px] hover:bg-voltra-acid"
          >
            Save →
          </button>
          <a href="/admin/events" className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-dim hover:text-text">Cancel</a>
        </div>
      </form>
    </FormShell>
  );
}
