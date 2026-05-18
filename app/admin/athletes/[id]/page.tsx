import { notFound } from "next/navigation";

import { saveAthlete } from "@/app/actions/admin";
import { prisma } from "@/lib/prisma";
import { CheckField, Field } from "@/app/components/admin/Field";
import { FormShell } from "@/app/components/admin/FormShell";
import { REGIONS, REGION_LABELS } from "@/lib/i18n/config";

export default async function EditAthletePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const a = await prisma.athlete.findUnique({ where: { id } });
  if (!a) notFound();

  return (
    <FormShell title={`Edit · ${a.name}`} eyebrow={`§ Athletes / ${a.slug}`} backHref="/admin/athletes">
      <form
        action={async (fd) => {
          "use server";
          await saveAthlete(id, fd);
        }}
        className="grid gap-6"
      >
        <Field label="Name" name="name" required defaultValue={a.name} />
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Sport" name="sport" required defaultValue={a.sport} />
          <Field label="Discipline" name="discipline" defaultValue={a.discipline ?? ""} />
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Country (ISO-2)" name="country" required defaultValue={a.country} />
          <Field
            label="Region"
            name="region"
            defaultValue={a.region}
            options={REGIONS.map((r) => ({ value: r, label: `${r} · ${REGION_LABELS[r]}` }))}
          />
        </div>
        <Field label="Slug" name="slug" defaultValue={a.slug} />
        <Field label="Image URL" name="imageUrl" defaultValue={a.imageUrl ?? ""} />
        <Field label="Bio" name="bio" rows={6} required defaultValue={a.bio} />
        <div className="flex flex-wrap gap-6">
          <CheckField name="hero" label="Hero athlete" defaultChecked={a.hero} />
          <CheckField name="active" label="Active" defaultChecked={a.active} />
        </div>
        <div className="flex items-center gap-3 border-t border-border pt-6">
          <button
            type="submit"
            className="clip-sharp inline-flex items-center gap-3 bg-voltra px-7 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-black transition-transform hover:-translate-y-[1px] hover:bg-voltra-acid"
          >
            Save →
          </button>
          <a
            href="/admin/athletes"
            className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-dim hover:text-text"
          >
            Cancel
          </a>
        </div>
      </form>
    </FormShell>
  );
}
