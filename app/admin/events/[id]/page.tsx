import { notFound } from "next/navigation";

import { saveEvent } from "@/app/actions/admin";
import { prisma } from "@/lib/prisma";
import { CheckField, Field } from "@/app/components/admin/Field";
import { FormShell } from "@/app/components/admin/FormShell";
import { REGIONS, REGION_LABELS } from "@/lib/i18n/config";

function toLocalDT(d: Date | null | undefined) {
  if (!d) return "";
  // datetime-local expects YYYY-MM-DDTHH:mm
  return d.toISOString().slice(0, 16);
}

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const e = await prisma.event.findUnique({ where: { id } });
  if (!e) notFound();

  return (
    <FormShell title={`Edit · ${e.title}`} eyebrow="§ Events / Edit" backHref="/admin/events">
      <form
        action={async (fd) => {
          "use server";
          await saveEvent(id, fd);
        }}
        className="grid gap-6"
      >
        <Field label="Title" name="title" required defaultValue={e.title} />
        <Field label="Description" name="description" rows={4} required defaultValue={e.description} />
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Starts At" name="startsAt" type="datetime-local" required defaultValue={toLocalDT(e.startsAt)} />
          <Field label="Ends At" name="endsAt" type="datetime-local" defaultValue={toLocalDT(e.endsAt)} />
        </div>
        <Field label="Location" name="location" required defaultValue={e.location} />
        <div className="grid gap-6 sm:grid-cols-3">
          <Field
            label="Region"
            name="region"
            defaultValue={e.region}
            options={REGIONS.map((r) => ({ value: r, label: `${r} · ${REGION_LABELS[r]}` }))}
          />
          <Field label="Country (ISO-2)" name="country" defaultValue={e.country ?? ""} />
          <Field label="Sport" name="sport" defaultValue={e.sport ?? ""} />
        </div>
        <Field label="Image URL" name="imageUrl" defaultValue={e.imageUrl ?? ""} />
        <Field label="External URL" name="url" defaultValue={e.url ?? ""} />
        <CheckField name="active" label="Active" defaultChecked={e.active} />
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
